import { prisma } from "@/lib/prisma";

export interface QuestionScore {
  questionId: string;
  number: number;
  text: string;
  value: number | null;
  comment: string | null;
}

export interface CriterionScore {
  criterionId: string;
  name: string;
  order: number;
  average: number | null;
  questions: QuestionScore[];
}

export interface DimensionScore {
  dimensionId: string;
  name: string;
  order: number;
  average: number | null;
  criteria: CriterionScore[];
}

export interface MeasurementResult {
  measurementId: string;
  processId: string;
  processName: string;
  year: number;
  overallScore: number | null;
  dimensions: DimensionScore[];
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export async function getMeasurementResult(
  measurementId: string
): Promise<MeasurementResult | null> {
  const measurement = await prisma.measurement.findUnique({
    where: { id: measurementId },
    include: {
      process: true,
      answers: true,
    },
  });
  if (!measurement) return null;

  const dimensions = await prisma.dimension.findMany({
    orderBy: { order: "asc" },
    include: {
      criteria: {
        orderBy: { order: "asc" },
        include: {
          questions: { orderBy: { number: "asc" } },
        },
      },
    },
  });

  const answersByQuestion = new Map(
    measurement.answers.map((a) => [a.questionId, a])
  );

  const dimensionScores: DimensionScore[] = dimensions.map((dimension) => {
    const criteriaScores: CriterionScore[] = dimension.criteria.map(
      (criterion) => {
        const questionScores: QuestionScore[] = criterion.questions.map(
          (q) => {
            const answer = answersByQuestion.get(q.id);
            return {
              questionId: q.id,
              number: q.number,
              text: q.text,
              value: answer?.value ?? null,
              comment: answer?.comment ?? null,
            };
          }
        );
        const values = questionScores
          .map((q) => q.value)
          .filter((v): v is number => v !== null);
        return {
          criterionId: criterion.id,
          name: criterion.name,
          order: criterion.order,
          average: average(values),
          questions: questionScores,
        };
      }
    );
    const criterionAverages = criteriaScores
      .map((c) => c.average)
      .filter((v): v is number => v !== null);
    return {
      dimensionId: dimension.id,
      name: dimension.name,
      order: dimension.order,
      average: average(criterionAverages),
      criteria: criteriaScores,
    };
  });

  const dimensionAverages = dimensionScores
    .map((d) => d.average)
    .filter((v): v is number => v !== null);

  return {
    measurementId: measurement.id,
    processId: measurement.processId,
    processName: measurement.process.name,
    year: measurement.year,
    overallScore: average(dimensionAverages),
    dimensions: dimensionScores,
  };
}

// Mittelt mehrere Messungen fragenweise (nv wird ignoriert) und rechnet
// Kriterium -> Dimension -> Gesamt wie bei einer einzelnen Messung.
export function aggregateResults(
  results: MeasurementResult[],
  name: string
): MeasurementResult | null {
  if (results.length === 0) return null;
  const template = results[0];

  const dimensions: DimensionScore[] = template.dimensions.map((dim, di) => {
    const criteria: CriterionScore[] = dim.criteria.map((crit, ci) => {
      const questions: QuestionScore[] = crit.questions.map((q, qi) => {
        const values = results
          .map((r) => r.dimensions[di].criteria[ci].questions[qi].value)
          .filter((v): v is number => v !== null);
        return { ...q, value: average(values), comment: null };
      });
      const values = questions
        .map((q) => q.value)
        .filter((v): v is number => v !== null);
      return { ...crit, average: average(values), questions };
    });
    const avgs = criteria
      .map((c) => c.average)
      .filter((v): v is number => v !== null);
    return { ...dim, average: average(avgs), criteria };
  });

  const dimAvgs = dimensions
    .map((d) => d.average)
    .filter((v): v is number => v !== null);

  return {
    measurementId: "",
    processId: "",
    processName: name,
    year: template.year,
    overallScore: average(dimAvgs),
    dimensions,
  };
}

export interface ProcessRow {
  id: string;
  name: string;
  measurementId: string | null;
  result: MeasurementResult | null;
}

export interface GroupRow {
  id: string;
  name: string;
  measurementId: string | null;
  result: MeasurementResult | null;
  children: ProcessRow[];
}

export interface CompanyYearData {
  years: number[];
  year: number | null;
  groups: GroupRow[];
  companyResult: MeasurementResult | null;
}

// Geschäftsbereich = oberste Prozessebene. Sein Ergebnis ist der Mittelwert der
// untergeordneten Prozesse (oder seine eigene Messung, wenn er keine hat).
export async function getCompanyYearData(
  companyId: string,
  requestedYear?: number
): Promise<CompanyYearData> {
  const yearRows = await prisma.measurement.findMany({
    where: { process: { companyId } },
    select: { year: true },
    distinct: ["year"],
    orderBy: { year: "desc" },
  });
  const years = yearRows.map((y) => y.year);
  const year = requestedYear && years.includes(requestedYear) ? requestedYear : years[0] ?? null;
  if (year === null) return { years, year, groups: [], companyResult: null };

  const processes = await prisma.process.findMany({
    where: { companyId },
    orderBy: { name: "asc" },
  });
  const measurements = await prisma.measurement.findMany({
    where: { year, process: { companyId } },
    orderBy: { createdAt: "desc" },
  });

  const latestByProcess = new Map<string, string>();
  for (const m of measurements) {
    if (!latestByProcess.has(m.processId)) latestByProcess.set(m.processId, m.id);
  }
  const resultByProcess = new Map<string, MeasurementResult>();
  await Promise.all(
    [...latestByProcess.entries()].map(async ([processId, measurementId]) => {
      const r = await getMeasurementResult(measurementId);
      if (r) resultByProcess.set(processId, r);
    })
  );

  const leafResults: MeasurementResult[] = [];
  const groups: GroupRow[] = processes
    .filter((p) => !p.parentId)
    .map((top) => {
      const children: ProcessRow[] = processes
        .filter((p) => p.parentId === top.id)
        .map((c) => ({
          id: c.id,
          name: c.name,
          measurementId: latestByProcess.get(c.id) ?? null,
          result: resultByProcess.get(c.id) ?? null,
        }));
      const childResults = children
        .map((c) => c.result)
        .filter((r): r is MeasurementResult => r !== null);
      const own = resultByProcess.get(top.id) ?? null;
      leafResults.push(...(children.length > 0 ? childResults : own ? [own] : []));
      return {
        id: top.id,
        name: top.name,
        measurementId: latestByProcess.get(top.id) ?? null,
        result: childResults.length > 0 ? aggregateResults(childResults, top.name) : own,
        children,
      };
    })
    .filter((g) => g.result !== null || g.children.length > 0);

  return {
    years,
    year,
    groups,
    companyResult: aggregateResults(leafResults, "Gesamt"),
  };
}

export function scoreToPercent(score: number | null): number | null {
  if (score === null) return null;
  // Skala 1-5 -> 0-100%: 1 = 0%, 5 = 100%
  return ((score - 1) / 4) * 100;
}

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

export function scoreToPercent(score: number | null): number | null {
  if (score === null) return null;
  // Skala 1-5 -> 0-100%: 1 = 0%, 5 = 100%
  return ((score - 1) / 4) * 100;
}

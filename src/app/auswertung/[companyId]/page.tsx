import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getMeasurementResult } from "@/lib/scoring";
import { scoreToColor, scoreToTextColor } from "@/lib/colorScale";

function ScoreCell({ value }: { value: number | null }) {
  return (
    <td
      className="border border-neutral-200 px-2 py-1 text-center text-xs font-medium"
      style={{
        backgroundColor: scoreToColor(value),
        color: scoreToTextColor(value),
      }}
    >
      {value !== null ? value.toFixed(2) : "nv"}
    </td>
  );
}

export default async function Auswertung({
  params,
  searchParams,
}: {
  params: Promise<{ companyId: string }>;
  searchParams: Promise<{ year?: string }>;
}) {
  const { companyId } = await params;
  const sp = await searchParams;

  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) notFound();

  const years = await prisma.measurement.findMany({
    where: { process: { companyId } },
    select: { year: true },
    distinct: ["year"],
    orderBy: { year: "desc" },
  });
  const selectedYear = sp.year ? Number(sp.year) : years[0]?.year;

  const processes = await prisma.process.findMany({
    where: { companyId },
    orderBy: { name: "asc" },
  });

  const dimensions = await prisma.dimension.findMany({
    orderBy: { order: "asc" },
    include: { criteria: { orderBy: { order: "asc" } } },
  });

  const rows = await Promise.all(
    processes.map(async (process) => {
      const measurement = selectedYear
        ? await prisma.measurement.findFirst({
            where: { processId: process.id, year: selectedYear },
            orderBy: { createdAt: "desc" },
          })
        : null;
      const result = measurement ? await getMeasurementResult(measurement.id) : null;
      return { process, measurement, result };
    })
  );

  // Gesamtdurchschnitt über alle Prozesse hinweg (entspricht "Auswertung SWFL" im Excel)
  function overallAverage(pick: (r: NonNullable<(typeof rows)[number]["result"]>) => number | null) {
    const values = rows
      .map((r) => (r.result ? pick(r.result) : null))
      .filter((v): v is number => v !== null);
    if (values.length === 0) return null;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  const overallScoreAll = overallAverage((r) => r.overallScore);
  const overallByDimension = dimensions.map((d) =>
    overallAverage(
      (r) => r.dimensions.find((rd) => rd.dimensionId === d.id)?.average ?? null
    )
  );

  return (
    <main className="mx-auto max-w-6xl p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/" className="text-sm text-brand hover:underline">
            ← Zurück zur Übersicht
          </Link>
          <h1 className="text-xl font-semibold mt-2">
            Tabellarische Auswertung — {company.name}
          </h1>
        </div>
        {years.length > 1 && (
          <div className="flex gap-2">
            {years.map((y) => (
              <Link
                key={y.year}
                href={`/auswertung/${companyId}?year=${y.year}`}
                className={`rounded-full px-3 py-1 text-sm border ${
                  selectedYear === y.year
                    ? "bg-brand text-white border-brand"
                    : "border-neutral-300 hover:bg-neutral-100"
                }`}
              >
                {y.year}
              </Link>
            ))}
          </div>
        )}
      </div>

      {!selectedYear && (
        <p className="text-sm text-neutral-500">
          Noch keine Messungen für dieses Unternehmen vorhanden.
        </p>
      )}

      {selectedYear && (
        <div className="overflow-x-auto rounded-lg border border-neutral-200">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-neutral-50">
                <th className="sticky left-0 bg-neutral-50 border border-neutral-200 px-3 py-2 text-left">
                  Prozess
                </th>
                <th className="border border-neutral-200 px-2 py-2">Gesamt</th>
                {dimensions.map((d) => (
                  <th key={d.id} className="border border-neutral-200 px-2 py-2 whitespace-nowrap">
                    {d.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(({ process, measurement, result }) => (
                <tr key={process.id}>
                  <td className="sticky left-0 bg-white border border-neutral-200 px-3 py-1.5 whitespace-nowrap">
                    {measurement ? (
                      <Link href={`/dashboard/${measurement.id}`} className="text-brand hover:underline">
                        {process.name}
                      </Link>
                    ) : (
                      <span className="text-neutral-400">{process.name}</span>
                    )}
                  </td>
                  <ScoreCell value={result?.overallScore ?? null} />
                  {dimensions.map((d) => (
                    <ScoreCell
                      key={d.id}
                      value={result?.dimensions.find((rd) => rd.dimensionId === d.id)?.average ?? null}
                    />
                  ))}
                </tr>
              ))}
              <tr className="bg-neutral-50 font-semibold">
                <td className="sticky left-0 bg-neutral-50 border border-neutral-200 px-3 py-1.5">
                  Mittelwert (alle Prozesse)
                </td>
                <ScoreCell value={overallScoreAll} />
                {dimensions.map((d, i) => (
                  <ScoreCell key={d.id} value={overallByDimension[i]} />
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div className="flex gap-4 text-xs text-neutral-500">
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: "rgb(220,38,38)" }} />
          1 – nicht digital
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: "rgb(234,179,8)" }} />
          3 – teilweise digital
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: "rgb(22,163,74)" }} />
          5 – vollständig digital
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded bg-neutral-200" />
          nicht bewertbar
        </span>
      </div>
    </main>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getMeasurementResult } from "@/lib/scoring";
import YearComparisonChart from "@/components/YearComparisonChart";

export default async function Vergleich({
  params,
}: {
  params: Promise<{ processId: string }>;
}) {
  const { processId } = await params;
  const process = await prisma.process.findUnique({ where: { id: processId } });
  if (!process) notFound();

  const measurements = await prisma.measurement.findMany({
    where: { processId },
    orderBy: { year: "asc" },
  });

  const results = await Promise.all(
    measurements.map((m) => getMeasurementResult(m.id))
  );
  const validResults = results.filter((r) => r !== null);

  const dimensionNames = validResults[0]?.dimensions.map((d) => d.name) ?? [];

  const chartData = validResults.map((r) => {
    const row: Record<string, number | string> = { year: String(r.year) };
    row["Gesamt"] = r.overallScore !== null ? Number(r.overallScore.toFixed(2)) : NaN;
    for (const d of r.dimensions) {
      row[d.name] = d.average !== null ? Number(d.average.toFixed(2)) : NaN;
    }
    return row;
  });

  return (
    <main className="mx-auto max-w-3xl p-8 space-y-8">
      <div>
        <Link href="/" className="text-sm text-brand hover:underline">
          ← Zurück zur Übersicht
        </Link>
        <h1 className="text-xl font-semibold mt-2">
          Jahresvergleich — {process.name}
        </h1>
      </div>

      {validResults.length === 0 && (
        <p className="text-sm text-neutral-500">Noch keine Messungen vorhanden.</p>
      )}

      {validResults.length > 0 && (
        <>
          <section className="rounded-lg border border-neutral-200 p-5">
            <h2 className="mb-2 font-medium">Gesamtreifegrad über die Zeit</h2>
            <YearComparisonChart data={chartData} series={["Gesamt"]} />
          </section>

          <section className="rounded-lg border border-neutral-200 p-5">
            <h2 className="mb-2 font-medium">Entwicklung je Dimension</h2>
            <YearComparisonChart data={chartData} series={dimensionNames} />
          </section>

          <section className="rounded-lg border border-neutral-200 p-5">
            <h2 className="mb-3 font-medium">Werte im Überblick</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left">
                  <th className="py-1">Jahr</th>
                  <th className="py-1">Gesamt</th>
                  {dimensionNames.map((name) => (
                    <th key={name} className="py-1">
                      {name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {validResults.map((r) => (
                  <tr key={r.measurementId} className="border-b border-neutral-100">
                    <td className="py-1">{r.year}</td>
                    <td className="py-1">{r.overallScore?.toFixed(2) ?? "–"}</td>
                    {r.dimensions.map((d) => (
                      <td key={d.dimensionId} className="py-1">
                        {d.average?.toFixed(2) ?? "–"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}
    </main>
  );
}

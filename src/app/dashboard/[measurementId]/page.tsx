import Link from "next/link";
import { notFound } from "next/navigation";
import { getMeasurementResult } from "@/lib/scoring";
import { scoreToColor } from "@/lib/colorScale";
import { prisma } from "@/lib/prisma";
import DimensionRadarChart from "@/components/DimensionRadarChart";
import YearComparisonChart from "@/components/YearComparisonChart";

export default async function Dashboard({
  params,
}: {
  params: Promise<{ measurementId: string }>;
}) {
  const { measurementId } = await params;
  const result = await getMeasurementResult(measurementId);
  if (!result) notFound();

  const processMeasurements = await prisma.measurement.findMany({
    where: { processId: result.processId },
    orderBy: [{ year: "asc" }, { createdAt: "desc" }],
  });
  const latestPerYear = new Map<number, string>();
  for (const m of processMeasurements) {
    if (!latestPerYear.has(m.year)) latestPerYear.set(m.year, m.id);
  }
  const yearResults = (
    await Promise.all([...latestPerYear.values()].map((id) => getMeasurementResult(id)))
  ).filter((r): r is NonNullable<typeof r> => r !== null);
  const dimensionNames = result.dimensions.map((d) => d.name);
  const yearChartData = yearResults.map((r) => {
    const row: Record<string, number | string> = { year: String(r.year) };
    row["Gesamt"] = r.overallScore !== null ? Number(r.overallScore.toFixed(2)) : NaN;
    for (const d of r.dimensions) {
      row[d.name] = d.average !== null ? Number(d.average.toFixed(2)) : NaN;
    }
    return row;
  });

  const radarData = result.dimensions.map((d) => ({
    dimension: d.name,
    score: d.average ?? 0,
  }));

  const allCriteria = result.dimensions.flatMap((d) =>
    d.criteria
      .filter((c) => c.average !== null)
      .map((c) => ({ ...c, dimensionName: d.name }))
  );
  const sorted = [...allCriteria].sort(
    (a, b) => (b.average ?? 0) - (a.average ?? 0)
  );
  const strengths = sorted.slice(0, 3);
  const weaknesses = [...sorted].reverse().slice(0, 3);

  return (
    <main className="mx-auto max-w-3xl p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/" className="text-sm text-brand hover:underline">
            ← Zurück zur Übersicht
          </Link>
          <h1 className="text-xl font-semibold mt-2">
            {result.processName} — Messjahr {result.year}
          </h1>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/vergleich/${result.processId}`}
            className="rounded border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100"
          >
            Jahresvergleich
          </Link>
          <a
            href={`/api/pdf/${result.measurementId}`}
            className="rounded bg-brand px-3 py-1.5 text-sm text-white hover:bg-brand-dark"
          >
            PDF-Bericht
          </a>
        </div>
      </div>

      <section className="rounded-lg border border-neutral-200 p-5 text-center">
        <p className="text-sm text-neutral-500">Gesamtreifegrad</p>
        <p className="text-4xl font-semibold">
          {result.overallScore?.toFixed(2) ?? "–"} / 5
        </p>
      </section>

      <section className="rounded-lg border border-neutral-200 p-5">
        <h2 className="mb-2 font-medium">Ergebnisse je Dimension</h2>
        <DimensionRadarChart data={radarData} />
      </section>

      <section className="rounded-lg border border-neutral-200 p-5 space-y-3">
        <h2 className="font-medium">Details je Dimension und Kriterium</h2>
        {result.dimensions.map((d) => (
          <div key={d.dimensionId} className="space-y-1">
            <div className="flex justify-between text-sm font-medium">
              <span>{d.name}</span>
              <span>{d.average?.toFixed(2) ?? "–"} / 5</span>
            </div>
            {d.criteria.map((c) => (
              <div key={c.criterionId} className="pl-4">
                <div className="flex justify-between text-xs text-neutral-600">
                  <span>{c.name}</span>
                  <span>{c.average?.toFixed(2) ?? "–"}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-neutral-200">
                  <div
                    className="h-1.5 rounded-full"
                    style={{
                      width: `${((c.average ?? 0) / 5) * 100}%`,
                      backgroundColor: scoreToColor(c.average),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ))}
      </section>

      <div className="grid grid-cols-2 gap-4">
        <section className="rounded-lg border border-green-200 bg-green-50 p-5">
          <h2 className="font-medium text-green-800">Stärken</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {strengths.map((c) => (
              <li key={c.criterionId} className="flex justify-between">
                <span>{c.name} ({c.dimensionName})</span>
                <span className="font-medium">{c.average?.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-5">
          <h2 className="font-medium text-amber-800">Handlungsfelder</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {weaknesses.map((c) => (
              <li key={c.criterionId} className="flex justify-between">
                <span>{c.name} ({c.dimensionName})</span>
                <span className="font-medium">{c.average?.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-lg border border-neutral-200 p-5 space-y-4">
        <h2 className="font-medium">Jahresvergleich</h2>
        {yearResults.length < 2 ? (
          <p className="text-sm text-neutral-500">
            Für diesen Prozess gibt es bisher nur die Messung {result.year}. Starte auf der
            Übersichtsseite eine weitere Messung mit einem anderen Jahr, dann erscheint hier
            die Entwicklung über die Jahre.
          </p>
        ) : (
          <>
            <div>
              <h3 className="mb-1 text-sm text-neutral-600">Gesamtreifegrad</h3>
              <YearComparisonChart data={yearChartData} series={["Gesamt"]} />
            </div>
            <div>
              <h3 className="mb-1 text-sm text-neutral-600">Entwicklung je Dimension</h3>
              <YearComparisonChart data={yearChartData} series={dimensionNames} />
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left">
                  <th className="py-1">Jahr</th>
                  <th className="py-1">Gesamt</th>
                  {dimensionNames.map((n) => (
                    <th key={n} className="py-1">{n}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {yearResults.map((r) => (
                  <tr key={r.measurementId} className="border-b border-neutral-100">
                    <td className="py-1">{r.year}</td>
                    <td className="py-1">{r.overallScore?.toFixed(2) ?? "–"}</td>
                    {r.dimensions.map((d) => (
                      <td key={d.dimensionId} className="py-1">{d.average?.toFixed(2) ?? "–"}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </section>
    </main>
  );
}

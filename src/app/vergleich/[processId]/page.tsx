import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getMeasurementResult } from "@/lib/scoring";
import { yearBarCriteria, yearBarDimensions } from "@/lib/yearData";
import YearBarChart from "@/components/YearBarChart";
import YearCompareTable from "@/components/YearCompareTable";

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
    orderBy: [{ year: "asc" }, { createdAt: "desc" }],
  });
  const latestPerYear = new Map<number, string>();
  for (const m of measurements) {
    if (!latestPerYear.has(m.year)) latestPerYear.set(m.year, m.id);
  }

  const results = (
    await Promise.all([...latestPerYear.values()].map((id) => getMeasurementResult(id)))
  )
    .filter((r): r is NonNullable<typeof r> => r !== null)
    .sort((a, b) => a.year - b.year);

  return (
    <main className="mx-auto max-w-4xl p-8 space-y-8">
      <div>
        <Link href="/" className="text-sm text-brand hover:underline">
          ← Zurück zur Übersicht
        </Link>
        <h1 className="text-xl font-semibold mt-2">Jahresvergleich — {process.name}</h1>
      </div>

      {results.length === 0 && (
        <p className="text-sm text-neutral-500">Noch keine Messungen vorhanden.</p>
      )}

      {results.length === 1 && (
        <p className="text-sm text-neutral-500">
          Bisher nur die Messung {results[0].year}. Für den Vergleich eine weitere Messung mit
          einem anderen Jahr anlegen.
        </p>
      )}

      {results.length > 0 && (
        <>
          <section className="rounded-lg border border-neutral-200 p-5">
            <h2 className="mb-2 font-medium">Gesamt und Dimensionen (Jahre nebeneinander)</h2>
            <YearBarChart {...yearBarDimensions(results)} />
          </section>

          <section className="rounded-lg border border-neutral-200 p-5">
            <h2 className="mb-2 font-medium">Kriterien (Jahre nebeneinander)</h2>
            <YearBarChart {...yearBarCriteria(results)} height={420} />
          </section>

          <section className="rounded-lg border border-neutral-200 p-5">
            <h2 className="mb-3 font-medium">Werte im Vergleich (Tabelle mit Veränderung)</h2>
            <YearCompareTable results={results} />
          </section>
        </>
      )}
    </main>
  );
}

import { Fragment } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCompanyYearData, type MeasurementResult } from "@/lib/scoring";
import { scoreToColor, scoreToTextColor } from "@/lib/colorScale";
import { yearBarCriteria, yearBarDimensions } from "@/lib/yearData";
import YearBarChart from "@/components/YearBarChart";
import YearCompareTable, { DeltaCell, ScoreCell } from "@/components/YearCompareTable";
import {
  CriteriaRadar,
  DimensionColumnChart,
  GaugeDonut,
  GroupStackedChart,
} from "@/components/AuswertungCharts";

const VIEWS = [
  { key: "gesamt", label: "Gesamt" },
  { key: "gb", label: "Nach Geschäftsbereich" },
  { key: "dimensionen", label: "Nach Dimensionen" },
  { key: "tabelle", label: "Tabellarisch" },
  { key: "jahre", label: "Jahresvergleich" },
] as const;

function Cell({
  value,
  bold,
  small,
}: {
  value: number | null;
  bold?: boolean;
  small?: boolean;
}) {
  return (
    <td
      className={`border border-neutral-200 px-2 text-center ${small ? "py-0.5 text-[11px]" : "py-1 text-xs"} ${bold ? "font-semibold" : "font-medium"}`}
      style={{ backgroundColor: scoreToColor(value), color: scoreToTextColor(value) }}
    >
      {value !== null ? value.toFixed(2) : "nv"}
    </td>
  );
}

function avg(values: (number | null)[]): number | null {
  const v = values.filter((x): x is number => x !== null);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
}

export default async function Auswertung({
  params,
  searchParams,
}: {
  params: Promise<{ companyId: string }>;
  searchParams: Promise<{ year?: string; view?: string }>;
}) {
  const { companyId } = await params;
  const sp = await searchParams;

  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) notFound();

  const data = await getCompanyYearData(companyId, sp.year ? Number(sp.year) : undefined);
  const view = VIEWS.some((v) => v.key === sp.view) ? sp.view! : "gesamt";
  const { groups, companyResult, year, years } = data;
  const q = (v: string, y = year) => `/auswertung/${companyId}?view=${v}${y ? `&year=${y}` : ""}`;

  const dimensionNames = companyResult?.dimensions.map((d) => d.name) ?? [];
  const groupRows = groups.filter((g) => g.result);

  let yearCompany: MeasurementResult[] = [];
  let yearGroups: { name: string; values: (number | null)[] }[] = [];
  const ascYears = [...years].sort((a, b) => a - b);
  if (view === "jahre") {
    const perYear = await Promise.all(ascYears.map((y) => getCompanyYearData(companyId, y)));
    yearCompany = perYear
      .filter((d) => d.companyResult && d.year !== null)
      .map((d) => ({ ...d.companyResult!, measurementId: `company-${d.year}`, year: d.year as number }));
    const names = [...new Set(perYear.flatMap((d) => d.groups.filter((g) => g.result).map((g) => g.name)))];
    yearGroups = names.map((n) => ({
      name: n,
      values: perYear.map((d) => d.groups.find((g) => g.name === n)?.result?.overallScore ?? null),
    }));
  }

  return (
    <main className="mx-auto max-w-6xl p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/" className="text-sm text-brand hover:underline">
            ← Zurück zur Übersicht
          </Link>
          <h1 className="mt-2 text-xl font-semibold">Auswertung — {company.name}</h1>
        </div>
        <div className="flex gap-2">
          {years.map((y) => (
            <Link
              key={y}
              href={q(view, y)}
              className={`rounded-full border px-3 py-1 text-sm ${
                y === year ? "border-brand bg-brand text-white" : "border-neutral-300 hover:bg-neutral-100"
              }`}
            >
              {y}
            </Link>
          ))}
        </div>
      </div>

      <nav className="flex flex-wrap gap-1 border-b border-neutral-200">
        {VIEWS.map((v) => (
          <Link
            key={v.key}
            href={q(v.key)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm ${
              view === v.key
                ? "border-brand font-medium text-brand"
                : "border-transparent text-neutral-600 hover:text-foreground"
            }`}
          >
            {v.label}
          </Link>
        ))}
      </nav>

      {!companyResult && view !== "jahre" && (
        <p className="text-sm text-neutral-500">Noch keine Messungen für dieses Unternehmen vorhanden.</p>
      )}

      {companyResult && view === "gesamt" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-lg border border-neutral-200 p-5">
            <h2 className="mb-3 font-medium">Bewertungsergebnis</h2>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-neutral-50 text-left">
                  <th className="border border-neutral-200 px-2 py-1.5">Dimension</th>
                  <th className="border border-neutral-200 px-2 py-1.5">Kriterium</th>
                  <th className="border border-neutral-200 px-2 py-1.5 text-center">Bewertung</th>
                  <th className="border border-neutral-200 px-2 py-1.5 text-center">Dimension</th>
                </tr>
              </thead>
              <tbody>
                {companyResult.dimensions.map((d) =>
                  d.criteria.map((c, i) => (
                    <tr key={c.criterionId}>
                      {i === 0 && (
                        <td rowSpan={d.criteria.length} className="border border-neutral-200 px-2 py-1 font-medium align-middle">
                          {d.order}) {d.name}
                        </td>
                      )}
                      <td className="border border-neutral-200 px-2 py-1">{c.name}</td>
                      <Cell value={c.average} />
                      {i === 0 && (
                        <td
                          rowSpan={d.criteria.length}
                          className="border border-neutral-200 px-2 text-center text-sm font-semibold"
                          style={{ backgroundColor: scoreToColor(d.average), color: scoreToTextColor(d.average) }}
                        >
                          {d.average?.toFixed(2) ?? "nv"}
                        </td>
                      )}
                    </tr>
                  ))
                )}
                <tr className="bg-neutral-50 font-semibold">
                  <td colSpan={2} className="border border-neutral-200 px-2 py-1.5">
                    Digitaler Reifegrad {company.name}
                  </td>
                  <Cell value={companyResult.overallScore} bold />
                  <Cell value={companyResult.overallScore} bold />
                </tr>
              </tbody>
            </table>
          </section>

          <div className="space-y-6">
            <section className="rounded-lg border border-neutral-200 p-5">
              <h2 className="mb-2 font-medium">Visualisierung Bewertungsergebnis</h2>
              <CriteriaRadar
                data={companyResult.dimensions.flatMap((d) =>
                  d.criteria.map((c) => ({ name: c.name, value: c.average ?? 0 }))
                )}
              />
            </section>
            <section className="rounded-lg border border-neutral-200 p-5">
              <h2 className="mb-2 text-center font-medium">Digitaler Reifegrad</h2>
              <GaugeDonut value={companyResult.overallScore ?? 0} label="von 5" />
            </section>
          </div>
        </div>
      )}

      {companyResult && view === "gb" && (
        <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
          <section className="rounded-lg border border-neutral-200 p-5">
            <h2 className="mb-2 font-medium">Reifegrad {company.name} je Geschäftsbereich</h2>
            <GroupStackedChart
              data={groupRows.map((g) => ({
                name: g.name,
                grad: Number((g.result!.overallScore ?? 0).toFixed(2)),
                potential: Number((5 - (g.result!.overallScore ?? 0)).toFixed(2)),
              }))}
            />
          </section>
          <section className="rounded-lg border border-neutral-200 p-5">
            <h2 className="mb-2 text-center font-medium">Mittelwert Digitalisierungsgrad</h2>
            <GaugeDonut
              value={avg(groupRows.map((g) => g.result!.overallScore)) ?? 0}
              label="Mittelwert Geschäftsbereiche"
            />
          </section>
        </div>
      )}

      {companyResult && view === "dimensionen" && (
        <section className="rounded-lg border border-neutral-200 p-5">
          <h2 className="mb-2 font-medium">Reifegrad nach Dimensionen</h2>
          <DimensionColumnChart
            dimensions={dimensionNames}
            data={groupRows.map((g) => {
              const row: Record<string, number | string> = { name: g.name };
              for (const d of g.result!.dimensions) row[d.name] = Number((d.average ?? 0).toFixed(2));
              return row;
            })}
          />
        </section>
      )}

      {view === "jahre" && yearCompany.length < 2 && (
        <p className="text-sm text-neutral-500">
          Für den Jahresvergleich braucht es Messungen aus mindestens zwei verschiedenen Jahren.
        </p>
      )}

      {view === "jahre" && yearCompany.length >= 2 && (
        <div className="space-y-6">
          <section className="rounded-lg border border-neutral-200 p-5">
            <h2 className="mb-2 font-medium">Gesamt und Dimensionen (Jahre nebeneinander)</h2>
            <YearBarChart {...yearBarDimensions(yearCompany)} />
          </section>

          <section className="rounded-lg border border-neutral-200 p-5">
            <h2 className="mb-2 font-medium">Geschäftsbereiche (Jahre nebeneinander)</h2>
            <YearBarChart
              years={ascYears.map(String)}
              data={yearGroups.map((g) => {
                const row: Record<string, number | string> = { name: g.name };
                ascYears.forEach((y, i) => (row[String(y)] = Number((g.values[i] ?? 0).toFixed(2))));
                return row;
              })}
            />
            <table className="mt-4 w-full border-collapse text-sm">
              <thead>
                <tr className="bg-neutral-50 text-left">
                  <th className="border border-neutral-200 px-3 py-2">Geschäftsbereich</th>
                  {ascYears.map((y) => (
                    <th key={y} className="border border-neutral-200 px-3 py-2 text-center">{y}</th>
                  ))}
                  <th className="border border-neutral-200 px-3 py-2 text-center text-xs">Veränderung</th>
                </tr>
              </thead>
              <tbody>
                {yearGroups.map((g) => (
                  <tr key={g.name}>
                    <td className="border border-neutral-200 px-3 py-1.5">{g.name}</td>
                    {g.values.map((v, i) => (
                      <ScoreCell key={ascYears[i]} value={v} />
                    ))}
                    <DeltaCell from={g.values[g.values.length - 2] ?? null} to={g.values[g.values.length - 1] ?? null} />
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="rounded-lg border border-neutral-200 p-5">
            <h2 className="mb-2 font-medium">Kriterien (Jahre nebeneinander)</h2>
            <YearBarChart {...yearBarCriteria(yearCompany)} height={420} />
          </section>

          <section className="rounded-lg border border-neutral-200 p-5">
            <h2 className="mb-3 font-medium">Werte im Vergleich (Tabelle mit Veränderung)</h2>
            <YearCompareTable results={yearCompany} />
          </section>
        </div>
      )}

      {companyResult && view === "tabelle" && (
        <TabellarischeAuswertung
          companyName={company.name}
          companyResult={companyResult}
          groupRows={groupRows}
        />
      )}
    </main>
  );
}

function TabellarischeAuswertung({
  companyName,
  companyResult,
  groupRows,
}: {
  companyName: string;
  companyResult: MeasurementResult;
  groupRows: Awaited<ReturnType<typeof getCompanyYearData>>["groups"];
}) {
  const template = companyResult.dimensions;

  function cells(result: MeasurementResult | null, small = false) {
    const out: React.ReactNode[] = [];
    template.forEach((dim, di) => {
      dim.criteria.forEach((_, ci) => (
        out.push(<Cell key={`${di}-${ci}`} small={small} value={result?.dimensions[di].criteria[ci].average ?? null} />)
      ));
      out.push(<Cell key={`d${di}`} small={small} bold value={result?.dimensions[di].average ?? null} />);
    });
    const grad = result?.overallScore ?? null;
    out.push(<Cell key="grad" small={small} bold value={grad} />);
    out.push(
      <td key="pot" className={`border border-neutral-200 px-2 text-center ${small ? "text-[11px]" : "text-xs"}`}>
        {grad !== null ? (5 - grad).toFixed(2) : ""}
      </td>
    );
    return out;
  }

  const mean = avg(groupRows.map((g) => g.result!.overallScore));

  return (
    <section className="space-y-2">
      <div className="overflow-x-auto rounded-lg border border-neutral-200">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-neutral-50">
              <th rowSpan={2} className="sticky left-0 z-10 border border-neutral-200 bg-neutral-50 px-3 py-2 text-left">
                Geschäftsbereich / Prozess
              </th>
              {template.map((d) => (
                <th key={d.dimensionId} colSpan={d.criteria.length + 1} className="border border-neutral-200 px-2 py-1">
                  {d.order}) {d.name}
                </th>
              ))}
              <th rowSpan={2} className="border border-neutral-200 px-2 py-1 text-xs">Digitalisierungsgrad</th>
              <th rowSpan={2} className="border border-neutral-200 px-2 py-1 text-xs">Digitalisierungspotential</th>
            </tr>
            <tr className="bg-neutral-50 text-[11px]">
              {template.flatMap((d) => [
                ...d.criteria.map((c) => (
                  <th key={c.criterionId} className="border border-neutral-200 px-1 py-1 font-normal">{c.name}</th>
                )),
                <th key={`h${d.dimensionId}`} className="border border-neutral-200 px-1 py-1">Ø</th>,
              ])}
            </tr>
          </thead>
          <tbody>
            {groupRows.map((g) => (
              <Fragment key={g.id}>
                <tr>
                  <td className="sticky left-0 z-10 whitespace-nowrap border border-neutral-200 bg-white px-3 py-1.5 font-medium">
                    {g.name}
                  </td>
                  {cells(g.result)}
                </tr>
                {g.children.filter((c) => c.result).map((c) => (
                  <tr key={c.id}>
                    <td className="sticky left-0 z-10 whitespace-nowrap border border-neutral-200 bg-white py-0.5 pl-7 pr-3 text-xs text-neutral-600">
                      {c.measurementId ? (
                        <Link href={`/dashboard/${c.measurementId}`} className="text-brand hover:underline">{c.name}</Link>
                      ) : c.name}
                    </td>
                    {cells(c.result, true)}
                  </tr>
                ))}
              </Fragment>
            ))}
            <tr className="bg-neutral-50 font-semibold">
              <td className="sticky left-0 z-10 border border-neutral-200 bg-neutral-50 px-3 py-1.5">
                Mittelwert {companyName}
              </td>
              {cells(companyResult)}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-xs text-neutral-500">
        Mittelwert Digitalisierungsgrad (Ø der Geschäftsbereiche): {mean !== null ? mean.toFixed(3) : "–"} · Digitalisierungspotential = Abstand zum Maximum 5.
      </p>
      <div className="flex gap-4 text-xs text-neutral-500">
        <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: "rgb(220,38,38)" }} />1 – nicht digital</span>
        <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: "rgb(234,179,8)" }} />3 – teilweise digital</span>
        <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: "rgb(22,163,74)" }} />5 – vollständig digital</span>
        <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-neutral-200" />nicht bewertbar</span>
      </div>
    </section>
  );
}

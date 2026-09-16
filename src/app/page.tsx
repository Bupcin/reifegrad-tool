import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createCompany, createProcess, getOrCreateMeasurement } from "./actions";
import { redirect } from "next/navigation";

async function createCompanyAction(formData: FormData) {
  "use server";
  const name = String(formData.get("name") || "").trim();
  if (!name) return;
  const company = await createCompany(name);
  redirect(`/?companyId=${company.id}`);
}

async function createProcessAction(formData: FormData) {
  "use server";
  const companyId = String(formData.get("companyId"));
  const name = String(formData.get("name") || "").trim();
  const category = String(formData.get("category") || "").trim();
  const customer = String(formData.get("customer") || "").trim();
  if (!name) return;
  const process = await createProcess(companyId, name, category, customer);
  redirect(`/?companyId=${companyId}&processId=${process.id}`);
}

async function startMeasurementAction(formData: FormData) {
  "use server";
  const processId = String(formData.get("processId"));
  const companyId = String(formData.get("companyId"));
  const year = Number(formData.get("year"));
  const measurement = await getOrCreateMeasurement(processId, year);
  redirect(`/fragebogen/${measurement.id}?companyId=${companyId}&processId=${processId}`);
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ companyId?: string; processId?: string }>;
}) {
  const params = await searchParams;
  const companies = await prisma.company.findMany({ orderBy: { name: "asc" } });
  const selectedCompany = params.companyId
    ? companies.find((c) => c.id === params.companyId)
    : undefined;

  const processes = selectedCompany
    ? await prisma.process.findMany({
        where: { companyId: selectedCompany.id },
        orderBy: { name: "asc" },
      })
    : [];

  const selectedProcess = params.processId
    ? processes.find((p) => p.id === params.processId)
    : undefined;

  const measurements = selectedProcess
    ? await prisma.measurement.findMany({
        where: { processId: selectedProcess.id },
        orderBy: { year: "desc" },
      })
    : [];

  const currentYear = new Date().getFullYear();

  return (
    <main className="mx-auto max-w-3xl p-8 space-y-8">
      <h1 className="text-2xl font-semibold">Digitales Reifegradmessungs-Tool</h1>

      {/* Schritt 1: Unternehmen */}
      <section className="space-y-3 rounded-lg border border-neutral-200 p-5">
        <h2 className="font-medium text-lg">1. Unternehmen</h2>
        <div className="flex flex-wrap gap-2">
          {companies.map((c) => (
            <Link
              key={c.id}
              href={`/?companyId=${c.id}`}
              className={`rounded-full px-3 py-1 text-sm border ${
                selectedCompany?.id === c.id
                  ? "bg-brand text-white border-brand"
                  : "border-neutral-300 hover:bg-neutral-100"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>
        <form action={createCompanyAction} className="flex gap-2 pt-2">
          <input
            name="name"
            placeholder="Neues Unternehmen / Organisationseinheit"
            className="flex-1 rounded border border-neutral-300 px-3 py-1.5 text-sm"
            required
          />
          <button className="rounded bg-brand px-3 py-1.5 text-sm text-white hover:bg-brand-dark">
            Anlegen
          </button>
        </form>
      </section>

      {/* Schritt 2: Prozess */}
      {selectedCompany && (
        <section className="space-y-3 rounded-lg border border-neutral-200 p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-medium text-lg">2. Prozess</h2>
            <Link
              href={`/auswertung/${selectedCompany.id}`}
              className="text-sm text-brand hover:underline"
            >
              Tabellarische Auswertung →
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {processes.map((p) => (
              <Link
                key={p.id}
                href={`/?companyId=${selectedCompany.id}&processId=${p.id}`}
                className={`rounded-full px-3 py-1 text-sm border ${
                  selectedProcess?.id === p.id
                    ? "bg-brand text-white border-brand"
                    : "border-neutral-300 hover:bg-neutral-100"
                }`}
              >
                {p.name}
              </Link>
            ))}
          </div>
          <form action={createProcessAction} className="grid grid-cols-2 gap-2 pt-2">
            <input type="hidden" name="companyId" value={selectedCompany.id} />
            <input
              name="name"
              placeholder="Prozessname"
              className="col-span-2 rounded border border-neutral-300 px-3 py-1.5 text-sm"
              required
            />
            <input
              name="category"
              placeholder="Prozesskategorie (optional)"
              className="rounded border border-neutral-300 px-3 py-1.5 text-sm"
            />
            <input
              name="customer"
              placeholder="Kunde(-n) (optional)"
              className="rounded border border-neutral-300 px-3 py-1.5 text-sm"
            />
            <button className="col-span-2 rounded bg-brand px-3 py-1.5 text-sm text-white hover:bg-brand-dark">
              Prozess anlegen
            </button>
          </form>
        </section>
      )}

      {/* Schritt 3: Messung */}
      {selectedProcess && (
        <section className="space-y-3 rounded-lg border border-neutral-200 p-5">
          <h2 className="font-medium text-lg">3. Messung</h2>

          {measurements.length > 0 && (
            <ul className="space-y-1">
              {measurements.map((m) => (
                <li key={m.id} className="flex items-center justify-between text-sm">
                  <span>Messjahr {m.year}</span>
                  <div className="flex gap-3">
                    <Link
                      href={`/fragebogen/${m.id}?companyId=${selectedCompany!.id}&processId=${selectedProcess.id}`}
                      className="text-brand hover:underline"
                    >
                      Fragebogen
                    </Link>
                    <Link
                      href={`/dashboard/${m.id}`}
                      className="text-brand hover:underline"
                    >
                      Dashboard
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {measurements.length > 1 && (
            <Link
              href={`/vergleich/${selectedProcess.id}`}
              className="inline-block text-sm text-brand hover:underline"
            >
              Jahresvergleich anzeigen →
            </Link>
          )}

          <form action={startMeasurementAction} className="flex gap-2 pt-2">
            <input type="hidden" name="processId" value={selectedProcess.id} />
            <input type="hidden" name="companyId" value={selectedCompany!.id} />
            <input
              name="year"
              type="number"
              defaultValue={currentYear}
              className="w-28 rounded border border-neutral-300 px-3 py-1.5 text-sm"
              required
            />
            <button className="rounded bg-brand px-3 py-1.5 text-sm text-white hover:bg-brand-dark">
              Messung starten / fortsetzen
            </button>
          </form>
        </section>
      )}
    </main>
  );
}

import { prisma } from "@/lib/prisma";
import { saveAnswer } from "@/app/actions";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ratingScale } from "../../../../prisma/catalog-data";

export default async function Fragebogen({
  params,
  searchParams,
}: {
  params: Promise<{ measurementId: string }>;
  searchParams: Promise<{ dim?: string; companyId?: string; processId?: string }>;
}) {
  const { measurementId } = await params;
  const sp = await searchParams;
  const dimIndex = Math.max(1, Number(sp.dim || 1));

  const measurement = await prisma.measurement.findUnique({
    where: { id: measurementId },
    include: { process: true, answers: true },
  });
  if (!measurement) notFound();

  const dimensions = await prisma.dimension.findMany({
    orderBy: { order: "asc" },
    include: {
      criteria: {
        orderBy: { order: "asc" },
        include: { questions: { orderBy: { number: "asc" } } },
      },
    },
  });

  const totalDims = dimensions.length;
  const currentDim = dimensions[dimIndex - 1];
  if (!currentDim) notFound();

  const answersByQuestion = new Map(
    measurement.answers.map((a) => [a.questionId, a])
  );

  const totalQuestions = dimensions.reduce(
    (sum, d) => sum + d.criteria.reduce((s, c) => s + c.questions.length, 0),
    0
  );
  const answeredCount = measurement.answers.filter((a) => a.value !== null || a.comment).length;

  async function submitDimension(formData: FormData) {
    "use server";
    for (const criterion of currentDim.criteria) {
      for (const question of criterion.questions) {
        const raw = formData.get(`q_${question.id}`);
        const comment = String(formData.get(`c_${question.id}`) || "");
        const value = raw === "nv" || raw === null || raw === "" ? null : Number(raw);
        await saveAnswer(measurementId, question.id, value, comment);
      }
    }
    const nav = String(formData.get("nav"));
    const query = `companyId=${sp.companyId || ""}&processId=${sp.processId || ""}`;
    if (nav === "prev" && dimIndex > 1) {
      redirect(`/fragebogen/${measurementId}?dim=${dimIndex - 1}&${query}`);
    } else if (nav === "next" && dimIndex < totalDims) {
      redirect(`/fragebogen/${measurementId}?dim=${dimIndex + 1}&${query}`);
    } else {
      redirect(`/dashboard/${measurementId}`);
    }
  }

  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  return (
    <main className="mx-auto max-w-2xl p-8 space-y-6">
      <div>
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          ← Zurück zur Übersicht
        </Link>
        <h1 className="text-xl font-semibold mt-2">
          {measurement.process.name} — Messjahr {measurement.year}
        </h1>
        <p className="text-sm text-neutral-500">
          Dimension {dimIndex} von {totalDims}: {currentDim.name}
        </p>
        <div className="mt-2 h-2 w-full rounded-full bg-neutral-200">
          <div
            className="h-2 rounded-full bg-black transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-neutral-500">
          {answeredCount} von {totalQuestions} Fragen beantwortet ({progressPercent}%)
        </p>
      </div>

      <form action={submitDimension} className="space-y-8">
        {currentDim.criteria.map((criterion) => (
          <fieldset key={criterion.id} className="space-y-4 rounded-lg border border-neutral-200 p-4">
            <legend className="px-1 font-medium">{criterion.name}</legend>
            {criterion.questions.map((q) => {
              const existing = answersByQuestion.get(q.id);
              return (
                <div key={q.id} className="space-y-2">
                  <p className="text-sm">
                    {q.number}. {q.text}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {ratingScale.map((scale) => (
                      <label key={scale.value} className="flex items-center gap-1 text-xs">
                        <input
                          type="radio"
                          name={`q_${q.id}`}
                          value={scale.value}
                          defaultChecked={existing?.value === scale.value}
                        />
                        {scale.value} – {scale.label}
                      </label>
                    ))}
                    <label className="flex items-center gap-1 text-xs">
                      <input
                        type="radio"
                        name={`q_${q.id}`}
                        value="nv"
                        defaultChecked={existing?.value === null && existing !== undefined}
                      />
                      nicht bewertbar
                    </label>
                  </div>
                  <input
                    type="text"
                    name={`c_${q.id}`}
                    placeholder="Kommentar (optional)"
                    defaultValue={existing?.comment || ""}
                    className="w-full rounded border border-neutral-300 px-2 py-1 text-xs"
                  />
                </div>
              );
            })}
          </fieldset>
        ))}

        <div className="flex justify-between pt-2">
          <button
            name="nav"
            value="prev"
            disabled={dimIndex === 1}
            className="rounded border border-neutral-300 px-4 py-2 text-sm disabled:opacity-40"
          >
            ← Zurück
          </button>
          <button
            name="nav"
            value="next"
            className="rounded bg-black px-4 py-2 text-sm text-white"
          >
            {dimIndex < totalDims ? "Speichern & Weiter →" : "Speichern & Abschließen"}
          </button>
        </div>
      </form>
    </main>
  );
}

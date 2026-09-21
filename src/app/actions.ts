"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCompany(name: string) {
  const company = await prisma.company.create({ data: { name } });
  revalidatePath("/");
  return company;
}

export async function createProcess(
  companyId: string,
  name: string,
  category: string,
  customer: string,
  parentId: string | null = null
) {
  const process = await prisma.process.create({
    data: {
      companyId,
      parentId,
      name,
      category: category || null,
      customer: customer || null,
    },
  });
  revalidatePath("/");
  return process;
}

// Findet eine bestehende Messung für Prozess+Jahr oder legt eine neue an.
// Historische Messungen werden nie überschrieben - jede Kombination Prozess+Jahr
// ist eine eigene, fortlaufend gespeicherte Messung.
export async function getOrCreateMeasurement(processId: string, year: number) {
  const existing = await prisma.measurement.findFirst({
    where: { processId, year },
    orderBy: { createdAt: "desc" },
  });
  if (existing) return existing;

  const measurement = await prisma.measurement.create({
    data: { processId, year },
  });
  revalidatePath("/");
  return measurement;
}

export async function saveAnswer(
  measurementId: string,
  questionId: string,
  value: number | null,
  comment: string
) {
  await prisma.answer.upsert({
    where: {
      measurementId_questionId: { measurementId, questionId },
    },
    update: { value, comment: comment || null },
    create: { measurementId, questionId, value, comment: comment || null },
  });
}

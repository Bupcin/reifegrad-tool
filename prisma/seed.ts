import { PrismaClient } from "@prisma/client";
import { dimensions } from "./catalog-data";

const prisma = new PrismaClient();

async function main() {
  for (let dIndex = 0; dIndex < dimensions.length; dIndex++) {
    const dimensionSeed = dimensions[dIndex];
    const dimension = await prisma.dimension.create({
      data: { name: dimensionSeed.name, order: dIndex + 1 },
    });

    for (let cIndex = 0; cIndex < dimensionSeed.criteria.length; cIndex++) {
      const criterionSeed = dimensionSeed.criteria[cIndex];
      const criterion = await prisma.criterion.create({
        data: {
          name: criterionSeed.name,
          order: cIndex + 1,
          dimensionId: dimension.id,
        },
      });

      for (const question of criterionSeed.questions) {
        await prisma.question.create({
          data: {
            number: question.number,
            text: question.text,
            criterionId: criterion.id,
          },
        });
      }
    }
  }

  const company = await prisma.company.create({
    data: { name: "Beispielunternehmen" },
  });

  await prisma.process.create({
    data: {
      name: "Beispielprozess",
      category: "Verwaltung",
      companyId: company.id,
    },
  });

  console.log("Seed abgeschlossen.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

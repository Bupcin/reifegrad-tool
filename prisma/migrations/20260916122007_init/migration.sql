-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Process" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "customer" TEXT,
    "companyId" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Process_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dimension" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "Dimension_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Criterion" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "dimensionId" TEXT NOT NULL,

    CONSTRAINT "Criterion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "hint" TEXT,
    "criterionId" TEXT NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Measurement" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "processId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Measurement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answer" (
    "id" TEXT NOT NULL,
    "value" INTEGER,
    "comment" TEXT,
    "measurementId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Measurement_processId_year_idx" ON "Measurement"("processId", "year");

-- CreateIndex
CREATE UNIQUE INDEX "Answer_measurementId_questionId_key" ON "Answer"("measurementId", "questionId");

-- AddForeignKey
ALTER TABLE "Process" ADD CONSTRAINT "Process_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Process" ADD CONSTRAINT "Process_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Process"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Criterion" ADD CONSTRAINT "Criterion_dimensionId_fkey" FOREIGN KEY ("dimensionId") REFERENCES "Dimension"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_criterionId_fkey" FOREIGN KEY ("criterionId") REFERENCES "Criterion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Measurement" ADD CONSTRAINT "Measurement_processId_fkey" FOREIGN KEY ("processId") REFERENCES "Process"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_measurementId_fkey" FOREIGN KEY ("measurementId") REFERENCES "Measurement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

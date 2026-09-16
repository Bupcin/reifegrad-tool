import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getMeasurementResult } from "@/lib/scoring";
import MeasurementReport from "@/lib/pdf/MeasurementReport";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ measurementId: string }> }
) {
  const { measurementId } = await params;
  const result = await getMeasurementResult(measurementId);
  if (!result) {
    return NextResponse.json({ error: "Messung nicht gefunden" }, { status: 404 });
  }

  const buffer = await renderToBuffer(MeasurementReport({ result }));

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="reifegrad-${result.processName}-${result.year}.pdf"`,
    },
  });
}

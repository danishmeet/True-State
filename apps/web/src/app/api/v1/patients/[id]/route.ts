import { NextResponse } from "next/server";
import { PATIENTS, generatePatientDetail } from "@/lib/mock-data";
import type { ApiResponse, PatientDetail } from "@/lib/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<PatientDetail | null>>> {
  const { id } = await params;
  const patient = PATIENTS.find((p) => p.id === id);

  if (!patient) {
    return NextResponse.json(
      { success: false, data: null, error: `Patient ${id} not found` },
      { status: 404 }
    );
  }

  const detail = generatePatientDetail(patient);

  return NextResponse.json({
    success: true,
    data: detail,
    error: null,
  });
}

import { NextResponse } from "next/server";
import { PATIENTS } from "@/lib/mock-data";
import type { ApiResponse, Patient } from "@/lib/types";

export async function GET(
  request: Request
): Promise<NextResponse<ApiResponse<Patient[]>>> {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") ?? 10)));
  const search = (searchParams.get("search") ?? "").toLowerCase();
  const statusFilter = searchParams.get("status");

  let filtered = PATIENTS;

  if (search) {
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.id.toLowerCase().includes(search)
    );
  }

  if (statusFilter && statusFilter !== "all") {
    filtered = filtered.filter((p) => p.status === statusFilter);
  }

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);

  return NextResponse.json({
    success: true,
    data,
    error: null,
    meta: { page, pageSize, total },
  });
}

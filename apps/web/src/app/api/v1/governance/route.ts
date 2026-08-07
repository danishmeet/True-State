import { NextResponse } from "next/server";
import { GOVERNANCE } from "@/lib/mock-data";
import type { ApiResponse, GovernanceData } from "@/lib/types";

export async function GET(): Promise<NextResponse<ApiResponse<GovernanceData>>> {
  return NextResponse.json({
    success: true,
    data: GOVERNANCE,
    error: null,
  });
}

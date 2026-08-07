import { NextResponse } from "next/server";
import { INFRASTRUCTURE } from "@/lib/mock-data";
import type { ApiResponse, InfrastructureData } from "@/lib/types";

export async function GET(): Promise<NextResponse<ApiResponse<InfrastructureData>>> {
  return NextResponse.json({
    success: true,
    data: INFRASTRUCTURE,
    error: null,
  });
}

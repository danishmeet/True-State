import { NextResponse } from "next/server";
import { CAUSAL_DEBUGGER } from "@/lib/mock-data";
import type { ApiResponse, CausalDebuggerData } from "@/lib/types";

export async function GET(): Promise<NextResponse<ApiResponse<CausalDebuggerData>>> {
  return NextResponse.json({
    success: true,
    data: CAUSAL_DEBUGGER,
    error: null,
  });
}

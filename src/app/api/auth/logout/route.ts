import { NextRequest, NextResponse } from "next/server";
import { verifyToken, blacklistToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (token && verifyToken(token)) {
    await blacklistToken(token);
  }

  return NextResponse.json({ message: "Logged out successfully" });
}

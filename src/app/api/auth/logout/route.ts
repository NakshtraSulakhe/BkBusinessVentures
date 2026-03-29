import { NextRequest, NextResponse } from "next/server"
import { verifyToken, blacklistToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (token) {
      try {
        // Verify token is valid before blacklisting
        verifyToken(token);
        await blacklistToken(token);
      } catch (error) {
        // Token is invalid or expired, but we still return success
        // since the user wants to logout anyway
        console.log('Token verification during logout:', error instanceof Error ? error.message : 'Unknown error');
      }
    }

    return NextResponse.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error('Logout error:', error);
    // Even if there's an error, we want the client to be logged out
    return NextResponse.json({ message: "Logged out successfully" });
  }
}

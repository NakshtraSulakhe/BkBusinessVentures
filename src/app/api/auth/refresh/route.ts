import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/database"
import { verifyToken, signToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    // Verify the current token (even if expired, we can extract the user info)
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      return NextResponse.json({ 
        error: "Token completely invalid - please login again",
        suggestion: "Go to login page" 
      }, { status: 401 });
    }

    // Get fresh user data
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || !user.isActive) {
      return NextResponse.json({ 
        error: "User not found or inactive",
        suggestion: "Contact administrator" 
      }, { status: 403 });
    }

    // Issue new token
    const newToken = signToken({
      userId: user.id,
      email: user.email
    });

    return NextResponse.json({
      message: "Token refreshed successfully",
      token: newToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json({ 
      error: "Server error during token refresh" 
    }, { status: 500 });
  }
}

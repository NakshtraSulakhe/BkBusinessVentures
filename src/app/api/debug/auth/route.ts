import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/database"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    
    if (!token) {
      return NextResponse.json({ 
        error: "No token found",
        suggestion: "Please log in first" 
      }, { status: 401 })
    }

    let decoded;
    try {
      decoded = verifyToken(token)
    } catch (error) {
      return NextResponse.json({ 
        error: "Invalid token",
        details: error instanceof Error ? error.message : 'Unknown error',
        suggestion: "Please log in again" 
      }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user) {
      return NextResponse.json({ 
        error: "User not found in database",
        userId: decoded.userId,
        suggestion: "Your account may have been deleted" 
      }, { status: 403 })
    }

    if (!user.isActive) {
      return NextResponse.json({ 
        error: "Account is inactive",
        user: { id: user.id, email: user.email, role: user.role, isActive: user.isActive },
        suggestion: "Contact administrator to activate your account" 
      }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      },
      canCreateUsers: user.role === "admin",
      message: user.role === "admin" 
        ? "You can create users" 
        : "You need admin privileges to create users"
    })

  } catch (error) {
    console.error("Debug auth error:", error)
    return NextResponse.json({ 
      error: "Server error", 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

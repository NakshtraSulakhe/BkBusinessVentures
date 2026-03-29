import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/database"
import { hashPassword } from "@/lib/auth"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    
    if (!token) {
      return NextResponse.json({ error: "Authorization required" }, { status: 401 })
    }

    let decoded;
    try {
      decoded = verifyToken(token)
    } catch (error) {
      console.error("Token verification failed:", error)
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 403 })
    }

    if (!user.isActive) {
      return NextResponse.json({ error: "Account is inactive" }, { status: 403 })
    }

    // Only admins can see all users, operators can only see themselves
    if (user.role === "admin") {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" }
      })
      return NextResponse.json(users)
    } else {
      // Operators can only see their own profile
      return NextResponse.json([{
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      }])
    }
  } catch (error) {
    console.error("Failed to fetch users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, role } = body

    // Check if this is the first user (allow creation without auth)
    const userCount = await prisma.user.count()
    const isFirstUser = userCount === 0
    
    // If not first user, require authentication (admin only)
    if (!isFirstUser) {
      const token = request.headers.get("authorization")?.replace("Bearer ", "")
      
      if (!token) {
        return NextResponse.json({ error: "Authorization required" }, { status: 401 })
      }

      let decoded;
      try {
        decoded = verifyToken(token)
      } catch (error) {
        console.error("Token verification failed:", error)
        return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
      }
      
      const requestingUser = await prisma.user.findUnique({
        where: { id: decoded.userId }
      })

      if (!requestingUser) {
        console.log('Requesting user not found in database')
        return NextResponse.json({ error: "Access denied: User not found" }, { status: 403 })
      }

      if (!requestingUser.isActive) {
        console.log('Requesting user account is inactive')
        return NextResponse.json({ error: "Access denied: Inactive account" }, { status: 403 })
      }

      // Only admins should be able to create users
      if (requestingUser.role !== "admin") {
        console.log('Non-admin user attempted to create a user. Role:', requestingUser.role)
        return NextResponse.json({ error: "Admin access required to create users" }, { status: 403 })
      }
    }

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Validate role
    if (!['admin', 'operator'].includes(role)) {
      return NextResponse.json({ error: "Invalid role. Must be 'admin' or 'operator'" }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        isActive: true
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    })

    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    console.error("Failed to create user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}

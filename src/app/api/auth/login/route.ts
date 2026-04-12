import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/users";
import { comparePassword, signToken } from "@/lib/auth";

// Force Node.js runtime to avoid Edge runtime issues
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function POST(request: NextRequest) {
  console.log(" LOGIN API CALLED - Request headers:", Object.fromEntries(request.headers.entries()));
  
  let body;
  try {
    // Clone request to allow re-reading if needed
    const clonedRequest = request.clone();
    body = await clonedRequest.json();
    console.log(" BODY RECEIVED:", body);
  } catch (err) {
    console.error(" JSON parse error:", err);
    // Try reading as text for debugging
    try {
      const text = await request.text();
      console.error(" Raw body text:", text);
    } catch {}
    return NextResponse.json(
      { error: "Invalid request body", details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 400 }
    );
  }

  const { email, password } = body;

  if (!email || !password) {
    console.log(" Missing credentials:", { email: !!email, password: !!password });
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  try {
    console.log(" Looking up user:", email);
    const user = await findUserByEmail(email);

    if (!user) {
      console.log(" User not found:", email);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    console.log(" Comparing password for user:", user.id);
    const isValid = await comparePassword(password, user.passwordHash);

    if (!isValid) {
      console.log(" Invalid password for user:", user.id);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    console.log(" Password valid, generating token for user:", user.id);
    const token = signToken({ userId: user.id, email: user.email });

    const response = {
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name ?? "",
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
      token,
    };

    console.log(" Login successful, sending response");
    return NextResponse.json(response);
  } catch (error) {
    console.error(" Login error:", error);
    return NextResponse.json(
      { error: "Login failed", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

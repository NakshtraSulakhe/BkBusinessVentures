import { NextRequest, NextResponse } from "next/server";
import { createUser } from "@/lib/users";
import { signToken } from "@/lib/auth";

// Force Node.js runtime to avoid Edge runtime issues
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function POST(request: NextRequest) {
  console.log(" SIGNUP API CALLED");
  
  let body;
  try {
    // Clone request to allow re-reading if needed
    const clonedRequest = request.clone();
    body = await clonedRequest.json();
    console.log(" SIGNUP BODY RECEIVED:", { email: body.email, name: body.name });
  } catch (err) {
    console.error(" SIGNUP JSON parse error:", err);
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

  const { email, password, name } = body;

  if (!email || !password) {
    console.log(" Missing signup credentials:", { email: !!email, password: !!password });
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters" },
      { status: 400 }
    );
  }

  try {
    console.log(" Creating user:", email);
    const user = await createUser(
      email,
      password,
      typeof name === "string" ? name : ""
    );

    if (!user) {
      console.log(" User already exists:", email);
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    console.log(" User created successfully:", user.id);
    const token = signToken({ userId: user.id, email: user.email });

    return NextResponse.json({
      message: "User created successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error(" Signup error:", error);
    return NextResponse.json(
      { error: "Signup failed", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

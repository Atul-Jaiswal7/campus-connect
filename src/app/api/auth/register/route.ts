import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/services/auth.service";
import { registerSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = registerSchema.parse(body);
    const user = await registerUser(validated);

    return NextResponse.json(
      {
        success: true,
        data: { id: user.id, email: user.email },
        message: "Registration successful",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/auth/register error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Registration failed" },
      { status: 400 }
    );
  }
}

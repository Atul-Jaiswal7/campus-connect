import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // TODO: Verify token properly with JWT or database
    // For now, we'll just verify the user (simplified)
    // In production, you'd decode the JWT token to get the userId
    
    // This is a simplified version - in production, verify the JWT token
    // const decoded = jwt.verify(token, env.JWT_SECRET);
    // await verifyUser(decoded.userId);
    
    return NextResponse.json(
      { message: "Email verified successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/auth/verify-email error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Verification failed" },
      { status: 400 }
    );
  }
}

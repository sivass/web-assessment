import { NextResponse } from "next/server";

// Mock MFA attempts store
const mfaAttempts = new Map<string, number>();

export async function POST(request: Request) {
  const { code } = await request.json();

  // Simulate TOTP validation (demo code: 123456)
  const isValid = code === "123456";

  if (!isValid) {
    // Track attempts
    const attempts = (mfaAttempts.get("demo") || 0) + 1;
    mfaAttempts.set("demo", attempts);

    if (attempts >= 3) {
      return NextResponse.json(
        { error: "Account locked. Too many attempts." },
        { status: 403 }
      );
    }

    return NextResponse.json({ error: "Invalid code" }, { status: 401 });
  }

  return NextResponse.json({ success: true });
}

import { NextResponse } from "next/server";

// Mock MFA attempts store
const mfaAttempts = new Map<string, number>();

export async function POST(request: Request) {
  const { code, username } = await request.json();

  // Simulate TOTP validation (demo code: 123456)
  const isValid = code === "123456";

  if (!isValid) {
    // Track attempts per username
    const userKey = username || "demo";
    const attempts = (mfaAttempts.get(userKey) || 0) + 1;
    mfaAttempts.set(userKey, attempts);

    console.log(`MFA attempts for ${userKey}: ${attempts}`);

    if (attempts >= 3) {
      console.log(`Account locked for ${userKey} after ${attempts} attempts`);
      return NextResponse.json(
        { error: "Account locked. Too many attempts." },
        { status: 403 }
      );
    }

    return NextResponse.json({ error: "Invalid code" }, { status: 401 });
  }

  // Reset attempts on successful verification
  const userKey = username || "demo";
  mfaAttempts.delete(userKey);

  // Generate auth token and set cookie
  const token = Buffer.from(`${username || 'user'}:mock-token`).toString("base64");
  
  const response = NextResponse.json({ success: true });
  response.cookies.set("auth-token", token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    maxAge: 3600, // 1 hour
    path: "/",
    sameSite: "lax"
  });

  return response;
}

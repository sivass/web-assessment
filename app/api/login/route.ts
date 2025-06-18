import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  const { username, hashedPassword, secureWord } = await request.json();
  const cookieStore = await cookies();

  // Get stored secure word from cookie
  const storedSecureWord = cookieStore.get(`secure-word-${username}`)?.value;

  console.log("Login attempt for username:", username);
  console.log("Provided secure word:", secureWord);
  console.log("Stored secure word:", storedSecureWord);
  console.log("Secure words match:", storedSecureWord === secureWord);

  // Validate secure word
  if (!storedSecureWord || storedSecureWord !== secureWord) {
    console.log("Secure word validation failed - returning error");
    return NextResponse.json({ 
      error: "Invalid or expired secure word. Please start over.", 
      code: "SECURE_WORD_INVALID" 
    }, { status: 401 });
  }

  // In a real app, verify hashedPassword against database
  if (!hashedPassword) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  console.log("Login successful - setting auth token");

  // Generate mock JWT
//   const token = Buffer.from(`${username}:mock-token`).toString("base64");

  // Set auth cookie
  const response = NextResponse.json({ success: true });
//   response.cookies.set("auth-token", token, {
//     httpOnly: false,
//     secure: process.env.NODE_ENV === "production",
//     maxAge: 3600, // 1 hour
//     path: "/",
//     sameSite: "lax"
//   });

  // Clear the secure word cookie
  response.cookies.set(`secure-word-${username}`, "", {
    maxAge: 0,
    path: "/",
  });

  return response;
}

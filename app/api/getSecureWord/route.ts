import { NextResponse } from "next/server";
import CryptoJS from "crypto-js";

const lastRequestTime = new Map<string, number>();

export async function POST(req: Request) {
  const { username } = await req.json();

  // Rate limiting (1 request per 10 seconds)
  const lastTime = lastRequestTime.get(username);
  if (lastTime && Date.now() - lastTime < 10_000) {
    return NextResponse.json(
      { error: "Rate limited. Try again later." },
      { status: 429 }
    );
  }

  lastRequestTime.set(username, Date.now());

  // Generate secure word
  const secureWord = CryptoJS.SHA256(
    `${username}-${Date.now()}-${process.env.SECRET_KEY}`
  )
    .toString()
    .substring(0, 12);

  const response = NextResponse.json({
    secureWord,
    expiresIn: 60,
    issuedAt: Date.now(),
  });

  // Store secure word in cookie
  response.cookies.set(`secure-word-${username}`, secureWord, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60, // 60 seconds
    path: "/",
    sameSite: "lax",
  });

  return response;
}

import { NextResponse } from "next/server";
import CryptoJS from "crypto-js";
import { cookies } from "next/headers";

const lastRequestTime = new Map<string, number>();

// Test helper function to clear rate limiting state
export const clearRateLimitState = () => {
  lastRequestTime.clear();
};

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

  // Check for existing secure word and validate expiration
  const cookieStore = await cookies();
  const existingSecureWord = cookieStore.get(`secure-word-${username}`)?.value;
  
  if (existingSecureWord) {
    // Check if the secure word is still valid (60 seconds)
    const secureWordTime = cookieStore.get(`secure-word-time-${username}`)?.value;
    if (secureWordTime) {
      const issuedTime = parseInt(secureWordTime);
      const currentTime = Date.now();
      
      if (currentTime - issuedTime < 60_000) {
        // Secure word is still valid, return existing one
        return NextResponse.json({
          secureWord: existingSecureWord,
          expiresIn: Math.max(0, 60 - Math.floor((currentTime - issuedTime) / 1000)),
          issuedAt: issuedTime,
        });
      }
    }
  }

  // Generate new secure word
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

  // Store timestamp for expiration checking
  response.cookies.set(`secure-word-time-${username}`, Date.now().toString(), {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60, // 60 seconds
    path: "/",
    sameSite: "lax",
  });

  return response;
}

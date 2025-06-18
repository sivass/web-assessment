import { NextResponse } from "next/server";


export async function POST(request: Request) {
  const { username } = await request.json();


  // Clear secure word cookies
  const response = NextResponse.json({ 
    message: "Secure word cleared for testing",
    username 
  });
  
  response.cookies.set(`secure-word-${username}`, "", {
    maxAge: 0,
    path: "/",
  });
  
  response.cookies.set(`secure-word-time-${username}`, "", {
    maxAge: 0,
    path: "/",
  });

  return response;
} 
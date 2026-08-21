import { NextResponse } from "next/server";
import { revokeCurrentAppSession, V4_SESSION_COOKIE } from "@/lib/v4-auth";

export async function POST() {
  await revokeCurrentAppSession();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(V4_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
  return response;
}

export async function GET(request: Request) {
  await revokeCurrentAppSession();
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.set(V4_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
  return response;
}

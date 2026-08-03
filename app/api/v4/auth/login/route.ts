import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { appUsers } from "@/db/schema";
import {
  createAppSession,
  findLoginUser,
  normalizeRole,
  verifyPassword,
  V4_SESSION_COOKIE,
  writeAuditLog,
} from "@/lib/v4-auth";

function clientIp(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "";
}

export async function POST(request: NextRequest) {
  let body: { login?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求格式无效 / Invalid request" }, { status: 400 });
  }

  const login = String(body.login || "").trim();
  const password = String(body.password || "");
  if (!login || !password) {
    return NextResponse.json({ error: "请输入账号和密码 / Enter login and password" }, { status: 400 });
  }

  const user = await findLoginUser(login);
  const valid = Boolean(
    user &&
      user.status === "active" &&
      normalizeRole(user.role) &&
      (await verifyPassword(password, user.passwordHash, user.passwordSalt)),
  );

  if (!valid || !user) {
    await writeAuditLog({
      action: "login_failed",
      entityType: "app_user",
      details: { login },
      ipAddress: clientIp(request),
    });
    return NextResponse.json({ error: "账号或密码错误 / Invalid login or password" }, { status: 401 });
  }

  const db = await getDb();
  const session = await createAppSession(user.id);
  await db.update(appUsers).set({ lastLoginAt: new Date().toISOString(), updatedAt: new Date().toISOString() }).where(eq(appUsers.id, user.id));
  await writeAuditLog({
    userId: user.id,
    action: "login_success",
    entityType: "app_user",
    entityId: String(user.id),
    details: { role: user.role },
    ipAddress: clientIp(request),
  });

  const response = NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      customerId: user.customerId,
    },
  });
  response.cookies.set(V4_SESSION_COOKIE, session.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(session.expiresAt),
  });
  return response;
}

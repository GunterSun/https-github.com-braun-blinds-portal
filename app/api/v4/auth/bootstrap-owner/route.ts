import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { appUsers } from "@/db/schema";
import { hashPassword, writeAuditLog } from "@/lib/v4-auth";

export async function POST(request: NextRequest) {
  const bootstrapKey = process.env.V4_BOOTSTRAP_KEY;
  if (!bootstrapKey) {
    return NextResponse.json({ error: "V4_BOOTSTRAP_KEY 尚未配置", setupRequired: true }, { status: 503 });
  }

  const suppliedKey = request.headers.get("x-bootstrap-key") || "";
  if (suppliedKey !== bootstrapKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { email?: string; username?: string; password?: string; displayName?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const email = String(body.email || "").trim().toLowerCase();
  const username = String(body.username || "").trim().toLowerCase();
  const password = String(body.password || "");
  const displayName = String(body.displayName || "Owner").trim();
  if (!email || !username || password.length < 10) {
    return NextResponse.json({ error: "Email、username 必填，密码至少 10 位" }, { status: 400 });
  }

  const db = await getDb();
  const existingOwner = await db.select({ id: appUsers.id }).from(appUsers).where(eq(appUsers.role, "owner")).limit(1);
  if (existingOwner.length > 0) {
    return NextResponse.json({ error: "Owner 已存在，bootstrap 已关闭" }, { status: 409 });
  }

  const passwordData = await hashPassword(password);
  const result = await db.insert(appUsers).values({
    email,
    username,
    passwordHash: passwordData.hash,
    passwordSalt: passwordData.salt,
    displayName,
    role: "owner",
    status: "active",
  }).returning({ id: appUsers.id });

  const ownerId = result[0]?.id;
  await writeAuditLog({
    userId: ownerId,
    action: "bootstrap_owner_created",
    entityType: "app_user",
    entityId: String(ownerId || ""),
    details: { email, username },
  });

  return NextResponse.json({ ok: true, ownerId }, { status: 201 });
}

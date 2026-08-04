import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { appUsers } from "@/db/schema";
import { hashPassword, writeAuditLog } from "@/lib/v4-auth";

export async function POST(request: NextRequest) {
  const bootstrapKey = process.env.V4_BOOTSTRAP_KEY;
  const suppliedKey = request.headers.get("x-bootstrap-key") || "";
  const sitesEmail = String(request.headers.get("oai-authenticated-user-email") || "").trim().toLowerCase();
  const allowedOwnerEmail = String(process.env.V4_OWNER_EMAIL || "").trim().toLowerCase();
  const validBootstrapKey = Boolean(bootstrapKey && suppliedKey && suppliedKey === bootstrapKey);
  const validPrivateSiteOwner = Boolean(allowedOwnerEmail && sitesEmail && sitesEmail === allowedOwnerEmail);
  if (!validBootstrapKey && !validPrivateSiteOwner) {
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

  let result: { id: number }[];
  try {
    const passwordData = await hashPassword(password);
    result = await db.insert(appUsers).values({
      email,
      username,
      passwordHash: passwordData.hash,
      passwordSalt: passwordData.salt,
      displayName,
      role: "owner",
      status: "active",
    }).returning({ id: appUsers.id });
  } catch {
    return NextResponse.json({ error: "Owner 初始化失败，请稍后重试" }, { status: 500 });
  }

  const ownerId = result[0]?.id;
  await writeAuditLog({
    userId: ownerId,
    action: "bootstrap_owner_created",
    entityType: "app_user",
    entityId: String(ownerId || ""),
    details: { email, username, bootstrapMethod: validPrivateSiteOwner ? "private_site_owner" : "bootstrap_key" },
  });

  return NextResponse.json({ ok: true, ownerId }, { status: 201 });
}

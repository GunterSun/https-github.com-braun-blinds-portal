import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { appUsers } from "@/db/schema";
import { getCurrentAppUser, writeAuditLog } from "@/lib/v4-auth";
import { visibleNavigation } from "@/lib/permissions";

export async function GET() {
  const user = await getCurrentAppUser();
  if (!user) return NextResponse.json({ authenticated: false }, { status: 401 });
  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      phone: user.phone,
      role: user.role,
      customerId: user.customerId,
      menus: visibleNavigation(user.role),
    },
  });
}

export async function PATCH(request: NextRequest) {
  const user = await getCurrentAppUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  let body: { phone?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }

  const phone = String(body.phone || "").trim().slice(0, 50);
  const digitCount = phone.replace(/\D/g, "").length;
  if (digitCount < 7 || digitCount > 20) {
    return NextResponse.json({ error: "请输入有效手机号" }, { status: 400 });
  }

  const db = await getDb();
  await db.update(appUsers).set({ phone, updatedAt: new Date().toISOString() }).where(eq(appUsers.id, user.id));
  await writeAuditLog({ userId: user.id, action: "profile_phone_updated", entityType: "app_user", entityId: String(user.id) });
  return NextResponse.json({ ok: true, phone });
}

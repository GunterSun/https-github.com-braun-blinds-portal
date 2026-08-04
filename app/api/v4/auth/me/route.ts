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
      preferredLocale: user.preferredLocale,
      role: user.role,
      customerId: user.customerId,
      menus: visibleNavigation(user.role),
    },
  });
}

export async function PATCH(request: NextRequest) {
  const user = await getCurrentAppUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  let body: { phone?: string; preferredLocale?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }

  const patch:Record<string,unknown>={updatedAt:new Date().toISOString()};let phone:string|undefined;
  if(body.phone!==undefined){phone=String(body.phone||"").trim().slice(0,50);const digitCount=phone.replace(/\D/g,"").length;if(digitCount<7||digitCount>20)return NextResponse.json({error:"请输入有效手机号"},{status:400});patch.phone=phone}
  if(body.preferredLocale!==undefined){if(!["en","zh-CN"].includes(body.preferredLocale))return NextResponse.json({error:"语言必须是 en 或 zh-CN"},{status:400});patch.preferredLocale=body.preferredLocale}
  if(phone===undefined&&body.preferredLocale===undefined)return NextResponse.json({error:"没有可更新的字段"},{status:400});
  const db=await getDb();await db.update(appUsers).set(patch).where(eq(appUsers.id,user.id));
  await writeAuditLog({userId:user.id,action:body.preferredLocale!==undefined?"profile_locale_updated":"profile_phone_updated",entityType:"app_user",entityId:String(user.id),details:{preferredLocale:body.preferredLocale}});
  return NextResponse.json({ok:true,phone:phone??user.phone,preferredLocale:body.preferredLocale??user.preferredLocale});
}

import { NextResponse } from "next/server";
import { getCurrentAppUser } from "@/lib/v4-auth";
import { ROLE_MENUS } from "@/lib/roles";

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
      menus: ROLE_MENUS[user.role],
    },
  });
}

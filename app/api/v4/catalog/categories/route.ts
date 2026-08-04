import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { productCategories } from "@/db/schema";
import { getCurrentAppUser } from "@/lib/v4-auth";

export async function GET() {
  const user = await getCurrentAppUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  const db = await getDb();
  const categories = await db.select().from(productCategories).where(eq(productCategories.status, "active")).orderBy(asc(productCategories.sortOrder), asc(productCategories.nameEn));
  return NextResponse.json({ categories });
}

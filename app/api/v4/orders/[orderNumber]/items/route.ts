import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { orderItems } from "@/db/order-schema";
import { getCurrentAppUser, writeAuditLog } from "@/lib/v4-auth";
import { hasPermission } from "@/lib/permissions";
import { findAccessibleOrder, recalculateOrderTotals } from "@/lib/order-access";
import { canEditOrderItems, parseOrderItem } from "@/lib/order-items";

export async function POST(request: NextRequest, context: { params: Promise<{ orderNumber: string }> }) {
  const user = await getCurrentAppUser();
  if (!user) return NextResponse.json({ error: "请先登录 / Authentication required" }, { status: 401 });
  if (!hasPermission(user.role, "orders.edit")) return NextResponse.json({ error: "无权修改订单" }, { status: 403 });
  const order = await findAccessibleOrder((await context.params).orderNumber, user);
  if (!order) return NextResponse.json({ error: "未找到订单 / Order not found" }, { status: 404 });
  if (!canEditOrderItems(order.status)) return NextResponse.json({ error: "订单确认后必须通过版本或调整流程修改产品" }, { status: 409 });

  let body: Record<string, unknown>;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "请求格式无效" }, { status: 400 }); }
  const parsed = parseOrderItem(body, user.role === "owner");
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const db = await getDb();
  const created = await db.insert(orderItems).values({ orderId: order.id, ...parsed.value }).returning();
  const totals = await recalculateOrderTotals(order.id);
  await writeAuditLog({ userId:user.id, action:"order_item_created", entityType:"order_item", entityId:String(created[0].id), details:{ orderNumber:order.orderNumber, after:created[0] } });
  return NextResponse.json({ item:created[0], totals }, { status:201 });
}

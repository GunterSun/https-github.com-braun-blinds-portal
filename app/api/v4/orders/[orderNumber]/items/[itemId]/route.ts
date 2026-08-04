import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { orderItems } from "@/db/order-schema";
import { getCurrentAppUser, writeAuditLog } from "@/lib/v4-auth";
import { hasPermission } from "@/lib/permissions";
import { findAccessibleOrder, recalculateOrderTotals } from "@/lib/order-access";
import { canEditOrderItems, parseOrderItem } from "@/lib/order-items";

export async function PATCH(request: NextRequest, context: { params: Promise<{ orderNumber:string; itemId:string }> }) {
  return mutate(request, context, false);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ orderNumber:string; itemId:string }> }) {
  return mutate(request, context, true);
}

async function mutate(request: NextRequest, context: { params: Promise<{ orderNumber:string; itemId:string }> }, remove: boolean) {
  const user = await getCurrentAppUser();
  if (!user) return NextResponse.json({ error:"请先登录 / Authentication required" }, { status:401 });
  if (!hasPermission(user.role,"orders.edit")) return NextResponse.json({ error:"无权修改订单" }, { status:403 });
  const params = await context.params;
  const order = await findAccessibleOrder(params.orderNumber,user);
  if (!order) return NextResponse.json({ error:"未找到订单 / Order not found" }, { status:404 });
  if (!canEditOrderItems(order.status)) return NextResponse.json({ error:"订单确认后必须通过版本或调整流程修改产品" }, { status:409 });
  const itemId = Number(params.itemId);
  if (!Number.isInteger(itemId) || itemId <= 0) return NextResponse.json({ error:"产品明细编号无效" }, { status:400 });
  const db = await getDb();
  const existing = await db.select().from(orderItems).where(and(eq(orderItems.id,itemId),eq(orderItems.orderId,order.id))).limit(1);
  if (!existing[0]) return NextResponse.json({ error:"未找到产品明细" }, { status:404 });

  if (remove) {
    await db.delete(orderItems).where(and(eq(orderItems.id,itemId),eq(orderItems.orderId,order.id)));
    const totals = await recalculateOrderTotals(order.id);
    await writeAuditLog({ userId:user.id, action:"order_item_deleted", entityType:"order_item", entityId:String(itemId), details:{ orderNumber:order.orderNumber, before:existing[0] } });
    return NextResponse.json({ ok:true, totals });
  }

  let body: Record<string,unknown>;
  try { body=await request.json(); }
  catch { return NextResponse.json({ error:"请求格式无效" }, { status:400 }); }
  const parsed=parseOrderItem({ ...existing[0], ...body },user.role==="owner");
  if ("error" in parsed) return NextResponse.json({ error:parsed.error }, { status:400 });
  const updated=await db.update(orderItems).set({
    ...parsed.value,
    costEstimateUsd:user.role==="owner"?parsed.value.costEstimateUsd:existing[0].costEstimateUsd,
    updatedAt:new Date().toISOString(),
  })
    .where(and(eq(orderItems.id,itemId),eq(orderItems.orderId,order.id))).returning();
  const totals=await recalculateOrderTotals(order.id);
  await writeAuditLog({ userId:user.id, action:"order_item_updated", entityType:"order_item", entityId:String(itemId), details:{ orderNumber:order.orderNumber, before:existing[0], after:updated[0] } });
  return NextResponse.json({ item:updated[0], totals });
}

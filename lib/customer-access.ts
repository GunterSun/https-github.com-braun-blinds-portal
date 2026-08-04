import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { customers } from "@/db/schema";
import { unifiedOrderAssignments, orders } from "@/db/order-schema";
import type { AppRole } from "@/lib/v4-auth";

export async function canAccessCustomer(user: { id: number; role: AppRole; customerId: number | null }, customerId: number) {
  if (user.role === "owner") return true;
  if (user.role === "customer") return user.customerId === customerId;
  if (user.role !== "sales") return false;
  const db = await getDb();
  const owned = await db.select({ id: customers.id }).from(customers)
    .where(and(eq(customers.id, customerId), eq(customers.salesOwnerUserId, user.id))).limit(1);
  if (owned[0]) return true;
  const row = await db.select({ id: orders.id }).from(orders)
    .innerJoin(unifiedOrderAssignments, eq(unifiedOrderAssignments.orderId, orders.id))
    .where(and(eq(orders.customerId, customerId), eq(unifiedOrderAssignments.userId, user.id))).limit(1);
  return Boolean(row[0]);
}

export function cleanText(value: unknown, maxLength: number) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

export function normalizeEmail(value: unknown) {
  return cleanText(value, 254).toLowerCase();
}

export function normalizePhone(value: unknown) {
  const raw = cleanText(value, 50);
  const digits = raw.replace(/\D/g, "");
  return digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
}

export async function addressHash(parts: unknown[]) {
  const normalized = parts.map((part) => cleanText(part, 200).toLowerCase().replace(/[^a-z0-9]/g, "")).join("|");
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(normalized));
  return Array.from(new Uint8Array(bytes)).map((value) => value.toString(16).padStart(2, "0")).join("");
}

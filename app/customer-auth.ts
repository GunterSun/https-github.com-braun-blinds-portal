import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import { getDb } from "@/db";
import { customerSessions, customers } from "@/db/schema";

export const CUSTOMER_SESSION_COOKIE = "braun_customer_session";

function toHex(bytes: Uint8Array) {
  return Array.from(bytes).map((value) => value.toString(16).padStart(2, "0")).join("");
}

async function hashSessionToken(token: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return toHex(new Uint8Array(digest));
}

export async function getCustomerSession() {
  const token = (await cookies()).get(CUSTOMER_SESSION_COOKIE)?.value;
  if (!token) return null;

  const db = await getDb();
  const [customer] = await db
    .select({
      id: customers.id,
      email: customers.email,
      username: customers.username,
      companyName: customers.companyName,
      contactName: customers.contactName,
      phone: customers.phone,
      discountPercent: customers.discountPercent,
      status: customers.status,
    })
    .from(customerSessions)
    .innerJoin(customers, eq(customerSessions.customerId, customers.id))
    .where(and(
      eq(customerSessions.tokenHash, await hashSessionToken(token)),
      gt(customerSessions.expiresAt, new Date().toISOString()),
    ))
    .limit(1);

  return customer || null;
}

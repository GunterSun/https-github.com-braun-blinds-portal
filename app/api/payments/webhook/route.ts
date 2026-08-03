import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../../../db";
import { customerOrders } from "../../../../db/schema";

function parseStripeSignature(header: string) {
  const values = new Map<string, string[]>();
  for (const part of header.split(",")) {
    const [key, value] = part.split("=", 2);
    if (!key || !value) continue;
    values.set(key, [...(values.get(key) || []), value]);
  }
  return { timestamp: values.get("t")?.[0], signatures: values.get("v1") || [] };
}

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let index = 0; index < a.length; index += 1) diff |= a.charCodeAt(index) ^ b.charCodeAt(index);
  return diff === 0;
}

async function verifySignature(payload: string, header: string, secret: string) {
  const { timestamp, signatures } = parseStripeSignature(header);
  if (!timestamp || signatures.length === 0) return false;
  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > 300) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${timestamp}.${payload}`));
  const expected = toHex(digest);
  return signatures.some((signature) => timingSafeEqual(expected, signature));
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET 尚未配置", setupRequired: true }, { status: 503 });

  const signature = req.headers.get("stripe-signature");
  const payload = await req.text();
  if (!signature || !(await verifySignature(payload, signature, webhookSecret))) {
    return NextResponse.json({ error: "Stripe Webhook 签名无效" }, { status: 400 });
  }

  const event = JSON.parse(payload);
  const session = event?.data?.object;
  const invoiceNumber = String(session?.metadata?.invoice_number || "").trim();
  if (!invoiceNumber) return NextResponse.json({ received: true, ignored: "missing_invoice_number" });

  const db = await getDb();
  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    if (session?.payment_status !== "paid" && event.type === "checkout.session.completed") {
      return NextResponse.json({ received: true, pending: true });
    }
    const paidAt = new Date((Number(session?.created) || Math.floor(Date.now() / 1000)) * 1000).toISOString();
    await db.update(customerOrders).set({
      paymentStatus: "paid",
      amountPaid: Number(session?.amount_total || 0) / 100,
      paymentCurrency: String(session?.currency || "usd").toLowerCase(),
      stripeSessionId: String(session?.id || ""),
      stripePaymentIntentId: String(session?.payment_intent || ""),
      paidAt,
    }).where(eq(customerOrders.invoiceNumber, invoiceNumber));
  } else if (event.type === "checkout.session.async_payment_failed") {
    await db.update(customerOrders).set({ paymentStatus: "failed" }).where(eq(customerOrders.invoiceNumber, invoiceNumber));
  }

  return NextResponse.json({ received: true });
}
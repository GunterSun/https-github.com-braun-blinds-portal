import { NextRequest, NextResponse } from "next/server";

function parseStripeSignature(header: string) {
  const values = new Map<string, string[]>();
  for (const part of header.split(",")) {
    const [key, value] = part.split("=", 2);
    if (!key || !value) continue;
    values.set(key, [...(values.get(key) || []), value]);
  }
  return {
    timestamp: values.get("t")?.[0],
    signatures: values.get("v1") || [],
  };
}

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let index = 0; index < a.length; index += 1) {
    diff |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return diff === 0;
}

async function verifySignature(payload: string, header: string, secret: string) {
  const { timestamp, signatures } = parseStripeSignature(header);
  if (!timestamp || signatures.length === 0) return false;

  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > 300) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${timestamp}.${payload}`),
  );
  const expected = toHex(digest);
  return signatures.some((signature) => timingSafeEqual(expected, signature));
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET 尚未配置", setupRequired: true },
      { status: 503 },
    );
  }

  const signature = req.headers.get("stripe-signature");
  const payload = await req.text();
  if (!signature || !(await verifySignature(payload, signature, webhookSecret))) {
    return NextResponse.json({ error: "Stripe Webhook 签名无效" }, { status: 400 });
  }

  const event = JSON.parse(payload);
  const session = event?.data?.object;
  const invoiceNumber = session?.metadata?.invoice_number;

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      // 下一步接入订单数据库后，在这里把对应 Invoice 更新为已付款，
      // 并保存 Stripe Session、Payment Intent、金额、币种和付款时间。
      console.info("Stripe payment completed", {
        invoiceNumber,
        sessionId: session?.id,
        paymentIntentId: session?.payment_intent,
        amountTotal: session?.amount_total,
        currency: session?.currency,
      });
      break;
    case "checkout.session.async_payment_failed":
      console.warn("Stripe payment failed", { invoiceNumber, sessionId: session?.id });
      break;
    default:
      break;
  }

  return NextResponse.json({ received: true });
}

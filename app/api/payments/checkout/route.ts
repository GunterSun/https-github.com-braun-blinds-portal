import { NextRequest, NextResponse } from "next/server";

type CheckoutRequest = {
  invoiceNumber: string;
  amount: number;
  currency?: string;
  customerEmail?: string;
  customerName?: string;
  description?: string;
  successUrl?: string;
  cancelUrl?: string;
};

const STRIPE_CHECKOUT_URL = "https://api.stripe.com/v1/checkout/sessions";

function append(form: URLSearchParams, key: string, value?: string | number) {
  if (value !== undefined && value !== null && String(value).length > 0) {
    form.append(key, String(value));
  }
}

export async function POST(req: NextRequest) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { error: "STRIPE_SECRET_KEY 尚未配置", setupRequired: true },
        { status: 503 },
      );
    }

    const body = (await req.json()) as CheckoutRequest;
    const amount = Number(body.amount);
    const invoiceNumber = String(body.invoiceNumber || "").trim();

    if (!invoiceNumber) {
      return NextResponse.json({ error: "缺少 Invoice 号码" }, { status: 400 });
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "付款金额必须大于 0" }, { status: 400 });
    }

    const origin = req.nextUrl.origin;
    const currency = (body.currency || "usd").toLowerCase();
    const amountInMinorUnit = Math.round(amount * 100);
    const successUrl = body.successUrl || `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = body.cancelUrl || `${origin}/payment/cancelled?invoice=${encodeURIComponent(invoiceNumber)}`;

    const form = new URLSearchParams();
    append(form, "mode", "payment");
    append(form, "success_url", successUrl);
    append(form, "cancel_url", cancelUrl);
    append(form, "payment_method_types[0]", "card");
    append(form, "line_items[0][quantity]", 1);
    append(form, "line_items[0][price_data][currency]", currency);
    append(form, "line_items[0][price_data][unit_amount]", amountInMinorUnit);
    append(form, "line_items[0][price_data][product_data][name]", `Braun Blinds Invoice ${invoiceNumber}`);
    append(form, "line_items[0][price_data][product_data][description]", body.description || "Invoice payment");
    append(form, "metadata[invoice_number]", invoiceNumber);
    append(form, "payment_intent_data[metadata][invoice_number]", invoiceNumber);
    append(form, "customer_email", body.customerEmail);
    append(form, "locale", "auto");
    append(form, "billing_address_collection", "auto");
    append(form, "allow_promotion_codes", "false");

    const response = await fetch(STRIPE_CHECKOUT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form.toString(),
      cache: "no-store",
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        { error: "Stripe 付款链接创建失败", details: data },
        { status: response.status },
      );
    }

    return NextResponse.json({
      sessionId: data.id,
      checkoutUrl: data.url,
      invoiceNumber,
      amount,
      currency: currency.toUpperCase(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "无法创建信用卡付款链接", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}

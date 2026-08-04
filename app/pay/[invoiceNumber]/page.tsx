"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Invoice = {
  orderNumber: string;
  invoiceNumber: string;
  projectName: string;
  wholesaleTotal: number;
  paymentStatus: string;
  amountPaid: number;
  paymentCurrency: string;
  balanceDue: number;
  customerEmail: string;
  customerName: string;
  paidAt?: string | null;
};

const money = (amount: number, currency = "usd") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(Number(amount || 0));

export default function InvoicePaymentPage() {
  const params = useParams<{ invoiceNumber: string }>();
  const invoiceNumber = String(params?.invoiceNumber || "");
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!invoiceNumber) return;
    fetch(`/api/invoices/${encodeURIComponent(invoiceNumber)}`, { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to load invoice");
        return data.invoice as Invoice;
      })
      .then(setInvoice)
      .catch((reason) => setError(reason instanceof Error ? reason.message : String(reason)))
      .finally(() => setLoading(false));
  }, [invoiceNumber]);

  async function payByCard() {
    if (!invoice || invoice.balanceDue <= 0) return;
    setPaying(true);
    setError("");
    try {
      const response = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          invoiceNumber: invoice.invoiceNumber,
          amount: invoice.balanceDue,
          currency: invoice.paymentCurrency || "usd",
          customerEmail: invoice.customerEmail,
          customerName: invoice.customerName,
          description: `${invoice.projectName || invoice.orderNumber} / Balance due`,
          successUrl: `${window.location.origin}/payment/success?invoice=${encodeURIComponent(invoice.invoiceNumber)}`,
          cancelUrl: `${window.location.origin}/payment/cancelled?invoice=${encodeURIComponent(invoice.invoiceNumber)}`,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to create payment link");
      window.location.href = data.checkoutUrl;
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
      setPaying(false);
    }
  }

  return (
    <main className="shell">
      <section className="card">
        <div className="brand">BRAUN BLINDS</div>
        {loading ? (
          <p>正在读取 Invoice… / Loading invoice…</p>
        ) : error ? (
          <div className="error">{error}</div>
        ) : invoice ? (
          <>
            <header>
              <div>
                <span>INVOICE PAYMENT / 发票付款</span>
                <h1>Invoice {invoice.invoiceNumber}</h1>
                <p>{invoice.projectName || invoice.orderNumber}</p>
              </div>
              <strong className={`status ${invoice.paymentStatus}`}>
                {invoice.paymentStatus === "paid" ? "已付款 / PAID" : invoice.paymentStatus === "partial" ? "部分付款 / PARTIAL" : "未付款 / UNPAID"}
              </strong>
            </header>

            <dl>
              <div><dt>订单号 / Order</dt><dd>{invoice.orderNumber}</dd></div>
              <div><dt>Invoice 总额 / Total</dt><dd>{money(invoice.wholesaleTotal, invoice.paymentCurrency)}</dd></div>
              <div><dt>已付款 / Paid</dt><dd>{money(invoice.amountPaid, invoice.paymentCurrency)}</dd></div>
              <div className="balance"><dt>应付余额 / Balance Due</dt><dd>{money(invoice.balanceDue, invoice.paymentCurrency)}</dd></div>
            </dl>

            {invoice.balanceDue > 0 ? (
              <button onClick={payByCard} disabled={paying}>
                {paying ? "正在进入安全付款… / Opening secure checkout…" : "信用卡付款 / Pay by Card"}
              </button>
            ) : (
              <div className="paid-note">✓ 此 Invoice 已结清 / This invoice is paid in full.</div>
            )}

            <small>信用卡资料由 Stripe 安全处理，Braun Portal 不保存完整卡号。<br/>Card details are processed securely by Stripe and are not stored in Braun Portal.</small>
            <Link href="/">← 返回客户门户 / Return to Customer Portal</Link>
          </>
        ) : null}
      </section>
      <style jsx>{`
        :global(*){box-sizing:border-box}:global(body){margin:0;background:#f4f1ea;color:#17211d;font-family:Arial,"PingFang SC",sans-serif}
        .shell{min-height:100vh;display:grid;place-items:center;padding:24px}.card{width:min(680px,100%);background:#fff;border:1px solid #dfdbd1;border-radius:22px;padding:34px;box-shadow:0 18px 55px rgba(25,35,30,.10)}
        .brand{font-size:13px;letter-spacing:.18em;font-weight:900;color:#1f5b49;margin-bottom:26px}header{display:flex;justify-content:space-between;gap:20px;align-items:flex-start;border-bottom:1px solid #ece8df;padding-bottom:22px}header span{font-size:11px;font-weight:800;letter-spacing:.14em;color:#8a6c3d}h1{font-size:34px;margin:7px 0 5px}header p{margin:0;color:#707872}.status{padding:9px 12px;border-radius:999px;font-size:12px;white-space:nowrap;background:#fff1df;color:#8a5c16}.status.paid{background:#e7f6ee;color:#17643f}.status.partial{background:#eaf1fb;color:#245c9a}
        dl{margin:24px 0}dl div{display:flex;justify-content:space-between;gap:20px;padding:13px 0;border-bottom:1px solid #eeeae2}dt{color:#69726d}dd{margin:0;font-weight:800;text-align:right}.balance{font-size:19px}.balance dd{color:#1f5b49}
        button{width:100%;border:0;border-radius:12px;background:#1f5b49;color:#fff;padding:15px;font-size:16px;font-weight:900;cursor:pointer}button:disabled{opacity:.65;cursor:wait}.paid-note{background:#eaf7ef;color:#17643f;border-radius:12px;padding:15px;text-align:center;font-weight:800}.error{background:#fff0ee;color:#9c352c;padding:14px;border-radius:12px}small{display:block;text-align:center;color:#737b76;line-height:1.5;margin:16px 0}a{display:block;text-align:center;color:#1f5b49;text-decoration:none;font-weight:800;margin-top:18px}@media(max-width:600px){.card{padding:23px}header{display:block}.status{display:inline-block;margin-top:14px}h1{font-size:28px}}
      `}</style>
    </main>
  );
}

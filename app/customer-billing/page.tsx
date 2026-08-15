"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Transaction = { id: number; type: string; status: string; amount: number; currency: string; provider: string; receiptNumber: string | null; occurredAt: string };
type Invoice = { id: number; invoiceNumber: string; version: number; status: string; currency: string; total: number; depositRequired: number; paid: number; balance: number; dueDate: string; issuedAt: string; documentSha256: string; transactions: Transaction[] };
type Lang = "zh" | "en";

const labels: Record<string, [string, string]> = {
  issued: ["已签发", "Issued"], partially_paid: ["部分付款", "Partially paid"], paid: ["已付清", "Paid"], overdue: ["已逾期", "Overdue"],
  pending: ["处理中", "Pending"], posted: ["已入账", "Posted"], failed: ["失败", "Failed"], reversed: ["已撤销", "Reversed"], refunded: ["已退款", "Refunded"],
  payment: ["付款", "Payment"], credit: ["贷项", "Credit"], adjustment: ["调整", "Adjustment"], refund: ["退款", "Refund"], reversal: ["撤销", "Reversal"],
};

export default function Page() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [lang, setLang] = useState<Lang>("zh");
  const [message, setMessage] = useState("");
  const [paying, setPaying] = useState<number | null>(null);
  const t = (zh: string, en: string) => lang === "zh" ? zh : en;
  const label = (value: string) => labels[value]?.[lang === "zh" ? 0 : 1] || value.replaceAll("_", " ");
  const load = () => fetch("/api/v4/customer-billing", { cache: "no-store" }).then(r => r.json()).then(data => setInvoices(data.invoices || []));
  useEffect(() => { void load(); }, []);

  const pay = async (invoice: Invoice, amount: number) => {
    if (paying !== null) return;
    setPaying(invoice.id);
    setMessage("");
    try {
      const response = await fetch("/api/v4/customer-billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": `checkout-${crypto.randomUUID()}-${crypto.randomUUID()}` },
        body: JSON.stringify({ invoiceId: invoice.id, amount }),
      });
      const data = await response.json();
      if (response.ok && data.checkoutUrl) window.location.assign(data.checkoutUrl);
      else setMessage(data.error || t("无法建立安全付款页面。", "Unable to create a secure payment session."));
    } finally { setPaying(null); }
  };

  return <main className="page">
    <header><div><small>SPRINT 9 · CUSTOMER BILLING #150</small><h1>{t("发票、付款与收据", "Invoices, payments & receipts")}</h1><p>{t("只有支付平台确认的交易才计入已付款；USD 与 CNY 始终分别显示。", "Only transactions confirmed by the payment provider count as paid. USD and CNY are always kept separate.")}</p></div><nav><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")}>{lang === "zh" ? "English" : "中文"}</button><button type="button" onClick={() => window.print()}>{t("打印 / 保存 PDF", "Print / Save PDF")}</button><Link href="/customer-portal">{t("房产", "Properties")}</Link></nav></header>
    {message && <p className="message" role="alert">{message}</p>}
    {!invoices.length && <section className="card">{t("尚无已签发发票。", "No issued Invoices.")}</section>}
    {invoices.map(invoice => <section className="card" key={invoice.id}>
      <div className="title"><div><small>{invoice.invoiceNumber} · V{invoice.version} · SHA {invoice.documentSha256.slice(0, 12)}…</small><h2>{label(invoice.status)}</h2></div><strong>{invoice.currency} {invoice.balance.toFixed(2)} {t("待付", "due")}</strong></div>
      <div className="totals">
        <span>{t("总额", "Total")}<b>{invoice.currency} {invoice.total.toFixed(2)}</b></span>
        <span>{t("所需订金", "Deposit required")}<b>{invoice.currency} {invoice.depositRequired.toFixed(2)}</b></span>
        <span>{t("已入账付款 / 贷项", "Posted payments / credits")}<b>{invoice.currency} {invoice.paid.toFixed(2)}</b></span>
        <span>{t("待付余额", "Balance due")}<b>{invoice.currency} {invoice.balance.toFixed(2)}</b></span>
        <span>{t("到期日", "Due date")}<b>{invoice.dueDate}</b></span>
      </div>
      {invoice.balance > 0 && <div className="actions"><button disabled={paying !== null} onClick={() => void pay(invoice, Math.min(invoice.depositRequired || invoice.balance, invoice.balance))}>{paying === invoice.id ? t("正在连接…", "Connecting…") : t("支付订金 / 下一笔金额", "Pay deposit / next amount")}</button><button disabled={paying !== null} onClick={() => void pay(invoice, invoice.balance)}>{t("付清全部余额", "Pay full balance")}</button></div>}
      <h3>{t("付款与调整记录", "Payment & adjustment history")}</h3>
      {!invoice.transactions.length && <p>{t("尚无已入账交易。", "No posted transactions.")}</p>}
      {invoice.transactions.map(transaction => <article key={transaction.id}><span>{label(transaction.type)}</span><b>{label(transaction.status)}</b><span>{transaction.currency} {transaction.amount.toFixed(2)}</span><span>{transaction.provider}</span><code>{transaction.receiptNumber || t("收据待生成", "Receipt pending")}</code><time>{new Date(transaction.occurredAt).toLocaleString(lang === "zh" ? "zh-CN" : "en-US")}</time></article>)}
    </section>)}
    <style jsx>{styles}</style>
  </main>;
}

const styles = `.page{min-height:100vh;background:#f3f0e9;color:#20372f;padding:20px;font-family:Arial,"PingFang SC",sans-serif}header,.card,.message{max-width:1100px;margin:auto;box-sizing:border-box}header{background:#153f34;color:white;border-radius:20px;padding:24px;display:flex;justify-content:space-between;gap:20px}nav{display:flex;gap:8px;align-items:start;flex-wrap:wrap}a,button{border:0;border-radius:9px;padding:10px 12px;background:#dfb45c;color:#173f35;text-decoration:none;font-weight:800}button:disabled{opacity:.55;cursor:not-allowed}.card{margin-top:14px;background:white;border:1px solid #ddd7ca;border-radius:16px;padding:18px}.message{margin-top:12px;padding:10px;background:#fff0e8}.title{display:flex;justify-content:space-between;gap:12px}.totals{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}.totals span{background:#f1f4f1;padding:12px;display:grid;gap:6px}.actions{display:flex;gap:8px;margin:14px 0}.actions button{background:#1e6650;color:white}article{display:grid;grid-template-columns:repeat(6,1fr);gap:8px;border-top:1px solid #dfe3df;padding:11px 0}article b{text-transform:uppercase}@media(max-width:700px){.page{padding:10px}header,.title{flex-direction:column}.totals{grid-template-columns:1fr 1fr}.actions{flex-direction:column}article{grid-template-columns:1fr 1fr}}@media print{nav,.actions,.message{display:none}.page{background:white;padding:0}.card,header{border:0;color:#111;background:white}}`;

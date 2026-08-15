"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type Quote = { id: number; quoteNumber: string; version: number; total: number; currency: string };
type Invoice = { id: number; invoiceNumber: string; status: string; currency: string; total: number; paid: number; balance: number; dueDate: string };
type Lang = "zh" | "en";

const labels: Record<string, [string, string]> = {
  credit: ["贷项", "Credit"], adjustment: ["调整", "Adjustment"], refund: ["退款", "Refund"], reversal: ["撤销", "Reversal"],
  posted: ["已入账", "Posted"], failed: ["失败", "Failed"], reversed: ["已撤销", "Reversed"], refunded: ["已退款", "Refunded"],
  issued: ["已签发", "Issued"], partially_paid: ["部分付款", "Partially paid"], paid: ["已付清", "Paid"], overdue: ["已逾期", "Overdue"],
};

export default function Page() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [lang, setLang] = useState<Lang>("zh");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState<"invoice" | "ledger" | null>(null);
  const [quoteVersionId, setQuote] = useState(0);
  const [dueDate, setDue] = useState(new Date().toISOString().slice(0, 10));
  const [event, setEvent] = useState({ invoiceId: 0, transactionType: "credit", status: "posted", amount: 0, authoritativeReference: "" });
  const t = (zh: string, en: string) => lang === "zh" ? zh : en;
  const label = (value: string) => labels[value]?.[lang === "zh" ? 0 : 1] || value.replaceAll("_", " ");
  const load = () => fetch("/api/v4/customer-billing", { cache: "no-store" }).then(r => r.json()).then(data => {
    setQuotes(data.signedQuotes || []); setInvoices(data.invoices || []);
    setQuote(current => current || data.signedQuotes?.[0]?.id || 0);
    setEvent(current => ({ ...current, invoiceId: current.invoiceId || data.invoices?.[0]?.id || 0 }));
  });
  useEffect(() => { void load(); }, []);

  const issue = async (e: FormEvent) => {
    e.preventDefault(); if (busy) return; setBusy("invoice"); setMessage("");
    try {
      const response = await fetch("/api/v4/customer-billing", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ quoteVersionId, dueDate }) });
      const data = await response.json();
      setMessage(response.ok ? t(`${data.invoice.invoiceNumber} 已签发。`, `${data.invoice.invoiceNumber} issued.`) : data.error || t("无法签发发票。", "Unable to issue Invoice."));
      if (response.ok) await load();
    } finally { setBusy(null); }
  };
  const record = async (e: FormEvent) => {
    e.preventDefault(); if (busy) return; setBusy("ledger"); setMessage("");
    try {
      const response = await fetch("/api/v4/customer-billing/transactions", { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": `ledger-${crypto.randomUUID()}-${crypto.randomUUID()}` }, body: JSON.stringify(event) });
      const data = await response.json();
      setMessage(response.ok ? t("权威账本事件已记录。", "Authoritative ledger event recorded.") : data.error || t("无法记录账本事件。", "Unable to record ledger event."));
      if (response.ok) await load();
    } finally { setBusy(null); }
  };

  return <main className="page">
    <header><div><small>SPRINT 9 · BILLING ADMIN #150</small><h1>{t("客户账单管理", "Customer billing administration")}</h1><p>{t("从已签署报价签发不可变发票；人工账本事件必须提供权威凭证编号。", "Issue immutable Invoices from signed Quotes. Manual ledger events require an authoritative reference.")}</p></div><nav><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")}>{lang === "zh" ? "English" : "中文"}</button><Link href="/hub">{t("工作台", "Hub")}</Link></nav></header>
    <div className="grid">
      <form className="card" onSubmit={issue}><h2>{t("签发发票", "Issue Invoice")}</h2><p className="notice">{t("同一份已签署报价只会对应一张发票；重复请求会返回原发票。", "A signed Quote maps to one Invoice; a repeated request returns the existing Invoice.")}</p><label>{t("已签署报价", "Signed Quote")}<select required value={quoteVersionId} onChange={e => setQuote(+e.target.value)}><option value={0}>{t("选择报价", "Select Quote")}</option>{quotes.map(q => <option key={q.id} value={q.id}>{q.quoteNumber} V{q.version} · {q.currency} {q.total.toFixed(2)}</option>)}</select></label><label>{t("到期日", "Due date")}<input required type="date" value={dueDate} onChange={e => setDue(e.target.value)} /></label><button disabled={busy !== null || !quoteVersionId}>{busy === "invoice" ? t("正在签发…", "Issuing…") : t("签发不可变发票", "Issue immutable Invoice")}</button></form>
      <form className="card" onSubmit={record}><h2>{t("记录授权账本事件", "Record authorized ledger event")}</h2><p className="warning">{t("仅依据银行、支付平台或已批准会计凭证录入。系统不会把未确认付款记为已付款。", "Record only bank, payment-provider or approved accounting evidence. Unconfirmed payments are never treated as paid.")}</p><label>{t("发票", "Invoice")}<select required value={event.invoiceId} onChange={e => setEvent({ ...event, invoiceId: +e.target.value })}><option value={0}>{t("选择发票", "Select Invoice")}</option>{invoices.map(i => <option key={i.id} value={i.id}>{i.invoiceNumber} · {t("余额", "balance")} {i.currency} {i.balance.toFixed(2)}</option>)}</select></label><label>{t("事件类型", "Event type")}<select value={event.transactionType} onChange={e => setEvent({ ...event, transactionType: e.target.value })}>{["credit", "adjustment", "refund", "reversal"].map(x => <option value={x} key={x}>{label(x)}</option>)}</select></label><label>{t("状态", "Status")}<select value={event.status} onChange={e => setEvent({ ...event, status: e.target.value })}>{["posted", "failed", "reversed", "refunded"].map(x => <option value={x} key={x}>{label(x)}</option>)}</select></label><label>{t("金额", "Amount")}<input min="0.01" step="0.01" required type="number" value={event.amount} onChange={e => setEvent({ ...event, amount: +e.target.value })} /></label><label>{t("权威凭证编号", "Authoritative reference")}<input required placeholder={t("银行流水号、支付平台编号或批准凭证号", "Bank, provider or approved accounting reference")} value={event.authoritativeReference} onChange={e => setEvent({ ...event, authoritativeReference: e.target.value })} /></label><button disabled={busy !== null || !event.invoiceId}>{busy === "ledger" ? t("正在记录…", "Recording…") : t("记录账本事件", "Record ledger event")}</button></form>
    </div>
    {message && <p className="message" role="status">{message}</p>}
    <section className="card history"><h2>{t("发票记录", "Invoices")}</h2>{!invoices.length && <p>{t("尚无发票。", "No Invoices.")}</p>}{invoices.map(i => <article key={i.id}><b>{i.invoiceNumber}</b><span>{label(i.status)}</span><span>{i.currency} {i.total.toFixed(2)}</span><span>{t("已付", "Paid")} {i.currency} {i.paid.toFixed(2)}</span><strong>{t("余额", "Balance")} {i.currency} {i.balance.toFixed(2)}</strong><time>{t("到期", "Due")} {i.dueDate}</time></article>)}</section>
    <style jsx>{styles}</style>
  </main>;
}

const styles = `.page{min-height:100vh;background:#f3f0e9;color:#20372f;padding:20px;font-family:Arial,"PingFang SC",sans-serif}header,.grid,.card,.message{max-width:1150px;margin:auto;box-sizing:border-box}header{background:#153f34;color:white;border-radius:20px;padding:24px;display:flex;justify-content:space-between;gap:20px}nav{display:flex;gap:8px;align-items:start}a,button{border:0;border-radius:9px;padding:10px 12px;background:#dfb45c;color:#173f35;text-decoration:none;font-weight:800}button:disabled{opacity:.55;cursor:not-allowed}.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.card{margin-top:14px;background:white;border:1px solid #ddd7ca;border-radius:16px;padding:18px}.card label{display:grid;gap:6px;margin:9px 0;font-weight:700}.card input,.card select{padding:10px;border:1px solid #bdc9c3;border-radius:8px}.card>button{background:#1e6650;color:white}.notice,.warning{padding:10px 12px;border-radius:8px;background:#f3f6f3;border-left:4px solid #1e6650}.warning{background:#fff8e8;border-left-color:#dfb45c}.message{margin-top:12px;padding:10px;background:#eaf2ed}.history article{display:grid;grid-template-columns:repeat(6,1fr);gap:8px;border-top:1px solid #e0e3df;padding:12px}@media(max-width:700px){.page{padding:10px}header{flex-direction:column}.grid{grid-template-columns:1fr}.history article{grid-template-columns:1fr 1fr}}`;

"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type Handoff = { id: number; revision: number; source: { property: { name: string }; room: { name: string }; window: { code: string }; design: { version: number; combinationType: string } } };
type Quote = { id: number; quoteNumber: string; version: number; status: string; total: number; currency: string };
type Lang = "zh" | "en";

const moneyFields = [
  ["subtotal", "小计", "Subtotal"],
  ["discountAmount", "折扣金额", "Discount amount"],
  ["taxAmount", "税额", "Tax amount"],
  ["installationFee", "安装费", "Installation fee"],
  ["depositRequired", "所需订金", "Required deposit"],
] as const;

const statusLabel = (status: string, lang: Lang) => {
  const labels: Record<string, [string, string]> = {
    draft: ["草稿", "Draft"], issued: ["已签发", "Issued"], option_selected: ["已选配置", "Option selected"],
    signed: ["已签署", "Signed"], declined: ["已拒绝", "Declined"], expired: ["已过期", "Expired"],
  };
  return labels[status]?.[lang === "zh" ? 0 : 1] || status.replaceAll("_", " ");
};

export default function Page() {
  const [handoffs, setHandoffs] = useState<Handoff[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [lang, setLang] = useState<Lang>("zh");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(() => ({
    handoffId: 0, currency: "USD", subtotal: 0, discountAmount: 0, taxAmount: 0, installationFee: 0, depositRequired: 0,
    validUntil: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    terms: "Valid for 30 days. Deposit required before order conversion.", renderingUrls: "", options: "",
  }));

  const t = (zh: string, en: string) => lang === "zh" ? zh : en;
  const load = () => fetch("/api/v4/customer-quotes", { cache: "no-store" }).then(r => r.json()).then(data => {
    setHandoffs(data.handoffs || []);
    setQuotes(data.quotes || []);
    setForm(current => ({ ...current, handoffId: current.handoffId || data.handoffs?.[0]?.id || 0 }));
  });
  useEffect(() => { void load(); }, []);

  const issue = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    let options: unknown[] = [];
    try { options = form.options.trim() ? JSON.parse(form.options) : []; }
    catch { setMessage(t("配置选项必须是有效 JSON。", "Options must be valid JSON.")); return; }
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/v4/customer-quotes", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, renderingUrls: form.renderingUrls.split("\n").map(x => x.trim()).filter(Boolean), options }),
      });
      const data = await response.json();
      setMessage(response.ok
        ? t(`${data.quote.quoteNumber} V${data.quote.version} 已签发。`, `${data.quote.quoteNumber} V${data.quote.version} issued.`)
        : data.error || t("签发失败。", "Unable to issue Quote."));
      if (response.ok) await load();
    } finally { setBusy(false); }
  };

  return <main className="page">
    <header><div><small>SPRINT 9 · QUOTE ISSUANCE #149</small><h1>{t("签发客户报价", "Issue customer Quote")}</h1><p>{t("从权威 Handoff 建立客户可见版本；不会读取或公开内部成本与利润。", "Create a customer-visible version from the authoritative Handoff. Internal cost and margin are never exposed.")}</p></div><nav><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")}>{lang === "zh" ? "English" : "中文"}</button><Link href="/workflow-handoff">{t("业务交接", "Handoff")}</Link><Link href="/hub">{t("工作台", "Hub")}</Link></nav></header>
    <form className="card form" onSubmit={issue}>
      <h2>{t("新建不可变报价版本", "New immutable Quote version")}</h2>
      <p className="notice">{t("每次签发都会建立新版本。提交期间按钮会锁定，防止浏览器重复提交。", "Each issuance creates a new version. The action is locked while submitting to prevent duplicate browser submissions.")}</p>
      <label>{t("权威来源", "Authoritative source")}<select required value={form.handoffId} onChange={e => setForm({ ...form, handoffId: +e.target.value })}><option value={0}>{t("选择 Handoff", "Select Handoff")}</option>{handoffs.map(h => <option value={h.id} key={h.id}>{h.source.property.name} · {h.source.room.name}/{h.source.window.code} · Design V{h.source.design.version} · Handoff R{h.revision}</option>)}</select></label>
      <label>{t("币种", "Currency")}<select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}><option>USD</option><option>CNY</option></select></label>
      {moneyFields.map(([key, zh, en]) => <label key={key}>{t(zh, en)}<input min="0" step="0.01" type="number" value={form[key]} onChange={e => setForm({ ...form, [key]: +e.target.value })} /></label>)}
      <label>{t("有效期至", "Valid until")}<input type="date" required value={form.validUntil} onChange={e => setForm({ ...form, validUntil: e.target.value })} /></label>
      <label className="wide">{t("客户条款", "Customer terms")}<textarea value={form.terms} onChange={e => setForm({ ...form, terms: e.target.value })} /></label>
      <label className="wide">{t("效果图网址（每行一个 HTTPS 网址）", "Rendering URLs (one HTTPS URL per line)")}<textarea value={form.renderingUrls} onChange={e => setForm({ ...form, renderingUrls: e.target.value })} /></label>
      <label className="wide">{t("中英文配置选项 JSON", "Bilingual options JSON")}<textarea placeholder='[{"id":"A","labelEn":"Blackout lining","labelZh":"遮光衬布","priceDelta":120}]' value={form.options} onChange={e => setForm({ ...form, options: e.target.value })} /></label>
      <button disabled={busy || !form.handoffId}>{busy ? t("正在签发…", "Issuing…") : t("签发客户报价", "Issue customer Quote")}</button>
    </form>
    {message && <p className="message" role="status">{message}</p>}
    <section className="card"><h2>{t("签发历史", "Issued history")}</h2>{!quotes.length && <p>{t("尚无已签发报价。", "No Quotes have been issued.")}</p>}{quotes.map(q => <article key={q.id}><b>{q.quoteNumber} · V{q.version}</b><span>{statusLabel(q.status, lang)}</span><strong>{q.currency} {q.total.toFixed(2)}</strong></article>)}</section>
    <style jsx>{styles}</style>
  </main>;
}

const styles = `.page{min-height:100vh;background:#f3f0e9;color:#20372f;padding:20px;font-family:Arial,"PingFang SC",sans-serif}header,.card,.message{max-width:1150px;margin:auto;box-sizing:border-box}header{background:#153f34;color:white;border-radius:20px;padding:24px;display:flex;justify-content:space-between;gap:20px}nav{display:flex;gap:8px;align-items:start;flex-wrap:wrap}a,button{border:0;border-radius:9px;padding:10px 12px;background:#dfb45c;color:#173f35;text-decoration:none;font-weight:800}button:disabled{opacity:.55;cursor:not-allowed}.card{margin-top:14px;background:white;border:1px solid #ddd7ca;border-radius:16px;padding:18px}.form{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.form h2,.wide,.notice{grid-column:1/-1}.notice{margin:0;padding:10px 12px;background:#f7f2e6;border-left:4px solid #dfb45c;border-radius:8px}.form label{display:grid;gap:6px;font-weight:700}.form input,.form select,.form textarea{padding:10px;border:1px solid #bdc9c3;border-radius:8px}.form textarea{min-height:70px}.form>button{background:#1e6650;color:white}.message{padding:10px;background:#eaf2ed;margin-top:12px}article{display:flex;justify-content:space-between;gap:12px;border-top:1px solid #e2e5df;padding:12px}@media(max-width:700px){.page{padding:10px}header{flex-direction:column}.form{grid-template-columns:1fr}.form h2,.wide,.notice{grid-column:1}article{align-items:flex-start;flex-direction:column}}`;

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Package = { id: number; packageCode: string; status: string; windowCodesJson: string; releasedAt: string | null };
type Fulfillment = { id: number; reference: string; mode: string; status: string; carrier: string; trackingNumber: string; trackingUrl: string; shippedAt: string | null; deliveredAt: string | null; pickupReadyAt: string | null; pickupAppointmentAt: string | null; warehouseInstructions: string; authorizedPickupPerson: string; packages: Package[]; signatures: { id: number; printedName: string; releasedBy: string; evidenceSha256: string; signedAt: string }[] };
type Lang = "zh" | "en";

const labels: Record<string, [string, string]> = {
  shipment: ["发货", "Shipment"], local_delivery: ["本地配送", "Local delivery"], installer_pickup: ["安装工自提", "Installer pickup"], customer_pickup: ["客户自提", "Customer pickup"],
  preparing: ["准备中", "Preparing"], ready_for_pickup: ["可自提", "Ready for pickup"], shipped: ["已发货", "Shipped"], in_transit: ["运输中", "In transit"], delivered: ["已送达", "Delivered"], exception: ["异常", "Exception"], partially_released: ["部分交付", "Partially released"], completed: ["已完成", "Completed"], released: ["已交付", "Released"],
};

export default function Page() {
  const [items, setItems] = useState<Fulfillment[]>([]);
  const [lang, setLang] = useState<Lang>("zh");
  const [message, setMessage] = useState("");
  const [signing, setSigning] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [form, setForm] = useState({ pickupCode: "", printedName: "", signatureText: "", releasedBy: "" });
  const t = (zh: string, en: string) => lang === "zh" ? zh : en;
  const label = (value: string) => labels[value]?.[lang === "zh" ? 0 : 1] || t("未知状态", "Unknown status");
  const locale = lang === "zh" ? "zh-CN" : "en-US";
  const load = () => fetch("/api/v4/customer-fulfillment", { cache: "no-store" }).then(r => r.json()).then(data => setItems(data.fulfillments || []));
  useEffect(() => { void load(); }, []);

  const startSigning = (id: number) => { setSigning(id); setSelected([]); setMessage(""); setForm({ pickupCode: "", printedName: "", signatureText: "", releasedBy: "" }); };
  const cancelSigning = () => { setSigning(null); setSelected([]); };
  const sign = async (fulfillment: Fulfillment) => {
    if (submitting || !selected.length || !form.pickupCode || !form.printedName || !form.signatureText || !form.releasedBy) return;
    setSubmitting(true); setMessage("");
    try {
      const response = await fetch("/api/v4/customer-fulfillment/pickup", { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": `pickup-${crypto.randomUUID()}-${crypto.randomUUID()}` }, body: JSON.stringify({ ...form, fulfillmentId: fulfillment.id, packageIds: selected }) });
      const data = await response.json();
      setMessage(response.ok ? t("自提签收已记录并锁定。", "Pickup handoff signed and locked.") : data.error || t("无法完成自提签收。", "Unable to complete pickup handoff."));
      if (response.ok) { cancelSigning(); await load(); }
    } finally { setSubmitting(false); }
  };

  return <main className="page">
    <header><div><small>SPRINT 9 · CUSTOMER FULFILLMENT #151</small><h1>{t("物流追踪与自提", "Delivery tracking & pickup")}</h1><p>{t("只显示已确认记录；系统不会推断预计到达、已送达或可自提状态。", "Only confirmed records are shown. ETA, delivered and pickup-ready states are never inferred.")}</p></div><nav><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")}>{lang === "zh" ? "English" : "中文"}</button><Link href="/customer-portal">{t("房产", "Properties")}</Link></nav></header>
    {message && <p className="message" role="status">{message}</p>}
    {!items.length && <section className="card">{t("尚无物流记录。", "No fulfillment records.")}</section>}
    {items.map(fulfillment => <section className="card" key={fulfillment.id}>
      <div className="title"><div><small>{fulfillment.reference} · {label(fulfillment.mode)}</small><h2>{label(fulfillment.status)}</h2></div>{fulfillment.trackingUrl ? <a href={fulfillment.trackingUrl} target="_blank" rel="noreferrer">{t(`前往 ${fulfillment.carrier} 查询`, `Track with ${fulfillment.carrier}`)}</a> : <span>{fulfillment.carrier || t("尚无承运商记录", "No carrier record")}</span>}</div>
      {fulfillment.trackingNumber && <p>{t("追踪号码", "Tracking number")}: <b>{fulfillment.trackingNumber}</b></p>}
      {fulfillment.pickupReadyAt && <p className="ready">✓ {t("已确认可自提", "Pickup ready confirmed")} · {new Date(fulfillment.pickupReadyAt).toLocaleString(locale)}</p>}
      {fulfillment.pickupAppointmentAt && <p>{t("自提预约", "Pickup appointment")}: {new Date(fulfillment.pickupAppointmentAt).toLocaleString(locale)}</p>}
      {fulfillment.authorizedPickupPerson && <p>{t("授权自提人", "Authorized pickup person")}: <b>{fulfillment.authorizedPickupPerson}</b></p>}
      {fulfillment.warehouseInstructions && <p className="instructions"><b>{t("仓库说明", "Warehouse instructions")}</b><br />{fulfillment.warehouseInstructions}</p>}
      <h3>{t("包裹与窗位", "Packages & Windows")}</h3>
      <div className="packages">{fulfillment.packages.map(pkg => <label key={pkg.id}><input aria-label={t(`选择包裹 ${pkg.packageCode}`, `Select package ${pkg.packageCode}`)} disabled={!!pkg.releasedAt || signing !== fulfillment.id || submitting} type="checkbox" checked={selected.includes(pkg.id)} onChange={e => setSelected(e.target.checked ? [...selected, pkg.id] : selected.filter(x => x !== pkg.id))} /><b>{pkg.packageCode}</b><span>{JSON.parse(pkg.windowCodesJson).join(", ") || "—"}</span><strong>{label(pkg.status)}</strong></label>)}</div>
      {fulfillment.mode === "customer_pickup" && fulfillment.packages.some(pkg => !pkg.releasedAt) && (signing === fulfillment.id ? <div className="sign"><p>{t("请选择本次实际领取的包裹，并由客户及交付员工当场完成签收。", "Select only packages physically collected now, then complete the handoff with the customer and releasing employee present.")}</p><input placeholder={t("自提码", "Pickup code")} value={form.pickupCode} onChange={e => setForm({ ...form, pickupCode: e.target.value })} /><input placeholder={t("客户姓名", "Customer printed name")} value={form.printedName} onChange={e => setForm({ ...form, printedName: e.target.value })} /><input placeholder={t("输入客户完整法律签名", "Type customer legal signature")} value={form.signatureText} onChange={e => setForm({ ...form, signatureText: e.target.value })} /><input placeholder={t("交付员工姓名", "Releasing employee name")} value={form.releasedBy} onChange={e => setForm({ ...form, releasedBy: e.target.value })} /><div className="signActions"><button className="cancel" type="button" disabled={submitting} onClick={cancelSigning}>{t("取消", "Cancel")}</button><button disabled={submitting || !selected.length || !form.pickupCode || !form.printedName || !form.signatureText || !form.releasedBy} onClick={() => void sign(fulfillment)}>{submitting ? t("正在锁定…", "Locking…") : t("签署所选包裹交接", "Sign selected package handoff")}</button></div></div> : <button onClick={() => startSigning(fulfillment.id)}>{t("选择包裹并签署自提", "Select packages and sign pickup")}</button>)}
      {fulfillment.signatures.map(signature => <p className="evidence" key={signature.id}>✓ {t("客户", "Customer")} {signature.printedName} / {t("交付员工", "released by")} {signature.releasedBy} · {new Date(signature.signedAt).toLocaleString(locale)} · SHA {signature.evidenceSha256.slice(0, 12)}…</p>)}
    </section>)}
    <style jsx>{styles}</style>
  </main>;
}

const styles = `.page{min-height:100vh;background:#f3f0e9;color:#20372f;padding:20px;font-family:Arial,"PingFang SC",sans-serif}header,.card,.message{max-width:1100px;margin:auto;box-sizing:border-box}header{background:#153f34;color:white;border-radius:20px;padding:24px;display:flex;justify-content:space-between;gap:18px}nav{display:flex;gap:8px;align-items:flex-start;flex-wrap:wrap}a,button{border:0;border-radius:9px;padding:10px 12px;background:#dfb45c;color:#173f35;text-decoration:none;font-weight:800}button:disabled{opacity:.5;cursor:not-allowed}.card{margin-top:14px;background:white;border:1px solid #ddd7ca;border-radius:16px;padding:18px}.message,.ready{background:#e8f3ed;padding:10px}.title{display:flex;justify-content:space-between;gap:12px}.instructions{background:#f6f4ee;padding:12px;border-radius:9px}.packages{display:grid;gap:8px}.packages label{display:grid;grid-template-columns:auto 1fr 2fr 1fr;gap:10px;background:#f1f4f1;padding:12px}.sign{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px;background:#f6f4ee;padding:14px;border-radius:12px}.sign p,.signActions{grid-column:1/-1}.sign input{padding:10px}.signActions{display:flex;justify-content:flex-end;gap:8px}.signActions button{background:#1e6650;color:white}.signActions .cancel{background:#e7e6df;color:#20372f}.evidence{color:#17603f;font-weight:700}@media(max-width:650px){.page{padding:10px}header,.title{flex-direction:column}.packages label,.sign{grid-template-columns:1fr}.sign p,.signActions{grid-column:1}.signActions{flex-direction:column}}`;

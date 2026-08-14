"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Property = { id: number; name: string; address: string };
type Check = { key: string; labelZh: string; labelEn: string; pass: boolean; evidence: string };
type Acceptance = { id: number; evidenceSha256: string; certifiedAt: string };
type Audit = { property?: Property; checks?: Check[]; ready?: boolean; acceptance?: Acceptance | null; summary?: Record<string, number> };

const actions: Record<string, { href: string; zh: string; en: string }> = {
  access: { href: "/customer-access", zh: "管理客户授权", en: "Manage access" },
  property: { href: "/measure", zh: "补充测量结构", en: "Complete measurement" },
  quote: { href: "/quote-issuance", zh: "签发含效果图 Quote", en: "Issue Quote with renderings" },
  billing: { href: "/billing-admin", zh: "查看账单入账", en: "Review posted billing" },
  fulfillment: { href: "/fulfillment-admin", zh: "更新物流或自提", en: "Update fulfillment" },
  installation: { href: "/installation-customer-admin", zh: "发布安装并签收", en: "Publish installation" },
  warranty: { href: "/service-admin", zh: "发布 Window 保修", en: "Publish warranties" },
  service: { href: "/service-admin", zh: "回复服务案件", en: "Respond to service case" },
};

export default function Page() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertyId, setPropertyId] = useState(0);
  const [data, setData] = useState<Audit>({});
  const [lang, setLang] = useState<"zh" | "en">("zh");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/v4/customer-journey-audit").then(r => r.json()).then(d => {
      setProperties(d.properties || []);
      setPropertyId(d.properties?.[0]?.id || 0);
    });
  }, []);

  const run = async () => {
    if (!propertyId) return;
    setBusy(true);
    setMessage("");
    const result = await fetch(`/api/v4/customer-journey-audit?propertyId=${propertyId}`, { cache: "no-store" });
    setData(await result.json());
    setBusy(false);
  };

  const certify = async () => {
    setBusy(true);
    const result = await fetch(`/api/v4/customer-journey-audit?propertyId=${propertyId}`, { method: "POST" });
    const body = await result.json();
    setMessage(result.ok ? `Certified · SHA-256 ${body.acceptance.evidenceSha256}` : body.error || "Certification failed");
    if (result.ok) await run();
    else setBusy(false);
  };

  return <main>
    <header><div><small>SPRINT 9 · PARENT #147</small><h1>{lang === "zh" ? "客户全旅程真实性检查" : "Customer Journey Truth Audit"}</h1><p>{lang === "zh" ? "只认可数据库中的权威证据，不推断完成状态。" : "Only authoritative database evidence counts; completion is never inferred."}</p></div><nav><Link href="/hub">Hub</Link><button onClick={() => setLang(lang === "zh" ? "en" : "zh")}>{lang === "zh" ? "English" : "中文"}</button></nav></header>
    <section className="toolbar"><select value={propertyId} onChange={e => setPropertyId(+e.target.value)}>{properties.map(p => <option value={p.id} key={p.id}>{p.name} · {p.address}</option>)}</select><button disabled={!propertyId || busy} onClick={() => void run()}>{busy ? "Checking…" : "Run authoritative audit"}</button></section>
    {message && <p className="message">{message}</p>}
    {data.checks && <><section className={`result ${data.ready ? "pass" : "blocked"}`}><h2>{data.ready ? "READY / 已具备验收证据" : "NOT READY / 尚缺真实证据"}</h2><p>{data.property?.name} · {data.property?.address}</p>{data.acceptance ? <div className="certificate"><p>✓ Certified {new Date(data.acceptance.certifiedAt).toLocaleString()} · SHA-256 {data.acceptance.evidenceSha256.slice(0, 16)}…</p><a href={`/customer-journey-audit/certificate?acceptance=${data.acceptance.id}`}>Open bilingual printable certificate / 打开双语打印证明</a></div> : data.ready && <button onClick={() => void certify()} disabled={busy}>Certify immutable acceptance / 生成不可变验收记录</button>}</section>
      <section className="checks">{data.checks.map(c => { const action = actions[c.key]; return <article key={c.key} className={c.pass ? "pass" : "fail"}><span>{c.pass ? "✓" : "!"}</span><div><h3>{lang === "zh" ? c.labelZh : c.labelEn}</h3><p>{c.evidence}</p>{!c.pass && action && <Link className="remedy" href={action.href}>{lang === "zh" ? action.zh : action.en} →</Link>}</div></article>; })}</section>
      <section className="summary">{Object.entries(data.summary || {}).map(([key, value]) => <div key={key}><b>{value}</b><span>{key}</span></div>)}</section></>}
    <style jsx>{`main{min-height:100vh;background:#f3f0e9;color:#173c31;padding:20px;font-family:Arial,"PingFang SC",sans-serif}header,.toolbar,.message,.result,.checks,.summary{max-width:1100px;margin:auto;box-sizing:border-box}header{background:#153f34;color:white;border-radius:20px;padding:24px;display:flex;justify-content:space-between}nav{display:flex;gap:8px}a,button{border:0;border-radius:9px;padding:10px 12px;background:#dfb45c;color:#173f35;text-decoration:none;font-weight:800}.toolbar{margin-top:14px;display:flex;gap:8px}.toolbar select{flex:1;padding:11px}.message{margin-top:12px;padding:10px;background:#e8f2eb;overflow-wrap:anywhere}.result{margin-top:14px;border-radius:16px;padding:18px;background:white}.result.pass{border-left:9px solid #23805b}.result.blocked{border-left:9px solid #b54b3d}.certificate{color:#17603f;font-weight:800;overflow-wrap:anywhere}.certificate :global(a){display:inline-block;background:#1e6650;color:white;padding:10px 12px;border-radius:9px;text-decoration:none}.checks{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px}.checks article{background:white;border:1px solid #ddd8cd;border-radius:14px;padding:16px;display:flex;gap:12px}.checks article>span{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;color:white;font-weight:900}.checks .pass>span{background:#23805b}.checks .fail>span{background:#b54b3d}.checks h3{margin:0}.checks p{color:#66766f}.checks :global(.remedy){display:inline-block;background:#f0dfb7;padding:8px 10px;border-radius:8px;color:#173f35;text-decoration:none;font-weight:800}.summary{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}.summary div{background:white;padding:13px;border-radius:12px;min-width:100px}.summary b,.summary span{display:block}@media(max-width:650px){main{padding:10px}header{display:block}nav{margin-top:10px}.toolbar,.checks{grid-template-columns:1fr;display:grid}}`}</style>
  </main>;
}

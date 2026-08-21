"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Certificate = { id: number; certifiedAt: string; evidenceSha256: string; snapshot: { property: { name: string; address: string }; checks: { labelZh: string; labelEn: string; evidence: string; pass: boolean }[]; summary: Record<string, number> } };

export default function Page() {
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("acceptance");
    fetch(`/api/v4/customer-journey-audit/certificate?acceptance=${encodeURIComponent(id || "")}`, { cache: "no-store" }).then(async response => {
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Certificate unavailable");
      setCertificate(body.certificate);
    }).catch(reason => setError(reason instanceof Error ? reason.message : "Certificate unavailable"));
  }, []);
  if (error) return <main className="state"><p>{error}</p><Link href="/customer-journey-audit">返回验收页</Link><style jsx>{styles}</style></main>;
  if (!certificate) return <main className="state">Loading verified certificate…<style jsx>{styles}</style></main>;
  return <main className="page"><div className="actions"><Link href="/customer-journey-audit">← Back / 返回</Link><button onClick={() => window.print()}>Print or Save PDF / 打印或存为 PDF</button></div><article><header><small>BRAUN BLINDS · SPRINT 9 #147</small><h1>客户全旅程验收证明</h1><h2>Customer Journey Acceptance Certificate</h2></header><section className="identity"><p><b>Property / 项目</b>{certificate.snapshot.property.name}</p><p><b>Address / 地址</b>{certificate.snapshot.property.address}</p><p><b>Certified / 认证时间</b>{new Date(certificate.certifiedAt).toLocaleString()}</p></section><h2>权威证据 / Authoritative evidence</h2><ol>{certificate.snapshot.checks.map((check, index) => <li key={index}><b>✓ {check.labelZh}</b><span>{check.labelEn}</span><small>{check.evidence}</small></li>)}</ol><section className="counts">{Object.entries(certificate.snapshot.summary).map(([key, value]) => <p key={key}><b>{value}</b><span>{key}</span></p>)}</section><footer><p>Evidence SHA-256</p><code>{certificate.evidenceSha256}</code><p>本证明仅报告不可变证据快照，不修改任何业务源记录。</p><p>This certificate reports an immutable evidence snapshot and does not alter source records.</p></footer></article><style jsx>{styles}</style></main>;
}

const styles = `.page,.state{min-height:100vh;background:#eeeae2;padding:24px;color:#173c31;font-family:Arial,"PingFang SC",sans-serif}.actions,article{max-width:850px;margin:auto}.actions{display:flex;justify-content:flex-end;gap:10px;margin-bottom:14px}.actions a,.actions button,.state a{border:0;border-radius:9px;padding:10px 13px;background:#1d624d;color:white;text-decoration:none;font-weight:800}article{box-sizing:border-box;background:white;padding:48px;border:1px solid #d9d4ca;box-shadow:0 8px 30px #37453b22}header{border-bottom:5px solid #d6ae5d;padding-bottom:18px}header h1{font-size:34px;margin:12px 0 3px}header h2{margin:0;color:#52675f}.identity{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:20px 0}.identity p{background:#f2f4f1;padding:12px;margin:0}.identity b{display:block;font-size:12px;color:#66766f;margin-bottom:5px}ol{padding-left:24px}li{padding:11px 0;border-bottom:1px solid #e7e4dd}li b,li span,li small{display:block}li span{margin-top:3px}li small{color:#66766f;margin-top:5px}.counts{display:flex;gap:8px;flex-wrap:wrap;margin:20px 0}.counts p{background:#edf2ee;padding:9px 12px;margin:0}.counts b,.counts span{display:block}footer{border-top:2px solid #1d624d;padding-top:16px}footer code{display:block;overflow-wrap:anywhere;background:#f3f1eb;padding:10px}.state{display:grid;place-content:center;text-align:center}@media(max-width:650px){.page{padding:10px}.actions{flex-wrap:wrap}article{padding:22px}.identity{grid-template-columns:1fr}}@media print{.page{background:white;padding:0}.actions{display:none}article{border:0;box-shadow:none;max-width:none;padding:24px}header h1{font-size:28px}}`;

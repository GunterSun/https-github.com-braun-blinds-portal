"use client";

import { useEffect, useMemo, useState } from "react";
import {
  detectWorkbookType,
  findDuplicates,
  NormalizedImportRow,
  parseCommerceRows,
  parseExpenseSheet,
} from "@/lib/excel-import-rules";

type SheetCell = string | number | boolean | null;
type XlsxApi = {
  read: (data: ArrayBuffer) => { SheetNames: string[]; Sheets: Record<string, unknown> };
  utils: { sheet_to_json: (sheet: unknown, options: { header: number; defval: null; raw: boolean }) => SheetCell[][] };
};
declare global { interface Window { XLSX?: XlsxApi } }

function loadXlsx() {
  if (window.XLSX) return Promise.resolve(window.XLSX);
  return new Promise<XlsxApi>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js";
    script.onload = () => window.XLSX ? resolve(window.XLSX) : reject(new Error("XLSX 加载失败"));
    script.onerror = () => reject(new Error("XLSX 加载失败"));
    document.head.appendChild(script);
  });
}

export default function DataImportPage() {
  const [lang, setLang] = useState<"zh" | "en">("zh");
  const [rows, setRows] = useState<NormalizedImportRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [workbookType, setWorkbookType] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const t = (zh: string, en: string) => lang === "zh" ? zh : en;

  useEffect(() => { loadXlsx().catch(() => setMessage(t("Excel 解析组件加载失败", "Excel parser failed to load"))); }, []);

  const summary = useMemo(() => {
    const usd = rows.filter(r => r.currency === "USD").reduce((s, r) => s + (r.amount || 0), 0);
    const rmb = rows.filter(r => r.currency === "RMB").reduce((s, r) => s + (r.amount || 0), 0);
    const warnings = rows.reduce((s, r) => s + r.warnings.length, 0);
    return { usd, rmb, warnings };
  }, [rows]);

  async function handleFile(file?: File) {
    if (!file) return;
    setBusy(true); setMessage(""); setRows([]); setFileName(file.name);
    try {
      const XLSX = await loadXlsx();
      const workbook = XLSX.read(await file.arrayBuffer());
      const type = detectWorkbookType(workbook.SheetNames);
      setWorkbookType(type);
      let parsed: NormalizedImportRow[] = [];
      if (type === "jin-commerce") {
        const sheetName = "Commerce订单汇总";
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: null, raw: true });
        parsed = parseCommerceRows(file.name, sheetName, data);
      } else if (type === "wholesale-sales") {
        for (const sheetName of workbook.SheetNames) {
          const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: null, raw: true });
          if (sheetName === "彭") parsed.push(...parseExpenseSheet(file.name, sheetName, data));
        }
      } else {
        setMessage(t("暂时无法识别此表格，请保留原文件等待字段映射。", "This workbook is not recognized yet. Keep the original file for field mapping."));
      }
      setRows(findDuplicates(parsed));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t("读取失败", "Read failed"));
    } finally { setBusy(false); }
  }

  return <main className="import-page">
    <header><div><small>BRAUN SMART PORTAL</small><h1>{t("真实数据导入中心", "Real Data Import Center")}</h1><p>{t("先预览、核对币种与重复项，再确认写入数据库。当前页面不会自动覆盖任何订单。", "Preview currency and duplicates before committing. This page never overwrites orders automatically.")}</p></div><button onClick={() => setLang(lang === "zh" ? "en" : "zh")}>{lang === "zh" ? "English" : "中文"}</button></header>
    <section className="upload-card">
      <label><strong>{t("选择 Excel 文件", "Choose Excel file")}</strong><span>{t("支持批发销售与 jin 汇总格式", "Supports Wholesale Sales and Jin Summary formats")}</span><input type="file" accept=".xlsx,.xls" disabled={busy} onChange={e => handleFile(e.target.files?.[0])}/></label>
      {message && <div className="message">{message}</div>}
    </section>
    {fileName && <section className="summary-grid">
      <div><span>{t("文件", "File")}</span><strong>{fileName}</strong></div>
      <div><span>{t("识别类型", "Detected type")}</span><strong>{workbookType || "—"}</strong></div>
      <div><span>USD</span><strong>${summary.usd.toFixed(2)}</strong></div>
      <div><span>RMB</span><strong>¥{summary.rmb.toFixed(2)}</strong></div>
      <div><span>{t("警告", "Warnings")}</span><strong>{summary.warnings}</strong></div>
    </section>}
    {rows.length > 0 && <section className="preview-card"><div className="preview-title"><div><h2>{t("导入预览", "Import Preview")}</h2><p>{rows.length} {t("条标准化记录", "normalized records")}</p></div><button disabled title={t("数据库确认接口完成后启用", "Enabled after database commit API is complete")}>{t("确认导入（暂未启用）", "Confirm Import (not enabled)")}</button></div>
      <div className="table-wrap"><table><thead><tr><th>#</th><th>{t("类型", "Type")}</th><th>{t("订单号", "Order")}</th><th>{t("客户/对象", "Customer / Payee")}</th><th>{t("产品/说明", "Product / Description")}</th><th>{t("金额", "Amount")}</th><th>{t("状态", "Status")}</th><th>{t("来源", "Source")}</th><th>{t("检查", "Checks")}</th></tr></thead><tbody>{rows.slice(0, 250).map((row, index) => <tr key={`${row.source.sheetName}-${row.source.rowNumber}-${index}`}><td>{index + 1}</td><td>{row.recordType}</td><td>{row.orderNumber || "—"}</td><td>{row.customer || "—"}<small>{row.project}</small></td><td>{row.product || "—"}</td><td className={row.currency === "RMB" ? "rmb" : "usd"}>{row.amount === null ? "—" : `${row.currency === "RMB" ? "¥" : "$"}${row.amount.toFixed(2)}`}</td><td>{row.status || "—"}</td><td>{row.source.sheetName} #{row.source.rowNumber}</td><td>{row.warnings.length ? row.warnings.map(w => <span className="warning" key={w}>{w}</span>) : <span className="ok">OK</span>}</td></tr>)}</tbody></table></div>
    </section>}
    <style jsx>{`
      .import-page{min-height:100vh;background:#f4f2ed;color:#18352c;padding:32px;font-family:Arial,"PingFang SC",sans-serif} header{display:flex;justify-content:space-between;gap:20px;max-width:1450px;margin:auto} small{display:block;color:#6d7d77;margin-top:5px} h1{font-size:34px;margin:5px 0} p{color:#60716b} button{border:0;border-radius:10px;padding:11px 16px;background:#1f5b49;color:white;font-weight:700} button:disabled{background:#b6beb9}.upload-card,.preview-card{max-width:1450px;margin:22px auto;background:white;border:1px solid #dedbd3;border-radius:18px;padding:22px;box-shadow:0 12px 32px rgba(31,58,48,.06)} label{display:grid;gap:7px} input{margin-top:12px;padding:14px;border:1px dashed #9baaa4;border-radius:12px}.message{margin-top:14px;padding:12px;background:#fff3d8;border-radius:10px}.summary-grid{max-width:1450px;margin:0 auto;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px}.summary-grid div{background:white;padding:16px;border-radius:14px;border:1px solid #dedbd3}.summary-grid span{display:block;color:#687871;font-size:12px}.summary-grid strong{display:block;margin-top:6px}.preview-title{display:flex;justify-content:space-between;align-items:center}.table-wrap{overflow:auto;margin-top:14px}table{border-collapse:collapse;width:100%;min-width:1150px}th,td{border-bottom:1px solid #e7e4dd;padding:11px;text-align:left;vertical-align:top;font-size:13px}th{position:sticky;top:0;background:#edf3f0}.usd{color:#155d47;font-weight:700}.rmb{color:#9a4e16;font-weight:700}.warning{display:block;color:#a33d28}.ok{color:#27815e}@media(max-width:850px){.import-page{padding:16px}.summary-grid{grid-template-columns:1fr 1fr}header{display:block}header button{margin-top:10px}}
    `}</style>
  </main>;
}

"use client";

import { useEffect, useMemo, useState } from "react";

type CatalogItem = {
  id: string;
  fabricCode: string;
  fabricSeriesZh: string;
  fabricSeriesEn: string;
  descriptionZh: string;
  descriptionEn: string;
  productCode: string;
  systemZh: string;
  systemEn: string;
  styleZh: string;
  styleEn: string;
  structureZh: string;
  structureEn: string;
  constructionZh: string;
  constructionEn: string;
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
  minDepthExclusive: number;
  retail: number;
  wholesale: number;
  currency: "USD";
};

type Line = {
  id: string;
  room: string;
  window: string;
  item: CatalogItem;
  width: number;
  height: number;
  depth: number;
  quantity: number;
};

type Lang = "zh" | "en";

const fracOptions = Array.from({ length: 16 }, (_, i) => i);
const toDecimal = (whole: number, frac: number) => Math.max(0, whole) + Math.max(0, Math.min(15, frac)) / 16;
const format16 = (value: number) => {
  const total = Math.round(value * 16);
  const whole = Math.floor(total / 16);
  const frac = total % 16;
  return frac === 0 ? `${whole}\"` : `${whole} ${frac}/16\"`;
};

export default function ZSeriesQuotePage() {
  const [lang, setLang] = useState<Lang>("zh");
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [message, setMessage] = useState("");
  const [room, setRoom] = useState("");
  const [windowCode, setWindowCode] = useState("");
  const [fabricCode, setFabricCode] = useState("");
  const [productCode, setProductCode] = useState("");
  const [widthWhole, setWidthWhole] = useState(0);
  const [widthFrac, setWidthFrac] = useState(0);
  const [heightWhole, setHeightWhole] = useState(0);
  const [heightFrac, setHeightFrac] = useState(0);
  const [depthWhole, setDepthWhole] = useState(0);
  const [depthFrac, setDepthFrac] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [installationFee, setInstallationFee] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);
  const [taxPercent, setTaxPercent] = useState(0);
  const [lines, setLines] = useState<Line[]>([]);

  const t = (zh: string, en: string) => (lang === "zh" ? zh : en);

  useEffect(() => {
    fetch("/api/z-series/catalog", { cache: "no-store" })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Catalog unavailable");
        setItems(d.items || []);
        setDiscountPercent(Number(d.discountPercent) || 0);
      })
      .catch((e) => setMessage(e instanceof Error ? e.message : "Catalog unavailable"));
  }, []);

  const fabrics = useMemo(() => {
    const seen = new Map<string, CatalogItem>();
    items.forEach((x) => { if (!seen.has(x.fabricCode)) seen.set(x.fabricCode, x); });
    return [...seen.values()].sort((a, b) => a.fabricCode.localeCompare(b.fabricCode));
  }, [items]);

  const products = useMemo(() => items.filter((x) => x.fabricCode === fabricCode), [items, fabricCode]);
  const selected = useMemo(() => products.find((x) => x.productCode === productCode) || null, [products, productCode]);

  const width = toDecimal(widthWhole, widthFrac);
  const height = toDecimal(heightWhole, heightFrac);
  const depth = toDecimal(depthWhole, depthFrac);

  const dimensionErrors = useMemo(() => {
    if (!selected) return [] as string[];
    const errors: string[] = [];
    if (width < selected.minWidth) errors.push(t(`宽度不能小于 ${selected.minWidth}\"`, `Width must be at least ${selected.minWidth}\"`));
    if (width > selected.maxWidth) errors.push(t(`宽度不能大于 ${selected.maxWidth}\"`, `Width cannot exceed ${selected.maxWidth}\"`));
    if (height < selected.minHeight) errors.push(t(`高度不能小于 ${selected.minHeight}\"`, `Height must be at least ${selected.minHeight}\"`));
    if (height > selected.maxHeight) errors.push(t(`高度不能大于 ${selected.maxHeight}\"`, `Height cannot exceed ${selected.maxHeight}\"`));
    if (depth <= selected.minDepthExclusive) errors.push(t(`深度必须大于 ${selected.minDepthExclusive}\"`, `Depth must be greater than ${selected.minDepthExclusive}\"`));
    return errors;
  }, [selected, width, height, depth, lang]);

  const addLine = () => {
    if (!selected) return setMessage(t("请选择完整的 Z 系列产品组合", "Select a complete Z-Series product combination"));
    if (!room.trim() || !windowCode.trim()) return setMessage(t("请填写房间和窗位编号", "Enter Room and Window code"));
    if (dimensionErrors.length) return setMessage(dimensionErrors.join(" · "));
    setLines((prev) => [...prev, {
      id: crypto.randomUUID(), room: room.trim(), window: windowCode.trim(), item: selected,
      width, height, depth, quantity: Math.max(1, Math.floor(quantity || 1)),
    }]);
    setWindowCode("");
    setMessage(t("已加入报价", "Added to quotation"));
  };

  const retailSubtotal = lines.reduce((s, l) => s + l.item.retail * l.quantity, 0);
  const wholesaleSubtotal = lines.reduce((s, l) => s + l.item.wholesale * l.quantity, 0);
  const taxAmount = wholesaleSubtotal * Math.max(0, taxPercent) / 100;
  const total = wholesaleSubtotal + Math.max(0, installationFee) + Math.max(0, shippingFee) + taxAmount;

  return <main className="page">
    <header>
      <div>
        <small>Z SERIES · BRAUN BLINDS</small>
        <h1>{t("Z 系列报价系统", "Z-Series Quotation")}</h1>
        <p>{t("正式价格表 · USD · 产品价不含安装与运输 · 尺寸精确到 1/16 英寸", "Approved price list · USD · Product price excludes installation and shipping · Dimensions to 1/16 inch")}</p>
      </div>
      <button onClick={() => setLang(lang === "zh" ? "en" : "zh")}>{lang === "zh" ? "English" : "中文"}</button>
    </header>

    {message && <p className="message">{message}</p>}

    <section className="card grid">
      <label>{t("房间 / Room", "Room / 房间")}<input value={room} onChange={(e) => setRoom(e.target.value)} placeholder={t("例如：客厅 LR", "e.g. Living Room LR")} /></label>
      <label>{t("窗位编号 / Window", "Window / 窗位编号")}<input value={windowCode} onChange={(e) => setWindowCode(e.target.value)} placeholder="LR-1" /></label>
      <label>{t("面料编码 / Fabric Code", "Fabric Code / 面料编码")}<select value={fabricCode} onChange={(e) => { setFabricCode(e.target.value); setProductCode(""); }}><option value="">{t("请选择", "Select")}</option>{fabrics.map((f) => <option key={f.fabricCode} value={f.fabricCode}>{f.fabricCode} · {lang === "zh" ? f.fabricSeriesZh : f.fabricSeriesEn}</option>)}</select></label>
      <label>{t("产品组合 / Product Configuration", "Product Configuration / 产品组合")}<select value={productCode} onChange={(e) => setProductCode(e.target.value)} disabled={!fabricCode}><option value="">{t("请选择", "Select")}</option>{products.map((p) => <option key={p.id} value={p.productCode}>{p.productCode} · {lang === "zh" ? `${p.systemZh} · ${p.styleZh} · ${p.structureZh} · ${p.constructionZh}` : `${p.systemEn} · ${p.styleEn} · ${p.structureEn} · ${p.constructionEn}`}</option>)}</select></label>
    </section>

    {selected && <section className="card">
      <h2>{t("产品信息", "Product details")}</h2>
      <div className="product"><span><b>{selected.fabricCode}</b><small>{lang === "zh" ? selected.descriptionZh : selected.descriptionEn}</small></span><span><b>{selected.productCode}</b><small>{lang === "zh" ? selected.systemZh : selected.systemEn} · {lang === "zh" ? selected.styleZh : selected.styleEn}</small></span><span><b>USD ${selected.retail.toFixed(2)}</b><small>{t("Retail 零售价", "Retail / 零售价")}</small></span><span><b>USD ${selected.wholesale.toFixed(2)}</b><small>{t(`客户批发价 · 折扣 ${discountPercent}%`, `Customer wholesale · ${discountPercent}% discount`)}</small></span></div>
      <p className="limit">{t("尺寸限制", "Size limits")}: W {selected.minWidth}–{selected.maxWidth}\" · H {selected.minHeight}–{selected.maxHeight}\" · D &gt; {selected.minDepthExclusive}\"</p>
    </section>}

    <section className="card">
      <h2>{t("尺寸 · 精确到 1/16 英寸", "Dimensions · exact to 1/16 inch")}</h2>
      <div className="dimensionGrid">
        <Dimension label={t("宽度 Width", "Width 宽度")} whole={widthWhole} frac={widthFrac} setWhole={setWidthWhole} setFrac={setWidthFrac} />
        <Dimension label={t("高度 Height", "Height 高度")} whole={heightWhole} frac={heightFrac} setWhole={setHeightWhole} setFrac={setHeightFrac} />
        <Dimension label={t("深度 Depth", "Depth 深度")} whole={depthWhole} frac={depthFrac} setWhole={setDepthWhole} setFrac={setDepthFrac} />
        <label>{t("数量 / Quantity", "Quantity / 数量")}<input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} /></label>
      </div>
      <p>{t("当前尺寸", "Current size")}: {format16(width)} × {format16(height)} · D {format16(depth)}</p>
      {dimensionErrors.length > 0 && <div className="errors">{dimensionErrors.map((e) => <div key={e}>⚠ {e}</div>)}</div>}
      <button className="primary" onClick={addLine}>{t("加入报价", "Add to quotation")}</button>
    </section>

    <section className="card">
      <h2>{t("报价明细", "Quotation lines")}</h2>
      {!lines.length ? <p>{t("尚未添加窗位", "No windows added yet")}</p> : <div className="tableWrap"><table><thead><tr><th>{t("房间", "Room")}</th><th>{t("窗位", "Window")}</th><th>{t("面料", "Fabric")}</th><th>{t("产品", "Product")}</th><th>{t("尺寸", "Size")}</th><th>{t("数量", "Qty")}</th><th>Retail</th><th>Wholesale</th><th></th></tr></thead><tbody>{lines.map((l) => <tr key={l.id}><td>{l.room}</td><td>{l.window}</td><td>{l.item.fabricCode}</td><td>{l.item.productCode}</td><td>{format16(l.width)} × {format16(l.height)} · D {format16(l.depth)}</td><td>{l.quantity}</td><td>${(l.item.retail * l.quantity).toFixed(2)}</td><td>${(l.item.wholesale * l.quantity).toFixed(2)}</td><td><button onClick={() => setLines((x) => x.filter((v) => v.id !== l.id))}>{t("删除", "Remove")}</button></td></tr>)}</tbody></table></div>}
    </section>

    <section className="card totalsCard">
      <div className="fees">
        <label>{t("安装费 / Installation", "Installation / 安装费")}<input type="number" min="0" step="0.01" value={installationFee} onChange={(e) => setInstallationFee(Number(e.target.value))} /></label>
        <label>{t("运输费 / Shipping", "Shipping / 运输费")}<input type="number" min="0" step="0.01" value={shippingFee} onChange={(e) => setShippingFee(Number(e.target.value))} /></label>
        <label>{t("税率 % / Tax %", "Tax % / 税率 %")}<input type="number" min="0" step="0.01" value={taxPercent} onChange={(e) => setTaxPercent(Number(e.target.value))} /></label>
      </div>
      <div className="totals">
        <span>{t("Retail 小计", "Retail subtotal")}<b>USD ${retailSubtotal.toFixed(2)}</b></span>
        <span>{t(`Wholesale 小计（账户折扣 ${discountPercent}%）`, `Wholesale subtotal (${discountPercent}% account discount)`)}<b>USD ${wholesaleSubtotal.toFixed(2)}</b></span>
        <span>{t("安装费", "Installation")}<b>USD ${Math.max(0, installationFee).toFixed(2)}</b></span>
        <span>{t("运输费", "Shipping")}<b>USD ${Math.max(0, shippingFee).toFixed(2)}</b></span>
        <span>{t("税", "Tax")}<b>USD ${taxAmount.toFixed(2)}</b></span>
        <span className="grand">{t("报价总额", "Quotation total")}<b>USD ${total.toFixed(2)}</b></span>
      </div>
      <p className="note">{t("说明：Z 系列产品价格来自正式价格表。安装费、运输费和税单独计算，不写回产品价格。", "Note: Z-Series product prices come from the approved price list. Installation, shipping and tax are calculated separately and never merged into product price.")}</p>
    </section>

    <style jsx>{styles}</style>
  </main>;
}

function Dimension({ label, whole, frac, setWhole, setFrac }: { label: string; whole: number; frac: number; setWhole: (v: number) => void; setFrac: (v: number) => void }) {
  return <label>{label}<div className="fraction"><input type="number" min="0" value={whole} onChange={(e) => setWhole(Number(e.target.value))} /><select value={frac} onChange={(e) => setFrac(Number(e.target.value))}>{fracOptions.map((f) => <option key={f} value={f}>{f === 0 ? "—" : `${f}/16`}</option>)}</select><span>in</span></div></label>;
}

const styles = `.page{min-height:100vh;background:#f4f1ea;color:#1b392f;padding:20px;font-family:Arial,"PingFang SC",sans-serif}header,.card,.message{max-width:1180px;margin:auto;box-sizing:border-box}header{background:#153f34;color:#fff;padding:24px;border-radius:20px;display:flex;justify-content:space-between;gap:20px}header h1{margin:6px 0}button{border:0;border-radius:9px;padding:10px 13px;background:#dfb45c;color:#173f35;font-weight:800;cursor:pointer}.message{margin-top:12px;background:#e7f0eb;padding:10px;border-radius:10px}.card{margin-top:14px;background:#fff;border:1px solid #ddd7ca;border-radius:16px;padding:18px}.grid,.dimensionGrid,.fees{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}label{display:grid;gap:6px;font-weight:700}input,select{padding:10px;border:1px solid #cfd6d1;border-radius:8px;background:#fff;min-width:0}.product{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.product span{background:#f1f4f1;padding:12px;border-radius:10px;display:grid}.product small{margin-top:5px}.limit,.note{background:#f6f4ee;padding:10px;border-radius:8px}.fraction{display:grid;grid-template-columns:1fr 1fr auto;gap:5px;align-items:center}.errors{margin:12px 0;color:#9b2f20;font-weight:700}.primary{background:#1f6751;color:#fff}.tableWrap{overflow:auto}table{border-collapse:collapse;width:100%;min-width:900px}th,td{border-bottom:1px solid #e3e3df;padding:9px;text-align:left}.totalsCard{display:grid;gap:15px}.totals{margin-left:auto;width:min(520px,100%);display:grid;gap:7px}.totals span{display:flex;justify-content:space-between;border-top:1px solid #e1e4df;padding-top:7px}.totals .grand{font-size:21px;font-weight:900}@media(max-width:800px){.page{padding:10px}header{flex-direction:column}.grid,.dimensionGrid,.fees,.product{grid-template-columns:1fr 1fr}}@media(max-width:520px){.grid,.dimensionGrid,.fees,.product{grid-template-columns:1fr}}`;

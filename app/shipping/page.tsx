"use client";

import { useEffect, useMemo, useState } from "react";

type PackageRow = {
  id: string;
  length: string;
  width: string;
  height: string;
  weight: string;
};

const emptyPackage = (id: string): PackageRow => ({
  id,
  length: "82",
  width: "5",
  height: "3",
  weight: "",
});

export default function ShippingPage() {
  const [packages, setPackages] = useState<PackageRow[]>([
    emptyPackage("PKG-1"),
    emptyPackage("PKG-2"),
  ]);
  const [destination, setDestination] = useState({
    name: "",
    company: "",
    address: "1060 Southcenter Mall",
    city: "Tukwila",
    state: "WA",
    zip: "98188",
  });
  const [service, setService] = useState("cheapest");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("braun-shipping-draft-v1");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed.packages) setPackages(parsed.packages);
      if (parsed.destination) setDestination(parsed.destination);
      if (parsed.service) setService(parsed.service);
    } catch {
      // Ignore malformed local drafts.
    }
  }, []);

  const dimensional = useMemo(
    () =>
      packages.map((pkg) => {
        const l = Number(pkg.length) || 0;
        const w = Number(pkg.width) || 0;
        const h = Number(pkg.height) || 0;
        return Math.ceil((l * w * h) / 139);
      }),
    [packages],
  );

  const hasLongPackage = packages.some((pkg) => Number(pkg.length) >= 48);
  const allReady = packages.every((pkg) => Number(pkg.weight) > 0) && destination.zip.length >= 5;

  function updatePackage(id: string, field: keyof PackageRow, value: string) {
    setPackages((rows) => rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
    setSaved(false);
  }

  function saveDraft() {
    localStorage.setItem(
      "braun-shipping-draft-v1",
      JSON.stringify({ packages, destination, service, savedAt: new Date().toISOString() }),
    );
    setSaved(true);
  }

  return (
    <main className="shipping-shell">
      <header className="topbar">
        <div>
          <span className="eyebrow">BRAUN BLINDS SHIPPING CENTER</span>
          <h1>物流比价与超长件发货</h1>
          <p>Shipping comparison and long-package workflow</p>
        </div>
        <a className="back" href="/">← 返回业务门户</a>
      </header>

      <section className="notice">
        <strong>第一阶段已经建立</strong>
        <span>先统一保存收货地址、箱数、尺寸和重量；下一阶段接入 Shippo 或 EasyPost 实时报价与购买运单。</span>
      </section>

      <div className="layout">
        <section className="card">
          <div className="section-head">
            <div><span>STEP 1</span><h2>收货地址 / Ship To</h2></div>
          </div>
          <div className="grid two">
            <label>客户姓名 / Name<input value={destination.name} onChange={(e) => setDestination({ ...destination, name: e.target.value })} /></label>
            <label>公司 / Company<input value={destination.company} onChange={(e) => setDestination({ ...destination, company: e.target.value })} /></label>
            <label className="full">地址 / Address<input value={destination.address} onChange={(e) => setDestination({ ...destination, address: e.target.value })} /></label>
            <label>城市 / City<input value={destination.city} onChange={(e) => setDestination({ ...destination, city: e.target.value })} /></label>
            <label>州 / State<input value={destination.state} maxLength={2} onChange={(e) => setDestination({ ...destination, state: e.target.value.toUpperCase() })} /></label>
            <label>邮编 / ZIP<input value={destination.zip} onChange={(e) => setDestination({ ...destination, zip: e.target.value })} /></label>
          </div>
        </section>

        <section className="card">
          <div className="section-head">
            <div><span>STEP 2</span><h2>包裹尺寸和重量 / Packages</h2></div>
            <button className="small" onClick={() => setPackages((rows) => [...rows, emptyPackage(`PKG-${rows.length + 1}`)])}>＋ 增加一箱</button>
          </div>

          {packages.map((pkg, index) => (
            <div className="package" key={pkg.id}>
              <div className="package-title"><b>第 {index + 1} 箱</b><span>{pkg.id}</span>{packages.length > 1 && <button onClick={() => setPackages((rows) => rows.filter((row) => row.id !== pkg.id))}>删除</button>}</div>
              <div className="measure-grid">
                <label>长 L（英寸）<input inputMode="decimal" value={pkg.length} onChange={(e) => updatePackage(pkg.id, "length", e.target.value)} /></label>
                <label>宽 W（英寸）<input inputMode="decimal" value={pkg.width} onChange={(e) => updatePackage(pkg.id, "width", e.target.value)} /></label>
                <label>高 H（英寸）<input inputMode="decimal" value={pkg.height} onChange={(e) => updatePackage(pkg.id, "height", e.target.value)} /></label>
                <label>实际重量（lb）<input inputMode="decimal" placeholder="必须填写" value={pkg.weight} onChange={(e) => updatePackage(pkg.id, "weight", e.target.value)} /></label>
                <div className="dim"><span>参考体积重量</span><b>{dimensional[index]} lb</b><small>按除数 139 估算，承运商最终计费为准</small></div>
              </div>
            </div>
          ))}

          {hasLongPackage && <div className="long-alert"><b>超长件提醒</b><span>当前包裹长度达到 48 英寸以上。购买运单前必须比较 UPS、FedEx、USPS 和零担/专线，并核对额外处理费。</span></div>}
        </section>

        <section className="card">
          <div className="section-head"><div><span>STEP 3</span><h2>运输要求 / Delivery</h2></div></div>
          <div className="service-options">
            <button className={service === "cheapest" ? "active" : ""} onClick={() => setService("cheapest")}><b>最便宜</b><span>Cheapest available</span></button>
            <button className={service === "next-day" ? "active" : ""} onClick={() => setService("next-day")}><b>次日到达</b><span>Next business day</span></button>
            <button className={service === "ground" ? "active" : ""} onClick={() => setService("ground")}><b>陆运</b><span>Ground / economy</span></button>
          </div>
        </section>

        <aside className="card summary">
          <span className="eyebrow">SHIPMENT SUMMARY</span>
          <h2>发货摘要</h2>
          <dl>
            <div><dt>目的地</dt><dd>{destination.city || "—"}, {destination.state} {destination.zip}</dd></div>
            <div><dt>包裹数量</dt><dd>{packages.length} 箱</dd></div>
            <div><dt>最长尺寸</dt><dd>{Math.max(...packages.map((p) => Number(p.length) || 0))} in</dd></div>
            <div><dt>运输要求</dt><dd>{service === "next-day" ? "次日到达" : service === "ground" ? "陆运" : "最便宜"}</dd></div>
          </dl>
          {!allReady && <p className="missing">请填写每一箱的实际重量，才能准确比价。</p>}
          <button className="primary" onClick={saveDraft}>{saved ? "已保存 ✓" : "保存发货资料"}</button>
          <a className="pirate" href="https://ship.pirateship.com/ship" target="_blank" rel="noreferrer">打开 Pirate Ship 手工比价 ↗</a>
          <p className="security">付款信息和平台密码不会保存在 Braun 网站中。</p>
        </aside>
      </div>

      <style jsx>{`
        :global(*){box-sizing:border-box} :global(body){margin:0;background:#f5f3ee;color:#17211d;font-family:Arial,"PingFang SC",sans-serif}
        .shipping-shell{min-height:100vh;padding:32px;max-width:1440px;margin:auto}.topbar{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:22px}.eyebrow,.section-head span{font-size:12px;letter-spacing:.16em;font-weight:800;color:#8a6c3d}.topbar h1{font-size:36px;margin:8px 0 4px}.topbar p{margin:0;color:#6f7772}.back{color:#1f5b49;text-decoration:none;font-weight:700;padding:12px 16px;background:white;border-radius:12px;border:1px solid #dedbd2}.notice{display:flex;gap:18px;align-items:center;background:#173f34;color:white;padding:16px 20px;border-radius:16px;margin-bottom:20px}.notice span{opacity:.82}.layout{display:grid;grid-template-columns:minmax(0,1fr) 360px;gap:20px}.card{background:white;border:1px solid #e2ded5;border-radius:18px;padding:22px;box-shadow:0 12px 34px rgba(28,38,33,.06)}.layout>.card:not(.summary){grid-column:1}.summary{grid-column:2;grid-row:1 / span 3;position:sticky;top:24px;height:max-content}.section-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}.section-head h2,.summary h2{margin:4px 0 0;font-size:22px}.grid{display:grid;gap:14px}.grid.two{grid-template-columns:1fr 1fr}.full{grid-column:1/-1}label{display:flex;flex-direction:column;gap:7px;font-size:13px;font-weight:700;color:#4c5751}input{border:1px solid #d8d4ca;border-radius:10px;padding:12px 13px;font-size:15px;background:#fff}.small,.package-title button{border:0;background:#edf4f1;color:#1f5b49;border-radius:9px;padding:9px 12px;font-weight:700;cursor:pointer}.package{border:1px solid #e1ddd4;border-radius:14px;padding:16px;margin-top:12px}.package-title{display:flex;gap:10px;align-items:center;margin-bottom:14px}.package-title span{color:#8b918d;font-size:12px}.package-title button{margin-left:auto;color:#9f3d33;background:#fff1ef}.measure-grid{display:grid;grid-template-columns:repeat(4,1fr) 1.15fr;gap:12px;align-items:end}.dim{background:#f4f1e8;border-radius:11px;padding:10px 12px;display:flex;flex-direction:column}.dim span,.dim small{font-size:11px;color:#737a76}.dim b{font-size:20px;margin:3px 0}.long-alert{margin-top:14px;background:#fff6dc;border:1px solid #eed78f;border-radius:12px;padding:13px 15px;display:flex;gap:12px;color:#72561e}.service-options{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.service-options button{padding:15px;text-align:left;border:1px solid #ddd8cf;background:white;border-radius:12px;cursor:pointer}.service-options button.active{border-color:#1f5b49;box-shadow:inset 0 0 0 1px #1f5b49;background:#f0f6f3}.service-options b,.service-options span{display:block}.service-options span{font-size:12px;color:#777;margin-top:4px}.summary dl{margin:18px 0}.summary dl div{display:flex;justify-content:space-between;gap:14px;padding:13px 0;border-bottom:1px solid #ece9e2}.summary dt{color:#777}.summary dd{margin:0;text-align:right;font-weight:700}.missing{background:#fff1ef;color:#973f35;padding:11px;border-radius:10px;font-size:13px}.primary,.pirate{width:100%;display:block;text-align:center;border:0;border-radius:11px;padding:13px 15px;font-weight:800;text-decoration:none;cursor:pointer}.primary{background:#1f5b49;color:white}.pirate{margin-top:10px;background:#eef1ef;color:#17211d}.security{font-size:11px;color:#828883;text-align:center;margin:12px 0 0}@media(max-width:900px){.shipping-shell{padding:18px}.topbar{flex-direction:column;gap:14px}.topbar h1{font-size:29px}.layout{grid-template-columns:1fr}.layout>.card,.summary{grid-column:1;grid-row:auto}.summary{position:static}.measure-grid{grid-template-columns:1fr 1fr}.dim{grid-column:1/-1}.service-options{grid-template-columns:1fr}.grid.two{grid-template-columns:1fr}.full{grid-column:auto}.notice{align-items:flex-start;flex-direction:column;gap:6px}}
      `}</style>
    </main>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type CalculatorKey = "braun" | "jin" | "z-series";
type Role = "owner" | "sales" | "factory" | "installer" | "customer";

const calculators: Array<{
  key: CalculatorKey;
  nameZh: string;
  nameEn: string;
  description: string;
  href: string;
  badge: string;
}> = [
  {
    key: "braun",
    nameZh: "Braun 标准计算器",
    nameEn: "Braun Price Calculator",
    description: "标准窗饰尺寸、产品与选项快速估价。",
    href: "/z-roman/index.html#calculator",
    badge: "BRAUN",
  },
  {
    key: "jin",
    nameZh: "Jin 报价计算器",
    nameEn: "Jin / Complete Calculator",
    description: "报价、订单、Invoice 与加工信息的一体化计算流程。",
    href: "/complete/index.html",
    badge: "JIN",
  },
  {
    key: "z-series",
    nameZh: "Z 系列计算器",
    nameEn: "Z-Series 1.6 Calculator",
    description: "Z 系列罗马帘、竹帘及电动配置的正式报价工具。",
    href: "/z-roman/index.html#Braun-Z-1-6",
    badge: "Z 1.6",
  },
];

export default function CalculatorsPage() {
  const [selected, setSelected] = useState<CalculatorKey>("braun");
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    fetch("/api/v4/auth/me", { cache: "no-store" })
      .then(async response => response.ok ? response.json() : null)
      .then(data => {
        const role = data?.user?.role as Role | undefined;
        if (!data?.authenticated || !role) {
          location.href = "/login?next=%2Fcalculators";
          return;
        }
        if (!["owner", "sales", "customer"].includes(role)) {
          location.href = "/hub";
          return;
        }
        setAllowed(true);
      })
      .finally(() => setReady(true));
  }, []);

  const current = useMemo(
    () => calculators.find(calculator => calculator.key === selected) ?? calculators[0],
    [selected],
  );

  if (!ready || !allowed) {
    return <main className="loading">正在读取计算器权限… / Loading calculators…<style jsx>{styles}</style></main>;
  }

  return <main className="page">
    <header>
      <div>
        <small>THREE LIVE CALCULATORS / 三个计算器</small>
        <h1>Braun 报价计算器中心</h1>
        <p>选择计算器后可立即在下方使用，也可以全屏打开。三套工具保持独立规则，避免价格或币种被错误混合。</p>
      </div>
      <Link href="/hub">返回统一入口 / Hub</Link>
    </header>

    <section className="calculator-grid" aria-label="计算器选择">
      {calculators.map(calculator => <button
        key={calculator.key}
        type="button"
        className={selected === calculator.key ? "active" : ""}
        onClick={() => setSelected(calculator.key)}
      >
        <span>{calculator.badge}</span>
        <strong>{calculator.nameZh}</strong>
        <b>{calculator.nameEn}</b>
        <p>{calculator.description}</p>
        <em>{selected === calculator.key ? "正在使用 / Active" : "打开 / Open →"}</em>
      </button>)}
    </section>

    <section className="workspace">
      <div className="workspace-head">
        <div><small>{current.badge}</small><h2>{current.nameZh}</h2><p>{current.nameEn}</p></div>
        <a href={current.href} target="_blank" rel="noreferrer">全屏打开 / Full screen ↗</a>
      </div>
      <iframe key={current.key} title={current.nameZh} src={current.href} allow="clipboard-read; clipboard-write" />
    </section>
    <style jsx>{styles}</style>
  </main>;
}

const styles = `.page{min-height:100vh;background:#f4f1ea;color:#24332d;padding:24px;font-family:Arial,"PingFang SC",sans-serif;box-sizing:border-box}.loading{min-height:100vh;display:grid;place-items:center;background:#f4f1ea;color:#355248;font-family:Arial,"PingFang SC",sans-serif}header{max-width:1280px;margin:0 auto 18px;background:#173f35;color:white;border-radius:20px;padding:25px 28px;display:flex;align-items:end;justify-content:space-between;gap:20px;box-sizing:border-box}header small,.workspace-head small{color:#d8b35f;letter-spacing:1.2px;font-weight:800}h1{margin:6px 0 8px;font-size:31px}header p{margin:0;max-width:780px;line-height:1.65;color:#c7d6d0}header a,.workspace-head a{background:#d8ad59;color:#173f35;border-radius:10px;padding:11px 15px;text-decoration:none;font-weight:800;white-space:nowrap}.calculator-grid{max-width:1280px;margin:0 auto 18px;display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.calculator-grid button{appearance:none;text-align:left;border:1px solid #d9d5ca;border-radius:17px;background:white;color:#24332d;padding:18px;cursor:pointer;box-shadow:0 7px 22px #28352f0a;transition:.18s ease}.calculator-grid button:hover,.calculator-grid button.active{border-color:#1f6651;transform:translateY(-2px);box-shadow:0 11px 28px #193d2f18}.calculator-grid button.active{background:#eef7f2}.calculator-grid span{display:inline-block;background:#173f35;color:#f4d68f;border-radius:999px;padding:5px 9px;font-size:11px;font-weight:900;letter-spacing:.8px}.calculator-grid strong,.calculator-grid b{display:block}.calculator-grid strong{font-size:19px;margin-top:13px}.calculator-grid b{font-size:12px;color:#68756f;margin-top:5px}.calculator-grid p{color:#69746f;line-height:1.55;min-height:48px}.calculator-grid em{font-style:normal;font-weight:800;color:#1f6651}.workspace{max-width:1280px;margin:auto;background:white;border:1px solid #d9d5ca;border-radius:19px;overflow:hidden}.workspace-head{padding:16px 18px;background:#fff;display:flex;justify-content:space-between;align-items:center;gap:16px;border-bottom:1px solid #e5e1d8}.workspace-head h2{margin:3px 0;font-size:21px}.workspace-head p{margin:0;color:#6d7772;font-size:13px}.workspace iframe{display:block;width:100%;height:72vh;min-height:720px;border:0;background:white}@media(max-width:820px){.page{padding:12px}header{align-items:flex-start;flex-direction:column;padding:21px}.calculator-grid{grid-template-columns:1fr}.calculator-grid p{min-height:0}.workspace-head{align-items:flex-start;flex-direction:column}.workspace iframe{height:78vh;min-height:640px}h1{font-size:26px}}`;

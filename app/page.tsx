"use client";

import { useMemo, useState } from "react";

type NavItem = { label: string; icon: string; badge?: number };
type NavGroup = { title: string; items: NavItem[] };

const nav: NavGroup[] = [
  { title: "Workspace", items: [
    { label: "Overview", icon: "⌂" }, { label: "Tasks & alerts", icon: "◌", badge: 8 },
  ]},
  { title: "Sales", items: [
    { label: "Leads", icon: "◎" }, { label: "Customers", icon: "◇" }, { label: "Projects", icon: "▤" },
    { label: "Measurements", icon: "⌁" }, { label: "Quotes", icon: "□" }, { label: "Sales orders", icon: "▣" }, { label: "Aftercare", icon: "✦" },
  ]},
  { title: "Operations", items: [
    { label: "Calendar", icon: "▦" }, { label: "Work orders", icon: "✓" }, { label: "Production", icon: "◫" },
    { label: "Receiving", icon: "↓" }, { label: "Photos", icon: "◉" },
  ]},
  { title: "Purchasing & finance", items: [
    { label: "Purchase orders", icon: "▧" }, { label: "Vendors", icon: "△" }, { label: "Vendor bills", icon: "$" },
    { label: "Receivables", icon: "↗" }, { label: "Payments", icon: "≈" },
  ]},
  { title: "Insights", items: [
    { label: "Reports", icon: "↗" }, { label: "Profitability", icon: "%" }, { label: "Resources", icon: "⌘" }, { label: "Settings", icon: "⚙" },
  ]},
];

const orders = [
  { id: "SO-2026-1048", client: "Hillcrest Residence", product: "Motorized roller shades", value: "$18,420", status: "In production", tone: "blue", date: "Jul 28", owner: "Mia Chen" },
  { id: "SO-2026-1042", client: "Silver Lake Studio", product: "Ripplefold drapery", value: "$9,860", status: "Install scheduled", tone: "green", date: "Jul 22", owner: "Leo Park" },
  { id: "SO-2026-1039", client: "Canyon House", product: "Zebra shades · 14 openings", value: "$7,245", status: "Receiving", tone: "amber", date: "Jul 19", owner: "Mia Chen" },
  { id: "SO-2026-1033", client: "Ontario Offices", product: "Vertical blinds · 28 openings", value: "$12,105", status: "Deposit due", tone: "red", date: "Jul 18", owner: "Noah Kim" },
];

const kpis = [
  { label: "Revenue this month", value: "$84,620", delta: "+12.4%", icon: "↗", trend: [12,20,16,31,28,45,39,58] },
  { label: "Open sales orders", value: "24", delta: "6 need attention", icon: "▣", trend: [24,22,30,27,36,33,41,45] },
  { label: "Jobs this week", value: "18", delta: "82% capacity", icon: "✓", trend: [18,22,21,31,26,36,42,38] },
  { label: "Receivables", value: "$31,480", delta: "$4,950 overdue", icon: "$", trend: [46,39,44,37,34,31,28,24] },
];

const pages: Record<string, { title: string; kicker: string }> = {
  Leads: { title: "Leads", kicker: "Track every opportunity from first inquiry to booked consultation." },
  Customers: { title: "Customers", kicker: "A complete view of contacts, sites, projects, and order history." },
  Projects: { title: "Projects", kicker: "Organize measurements, quotes, files, and orders by job site." },
  Measurements: { title: "Measurements", kicker: "Capture openings, photos, notes, and installer-ready details." },
  Quotes: { title: "Quotes", kicker: "Build clear proposals with product rules, pricing, and approvals." },
  "Sales orders": { title: "Sales orders", kicker: "Follow each order from deposit through installation and closeout." },
  Aftercare: { title: "Aftercare", kicker: "Resolve warranty, repair, and client service requests." },
  Calendar: { title: "Team calendar", kicker: "Coordinate consultations, measurements, installations, and service visits." },
  "Work orders": { title: "Work orders", kicker: "Plan field work, assign crews, and capture completion evidence." },
  Production: { title: "Production schedule", kicker: "See vendor milestones and internal production readiness." },
  Receiving: { title: "Receiving", kicker: "Match incoming products to sales orders and record exceptions." },
  Photos: { title: "Photo library", kicker: "Keep site, measurement, install, and aftercare images organized." },
  "Purchase orders": { title: "Purchase orders", kicker: "Control vendor orders, costs, deposits, and inbound dates." },
  Vendors: { title: "Vendors", kicker: "Manage suppliers, catalogs, lead times, terms, and performance." },
  "Vendor bills": { title: "Vendor bills", kicker: "Review obligations and link every expense to its source order." },
  Receivables: { title: "Accounts receivable", kicker: "Monitor customer balances, aging, and collection activity." },
  Payments: { title: "Payments", kicker: "Record deposits, balances, refunds, and vendor disbursements." },
  Reports: { title: "Business reports", kicker: "Revenue, conversion, product mix, operations, and team performance." },
  Profitability: { title: "Profitability", kicker: "Understand margin by order, product, vendor, and channel." },
  Resources: { title: "Resources", kicker: "Product specifications, templates, terms, and team documents." },
  Settings: { title: "Settings", kicker: "Company preferences, team access, workflows, and integrations." },
  "Tasks & alerts": { title: "Tasks & alerts", kicker: "The decisions and follow-ups that need your attention." },
};

function Spark({ values }: { values: number[] }) {
  const points = values.map((v, i) => `${i * 18},${56 - v}`).join(" ");
  return <svg className="spark" viewBox="0 0 126 58" aria-hidden="true"><polyline points={points} /></svg>;
}

function Status({ children, tone = "blue" }: { children: React.ReactNode; tone?: string }) {
  return <span className={`status ${tone}`}><i />{children}</span>;
}

function Overview({ onOpen }: { onOpen: (id: string) => void }) {
  return <>
    <section className="hero-card">
      <div><span className="eyebrow">THURSDAY · JULY 16</span><h1>Good morning, Gunther.</h1><p>Here is what is moving across your business today.</p></div>
      <div className="hero-actions"><button className="secondary">View calendar</button><button className="primary">＋ New quote</button></div>
      <div className="fabric-orb one"/><div className="fabric-orb two"/>
    </section>
    <section className="kpi-grid">
      {kpis.map((k) => <article className="kpi" key={k.label}><div className="kpi-top"><span>{k.label}</span><b>{k.icon}</b></div><strong>{k.value}</strong><div className="kpi-foot"><small>{k.delta}</small><Spark values={k.trend}/></div></article>)}
    </section>
    <section className="dashboard-grid">
      <article className="panel orders-panel">
        <div className="panel-head"><div><span className="eyebrow">ORDER FLOW</span><h2>Active sales orders</h2></div><button className="text-button">View all →</button></div>
        <div className="table-wrap"><table><thead><tr><th>Order</th><th>Client / product</th><th>Owner</th><th>Value</th><th>Status</th><th>Next date</th></tr></thead><tbody>{orders.map(o => <tr key={o.id} onClick={() => onOpen(o.id)}><td><b>{o.id}</b></td><td><strong>{o.client}</strong><small>{o.product}</small></td><td>{o.owner}</td><td>{o.value}</td><td><Status tone={o.tone}>{o.status}</Status></td><td>{o.date}</td></tr>)}</tbody></table></div>
      </article>
      <aside className="right-stack">
        <article className="panel focus"><div className="panel-head"><div><span className="eyebrow">TODAY&apos;S FOCUS</span><h2>8 items need attention</h2></div></div>
          <button className="focus-row"><span className="focus-icon warm">$</span><span><b>3 deposits to collect</b><small>$12,410 outstanding</small></span><em>→</em></button>
          <button className="focus-row"><span className="focus-icon red">!</span><span><b>2 delivery risks</b><small>Vendor dates have shifted</small></span><em>→</em></button>
          <button className="focus-row"><span className="focus-icon green">✓</span><span><b>3 jobs ready to close</b><small>Awaiting client sign-off</small></span><em>→</em></button>
        </article>
        <article className="panel pipeline"><div className="panel-head"><div><span className="eyebrow">SALES</span><h2>Quote pipeline</h2></div><b>$46.2K</b></div>
          {[['Draft','5','$18.4K'],['Sent','8','$21.6K'],['Approved','3','$6.2K']].map((x,i)=><div className="pipe" key={x[0]}><div><span>{x[0]}</span><b>{x[1]}</b></div><div className="bar"><i style={{width:`${74-i*19}%`}}/></div><small>{x[2]}</small></div>)}
        </article>
      </aside>
    </section>
    <section className="lower-grid">
      <article className="panel schedule"><div className="panel-head"><div><span className="eyebrow">FIELD TEAM</span><h2>Upcoming appointments</h2></div><button className="text-button">Full schedule →</button></div>
        {[['9:00','Measurement','Canyon House','Mia · Pasadena'],['11:30','Installation','Silver Lake Studio','Crew 2 · Los Angeles'],['2:00','Consultation','Park Residence','Leo · Arcadia']].map((a,i)=><div className="appointment" key={a[0]}><time>{a[0]}<small>{i===0?'AM':i===1?'AM':'PM'}</small></time><i/><span><Status tone={i===1?'green':'blue'}>{a[1]}</Status><b>{a[2]}</b><small>{a[3]}</small></span><em>•••</em></div>)}
      </article>
      <article className="panel margin"><div className="panel-head"><div><span className="eyebrow">MARGIN HEALTH</span><h2>Gross margin</h2></div><select><option>This month</option></select></div><div className="margin-body"><div className="ring"><span>42.8%<small>+2.1 pts</small></span></div><div><b>Target 40%</b><p>Margin is holding above target. Motorization and drapery are leading performance.</p><button className="text-button">Open profitability →</button></div></div></article>
    </section>
  </>;
}

function ModulePage({ name, onOpen }: { name: string; onOpen: (id: string) => void }) {
  const meta = pages[name] || { title: name, kicker: "Manage this area of the business." };
  const isCalendar = name === "Calendar";
  const isReport = ["Reports","Profitability","Receivables"].includes(name);
  return <>
    <div className="module-head"><div><span className="eyebrow">BRAUN BLINDS / {name.toUpperCase()}</span><h1>{meta.title}</h1><p>{meta.kicker}</p></div><div><button className="secondary">Export</button><button className="primary">＋ Add new</button></div></div>
    <div className="toolbar"><label>⌕ <input placeholder={`Search ${name.toLowerCase()}...`} /></label><button>All statuses⌄</button><button>Filters</button><button>Columns</button></div>
    {isCalendar ? <CalendarView/> : isReport ? <ReportView name={name}/> : <ListView name={name} onOpen={onOpen}/>} 
  </>;
}

function ListView({ name, onOpen }: { name: string; onOpen: (id: string) => void }) {
  return <div className="panel module-panel"><div className="summary-row"><div><span>Active</span><b>{name === 'Purchase orders' ? '12' : '24'}</b></div><div><span>Needs attention</span><b>6</b></div><div><span>Completed this month</span><b>18</b></div><div><span>Total value</span><b>$84,620</b></div></div><div className="table-wrap"><table><thead><tr><th>Reference</th><th>Client / company</th><th>Description</th><th>Owner</th><th>Value</th><th>Status</th><th>Next date</th></tr></thead><tbody>{orders.concat(orders.slice(0,2).map((o,i)=>({...o,id:`${name.slice(0,2).toUpperCase()}-2026-${1030-i}`,client:i?'Westside Loft':'Park Residence'}))).map((o,i)=><tr key={`${o.id}${i}`} onClick={()=>onOpen(o.id)}><td><b>{o.id}</b></td><td><strong>{o.client}</strong></td><td>{o.product}</td><td>{o.owner}</td><td>{o.value}</td><td><Status tone={o.tone}>{o.status}</Status></td><td>{o.date}</td></tr>)}</tbody></table></div></div>;
}

function CalendarView(){ const days=Array.from({length:35},(_,i)=>i<3?29+i:i-2); return <div className="panel calendar"><div className="calendar-head"><button>←</button><h2>July 2026</h2><button>→</button><span/><Status tone="blue">Measurement</Status><Status tone="green">Installation</Status><Status tone="amber">Consultation</Status></div><div className="weekdays">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=><b key={d}>{d}</b>)}</div><div className="days">{days.map((d,i)=><div key={i} className={i<3?'muted':''}><span>{d}</span>{i===9&&<em className="event blue">9:00 · Measure</em>}{i===11&&<em className="event amber">2:00 · Consult</em>}{i===17&&<em className="event green">11:30 · Install</em>}{i===24&&<em className="event green">8:30 · Install</em>}</div>)}</div></div> }

function ReportView({name}:{name:string}){ return <><section className="kpi-grid report-kpis">{kpis.map((k,i)=><article className="kpi" key={k.label}><div className="kpi-top"><span>{name==='Receivables'&&i===0?'Total outstanding':k.label}</span></div><strong>{k.value}</strong><small>{k.delta}</small></article>)}</section><div className="report-grid"><article className="panel chart-card"><div className="panel-head"><div><span className="eyebrow">12 MONTH TREND</span><h2>{name} overview</h2></div></div><div className="bars">{[32,48,42,58,68,62,78,72,88,77,92,84].map((v,i)=><div key={i}><i style={{height:`${v}%`}}/><small>{['A','S','O','N','D','J','F','M','A','M','J','J'][i]}</small></div>)}</div></article><article className="panel mix"><span className="eyebrow">BREAKDOWN</span><h2>Product mix</h2>{[['Roller shades','36%'],['Drapery','24%'],['Blinds','19%'],['Shutters','12%'],['Other','9%']].map(x=><div key={x[0]}><span>{x[0]}</span><b>{x[1]}</b></div>)}</article></div></> }

function DetailDrawer({ id, close }: { id: string; close: () => void }) { return <div className="drawer-wrap" onClick={close}><aside className="drawer" onClick={e=>e.stopPropagation()}><button className="drawer-close" onClick={close}>×</button><span className="eyebrow">ORDER DETAIL</span><h2>{id}</h2><p className="drawer-sub">Hillcrest Residence · Motorized roller shades</p><Status tone="blue">In production</Status><div className="detail-stats"><div><span>Order value</span><b>$18,420</b></div><div><span>Balance due</span><b>$9,210</b></div><div><span>Install target</span><b>Jul 28</b></div></div><h3>Progress</h3><div className="timeline">{[['Quote approved','Jul 02','done'],['Deposit received','Jul 03','done'],['Purchase order sent','Jul 05','done'],['In production','Jul 14','active'],['Receiving','Estimated Jul 22',''],['Installation','Target Jul 28','']].map(x=><div className={x[2]} key={x[0]}><i/><span><b>{x[0]}</b><small>{x[1]}</small></span></div>)}</div><h3>Access</h3><div className="access-card"><span>Only 4 assigned team members can view this order’s schedule, progress, installation, and billing details.</span><button>Manage access</button></div><button className="primary wide">Open full order</button></aside></div> }

export default function Home() {
  const [active, setActive] = useState("Overview");
  const [drawer, setDrawer] = useState<string|null>(null);
  const [mobile, setMobile] = useState(false);
  const [role, setRole] = useState("Owner");
  const breadcrumb = useMemo(()=> nav.find(g=>g.items.some(i=>i.label===active))?.title || "Workspace",[active]);
  const go = (label:string)=>{setActive(label);setMobile(false);window.scrollTo({top:0,behavior:'smooth'})};
  return <div className="app-shell">
    <aside className={`sidebar ${mobile?'open':''}`}><div className="brand"><div className="brand-mark"><i/><i/><i/></div><div><b>BRAUN</b><span>BLINDS</span></div><button className="mobile-close" onClick={()=>setMobile(false)}>×</button></div><div className="workspace"><span>WORKSPACE</span><b>Braun International</b><button>⌄</button></div><nav>{nav.map(g=><div className="nav-group" key={g.title}><h3>{g.title}</h3>{g.items.map(item=><button key={item.label} className={active===item.label?'active':''} onClick={()=>go(item.label)}><i>{item.icon}</i><span>{item.label}</span>{item.badge&&<em>{item.badge}</em>}</button>)}</div>)}</nav><div className="help-card"><b>Need a hand?</b><span>Visit the help center or contact support.</span><button>Open help center →</button></div><div className="user-card"><div>GS</div><span><b>Gunther Sung</b><small>{role} · Ontario, CA</small></span><button>•••</button></div></aside>
    <div className="mobile-overlay" onClick={()=>setMobile(false)}/>
    <main className="main"><header className="topbar"><button className="menu" onClick={()=>setMobile(true)}>☰</button><div className="crumb"><span>{breadcrumb}</span><b>/</b><strong>{active}</strong></div><label className="global-search">⌕<input placeholder="Search orders, clients, projects…"/><kbd>⌘ K</kbd></label><div className="top-actions"><select value={role} onChange={e=>setRole(e.target.value)} aria-label="Role preview"><option>Owner</option><option>Sales</option><option>Installer</option></select><button aria-label="Notifications">♢<em>3</em></button><div className="avatar">GS</div></div></header><div className="content">{active==='Overview'?<Overview onOpen={setDrawer}/>:<ModulePage name={active} onOpen={setDrawer}/>}<footer><span>© 2026 Braun International, LLC</span><span>Privacy · Terms · Support</span></footer></div></main>{drawer&&<DetailDrawer id={drawer} close={()=>setDrawer(null)}/>}</div>;
}

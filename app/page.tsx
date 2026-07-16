"use client";

import { useMemo, useState } from "react";

type NavItem = { label: string; icon: string; badge?: number };
type NavGroup = { title: string; items: NavItem[] };

const nav: NavGroup[] = [
  { title: "工作台", items: [
    { label: "经营总览", icon: "⌂" }, { label: "待办与提醒", icon: "◌", badge: 8 },
  ]},
  { title: "客户与销售", items: [
    { label: "销售线索", icon: "◎" }, { label: "客户管理", icon: "◇" }, { label: "项目管理", icon: "▤" },
    { label: "上门测量", icon: "⌁" }, { label: "报价管理", icon: "□" }, { label: "销售订单", icon: "▣" }, { label: "售后服务", icon: "✦" },
  ]},
  { title: "现场与运营", items: [
    { label: "团队日历", icon: "▦" }, { label: "安装工单", icon: "✓" }, { label: "生产进度", icon: "◫" },
    { label: "采购入库", icon: "↓" }, { label: "照片资料", icon: "◉" },
  ]},
  { title: "采购与财务", items: [
    { label: "采购订单", icon: "▧" }, { label: "供应商管理", icon: "△" }, { label: "供应商账单", icon: "$" },
    { label: "应收账款", icon: "↗" }, { label: "收付款", icon: "≈" },
  ]},
  { title: "分析与管理", items: [
    { label: "经营报表", icon: "↗" }, { label: "利润分析", icon: "%" }, { label: "产品与文档", icon: "⌘" }, { label: "系统设置", icon: "⚙" },
  ]},
];

const orders = [
  { id: "SO-2026-1048", client: "山景别墅项目", product: "电动卷帘 · 12个窗位 · Somfy电机", value: "$18,420", status: "生产中", tone: "blue", date: "7月28日", owner: "陈美雅" },
  { id: "SO-2026-1042", client: "银湖设计工作室", product: "蛇形帘 · 双层轨道 · 8个窗位", value: "$9,860", status: "已排安装", tone: "green", date: "7月22日", owner: "朴立欧" },
  { id: "SO-2026-1039", client: "峡谷住宅项目", product: "斑马帘 · 14个窗位 · 米白色", value: "$7,245", status: "待入库", tone: "amber", date: "7月19日", owner: "陈美雅" },
  { id: "SO-2026-1033", client: "安大略办公室", product: "垂直百叶 · 28个窗位 · 商用阻燃", value: "$12,105", status: "待收定金", tone: "red", date: "7月18日", owner: "金诺亚" },
];

const kpis = [
  { label: "本月销售额", value: "$84,620", delta: "较上月 +12.4%", icon: "↗", trend: [12,20,16,31,28,45,39,58] },
  { label: "进行中销售订单", value: "24", delta: "其中6项需处理", icon: "▣", trend: [24,22,30,27,36,33,41,45] },
  { label: "本周现场任务", value: "18", delta: "团队产能已使用82%", icon: "✓", trend: [18,22,21,31,26,36,42,38] },
  { label: "应收账款", value: "$31,480", delta: "逾期金额 $4,950", icon: "$", trend: [46,39,44,37,34,31,28,24] },
];

const pages: Record<string, { title: string; kicker: string }> = {
  销售线索: { title: "销售线索", kicker: "记录来源、跟进人、客户需求、预约时间和成交阶段。" },
  客户管理: { title: "客户管理", kicker: "统一查看联系人、项目地址、历史报价、订单和应收余额。" },
  项目管理: { title: "项目管理", kicker: "以项目地址为中心管理测量、报价、附件、订单和安装。" },
  上门测量: { title: "上门测量", kicker: "记录每个窗位的宽高、安装方式、障碍物、照片和语音备注。" },
  报价管理: { title: "报价管理", kicker: "按窗饰产品规则配置选项、成本、售价、折扣、税费和客户确认。" },
  销售订单: { title: "销售订单", kicker: "从定金、采购、生产、入库到安装结清追踪完整进度。" },
  售后服务: { title: "售后服务", kicker: "处理维修、质保、补件、客户投诉和上门服务。" },
  团队日历: { title: "团队日历", kicker: "安排咨询、测量、安装、维修和售后回访。" },
  安装工单: { title: "安装工单", kicker: "分配安装人员、工具物料、现场说明和完工签字。" },
  生产进度: { title: "生产进度", kicker: "查看供应商确认、生产、发货、到货和异常节点。" },
  采购入库: { title: "采购入库", kicker: "按销售订单核对到货产品、数量、箱号、损坏和缺件。" },
  照片资料: { title: "照片资料", kicker: "按客户、项目、窗位、测量、安装前后及售后分类保存。" },
  采购订单: { title: "采购订单", kicker: "关联销售订单、产品明细、供应商成本、付款和预计到货日。" },
  供应商管理: { title: "供应商管理", kicker: "维护供应商目录、折扣、交期、付款条款和服务表现。" },
  供应商账单: { title: "供应商账单", kicker: "审核应付金额并将每笔费用归集到对应订单。" },
  应收账款: { title: "应收账款", kicker: "查看客户余额、账龄、定金、尾款和催收记录。" },
  收付款: { title: "收付款", kicker: "登记信用卡、ACH、支票、Zelle、退款和供应商付款。" },
  经营报表: { title: "经营报表", kicker: "分析收入、成交率、产品结构、采购、安装和团队效率。" },
  利润分析: { title: "利润分析", kicker: "按订单、产品、供应商、销售人员查看收入、成本和毛利。" },
  产品与文档: { title: "产品与文档", kicker: "管理产品规格、面料、测量规则、条款、模板和培训资料。" },
  系统设置: { title: "系统设置", kicker: "设置公司资料、员工权限、编号规则、支付方式和通知。" },
  待办与提醒: { title: "待办与提醒", kicker: "集中处理逾期回访、待收款、到货异常和安装确认。" },
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
      <div><span className="eyebrow">2026年7月16日 · 星期四</span><h1>早上好，Gunther。</h1><p>这里汇总了今天需要关注的销售、采购、生产和安装动态。</p></div>
      <div className="hero-actions"><button className="secondary">查看日历</button><button className="primary">＋ 新建报价</button></div>
      <div className="fabric-orb one"/><div className="fabric-orb two"/>
    </section>
    <section className="kpi-grid">
      {kpis.map((k) => <article className="kpi" key={k.label}><div className="kpi-top"><span>{k.label}</span><b>{k.icon}</b></div><strong>{k.value}</strong><div className="kpi-foot"><small>{k.delta}</small><Spark values={k.trend}/></div></article>)}
    </section>
    <section className="dashboard-grid">
      <article className="panel orders-panel">
        <div className="panel-head"><div><span className="eyebrow">订单流程</span><h2>进行中的销售订单</h2></div><button className="text-button">查看全部 →</button></div>
        <div className="table-wrap"><table><thead><tr><th>订单编号</th><th>客户 / 产品</th><th>负责人</th><th>订单金额</th><th>当前状态</th><th>下一节点</th></tr></thead><tbody>{orders.map(o => <tr key={o.id} onClick={() => onOpen(o.id)}><td><b>{o.id}</b></td><td><strong>{o.client}</strong><small>{o.product}</small></td><td>{o.owner}</td><td>{o.value}</td><td><Status tone={o.tone}>{o.status}</Status></td><td>{o.date}</td></tr>)}</tbody></table></div>
      </article>
      <aside className="right-stack">
        <article className="panel focus"><div className="panel-head"><div><span className="eyebrow">今日重点</span><h2>8项工作需要处理</h2></div></div>
          <button className="focus-row"><span className="focus-icon warm">$</span><span><b>3笔定金待收取</b><small>合计待收 $12,410</small></span><em>→</em></button>
          <button className="focus-row"><span className="focus-icon red">!</span><span><b>2个订单存在交期风险</b><small>供应商预计发货日期已变更</small></span><em>→</em></button>
          <button className="focus-row"><span className="focus-icon green">✓</span><span><b>3张工单可完工结算</b><small>等待客户签字确认</small></span><em>→</em></button>
        </article>
        <article className="panel pipeline"><div className="panel-head"><div><span className="eyebrow">销售漏斗</span><h2>报价进展</h2></div><b>$46.2K</b></div>
          {[['草稿','5','$18.4K'],['已发送','8','$21.6K'],['已批准','3','$6.2K']].map((x,i)=><div className="pipe" key={x[0]}><div><span>{x[0]}</span><b>{x[1]}</b></div><div className="bar"><i style={{width:`${74-i*19}%`}}/></div><small>{x[2]}</small></div>)}
        </article>
      </aside>
    </section>
    <section className="lower-grid">
      <article className="panel schedule"><div className="panel-head"><div><span className="eyebrow">现场团队</span><h2>即将开始的预约</h2></div><button className="text-button">查看完整排程 →</button></div>
        {[['9:00','上门测量','峡谷住宅项目','陈美雅 · 帕萨迪纳'],['11:30','安装施工','银湖设计工作室','安装二组 · 洛杉矶'],['2:00','方案咨询','公园路住宅','朴立欧 · 亚凯迪亚']].map((a,i)=><div className="appointment" key={a[0]}><time>{a[0]}<small>{i<2?'上午':'下午'}</small></time><i/><span><Status tone={i===1?'green':'blue'}>{a[1]}</Status><b>{a[2]}</b><small>{a[3]}</small></span><em>•••</em></div>)}
      </article>
      <article className="panel margin"><div className="panel-head"><div><span className="eyebrow">毛利健康度</span><h2>综合毛利率</h2></div><select><option>本月</option></select></div><div className="margin-body"><div className="ring"><span>42.8%<small>提升2.1点</small></span></div><div><b>目标毛利率 40%</b><p>整体毛利高于目标，其中电动产品和窗帘项目表现最好。</p><button className="text-button">查看利润分析 →</button></div></div></article>
    </section>
  </>;
}

function ModulePage({ name, onOpen }: { name: string; onOpen: (id: string) => void }) {
  const meta = pages[name] || { title: name, kicker: "管理该业务模块的记录、状态和负责人。" };
  const isCalendar = name === "团队日历";
  const isReport = ["经营报表","利润分析","应收账款"].includes(name);
  return <>
    <div className="module-head"><div><span className="eyebrow">BRAUN BLINDS / {name}</span><h1>{meta.title}</h1><p>{meta.kicker}</p></div><div><button className="secondary">导出</button><button className="primary">＋ 新建</button></div></div>
    <div className="toolbar"><label>⌕ <input placeholder={`搜索${name}...`} /></label><button>全部状态⌄</button><button>筛选</button><button>显示字段</button></div>
    {isCalendar ? <CalendarView/> : isReport ? <ReportView name={name}/> : <ListView name={name} onOpen={onOpen}/>} 
  </>;
}

function ListView({ name, onOpen }: { name: string; onOpen: (id: string) => void }) {
  return <div className="panel module-panel"><div className="summary-row"><div><span>进行中</span><b>{name === '采购订单' ? '12' : '24'}</b></div><div><span>需要处理</span><b>6</b></div><div><span>本月已完成</span><b>18</b></div><div><span>合计金额</span><b>$84,620</b></div></div><div className="table-wrap"><table><thead><tr><th>业务编号</th><th>客户 / 公司</th><th>产品或事项</th><th>负责人</th><th>金额</th><th>状态</th><th>下一节点</th></tr></thead><tbody>{orders.concat(orders.slice(0,2).map((o,i)=>({...o,id:`BR-2026-${1030-i}`,client:i?'西区公寓项目':'公园路住宅'}))).map((o,i)=><tr key={`${o.id}${i}`} onClick={()=>onOpen(o.id)}><td><b>{o.id}</b></td><td><strong>{o.client}</strong></td><td>{o.product}</td><td>{o.owner}</td><td>{o.value}</td><td><Status tone={o.tone}>{o.status}</Status></td><td>{o.date}</td></tr>)}</tbody></table></div></div>;
}

function CalendarView(){ const days=Array.from({length:35},(_,i)=>i<3?29+i:i-2); return <div className="panel calendar"><div className="calendar-head"><button>←</button><h2>2026年7月</h2><button>→</button><span/><Status tone="blue">上门测量</Status><Status tone="green">安装施工</Status><Status tone="amber">方案咨询</Status></div><div className="weekdays">{['周日','周一','周二','周三','周四','周五','周六'].map(d=><b key={d}>{d}</b>)}</div><div className="days">{days.map((d,i)=><div key={i} className={i<3?'muted':''}><span>{d}</span>{i===9&&<em className="event blue">9:00 · 测量</em>}{i===11&&<em className="event amber">14:00 · 咨询</em>}{i===17&&<em className="event green">11:30 · 安装</em>}{i===24&&<em className="event green">8:30 · 安装</em>}</div>)}</div></div> }

function ReportView({name}:{name:string}){ return <><section className="kpi-grid report-kpis">{kpis.map((k,i)=><article className="kpi" key={k.label}><div className="kpi-top"><span>{name==='应收账款'&&i===0?'应收余额合计':k.label}</span></div><strong>{k.value}</strong><small>{k.delta}</small></article>)}</section><div className="report-grid"><article className="panel chart-card"><div className="panel-head"><div><span className="eyebrow">近12个月趋势</span><h2>{name}概览</h2></div></div><div className="bars">{[32,48,42,58,68,62,78,72,88,77,92,84].map((v,i)=><div key={i}><i style={{height:`${v}%`}}/><small>{['8月','9月','10月','11月','12月','1月','2月','3月','4月','5月','6月','7月'][i]}</small></div>)}</div></article><article className="panel mix"><span className="eyebrow">产品构成</span><h2>销售产品占比</h2>{[['卷帘 / 阳光面料','36%'],['窗帘 / 轨道','24%'],['百叶 / 垂直帘','19%'],['木百叶 / 百叶窗','12%'],['罗马帘及其他','9%']].map(x=><div key={x[0]}><span>{x[0]}</span><b>{x[1]}</b></div>)}</article></div></> }

function DetailDrawer({ id, close }: { id: string; close: () => void }) { return <div className="drawer-wrap" onClick={close}><aside className="drawer" onClick={e=>e.stopPropagation()}><button className="drawer-close" onClick={close}>×</button><span className="eyebrow">销售订单详情</span><h2>{id}</h2><p className="drawer-sub">山景别墅项目 · 电动卷帘 · 12个窗位</p><Status tone="blue">生产中</Status><div className="detail-stats"><div><span>订单金额</span><b>$18,420</b></div><div><span>待收尾款</span><b>$9,210</b></div><div><span>目标安装日</span><b>7月28日</b></div></div><h3>订单进度</h3><div className="timeline">{[['报价已批准','7月2日','done'],['已收50%定金','7月3日','done'],['采购订单已发送','7月5日','done'],['供应商生产中','7月14日更新','active'],['采购入库','预计7月22日',''],['安装施工','计划7月28日','']].map(x=><div className={x[2]} key={x[0]}><i/><span><b>{x[0]}</b><small>{x[1]}</small></span></div>)}</div><h3>订单访问权限</h3><div className="access-card"><span>仅4名已分配人员可查看本订单的排程、生产进度、安装记录、成本和账单。其他员工无法通过搜索或报表访问。</span><button>管理权限</button></div><button className="primary wide">打开完整订单</button></aside></div> }

export default function Home() {
  const [active, setActive] = useState("经营总览");
  const [drawer, setDrawer] = useState<string|null>(null);
  const [mobile, setMobile] = useState(false);
  const [role, setRole] = useState("公司管理员");
  const breadcrumb = useMemo(()=> nav.find(g=>g.items.some(i=>i.label===active))?.title || "工作台",[active]);
  const go = (label:string)=>{setActive(label);setMobile(false);window.scrollTo({top:0,behavior:'smooth'})};
  return <div className="app-shell">
    <aside className={`sidebar ${mobile?'open':''}`}><div className="brand"><div className="brand-mark"><i/><i/><i/></div><div><b>BRAUN</b><span>BLINDS</span></div><button className="mobile-close" onClick={()=>setMobile(false)}>×</button></div><div className="workspace"><span>当前公司</span><b>Braun International</b><button>⌄</button></div><nav>{nav.map(g=><div className="nav-group" key={g.title}><h3>{g.title}</h3>{g.items.map(item=><button key={item.label} className={active===item.label?'active':''} onClick={()=>go(item.label)}><i>{item.icon}</i><span>{item.label}</span>{item.badge&&<em>{item.badge}</em>}</button>)}</div>)}</nav><div className="help-card"><b>需要帮助？</b><span>查看操作说明、产品规则或联系系统支持。</span><button>打开帮助中心 →</button></div><div className="user-card"><div>GS</div><span><b>Gunther Sung</b><small>{role} · 加州安大略市</small></span><button>•••</button></div></aside>
    <div className="mobile-overlay" onClick={()=>setMobile(false)}/>
    <main className="main"><header className="topbar"><button className="menu" onClick={()=>setMobile(true)}>☰</button><div className="crumb"><span>{breadcrumb}</span><b>/</b><strong>{active}</strong></div><label className="global-search">⌕<input placeholder="搜索订单、客户、项目、采购单…"/><kbd>⌘ K</kbd></label><div className="top-actions"><select value={role} onChange={e=>setRole(e.target.value)} aria-label="角色权限预览"><option>公司管理员</option><option>销售人员</option><option>测量人员</option><option>安装人员</option><option>财务人员</option><option>客户账户</option></select><button aria-label="通知">♢<em>3</em></button><div className="avatar">GS</div></div></header><div className="content">{active==='经营总览'?<Overview onOpen={setDrawer}/>:<ModulePage name={active} onOpen={setDrawer}/>}<footer><span>© 2026 Braun International, LLC</span><span>隐私政策 · 使用条款 · 技术支持</span></footer></div></main>{drawer&&<DetailDrawer id={drawer} close={()=>setDrawer(null)}/>}</div>;
}

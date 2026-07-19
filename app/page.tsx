"use client";

import { useEffect, useMemo, useState } from "react";

type NavItem = { label: string; icon: string; badge?: number };
type NavGroup = { title: string; items: NavItem[] };

const en: Record<string,string> = {
  "工作台":"Workspace","经营总览":"Overview","待办与提醒":"Tasks & Alerts","客户与销售":"Sales & CRM","销售线索":"Leads","客户管理":"Customers","项目管理":"Projects","上门测量":"Measurements","报价管理":"Quotes","销售订单":"Sales Orders","售后服务":"Aftercare",
  "现场与运营":"Field & Operations","团队日历":"Calendar","安装工单":"Work Orders","生产进度":"Production","采购入库":"Receiving","照片资料":"Photos","采购与财务":"Purchasing & Finance","采购订单":"Purchase Orders","供应商管理":"Vendors","供应商账单":"Vendor Bills","应收账款":"Receivables","收付款":"Payments","分析与管理":"Insights & Admin","经营报表":"Reports","利润分析":"Profitability","产品与文档":"Resources","系统设置":"Settings"
};

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

const moduleRows: Record<string, Array<{id:string;client:string;product:string;owner:string;value:string;status:string;tone:string;date:string}>> = {
  销售线索: [
    {id:"LD-2026-0081",client:"林女士 · Pasadena",product:"客厅电动卷帘，预约现场咨询",owner:"陈美雅",value:"预计 $8,000",status:"待联系",tone:"amber",date:"今天 3:00"},
    {id:"LD-2026-0078",client:"Cedar Design Group",product:"酒店公共区窗帘项目",owner:"朴立欧",value:"预计 $35,000",status:"已预约",tone:"green",date:"7月18日"},
  ],
  客户管理: [
    {id:"CU-0148",client:"Hillcrest Residence",product:"2个项目 · 26个窗位",owner:"陈美雅",value:"累计 $28,460",status:"活跃客户",tone:"green",date:"7月14日"},
    {id:"CU-0139",client:"Ontario Office Partners",product:"商业客户 · Net 30",owner:"金诺亚",value:"累计 $42,180",status:"活跃客户",tone:"green",date:"7月11日"},
  ],
  项目管理: [
    {id:"PJ-2026-0036",client:"山景别墅项目",product:"12个窗位 · 已完成测量",owner:"陈美雅",value:"$18,420",status:"执行中",tone:"blue",date:"7月28日"},
    {id:"PJ-2026-0031",client:"银湖设计工作室",product:"8个窗位 · 蛇形帘",owner:"朴立欧",value:"$9,860",status:"待安装",tone:"green",date:"7月22日"},
  ],
  上门测量: [
    {id:"MS-2026-0114",client:"峡谷住宅项目",product:"14个窗位 · 激光测量 + 照片",owner:"陈美雅",value:"已用 140 tokens",status:"已完成",tone:"green",date:"7月15日"},
    {id:"MS-2026-0116",client:"Park Residence",product:"主卧及客厅 · 6个窗位",owner:"金诺亚",value:"待测量",status:"已排程",tone:"blue",date:"7月17日"},
  ],
  报价管理: [
    {id:"QT-2026-0188",client:"山景别墅项目",product:"电动卷帘 · Somfy电机",owner:"陈美雅",value:"$18,420",status:"客户已批准",tone:"green",date:"7月2日"},
    {id:"QT-2026-0194",client:"Westside Loft",product:"罗马帘 · 7个窗位",owner:"朴立欧",value:"$6,780",status:"已发送",tone:"blue",date:"7月16日"},
  ],
  销售订单: orders,
  采购订单: [
    {id:"PO-2026-0726",client:"供应商：Suntex",product:"关联 SO-2026-1048 · 电动卷帘",owner:"金诺亚",value:"$8,940",status:"生产中",tone:"blue",date:"预计7月22日"},
    {id:"PO-2026-0719",client:"供应商：Fabricut",product:"关联 SO-2026-1042 · 窗帘面料",owner:"陈美雅",value:"$3,260",status:"已发货",tone:"green",date:"预计7月18日"},
  ],
  采购入库: [
    {id:"RC-2026-0042",client:"PO-2026-0719",product:"5箱 · 关联 SO-2026-1042",owner:"仓库",value:"数量 8/8",status:"待质检",tone:"amber",date:"今天"},
    {id:"RC-2026-0038",client:"PO-2026-0708",product:"3箱 · 2件轨道",owner:"仓库",value:"数量 3/3",status:"已入库",tone:"green",date:"7月14日"},
  ],
  安装工单: [
    {id:"WO-2026-0094",client:"银湖设计工作室",product:"安装蛇形帘 · 8个窗位 · 二人组",owner:"安装二组",value:"预计 4.5小时",status:"已排程",tone:"blue",date:"7月22日 11:30"},
    {id:"WO-2026-0091",client:"Ontario Offices",product:"垂直百叶 · 28个窗位",owner:"安装一组",value:"预计 6小时",status:"待确认",tone:"amber",date:"7月24日 8:30"},
  ],
  应收账款: [
    {id:"INV-2026-0241",client:"山景别墅项目",product:"SO-2026-1048 · 50%尾款",owner:"财务",value:"$9,210",status:"未到期",tone:"blue",date:"7月28日"},
    {id:"INV-2026-0228",client:"Ontario Offices",product:"SO-2026-1033 · 定金",owner:"财务",value:"$4,950",status:"已逾期",tone:"red",date:"逾期5天"},
  ]
};

function Spark({ values }: { values: number[] }) {
  const points = values.map((v, i) => `${i * 18},${56 - v}`).join(" ");
  return <svg className="spark" viewBox="0 0 126 58" aria-hidden="true"><polyline points={points} /></svg>;
}

function Status({ children, tone = "blue" }: { children: React.ReactNode; tone?: string }) {
  return <span className={`status ${tone}`}><i />{children}</span>;
}

function Overview({ onOpen, go, onNew }: { onOpen: (id: string) => void; go:(name:string)=>void; onNew:()=>void }) {
  return <>
    <section className="hero-card">
      <div><span className="eyebrow">2026年7月16日 · 星期四</span><h1>早上好，Gunther。</h1><p>这里汇总了今天需要关注的销售、采购、生产和安装动态。</p></div>
      <div className="hero-actions"><button className="secondary" onClick={()=>go('团队日历')}>查看日历 / Calendar</button><button className="primary" onClick={()=>{go('报价管理');onNew()}}>＋ 新建报价 / Quote</button></div>
      <div className="fabric-orb one"/><div className="fabric-orb two"/>
    </section>
    <section className="kpi-grid">
      {kpis.map((k) => <article className="kpi" key={k.label}><div className="kpi-top"><span>{k.label}</span><b>{k.icon}</b></div><strong>{k.value}</strong><div className="kpi-foot"><small>{k.delta}</small><Spark values={k.trend}/></div></article>)}
    </section>
    <section className="dashboard-grid">
      <article className="panel orders-panel">
        <div className="panel-head"><div><span className="eyebrow">订单流程</span><h2>进行中的销售订单</h2></div><button className="text-button" onClick={()=>go('销售订单')}>查看全部 / View all →</button></div>
        <div className="table-wrap"><table><thead><tr><th>订单编号</th><th>客户 / 产品</th><th>负责人</th><th>订单金额</th><th>当前状态</th><th>下一节点</th></tr></thead><tbody>{orders.map(o => <tr key={o.id} onClick={() => onOpen(o.id)}><td><b>{o.id}</b></td><td><strong>{o.client}</strong><small>{o.product}</small></td><td>{o.owner}</td><td>{o.value}</td><td><Status tone={o.tone}>{o.status}</Status></td><td>{o.date}</td></tr>)}</tbody></table></div>
      </article>
      <aside className="right-stack">
        <article className="panel focus"><div className="panel-head"><div><span className="eyebrow">今日重点</span><h2>8项工作需要处理</h2></div></div>
          <button className="focus-row" onClick={()=>go('应收账款')}><span className="focus-icon warm">$</span><span><b>3笔定金待收取</b><small>合计待收 $12,410</small></span><em>→</em></button>
          <button className="focus-row" onClick={()=>go('采购订单')}><span className="focus-icon red">!</span><span><b>2个订单存在交期风险</b><small>供应商预计发货日期已变更</small></span><em>→</em></button>
          <button className="focus-row" onClick={()=>go('安装工单')}><span className="focus-icon green">✓</span><span><b>3张工单可完工结算</b><small>等待客户签字确认</small></span><em>→</em></button>
        </article>
        <article className="panel pipeline"><div className="panel-head"><div><span className="eyebrow">销售漏斗</span><h2>报价进展</h2></div><b>$46.2K</b></div>
          {[['草稿','5','$18.4K'],['已发送','8','$21.6K'],['已批准','3','$6.2K']].map((x,i)=><div className="pipe" key={x[0]}><div><span>{x[0]}</span><b>{x[1]}</b></div><div className="bar"><i style={{width:`${74-i*19}%`}}/></div><small>{x[2]}</small></div>)}
        </article>
      </aside>
    </section>
    <section className="lower-grid">
      <article className="panel schedule"><div className="panel-head"><div><span className="eyebrow">现场团队</span><h2>即将开始的预约</h2></div><button className="text-button" onClick={()=>go('团队日历')}>查看完整排程 / Schedule →</button></div>
        {[['9:00','上门测量','峡谷住宅项目','陈美雅 · 帕萨迪纳'],['11:30','安装施工','银湖设计工作室','安装二组 · 洛杉矶'],['2:00','方案咨询','公园路住宅','朴立欧 · 亚凯迪亚']].map((a,i)=><div className="appointment" key={a[0]}><time>{a[0]}<small>{i<2?'上午':'下午'}</small></time><i/><span><Status tone={i===1?'green':'blue'}>{a[1]}</Status><b>{a[2]}</b><small>{a[3]}</small></span><em>•••</em></div>)}
      </article>
      <article className="panel margin"><div className="panel-head"><div><span className="eyebrow">毛利健康度</span><h2>综合毛利率</h2></div><select aria-label="报表周期"><option>本月 / Month</option><option>本季度 / Quarter</option><option>本年 / Year</option></select></div><div className="margin-body"><div className="ring"><span>42.8%<small>提升2.1点</small></span></div><div><b>目标毛利率 40%</b><p>整体毛利高于目标，其中电动产品和窗帘项目表现最好。</p><button className="text-button" onClick={()=>go('利润分析')}>查看利润分析 / Profitability →</button></div></div></article>
    </section>
  </>;
}

function IntegratedTool({kind}:{kind:"measure"|"complete"}){
  const isMeasure=kind==="measure";
  const src=isMeasure?"https://braun-measure.sundagang91709.chatgpt.site":"/complete/index.html";
  return <section className="integrated-tool">
    <div className="tool-banner"><div><span className="eyebrow">BRAUN UNIFIED WORKFLOW / 统一工作流</span><h1>{isMeasure?"现场测量系统":"Braun Complete v3.0"}<small>{isMeasure?"Field Measure":"Quote · Order · Invoice · Fabrication"}</small></h1><p>{isMeasure?"按客户、订单、房间和窗位拍照测量；完成后可发送到报价订单系统。":"导入现场测量结果，补充面料与款式，生成报价、Invoice和加工图。"}</p></div><div><button className="secondary" onClick={()=>window.open(src,"_blank")}>全屏打开 / Open full screen ↗</button>{isMeasure?<a className="primary tool-switch" href="/complete/index.html" target="_blank">下一步：报价 / Quote →</a>:<span className="tool-status">✓ Complete v3.0 已嵌入门户</span>}</div></div>
    <div className="integration-flow"><span className={isMeasure?"active":"done"}>1　现场测量</span><i>→</i><span className={!isMeasure?"active":""}>2　报价与订单</span><i>→</i><span>3　Invoice / 加工图</span></div>
    <div className="tool-frame-wrap"><iframe title={isMeasure?"Braun现场测量":"Braun Complete v3.0"} src={src} className="tool-frame" allow="camera; clipboard-read; clipboard-write"/></div>
  </section>
}

function ModulePage({ name, onOpen, onNew, search, setSearch }: { name: string; onOpen: (id: string) => void; onNew:()=>void; search:string; setSearch:(v:string)=>void }) {
  const meta = pages[name] || { title: name, kicker: "管理该业务模块的记录、状态和负责人。" };
  const isCalendar = name === "团队日历";
  const isReport = ["经营报表","利润分析","应收账款"].includes(name);
  const [status,setStatus]=useState("all");
  const [compact,setCompact]=useState(false);
  const exportCsv=()=>{const rows=moduleRows[name]||orders;const csv=['编号,客户,说明,负责人,金额,状态,日期',...rows.map(x=>[x.id,x.client,x.product,x.owner,x.value,x.status,x.date].map(v=>`"${v}"`).join(','))].join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv'}));a.download=`${name}-2026-07.csv`;a.click();URL.revokeObjectURL(a.href)};
  if(name==="上门测量") return <IntegratedTool kind="measure"/>;
  if(name==="报价管理") return <IntegratedTool kind="complete"/>;
  return <>
    <div className="module-head"><div><span className="eyebrow">BRAUN BLINDS / {en[name]}</span><h1>{meta.title}<small className="en-title">{en[name]}</small></h1><p>{meta.kicker}</p></div><div><button className="secondary" onClick={exportCsv}>导出 / Export</button><button className="primary" onClick={onNew}>＋ 新建 / New</button></div></div>
    <div className="toolbar"><label>⌕ <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={`搜索${name} / Search ${en[name]}...`} /></label><select value={status} onChange={e=>setStatus(e.target.value)}><option value="all">全部状态 / All</option><option value="attention">需要处理 / Attention</option><option value="active">正常进行 / Active</option></select><button onClick={()=>setSearch('SO-')}>仅销售订单 / Sales</button><button onClick={()=>setCompact(v=>!v)}>{compact?'展开字段 / Expand':'精简字段 / Compact'}</button></div>
    {isCalendar ? <CalendarView/> : isReport ? <ReportView name={name}/> : <ListView name={name} onOpen={onOpen} search={search} status={status} compact={compact}/>} 
  </>;
}

function ListView({ name, onOpen, search, status, compact }: { name: string; onOpen: (id: string) => void; search:string;status:string;compact:boolean }) {
  const rows = (moduleRows[name] || orders).filter(o=>`${o.id}${o.client}${o.product}${o.owner}${o.status}`.toLowerCase().includes(search.toLowerCase())).filter(o=>status==='all'||(status==='attention'?['red','amber'].includes(o.tone):!['red','amber'].includes(o.tone)));
  return <div className={`panel module-panel ${compact?'compact-table':''}`}><div className="summary-row"><div><span>进行中 / Active</span><b>{rows.length}</b></div><div><span>需要处理 / Attention</span><b>{rows.filter(x=>['red','amber'].includes(x.tone)).length}</b></div><div><span>本月完成 / Completed</span><b>18</b></div><div><span>合计金额 / Total</span><b>$84,620</b></div></div><div className="table-wrap"><table><thead><tr><th>业务编号 / Ref.</th><th>客户或公司 / Client</th><th className="optional-col">产品或事项 / Description</th><th className="optional-col">负责人 / Owner</th><th>金额 / Value</th><th>状态 / Status</th><th>下一节点 / Next</th></tr></thead><tbody>{rows.map((o,i)=><tr key={`${o.id}${i}`} onClick={()=>onOpen(o.id)}><td><b>{o.id}</b></td><td><strong>{o.client}</strong></td><td className="optional-col">{o.product}</td><td className="optional-col">{o.owner}</td><td>{o.value}</td><td><Status tone={o.tone}>{o.status}</Status></td><td>{o.date}</td></tr>)}</tbody></table>{!rows.length&&<div className="empty-search">没有匹配记录 / No matching records</div>}</div></div>;
}

function CalendarView(){ const [month,setMonth]=useState(7);const [selected,setSelected]=useState<number|null>(null);const days=Array.from({length:35},(_,i)=>i<3?29+i:i-2); return <div className="panel calendar"><div className="calendar-head"><button onClick={()=>setMonth(m=>m===1?12:m-1)}>←</button><h2>2026年{month}月 <small>/ {['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][month]}</small></h2><button onClick={()=>setMonth(m=>m===12?1:m+1)}>→</button><span/><Status tone="blue">上门测量</Status><Status tone="green">安装施工</Status><Status tone="amber">方案咨询</Status></div><div className="weekdays">{['周日','周一','周二','周三','周四','周五','周六'].map(d=><b key={d}>{d}</b>)}</div><div className="days">{days.map((d,i)=><button key={i} className={`${i<3?'muted':''} ${selected===i?'selected-day':''}`} onClick={()=>setSelected(i)}><span>{d}</span>{month===7&&i===9&&<em className="event blue">9:00 · 测量</em>}{month===7&&i===11&&<em className="event amber">14:00 · 咨询</em>}{month===7&&i===17&&<em className="event green">11:30 · 安装</em>}{month===7&&i===24&&<em className="event green">8:30 · 安装</em>}</button>)}</div>{selected!==null&&<div className="calendar-selection">已选择 {month}月{days[selected]}日 / Selected date　<button onClick={()=>setSelected(null)}>清除 / Clear</button></div>}</div> }

function ReportView({name}:{name:string}){ return <><section className="kpi-grid report-kpis">{kpis.map((k,i)=><article className="kpi" key={k.label}><div className="kpi-top"><span>{name==='应收账款'&&i===0?'应收余额合计':k.label}</span></div><strong>{k.value}</strong><small>{k.delta}</small></article>)}</section><div className="report-grid"><article className="panel chart-card"><div className="panel-head"><div><span className="eyebrow">近12个月趋势</span><h2>{name}概览</h2></div></div><div className="bars">{[32,48,42,58,68,62,78,72,88,77,92,84].map((v,i)=><div key={i}><i style={{height:`${v}%`}}/><small>{['8月','9月','10月','11月','12月','1月','2月','3月','4月','5月','6月','7月'][i]}</small></div>)}</div></article><article className="panel mix"><span className="eyebrow">产品构成</span><h2>销售产品占比</h2>{[['卷帘 / 阳光面料','36%'],['窗帘 / 轨道','24%'],['百叶 / 垂直帘','19%'],['木百叶 / 百叶窗','12%'],['罗马帘及其他','9%']].map(x=><div key={x[0]}><span>{x[0]}</span><b>{x[1]}</b></div>)}</article></div></> }

function DetailDrawer({ id, close }: { id: string; close: () => void }) { const [perm,setPerm]=useState(false);const [advanced,setAdvanced]=useState(false);return <div className="drawer-wrap" onClick={close}><aside className="drawer" onClick={e=>e.stopPropagation()}><button className="drawer-close" onClick={close}>×</button><span className="eyebrow">销售订单详情 / ORDER DETAIL</span><h2>{id}</h2><p className="drawer-sub">山景别墅项目 · 电动卷帘 · 12个窗位</p><Status tone="blue">生产中 / In production</Status><div className="detail-stats"><div><span>订单金额 / Value</span><b>$18,420</b></div><div><span>待收尾款 / Due</span><b>$9,210</b></div><div><span>目标安装 / Install</span><b>7月28日</b></div></div><h3>订单进度 / Progress</h3><div className="timeline">{[['报价已批准','7月2日','done'],['已收50%定金','7月3日','done'],['采购订单已发送','7月5日','done'],['供应商生产中','7月14日更新','active'],['采购入库','预计7月22日',''],['安装施工','计划7月28日','']].map(x=><div className={x[2]} key={x[0]}><i/><span><b>{x[0]}</b><small>{x[1]}</small></span></div>)}</div><h3>订单访问权限 / Access</h3><div className="access-card"><span>仅4名已分配人员可查看本订单的排程、生产进度、安装记录、成本和账单。</span><button onClick={()=>setPerm(v=>!v)}>管理权限 / Manage</button></div>{perm&&<div className="permission-list">{['Gunther Sung · 管理员','陈美雅 · 销售','金诺亚 · 测量','安装二组 · 安装'].map(x=><label key={x}><input type="checkbox" defaultChecked/>{x}</label>)}</div>}<button className="primary wide" onClick={()=>setAdvanced(v=>!v)}>{advanced?'收起完整资料 / Collapse':'打开完整订单 / Full order'}</button>{advanced&&<div className="full-order"><h3>采购与财务 / Purchasing & Finance</h3><p>采购单 PO-2026-0726 · 成本 $8,940 · 已付 $4,470 · 预计7月22日到货</p><h3>安装要求 / Installation</h3><p>12个窗位，内装，低压电源已确认；安装后完成电机行程设置和客户遥控器培训。</p></div>}</aside></div> }

function NewRecordModal({module,close,save}:{module:string;close:()=>void;save:(name:string)=>void}){
  const [name,setName]=useState(""); const [contact,setContact]=useState(""); const [notes,setNotes]=useState("");
  return <div className="drawer-wrap modal-wrap" onClick={close}><form className="new-modal" onClick={e=>e.stopPropagation()} onSubmit={e=>{e.preventDefault();save(name||"未命名记录")}}><button type="button" className="drawer-close" onClick={close}>×</button><span className="eyebrow">新建记录 / NEW RECORD</span><h2>新建{module}<small>{en[module]}</small></h2><div className="form-grid"><label>客户或项目名称 <small>Client / Project</small><input required value={name} onChange={e=>setName(e.target.value)} placeholder="例如：洛杉矶住宅项目"/></label><label>联系人 / 电话 <small>Contact / Phone</small><input value={contact} onChange={e=>setContact(e.target.value)} placeholder="姓名、电话或邮箱"/></label><label>产品类型 <small>Product type</small><select><option>卷帘 / Roller Shade</option><option>斑马帘 / Zebra Shade</option><option>窗帘 / Drapery</option><option>百叶帘 / Blinds</option><option>百叶窗 / Shutters</option><option>罗马帘 / Roman Shade</option><option>电动产品 / Motorization</option></select></label><label>负责人 <small>Owner</small><select><option>陈美雅</option><option>朴立欧</option><option>金诺亚</option><option>安装一组</option></select></label><label className="full">说明与现场需求 <small>Notes / Site requirements</small><textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="窗位数量、安装方式、期望日期、特殊说明…"/></label></div><div className="modal-actions"><button type="button" className="secondary" onClick={close}>取消 / Cancel</button><button className="primary">保存记录 / Save</button></div></form></div>
}

export default function Home() {
  const [active, setActive] = useState("经营总览");
  const [drawer, setDrawer] = useState<string|null>(null);
  const [mobile, setMobile] = useState(false);
  const [role, setRole] = useState("公司管理员");
  const [search,setSearch]=useState("");
  const [newOpen,setNewOpen]=useState(false);
  const [toast,setToast]=useState("");
  useEffect(()=>{const receive=(event:MessageEvent)=>{if(event.data?.type!=="BRAUN_MEASURE_TRANSFER"||!event.data?.payload)return;localStorage.setItem("braun-measure-transfer-pending",JSON.stringify(event.data.payload));setToast("测量数据已进入 Braun Complete v3.0 / Measurement transferred");setActive("报价管理");setTimeout(()=>setToast(""),3200)};window.addEventListener("message",receive);return()=>window.removeEventListener("message",receive)},[]);
  const breadcrumb = useMemo(()=> nav.find(g=>g.items.some(i=>i.label===active))?.title || "工作台",[active]);
  const go = (label:string)=>{setActive(label);setSearch("");setMobile(false);window.scrollTo({top:0,behavior:'smooth'})};
  const saveRecord=(name:string)=>{setNewOpen(false);setToast(`${name} 已保存 / Saved`);setTimeout(()=>setToast(""),2600)};
  return <div className="app-shell">
    <aside className={`sidebar ${mobile?'open':''}`}><div className="brand"><div className="brand-mark"><i/><i/><i/></div><div><b>BRAUN</b><span>BLINDS</span></div><button className="mobile-close" onClick={()=>setMobile(false)}>×</button></div><div className="workspace"><span>当前公司 / COMPANY</span><b>Braun International</b><button onClick={()=>setToast('当前仅配置一个公司账户 / One company configured')}>⌄</button></div><nav>{nav.map(g=><div className="nav-group" key={g.title}><h3>{g.title}<small>{en[g.title]}</small></h3>{g.items.map(item=><button key={item.label} className={active===item.label?'active':''} onClick={()=>go(item.label)}><i>{item.icon}</i><span>{item.label}<small>{en[item.label]}</small></span>{item.badge&&<em>{item.badge}</em>}</button>)}</div>)}</nav><div className="help-card"><b>需要帮助？ / Need help?</b><span>查看操作说明、产品规则或联系系统支持。</span><button onClick={()=>go('产品与文档')}>打开帮助中心 / Help center →</button></div><div className="user-card"><div>GS</div><span><b>Gunther Sung</b><small>{role} · Ontario, CA</small></span><button onClick={()=>go('系统设置')}>•••</button></div></aside>
    <div className="mobile-overlay" onClick={()=>setMobile(false)}/>
    <main className="main"><header className="topbar"><button className="menu" onClick={()=>setMobile(true)}>☰</button><div className="crumb"><span>{breadcrumb}</span><b>/</b><strong>{active}</strong></div><label className="global-search">⌕<input value={search} onChange={e=>{if(active==='经营总览')go('销售订单');setSearch(e.target.value)}} placeholder="搜索订单、客户、项目、采购单… / Search"/><kbd>⌘ K</kbd></label><div className="top-actions"><select value={role} onChange={e=>{setRole(e.target.value);setToast(`已切换权限视图：${e.target.value}`)}} aria-label="角色权限预览"><option>公司管理员 / Owner</option><option>销售人员 / Sales</option><option>测量人员 / Measure</option><option>安装人员 / Installer</option><option>财务人员 / Finance</option><option>客户账户 / Client</option></select><button aria-label="通知" onClick={()=>go('待办与提醒')}>♢<em>3</em></button><div className="avatar" onClick={()=>go('系统设置')}>GS</div></div></header><div className="content">{active==='经营总览'?<Overview onOpen={setDrawer} go={go} onNew={()=>setNewOpen(true)}/>:<ModulePage name={active} onOpen={setDrawer} onNew={()=>setNewOpen(true)} search={search} setSearch={setSearch}/>}<footer><span>© 2026 Braun International, LLC</span><span>隐私政策 Privacy · 使用条款 Terms · 技术支持 Support</span></footer></div></main>{drawer&&<DetailDrawer id={drawer} close={()=>setDrawer(null)}/>} {newOpen&&<NewRecordModal module={active} close={()=>setNewOpen(false)} save={saveRecord}/>} {toast&&<div className="toast">✓ {toast}</div>}</div>;
}

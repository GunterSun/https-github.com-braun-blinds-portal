"use client";

import { type ChangeEvent, useEffect, useMemo, useState } from "react";

type SheetCell = string | number | boolean | null;
type XlsxApi = { read:(data:ArrayBuffer)=>{SheetNames:string[];Sheets:Record<string,unknown>}; utils:{sheet_to_json:(sheet:unknown,options:{header:number;defval:null;raw?:boolean})=>SheetCell[][]} };
declare global { interface Window { XLSX?:XlsxApi } }

type NavItem = { label: string; icon: string; badge?: number };
type NavGroup = { title: string; items: NavItem[] };
type ModuleRow = {id:string;client:string;product:string;owner:string;value:string;status:string;tone:string;date:string;manual?:boolean};

const en: Record<string,string> = {
  "工作台":"Workspace","经营总览":"Overview","待办与提醒":"Tasks & Alerts","客户与销售":"Sales & CRM","客户与订单":"Customers & Orders","销售线索":"Leads","客户管理":"Customers","项目管理":"Projects","上门测量":"Measurements","报价管理":"Quotes","销售订单":"Sales Orders","售后服务":"Aftercare","数据中心":"Data Center","现场运营中心":"Field Operations","采购财务中心":"Purchasing & Finance","真实经营分析":"Business Analytics",
  "现场与运营":"Field & Operations","团队日历":"Calendar","安装工单":"Work Orders","生产进度":"Production","采购入库":"Receiving","照片资料":"Photos","采购与财务":"Purchasing & Finance","采购订单":"Purchase Orders","供应商管理":"Vendors","供应商账单":"Vendor Bills","应收账款":"Receivables","收付款":"Payments","分析与管理":"Insights & Admin","经营报表":"Reports","利润分析":"Profitability","产品与文档":"Resources","系统设置":"Settings"
};

const nav: NavGroup[] = [
  { title: "工作台", items: [
    { label: "经营总览", icon: "⌂" }, { label: "待办与提醒", icon: "◌", badge: 8 },
  ]},
  { title: "客户与销售", items: [
    { label: "客户与订单", icon: "▣" }, { label: "项目管理", icon: "▤" },
    { label: "上门测量", icon: "⌁" }, { label: "报价管理", icon: "□" }, { label: "售后服务", icon: "✦" },
  ]},
  { title: "现场与运营", items: [
    { label: "现场运营中心", icon: "▦" },
  ]},
  { title: "采购与财务", items: [
    { label: "采购财务中心", icon: "▧" },
  ]},
  { title: "分析与管理", items: [
    { label: "真实经营分析", icon: "↗" }, { label: "数据中心", icon: "↙" }, { label: "产品与文档", icon: "⌘" }, { label: "系统设置", icon: "⚙" },
  ]},
];

const orders:ModuleRow[] = [];

const kpis = [
  { label: "本月销售额", value: "$84,620", delta: "较上月 +12.4%", icon: "↗", trend: [12,20,16,31,28,45,39,58] },
  { label: "进行中销售订单", value: "24", delta: "其中6项需处理", icon: "▣", trend: [24,22,30,27,36,33,41,45] },
  { label: "本周现场任务", value: "18", delta: "团队产能已使用82%", icon: "✓", trend: [18,22,21,31,26,36,42,38] },
  { label: "应收账款", value: "$31,480", delta: "逾期金额 $4,950", icon: "$", trend: [46,39,44,37,34,31,28,24] },
];

const pages: Record<string, { title: string; kicker: string }> = {
  客户与订单: { title: "客户与订单", kicker: "从 jin 汇总文件查看真实经销商、项目代号、产品、数量、结算金额和汇款状态。" },
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
  数据中心: { title: "数据中心", kicker: "读取真实 Excel 文件，并将批发销售、订单、结算和汇款记录用于网站。" },
  系统设置: { title: "系统设置", kicker: "设置公司资料、员工权限、编号规则、支付方式和通知。" },
  待办与提醒: { title: "待办与提醒", kicker: "集中处理逾期回访、待收款、到货异常和安装确认。" },
  现场运营中心: { title: "现场运营中心", kicker: "按测量、生产、到货、安装和照片管理真实现场任务。" },
  采购财务中心: { title: "采购财务中心", kicker: "按照 jin 汇总文件核对CWF采购订单、结算金额、到账金额和汇款状态。" },
  真实经营分析: { title: "真实经营分析", kicker: "仅使用Excel真实字段分析订单、数量、客户、产品和汇款状态。" },
};

const moduleRows: Record<string, ModuleRow[]> = {
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
    {id:"MS-2026-0114",client:"峡谷住宅项目",product:"14个窗位 · 整墙及逐窗照片完整",owner:"陈美雅",value:"14/14窗",status:"已完成",tone:"green",date:"7月15日"},
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
  ],
  生产进度:[
    {id:"SO-2026-1048",client:"山景别墅项目",product:"电动卷帘12件 · 供应商已确认生产",owner:"金诺亚",value:"完成 7/12",status:"生产中",tone:"blue",date:"预计7月25日"},
    {id:"SO-2026-1039",client:"峡谷住宅项目",product:"斑马帘14件 · 等待装箱照片",owner:"陈美雅",value:"完成 14/14",status:"待发货",tone:"amber",date:"7月20日"}
  ],
  照片资料:[
    {id:"PH-SO-1048",client:"山景别墅项目",product:"测量照片36张 · 墙面6张 · 电源位置8张",owner:"陈美雅",value:"50张",status:"资料完整",tone:"green",date:"7月19日更新"},
    {id:"PH-SO-1042",client:"银湖设计工作室",product:"安装前18张 · 完工照片待上传",owner:"安装二组",value:"18张",status:"缺完工照片",tone:"amber",date:"今天到期"}
  ],
  供应商管理:[
    {id:"VN-0012",client:"Jin Park / CWF",product:"罗马帘加工 · 一级批发价 · 支持外销",owner:"采购",value:"平均21天",status:"合作中",tone:"green",date:"7月18日更新"},
    {id:"VN-0007",client:"Somfy",product:"电机、遥控器、Hub及智能控制",owner:"采购",value:"Net 30",status:"合作中",tone:"green",date:"7月12日更新"}
  ],
  供应商账单:[
    {id:"BILL-2026-0184",client:"Jin Park / CWF",product:"关联 PO-2026-0726 · SO-2026-1048",owner:"财务",value:"$8,940",status:"待审核",tone:"amber",date:"7月20日前"},
    {id:"BILL-2026-0179",client:"Fabricut",product:"关联 PO-2026-0719 · 面料采购",owner:"财务",value:"$3,260",status:"已付款",tone:"green",date:"7月16日"}
  ],
  收付款:[
    {id:"PAY-2026-0316",client:"山景别墅项目",product:"SO-2026-1048 · 客户定金 · Zelle",owner:"财务",value:"+$9,210",status:"已到账",tone:"green",date:"7月3日"},
    {id:"PAY-2026-0328",client:"Jin Park / CWF",product:"BILL-2026-0184 · 供应商付款",owner:"财务",value:"-$4,470",status:"待批准",tone:"amber",date:"7月20日"}
  ],
  产品与文档:[
    {id:"DOC-MEASURE-01",client:"窗帘测量标准",product:"整墙、窗位、口深、IB/OB及照片要求",owner:"管理员",value:"版本 3.0",status:"已发布",tone:"green",date:"7月19日"},
    {id:"DOC-ROMAN-02",client:"罗马帘加工说明",product:"款式、拉绳、里布、帘头、分档及加工图",owner:"生产",value:"版本 2.4",status:"已发布",tone:"green",date:"7月18日"}
  ]
};

function Spark({ values }: { values: number[] }) {
  const points = values.map((v, i) => `${i * 18},${56 - v}`).join(" ");
  return <svg className="spark" viewBox="0 0 126 58" aria-hidden="true"><polyline points={points} /></svg>;
}

function Status({ children, tone = "blue" }: { children: React.ReactNode; tone?: string }) {
  return <span className={`status ${tone}`}><i />{children}</span>;
}

function useRealWorkbookData(){
  const [data,setData]=useState<RealWorkbookData>(()=>{if(typeof window==='undefined')return {commerce:[],wholesale:[],sources:[],updated:""};try{return JSON.parse(localStorage.getItem('braun-real-workbooks-v2')||'')||{commerce:[],wholesale:[],sources:[],updated:""}}catch{return {commerce:[],wholesale:[],sources:[],updated:""}}});
  const [loading,setLoading]=useState(!data.sources.length);
  useEffect(()=>{if(data.sources.length)return;const run=async()=>{try{const xlsx=await loadXlsxApi();const files=await Promise.all([['jin汇总.xlsx','/data/jin汇总.xlsx'],['批发销售.xlsx','/data/批发销售.xlsx']].map(async([name,url])=>({name,buffer:await (await fetch(url)).arrayBuffer()})));const parsed=files.map(file=>{const book=xlsx.read(file.buffer);return parseWorkbook(xlsx.utils.sheet_to_json(book.Sheets[book.SheetNames[0]],{header:1,defval:null,raw:true}),file.name)});setData({commerce:parsed.flatMap(x=>x.commerce),wholesale:parsed.flatMap(x=>x.wholesale),sources:parsed.map(x=>x.source),updated:new Date().toLocaleString('zh-CN')})}finally{setLoading(false)}};void run()},[]); // eslint-disable-line react-hooks/exhaustive-deps
  return {data,loading};
}

function realRowsFor(name:string,data:RealWorkbookData):ModuleRow[]{
  const orderRows=data.commerce.map((r,i)=>({id:r.po||`CWF-${i+1}`,client:r.dealer,product:`${r.sidemark} · ${r.product}`,owner:"Excel导入",value:`$${r.settlement.toLocaleString(undefined,{minimumFractionDigits:2})}`,status:r.remittance,tone:r.remittance.includes('已汇款')?'green':'amber',date:"Excel记录"}));
  if(["销售订单","项目管理","采购订单","供应商账单","收付款"].includes(name))return orderRows;
  if(name==="客户管理")return Array.from(new Set(data.commerce.map(r=>r.dealer).filter(x=>x&&x!=="未填写"))).map((dealer,i)=>{const rows=data.commerce.filter(r=>r.dealer===dealer);return{id:`CUSTOMER-${String(i+1).padStart(3,'0')}`,client:dealer,product:`${rows.length}笔订单 · ${rows.reduce((s,r)=>s+r.qty,0)}件`,owner:"Excel导入",value:`$${rows.reduce((s,r)=>s+r.settlement,0).toLocaleString(undefined,{minimumFractionDigits:2})}`,status:"真实客户",tone:"green",date:"Excel记录"}});
  if(name==="供应商管理")return data.commerce.length?[{id:"SUPPLIER-CWF",client:"Commerce Window Fashions (CWF)",product:`已关联 ${data.commerce.length} 笔真实订单`,owner:"采购",value:`$${data.commerce.reduce((s,r)=>s+r.settlement,0).toLocaleString(undefined,{minimumFractionDigits:2})}`,status:"真实数据来源",tone:"green",date:data.updated||"Excel记录"}]:[];
  if(name==="经营报表")return orderRows;
  if(name==="利润分析")return [];
  return [];
}

function RealOverview({go}:{go:(name:string)=>void}){
  const {data,loading}=useRealWorkbookData(),total=data.commerce.reduce((s,r)=>s+r.settlement,0),paid=data.commerce.filter(r=>r.remittance.includes('已汇款')).length,dealers=new Set(data.commerce.map(r=>r.dealer).filter(x=>x&&x!=="未填写")).size;
  const cards=[['真实订单',String(data.commerce.length),'来自 jin汇总(1).xlsx'],['结算金额',`$${total.toLocaleString(undefined,{minimumFractionDigits:2})}`,'Excel结算金额合计'],['已汇款',String(paid),`${Math.max(0,data.commerce.length-paid)}笔未标记`],['真实客户',String(dealers),'按Dealer名称去重']];
  return <><section className="hero-card"><div><span className="eyebrow">REAL DATA WORKSPACE / 真实数据工作台</span><h1>Braun Blinds 业务中心</h1><p>只显示真实 Excel 与您手工建立的记录；演示订单已删除。</p></div><div className="hero-actions"><button className="secondary" onClick={()=>go('数据中心')}>更新Excel数据</button><button className="primary" onClick={()=>go('上门测量')}>现场测量</button></div><div className="fabric-orb one"/><div className="fabric-orb two"/></section><section className="kpi-grid">{cards.map(x=><article className="kpi" key={x[0]}><span>{x[0]}</span><strong>{loading?'…':x[1]}</strong><small>{x[2]}</small></article>)}</section><section className="panel real-home"><div className="panel-head"><div><span className="eyebrow">BUSINESS AREAS</span><h2>业务模块状态</h2></div></div><div className="area-grid">{[['客户与销售','客户与订单',`${data.commerce.length}笔真实订单`],['现场与运营','现场运营中心','等待录入现场记录'],['采购与财务','采购财务中心',`${data.commerce.length}笔CWF记录`],['分析与管理','真实经营分析','基于真实Excel统计']].map(x=><button key={x[0]} onClick={()=>go(x[1])}><b>{x[0]}</b><span>{x[2]}</span><em>打开 →</em></button>)}</div></section></>;
}

function Overview({ go }: { onOpen: (id: string) => void; go:(name:string)=>void; onNew:()=>void }) { return <RealOverview go={go}/> }

function LegacyOverview({ onOpen, go }: { onOpen: (id: string) => void; go:(name:string)=>void; onNew:()=>void }) {
  return <>
    <section className="hero-card">
      <div><span className="eyebrow">2026年7月19日 · 星期日</span><h1>您好，Gunther。</h1><p>这里汇总今天的收款、采购、生产、测量、安装和售后事项。</p></div>
      <div className="hero-actions"><button className="secondary" onClick={()=>go('团队日历')}>查看日历 / Calendar</button><button className="primary" onClick={()=>go('报价管理')}>打开报价系统 / Quote</button></div>
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

type ServiceTicket={id:string;order:string;customer:string;problem:string;category:string;submitted:string;responded:string;scheduled:string;resolved:string;owner:string;status:"待响应"|"处理中"|"已预约"|"已完成";priority:"紧急"|"普通";notes:string};
const initialTickets:ServiceTicket[]=[];

function AftercarePage(){
  const [tickets,setTickets]=useState<ServiceTicket[]>(()=>{if(typeof window==="undefined")return initialTickets;try{return JSON.parse(localStorage.getItem("braun-aftercare-real-v2")||"")||initialTickets}catch{return initialTickets}}),[filter,setFilter]=useState("全部"),[selected,setSelected]=useState<ServiceTicket|null>(null),[creating,setCreating]=useState(false);
  const [form,setForm]=useState({order:"",customer:"",problem:"",category:"安装调整",owner:"安装一组",scheduled:""});
  useEffect(()=>{localStorage.setItem("braun-aftercare-real-v2",JSON.stringify(tickets))},[tickets]);
  const visible=tickets.filter(t=>filter==="全部"||t.status===filter);
  const advance=(id:string)=>setTickets(all=>all.map(t=>{if(t.id!==id)return t;const next=t.status==="待响应"?"处理中":t.status==="处理中"?"已预约":t.status==="已预约"?"已完成":"已完成";const now=new Date().toLocaleString("zh-CN",{hour12:false});const updated={...t,status:next as ServiceTicket["status"],responded:t.responded==="—"?now:t.responded,resolved:next==="已完成"?now:t.resolved};if(selected?.id===id)setSelected(updated);return updated}));
  const create=(e:React.FormEvent)=>{e.preventDefault();const now=new Date().toLocaleString("zh-CN",{hour12:false});const item:ServiceTicket={id:`AS-2026-${String(tickets.length+39).padStart(4,"0")}`,order:form.order,customer:form.customer,problem:form.problem,category:form.category,submitted:now,responded:"—",scheduled:form.scheduled?form.scheduled.replace("T"," "):"待安排",resolved:"—",owner:form.owner,status:"待响应",priority:"普通",notes:""};setTickets(x=>[item,...x]);setSelected(item);setCreating(false);setForm({order:"",customer:"",problem:"",category:"安装调整",owner:"安装一组",scheduled:""})};
  return <>
    <div className="module-head aftercare-head"><div><span className="eyebrow">BRAUN BLINDS / AFTERCARE</span><h1>售后问题处理台 <small className="en-title">Service Cases</small></h1><p>按订单记录问题、响应时间、预约时间、处理过程和完成结果。</p></div><button className="primary" onClick={()=>setCreating(true)}>＋ 新增售后问题</button></div>
    <section className="aftercare-kpis"><div><span>待响应</span><b>{tickets.filter(t=>t.status==="待响应").length}</b><small>目标：30分钟内</small></div><div><span>处理中</span><b>{tickets.filter(t=>t.status==="处理中").length}</b><small>等待方案或补件</small></div><div><span>已预约</span><b>{tickets.filter(t=>t.status==="已预约").length}</b><small>已安排上门时间</small></div><div><span>本月已完成</span><b>{tickets.filter(t=>t.status==="已完成").length}</b><small>保留完整处理记录</small></div></section>
    <div className="aftercare-toolbar"><label>状态筛选<select value={filter} onChange={e=>setFilter(e.target.value)}>{["全部","待响应","处理中","已预约","已完成"].map(x=><option key={x}>{x}</option>)}</select></label><span>共 {visible.length} 个问题 / Cases</span></div>
    <div className="aftercare-layout"><section className="panel case-list">{visible.map(t=><button key={t.id} className={selected?.id===t.id?"selected":""} onClick={()=>setSelected(t)}><div className="case-top"><b>{t.id}</b><Status tone={t.status==="已完成"?"green":t.priority==="紧急"?"red":t.status==="已预约"?"blue":"amber"}>{t.status}</Status></div><h3>{t.problem}</h3><p>{t.order} · {t.customer}</p><div className="case-times"><span>提交 <b>{t.submitted}</b></span><span>处理/预约 <b>{t.scheduled}</b></span></div></button>)}</section>
      <aside className="panel case-detail">{selected?<><div className="case-detail-head"><div><span className="eyebrow">CASE DETAIL / 问题详情</span><h2>{selected.id}</h2></div><Status tone={selected.status==="已完成"?"green":selected.priority==="紧急"?"red":"blue"}>{selected.status}</Status></div><h3 className="problem-title">{selected.problem}</h3><div className="case-meta"><div><span>关联订单</span><b>{selected.order}</b></div><div><span>客户/项目</span><b>{selected.customer}</b></div><div><span>问题分类</span><b>{selected.category}</b></div><div><span>负责人</span><b>{selected.owner}</b></div></div><h3>时间记录 / Timeline</h3><div className="service-times"><div><i/><span><b>客户提交问题</b><small>{selected.submitted}</small></span></div><div><i/><span><b>首次响应时间</b><small>{selected.responded}</small></span></div><div><i/><span><b>预约处理时间</b><small>{selected.scheduled}</small></span></div><div><i/><span><b>完成处理时间</b><small>{selected.resolved}</small></span></div></div><h3>处理说明 / Notes</h3><textarea value={selected.notes} onChange={e=>{const notes=e.target.value;setSelected({...selected,notes});setTickets(all=>all.map(t=>t.id===selected.id?{...t,notes}:t))}}/><div className="case-actions"><button className="secondary" onClick={()=>{const scheduled="明天 10:00（待客户确认）";setSelected({...selected,scheduled,status:"已预约"});setTickets(all=>all.map(t=>t.id===selected.id?{...t,scheduled,status:"已预约"}:t))}}>安排上门</button><button className="primary" disabled={selected.status==="已完成"} onClick={()=>advance(selected.id)}>{selected.status==="待响应"?"确认响应":selected.status==="处理中"?"标记已预约":selected.status==="已预约"?"完成处理":"已完成 ✓"}</button></div></>:<div className="empty-search">请选择一个售后问题</div>}</aside>
    </div>
    {creating&&<div className="drawer-wrap modal-wrap" onClick={()=>setCreating(false)}><form className="new-modal service-modal" onClick={e=>e.stopPropagation()} onSubmit={create}><button type="button" className="drawer-close" onClick={()=>setCreating(false)}>×</button><span className="eyebrow">NEW SERVICE CASE</span><h2>新增售后问题</h2><div className="form-grid"><label>订单号 / Order #<input required value={form.order} onChange={e=>setForm({...form,order:e.target.value})} placeholder="SO-2026-"/></label><label>客户或项目 / Customer<input required value={form.customer} onChange={e=>setForm({...form,customer:e.target.value})}/></label><label>问题分类 / Category<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}><option>安装调整</option><option>运行异响</option><option>损坏/补件</option><option>电机/遥控器</option><option>尺寸问题</option><option>客户投诉</option></select></label><label>负责人 / Owner<select value={form.owner} onChange={e=>setForm({...form,owner:e.target.value})}><option>安装一组</option><option>安装二组</option><option>金诺亚</option><option>陈美雅</option></select></label><label>计划处理时间 / Scheduled<input type="datetime-local" value={form.scheduled} onChange={e=>setForm({...form,scheduled:e.target.value})}/></label><label className="full">问题说明 / Problem<textarea required value={form.problem} onChange={e=>setForm({...form,problem:e.target.value})} placeholder="说明哪个房间、哪扇窗、发生什么问题，以及客户要求。"/></label></div><div className="modal-actions"><button type="button" className="secondary" onClick={()=>setCreating(false)}>取消</button><button className="primary">建立售后问题</button></div></form></div>}
  </>;
}

type WorkTask={id:string;type:"收款"|"采购"|"测量"|"安装"|"生产"|"售后";order:string;customer:string;title:string;detail:string;owner:string;created:string;due:string;priority:"紧急"|"普通";status:"待处理"|"处理中"|"已完成"};
const initialTasks:WorkTask[]=[];

function TasksPage(){
 const [tasks,setTasks]=useState<WorkTask[]>(()=>{if(typeof window==="undefined")return initialTasks;try{return JSON.parse(localStorage.getItem("braun-work-tasks-real-v2")||"")||initialTasks}catch{return initialTasks}}),[filter,setFilter]=useState("未完成"),[selected,setSelected]=useState<WorkTask|null>(null);
 useEffect(()=>localStorage.setItem("braun-work-tasks-real-v2",JSON.stringify(tasks)),[tasks]);
 const visible=tasks.filter(t=>filter==="全部"||(filter==="未完成"?t.status!=="已完成":t.type===filter));
 const update=(id:string,patch:Partial<WorkTask>)=>{setTasks(all=>all.map(t=>t.id===id?{...t,...patch}:t));if(selected?.id===id)setSelected({...selected,...patch})};
 const counts={urgent:tasks.filter(t=>t.priority==="紧急"&&t.status!=="已完成").length,today:tasks.filter(t=>t.due.includes("今天")&&t.status!=="已完成").length,active:
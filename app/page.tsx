"use client";

import { type ChangeEvent, useEffect, useMemo, useState } from "react";

type SheetCell = string | number | boolean | null;
type XlsxApi = { read:(data:ArrayBuffer)=>{SheetNames:string[];Sheets:Record<string,unknown>}; utils:{sheet_to_json:(sheet:unknown,options:{header:number;defval:null;raw?:boolean})=>SheetCell[][]} };
declare global { interface Window { XLSX?:XlsxApi } }

type NavItem = { label: string; icon: string; badge?: number };
type NavGroup = { title: string; items: NavItem[] };

const en: Record<string,string> = {
  "工作台":"Workspace","经营总览":"Overview","待办与提醒":"Tasks & Alerts","客户与销售":"Sales & CRM","销售线索":"Leads","客户管理":"Customers","项目管理":"Projects","上门测量":"Measurements","报价管理":"Quotes","销售订单":"Sales Orders","售后服务":"Aftercare","数据中心":"Data Center",
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
    { label: "经营报表", icon: "↗" }, { label: "利润分析", icon: "%" }, { label: "数据中心", icon: "↙" }, { label: "产品与文档", icon: "⌘" }, { label: "系统设置", icon: "⚙" },
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
  数据中心: { title: "数据中心", kicker: "读取真实 Excel 文件，并将批发销售、订单、结算和汇款记录用于网站。" },
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

function Overview({ onOpen, go, onNew }: { onOpen: (id: string) => void; go:(name:string)=>void; onNew:()=>void }) {
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
const initialTickets:ServiceTicket[]=[
  {id:"AS-2026-0038",order:"SO-2026-1042",customer:"银湖设计工作室",problem:"客厅右侧蛇形帘运行时有异响，客户要求检查轨道。",category:"运行异响",submitted:"2026-07-19 09:12",responded:"2026-07-19 09:28",scheduled:"2026-07-20 11:30",resolved:"—",owner:"安装二组",status:"已预约",priority:"紧急",notes:"客户上午在家；携带轨道连接件和备用滑轮。"},
  {id:"AS-2026-0037",order:"SO-2026-1039",customer:"峡谷住宅项目",problem:"主卧斑马帘左侧下垂约1/2英寸，需要重新调平。",category:"安装调整",submitted:"2026-07-18 15:40",responded:"2026-07-18 16:05",scheduled:"2026-07-21 14:00",resolved:"—",owner:"安装一组",status:"处理中",priority:"普通",notes:"先电话确认窗号，再安排上门。"},
  {id:"AS-2026-0034",order:"SO-2026-1033",customer:"安大略办公室",problem:"两片垂直百叶在运输中损坏，已向供应商申请补件。",category:"损坏/补件",submitted:"2026-07-16 10:20",responded:"2026-07-16 10:34",scheduled:"2026-07-18 08:30",resolved:"2026-07-18 10:15",owner:"金诺亚",status:"已完成",priority:"普通",notes:"补件已更换，客户现场确认完成。"}
];

function AftercarePage(){
  const [tickets,setTickets]=useState<ServiceTicket[]>(()=>{if(typeof window==="undefined")return initialTickets;try{return JSON.parse(localStorage.getItem("braun-aftercare-tickets")||"")||initialTickets}catch{return initialTickets}}),[filter,setFilter]=useState("全部"),[selected,setSelected]=useState<ServiceTicket|null>(initialTickets[0]),[creating,setCreating]=useState(false);
  const [form,setForm]=useState({order:"",customer:"",problem:"",category:"安装调整",owner:"安装一组",scheduled:""});
  useEffect(()=>{localStorage.setItem("braun-aftercare-tickets",JSON.stringify(tickets))},[tickets]);
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
const initialTasks:WorkTask[]=[
 {id:"TK-2026-0128",type:"收款",order:"SO-2026-1033",customer:"安大略办公室",title:"定金已逾期5天",detail:"订单定金 $4,950 尚未到账；确认付款方式并记录跟进结果。",owner:"财务",created:"7月14日 09:00",due:"今天 10:00",priority:"紧急",status:"待处理"},
 {id:"TK-2026-0127",type:"采购",order:"SO-2026-1048",customer:"山景别墅项目",title:"供应商交期需要重新确认",detail:"12套电动卷帘原预计7月22日到货，供应商尚未上传装箱照片。",owner:"金诺亚",created:"7月18日 16:20",due:"今天 12:00",priority:"紧急",status:"处理中"},
 {id:"TK-2026-0126",type:"测量",order:"PRJ-2026-0041",customer:"Park Residence",title:"上门测量前确认客户在家",detail:"预约主卧和客厅6个窗位；需确认地址、停车位置和电机电源。",owner:"陈美雅",created:"7月18日 14:10",due:"今天 13:30",priority:"普通",status:"待处理"},
 {id:"TK-2026-0125",type:"安装",order:"SO-2026-1042",customer:"银湖设计工作室",title:"安装工单等待客户确认",detail:"7月22日11:30安装，需确认欠款、详细地址和现场联系人。",owner:"安装二组",created:"7月18日 11:35",due:"今天 15:00",priority:"普通",status:"待处理"},
 {id:"TK-2026-0124",type:"生产",order:"SO-2026-1039",customer:"峡谷住宅项目",title:"检查14件斑马帘装箱数量",detail:"生产已完成，发货前核对窗号、尺寸、颜色和箱唛。",owner:"仓库",created:"7月18日 10:00",due:"7月20日 09:00",priority:"普通",status:"处理中"},
 {id:"TK-2026-0123",type:"售后",order:"SO-2026-1042",customer:"银湖设计工作室",title:"轨道异响售后已预约",detail:"携带备用滑轮和连接件；处理后上传照片并填写完成时间。",owner:"安装二组",created:"7月19日 09:28",due:"7月20日 11:30",priority:"紧急",status:"处理中"},
 {id:"TK-2026-0122",type:"收款",order:"SO-2026-1048",customer:"山景别墅项目",title:"安装前收取50%尾款",detail:"待收 $9,210；安装排期前确认到账。",owner:"财务",created:"7月17日 15:00",due:"7月26日 17:00",priority:"普通",status:"待处理"},
 {id:"TK-2026-0121",type:"安装",order:"SO-2026-1033",customer:"安大略办公室",title:"补充安装工单现场说明",detail:"28个窗位，需两人安装；复制详细地址、欠款和联系人给安装工。",owner:"金诺亚",created:"7月17日 13:15",due:"7月21日 12:00",priority:"普通",status:"待处理"}
];

function TasksPage(){
 const [tasks,setTasks]=useState<WorkTask[]>(()=>{if(typeof window==="undefined")return initialTasks;try{return JSON.parse(localStorage.getItem("braun-work-tasks")||"")||initialTasks}catch{return initialTasks}}),[filter,setFilter]=useState("未完成"),[selected,setSelected]=useState<WorkTask|null>(initialTasks[0]);
 useEffect(()=>localStorage.setItem("braun-work-tasks",JSON.stringify(tasks)),[tasks]);
 const visible=tasks.filter(t=>filter==="全部"||(filter==="未完成"?t.status!=="已完成":t.type===filter));
 const update=(id:string,patch:Partial<WorkTask>)=>{setTasks(all=>all.map(t=>t.id===id?{...t,...patch}:t));if(selected?.id===id)setSelected({...selected,...patch})};
 const counts={urgent:tasks.filter(t=>t.priority==="紧急"&&t.status!=="已完成").length,today:tasks.filter(t=>t.due.includes("今天")&&t.status!=="已完成").length,active:tasks.filter(t=>t.status==="处理中").length,done:tasks.filter(t=>t.status==="已完成").length};
 return <><div className="module-head tasks-head"><div><span className="eyebrow">WORK QUEUE / TASKS & ALERTS</span><h1>待办与提醒 <small className="en-title">Tasks & Alerts</small></h1><p>由收款、采购、测量、生产、安装和售后业务产生；每项均关联订单号和截止时间。</p></div></div>
  <section className="task-kpis"><div><span>紧急事项</span><b>{counts.urgent}</b><small>优先处理</small></div><div><span>今天到期</span><b>{counts.today}</b><small>含逾期任务</small></div><div><span>处理中</span><b>{counts.active}</b><small>已有人负责</small></div><div><span>已完成</span><b>{counts.done}</b><small>本设备记录</small></div></section>
  <div className="task-filters">{["未完成","全部","收款","采购","测量","安装","生产","售后"].map(x=><button className={filter===x?"active":""} key={x} onClick={()=>setFilter(x)}>{x}</button>)}</div>
  <div className="tasks-layout"><section className="panel task-list">{visible.map(t=><button key={t.id} className={`${selected?.id===t.id?"selected":""} ${t.status==="已完成"?"completed":""}`} onClick={()=>setSelected(t)}><span className={`task-type ${t.type}`}>{t.type}</span><div><div className="task-title"><b>{t.title}</b>{t.priority==="紧急"&&<em>紧急</em>}</div><p>{t.order} · {t.customer}</p><small>负责人：{t.owner}　截止：<strong>{t.due}</strong></small></div><Status tone={t.status==="已完成"?"green":t.status==="处理中"?"blue":"amber"}>{t.status}</Status></button>)}{!visible.length&&<div className="empty-search">当前筛选没有待办事项</div>}</section>
   <aside className="panel task-detail">{selected?<><span className={`task-type ${selected.type}`}>{selected.type}</span><h2>{selected.title}</h2><p className="task-description">{selected.detail}</p><div className="task-info"><div><span>关联订单</span><b>{selected.order}</b></div><div><span>客户/项目</span><b>{selected.customer}</b></div><div><span>负责人</span><b>{selected.owner}</b></div><div><span>建立时间</span><b>{selected.created}</b></div><div><span>截止时间</span><b>{selected.due}</b></div><div><span>当前状态</span><b>{selected.status}</b></div></div><label className="task-owner">重新分配负责人<select value={selected.owner} onChange={e=>update(selected.id,{owner:e.target.value})}>{["Gunther","陈美雅","金诺亚","财务","仓库","安装一组","安装二组"].map(x=><option key={x}>{x}</option>)}</select></label><div className="task-actions"><button className="secondary" onClick={()=>update(selected.id,{due:"明天 10:00"})}>延至明天</button><button className="secondary" onClick={()=>update(selected.id,{status:"处理中"})}>开始处理</button><button className="primary" disabled={selected.status==="已完成"} onClick={()=>update(selected.id,{status:"已完成"})}>标记完成 ✓</button></div></>:<div className="empty-search">请选择一项待办</div>}</aside>
  </div></>;
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
  if(name==="售后服务") return <AftercarePage/>;
  if(name==="待办与提醒") return <TasksPage/>;
  if(name==="数据中心") return <DataCenterPage/>;
  if(name==="系统设置") return <SettingsPage/>;
  return <>
    <div className="module-head"><div><span className="eyebrow">BRAUN BLINDS / {en[name]}</span><h1>{meta.title}<small className="en-title">{en[name]}</small></h1><p>{meta.kicker}</p></div><div><button className="secondary" onClick={exportCsv}>导出 / Export</button><button className="primary" onClick={onNew}>＋ 新建 / New</button></div></div>
    <div className="toolbar"><label>⌕ <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={`搜索${name} / Search ${en[name]}...`} /></label><select value={status} onChange={e=>setStatus(e.target.value)}><option value="all">全部状态 / All</option><option value="attention">需要处理 / Attention</option><option value="active">正常进行 / Active</option></select><button onClick={()=>setSearch('SO-')}>仅销售订单 / Sales</button><button onClick={()=>setCompact(v=>!v)}>{compact?'展开字段 / Expand':'精简字段 / Compact'}</button></div>
    {isCalendar ? <CalendarView/> : isReport ? <ReportView name={name}/> : <ListView name={name} onOpen={onOpen} search={search} status={status} compact={compact}/>} 
  </>;
}

function ListView({ name, onOpen, search, status, compact }: { name: string; onOpen: (id: string) => void; search:string;status:string;compact:boolean }) {
  const rows = (moduleRows[name] || orders).filter(o=>`${o.id}${o.client}${o.product}${o.owner}${o.status}`.toLowerCase().includes(search.toLowerCase())).filter(o=>status==='all'||(status==='attention'?['red','amber'].includes(o.tone):!['red','amber'].includes(o.tone)));
  return <div className={`panel module-panel ${compact?'compact-table':''}`}><div className="summary-row"><div><span>当前记录 / Records</span><b>{rows.length}</b></div><div><span>需要处理 / Attention</span><b>{rows.filter(x=>['red','amber'].includes(x.tone)).length}</b></div><div><span>正常进行 / Active</span><b>{rows.filter(x=>!['red','amber'].includes(x.tone)).length}</b></div><div><span>最近节点 / Latest</span><b className="summary-date">{rows[0]?.date||"—"}</b></div></div><div className="table-wrap"><table><thead><tr><th>业务编号 / Ref.</th><th>客户或公司 / Client</th><th className="optional-col">产品或事项 / Description</th><th className="optional-col">负责人 / Owner</th><th>金额/数量 / Value</th><th>状态 / Status</th><th>下一节点 / Next</th></tr></thead><tbody>{rows.map((o,i)=><tr key={`${o.id}${i}`} onClick={()=>onOpen(o.id)}><td><b>{o.id}</b></td><td><strong>{o.client}</strong></td><td className="optional-col">{o.product}</td><td className="optional-col">{o.owner}</td><td>{o.value}</td><td><Status tone={o.tone}>{o.status}</Status></td><td>{o.date}</td></tr>)}</tbody></table>{!rows.length&&<div className="empty-search">该模块还没有记录，请使用“新建”添加。 / No records yet.</div>}</div></div>;
}

function CalendarView(){ const [month,setMonth]=useState(7);const [selected,setSelected]=useState<number|null>(null);const days=Array.from({length:35},(_,i)=>i<3?29+i:i-2); return <div className="panel calendar"><div className="calendar-head"><button onClick={()=>setMonth(m=>m===1?12:m-1)}>←</button><h2>2026年{month}月 <small>/ {['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][month]}</small></h2><button onClick={()=>setMonth(m=>m===12?1:m+1)}>→</button><span/><Status tone="blue">上门测量</Status><Status tone="green">安装施工</Status><Status tone="amber">方案咨询</Status></div><div className="weekdays">{['周日','周一','周二','周三','周四','周五','周六'].map(d=><b key={d}>{d}</b>)}</div><div className="days">{days.map((d,i)=><button key={i} className={`${i<3?'muted':''} ${selected===i?'selected-day':''}`} onClick={()=>setSelected(i)}><span>{d}</span>{month===7&&i===9&&<em className="event blue">9:00 · 测量</em>}{month===7&&i===11&&<em className="event amber">14:00 · 咨询</em>}{month===7&&i===17&&<em className="event green">11:30 · 安装</em>}{month===7&&i===24&&<em className="event green">8:30 · 安装</em>}</button>)}</div>{selected!==null&&<div className="calendar-selection">已选择 {month}月{days[selected]}日 / Selected date　<button onClick={()=>setSelected(null)}>清除 / Clear</button></div>}</div> }

function ReportView({name}:{name:string}){ return <><section className="kpi-grid report-kpis">{kpis.map((k,i)=><article className="kpi" key={k.label}><div className="kpi-top"><span>{name==='应收账款'&&i===0?'应收余额合计':k.label}</span></div><strong>{k.value}</strong><small>{k.delta}</small></article>)}</section><div className="report-grid"><article className="panel chart-card"><div className="panel-head"><div><span className="eyebrow">近12个月趋势</span><h2>{name}概览</h2></div></div><div className="bars">{[32,48,42,58,68,62,78,72,88,77,92,84].map((v,i)=><div key={i}><i style={{height:`${v}%`}}/><small>{['8月','9月','10月','11月','12月','1月','2月','3月','4月','5月','6月','7月'][i]}</small></div>)}</div></article><article className="panel mix"><span className="eyebrow">产品构成</span><h2>销售产品占比</h2>{[['卷帘 / 阳光面料','36%'],['窗帘 / 轨道','24%'],['百叶 / 垂直帘','19%'],['木百叶 / 百叶窗','12%'],['罗马帘及其他','9%']].map(x=><div key={x[0]}><span>{x[0]}</span><b>{x[1]}</b></div>)}</article></div></> }

type CommerceRow={po:string;dealer:string;sidemark:string;product:string;qty:number;settlement:number;received:number;remittance:string;difference:string};
type WholesaleRow={seller:string;date:string;reference:string;amount:number};
type RealWorkbookData={commerce:CommerceRow[];wholesale:WholesaleRow[];sources:string[];updated:string};
const emptyWorkbookData:RealWorkbookData={commerce:[],wholesale:[],sources:[],updated:""};

function loadXlsxApi(){return new Promise<XlsxApi>((resolve,reject)=>{if(window.XLSX)return resolve(window.XLSX);const existing=document.querySelector('script[data-braun-xlsx]') as HTMLScriptElement|null;if(existing){existing.addEventListener('load',()=>window.XLSX?resolve(window.XLSX):reject(new Error('Excel reader unavailable')));return}const script=document.createElement('script');script.src='/complete/xlsx.full.min.js';script.dataset.braunXlsx='true';script.onload=()=>window.XLSX?resolve(window.XLSX):reject(new Error('Excel reader unavailable'));script.onerror=()=>reject(new Error('Excel reader failed to load'));document.head.appendChild(script)})}
const cell=(v:SheetCell)=>v===null||v===undefined?'':String(v).trim();
const money=(v:SheetCell)=>{const n=Number(String(v??'').replace(/[$,]/g,''));return Number.isFinite(n)?n:0};
function parseWorkbook(rows:SheetCell[][],source:string){
  if(rows.some(r=>r.some(v=>cell(v).includes('客户名字 (Dealer)')))){
    const header=rows.findIndex(r=>r.some(v=>cell(v).includes('客户名字 (Dealer)')));
    const commerce=rows.slice(header+1).filter(r=>cell(r[1]).toUpperCase().startsWith('CWF')).map(r=>({po:cell(r[1]).replace(/^CWF\s*/i,'CWF '),dealer:cell(r[5])||'未填写',sidemark:cell(r[6])||'未填写',product:cell(r[7])||'未填写',qty:Number(r[8])||0,settlement:money(r[9]),received:money(r[4]),difference:cell(r[10]),remittance:cell(r[11])||'未汇款'}));
    return {commerce,wholesale:[] as WholesaleRow[],source};
  }
  const wholesale=rows.filter(r=>cell(r[0])&&r.some(v=>cell(v))).map(r=>({seller:cell(r[0]),date:cell(r[1]),reference:cell(r[2]),amount:money(r[3])})).filter(r=>r.seller||r.reference);
  return {commerce:[] as CommerceRow[],wholesale,source};
}

function DataCenterPage(){
  const [data,setData]=useState<RealWorkbookData>(()=>{if(typeof window==='undefined')return emptyWorkbookData;try{return JSON.parse(localStorage.getItem('braun-real-workbooks')||'')||emptyWorkbookData}catch{return emptyWorkbookData}}),[tab,setTab]=useState<'commerce'|'wholesale'>('commerce'),[search,setSearch]=useState(''),[busy,setBusy]=useState(()=>typeof window==='undefined'||!localStorage.getItem('braun-real-workbooks')),[error,setError]=useState('');
  const readFiles=async(files:Array<{name:string;buffer:ArrayBuffer}>,persist=true)=>{setBusy(true);setError('');try{const xlsx=await loadXlsxApi();const parsed=files.map(file=>{const book=xlsx.read(file.buffer);const sheet=book.Sheets[book.SheetNames[0]];return parseWorkbook(xlsx.utils.sheet_to_json(sheet,{header:1,defval:null,raw:true}),file.name)});const next:RealWorkbookData={commerce:parsed.flatMap(x=>x.commerce),wholesale:parsed.flatMap(x=>x.wholesale),sources:parsed.map(x=>x.source),updated:new Date().toLocaleString('zh-CN')};setData(next);if(persist)localStorage.setItem('braun-real-workbooks',JSON.stringify(next))}catch{setError('无法读取文件，请确认它是有效的 .xlsx 文件。')}finally{setBusy(false)}};
  const loadBundled=async()=>{const files=await Promise.all([['jin汇总.xlsx','/data/jin汇总.xlsx'],['批发销售.xlsx','/data/批发销售.xlsx']].map(async([name,url])=>({name,buffer:await (await fetch(url)).arrayBuffer()})));await readFiles(files,false)};
  // Initial file parsing is an external workbook synchronization.
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(()=>{if(!data.sources.length)void loadBundled()},[]);
  const importFiles=async(e:ChangeEvent<HTMLInputElement>)=>{const picked=Array.from(e.target.files||[]);if(!picked.length)return;await readFiles(await Promise.all(picked.map(async f=>({name:f.name,buffer:await f.arrayBuffer()}))));e.target.value=''};
  const commerce=data.commerce.filter(r=>`${r.po}${r.dealer}${r.sidemark}${r.product}${r.remittance}`.toLowerCase().includes(search.toLowerCase()));
  const wholesale=data.wholesale.filter(r=>`${r.seller}${r.reference}${r.date}`.toLowerCase().includes(search.toLowerCase()));
  const total=data.commerce.reduce((sum,r)=>sum+r.settlement,0),paid=data.commerce.filter(r=>r.remittance.includes('已汇款')).length,dealers=new Set(data.commerce.map(r=>r.dealer).filter(x=>x!=='未填写')).size;
  return <><div className="module-head"><div><span className="eyebrow">REAL WORKBOOKS / DATA CENTER</span><h1>真实数据中心 <small className="en-title">Data Center</small></h1><p>当前数据来自您提供的 Excel；选择电脑中的新版文件即可更新。</p></div><div className="data-actions"><label className="primary file-import">选择电脑文件 / Import<input type="file" accept=".xlsx,.xls" multiple onChange={importFiles}/></label><button className="secondary" onClick={()=>{localStorage.removeItem('braun-real-workbooks');void loadBundled()}}>恢复原始文件</button></div></div>
  <div className="source-note"><b>数据来源：</b>{data.sources.join('、')||'正在读取…'}<span>最后读取：{data.updated||'—'}</span><small>浏览器只读取您主动选择的文件，不会扫描电脑其他目录。</small></div>{error&&<div className="data-error">{error}</div>}
  <section className="kpi-grid data-kpis"><article className="kpi"><span>Commerce订单</span><strong>{data.commerce.length}</strong><small>含新增未编号行</small></article><article className="kpi"><span>结算金额</span><strong>${total.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</strong><small>Excel 结算金额合计</small></article><article className="kpi"><span>已汇款</span><strong>{paid}</strong><small>另有 {Math.max(0,data.commerce.length-paid)} 笔未标记</small></article><article className="kpi"><span>经销商</span><strong>{dealers}</strong><small>按客户名称去重</small></article></section>
  <div className="toolbar data-toolbar"><button className={tab==='commerce'?'selected-filter':''} onClick={()=>setTab('commerce')}>Commerce订单 ({data.commerce.length})</button><button className={tab==='wholesale'?'selected-filter':''} onClick={()=>setTab('wholesale')}>批发销售 ({data.wholesale.length})</button><label>⌕ <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="搜索PO、客户、项目、产品…"/></label></div>
  <div className="panel module-panel real-data-table"><div className="table-wrap">{busy?<div className="empty-search">正在读取真实 Excel 数据…</div>:tab==='commerce'?<table><thead><tr><th>PO号</th><th>客户 / Dealer</th><th>项目代号</th><th>产品</th><th>数量</th><th>结算金额</th><th>已到账</th><th>汇款状态</th></tr></thead><tbody>{commerce.map((r,i)=><tr key={`${r.po}-${i}`}><td><b>{r.po}</b></td><td>{r.dealer}</td><td>{r.sidemark}</td><td>{r.product}</td><td>{r.qty||'—'}</td><td>${r.settlement.toLocaleString(undefined,{minimumFractionDigits:2})}</td><td>{r.received?`$${r.received.toLocaleString(undefined,{minimumFractionDigits:2})}`:'—'}</td><td><Status tone={r.remittance.includes('已汇款')?'green':'amber'}>{r.remittance}</Status></td></tr>)}</tbody></table>:<table><thead><tr><th>销售/来源</th><th>日期</th><th>订单或说明</th><th>金额</th></tr></thead><tbody>{wholesale.map((r,i)=><tr key={`${r.seller}-${i}`}><td><b>{r.seller}</b></td><td>{r.date||'—'}</td><td>{r.reference||'—'}</td><td>{r.amount?`$${r.amount.toLocaleString(undefined,{minimumFractionDigits:2})}`:'—'}</td></tr>)}</tbody></table>}</div></div></>;
}

type PortalSettings = { company:string; phone:string; email:string; address:string; orderPrefix:string; mfa:boolean; orderAccess:boolean };
const defaultSettings:PortalSettings = {company:"Braun International, LLC",phone:"626-658-5002",email:"sundagang91709@gmail.com",address:"2115 S. Hellman Avenue, Unit E, Ontario, CA 91761",orderPrefix:"SO",mfa:true,orderAccess:true};
function SettingsPage(){
  const [saved,setSaved]=useState(false);
  const [settings,setSettings]=useState<PortalSettings>(()=>{
    if(typeof window==="undefined") return defaultSettings;
    try { return JSON.parse(localStorage.getItem("braun-settings")||"") || defaultSettings; }
    catch { return defaultSettings; }
  });
  const save=()=>{localStorage.setItem("braun-settings",JSON.stringify(settings));setSaved(true);setTimeout(()=>setSaved(false),1600)};
  return <><div className="module-head"><div><span className="eyebrow">ADMIN / SETTINGS</span><h1>系统设置 <small className="en-title">Settings</small></h1><p>公司资料、编号规则、安全和订单级访问权限。</p></div><button className="primary" onClick={save}>{saved?"已保存 ✓":"保存设置"}</button></div><div className="settings-grid"><section className="panel settings-card"><h2>公司资料</h2><label>公司名称<input value={settings.company} onChange={e=>setSettings({...settings,company:e.target.value})}/></label><label>电话<input value={settings.phone} onChange={e=>setSettings({...settings,phone:e.target.value})}/></label><label>邮箱<input value={settings.email} onChange={e=>setSettings({...settings,email:e.target.value})}/></label><label>地址<textarea value={settings.address} onChange={e=>setSettings({...settings,address:e.target.value})}/></label></section><section className="panel settings-card"><h2>订单与安全</h2><label>销售订单前缀<input value={settings.orderPrefix} onChange={e=>setSettings({...settings,orderPrefix:e.target.value})}/></label><label className="toggle-setting"><input type="checkbox" checked={settings.orderAccess} onChange={e=>setSettings({...settings,orderAccess:e.target.checked})}/><span><b>订单号访问权限</b><small>账号只能查看被分配的订单、排期、安装和账单。</small></span></label><label className="toggle-setting"><input type="checkbox" checked={settings.mfa} onChange={e=>setSettings({...settings,mfa:e.target.checked})}/><span><b>管理员和财务MFA</b><small>登录时要求额外身份验证。</small></span></label></section></div></>;
}

function RecordDrawer({id,close}:{id:string;close:()=>void}){const all=Object.values(moduleRows).flat(),record=all.find(x=>x.id===id)||orders.find(x=>x.id===id),[perm,setPerm]=useState(false);if(!record)return null;const isOrder=id.startsWith("SO-");return <div className="drawer-wrap" onClick={close}><aside className="drawer" onClick={e=>e.stopPropagation()}><button className="drawer-close" onClick={close}>×</button><span className="eyebrow">RECORD DETAIL / 记录详情</span><h2>{record.id}</h2><p className="drawer-sub">{record.client}</p><Status tone={record.tone}>{record.status}</Status><div className="record-description"><h3>业务内容 / Description</h3><p>{record.product}</p></div><div className="detail-stats"><div><span>负责人</span><b>{record.owner}</b></div><div><span>金额/数量</span><b>{record.value}</b></div><div><span>下一节点</span><b>{record.date}</b></div></div><h3>处理记录 / Activity</h3><div className="timeline"><div className="done"><i/><span><b>记录已建立</b><small>业务资料已关联到 {record.id}</small></span></div><div className="active"><i/><span><b>{record.status}</b><small>负责人：{record.owner}</small></span></div><div><i/><span><b>下一步</b><small>{record.date}</small></span></div></div><h3>订单访问权限 / Access</h3><div className="access-card"><span>{isOrder?"仅已分配此订单号的人员可查看排期、进度、安装资料和账单。":"该记录继承关联订单的人员权限。"}</span><button onClick={()=>setPerm(v=>!v)}>管理权限</button></div>{perm&&<div className="permission-list">{['Gunther · 管理员',`${record.owner} · 负责人`,'财务 · 仅收付款','安装组 · 仅安装资料'].map((x,i)=><label key={x}><input type="checkbox" defaultChecked={i<2}/>{x}</label>)}</div>}</aside></div>}

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
    <aside className={`sidebar ${mobile?'open':''}`}><div className="brand"><div className="brand-mark"><i/><i/><i/></div><div><b>BRAUN</b><span>BLINDS</span></div><button className="mobile-close" onClick={()=>setMobile(false)}>×</button></div><div className="workspace"><span>当前公司 / COMPANY</span><b>Braun International</b><button onClick={()=>go('系统设置')}>⚙</button></div><nav>{nav.map(g=><div className="nav-group" key={g.title}><h3>{g.title}<small>{en[g.title]}</small></h3>{g.items.map(item=><button key={item.label} className={active===item.label?'active':''} onClick={()=>go(item.label)}><i>{item.icon}</i><span>{item.label}<small>{en[item.label]}</small></span>{item.badge&&<em>{item.badge}</em>}</button>)}</div>)}</nav><div className="help-card"><b>需要帮助？ / Need help?</b><span>查看操作说明、产品规则或联系系统支持。</span><button onClick={()=>go('产品与文档')}>打开帮助中心 / Help center →</button></div><div className="user-card"><div>GS</div><span><b>Gunther Sung</b><small>{role} · Ontario, CA</small></span><button onClick={()=>go('系统设置')}>•••</button></div></aside>
    <div className="mobile-overlay" onClick={()=>setMobile(false)}/>
    <main className="main"><header className="topbar"><button className="menu" onClick={()=>setMobile(true)}>☰</button><div className="crumb"><span>{breadcrumb}</span><b>/</b><strong>{active}</strong></div><label className="global-search">⌕<input value={search} onChange={e=>{if(active==='经营总览')go('销售订单');setSearch(e.target.value)}} placeholder="搜索订单、客户、项目、采购单… / Search"/><kbd>⌘ K</kbd></label><div className="top-actions"><select value={role} onChange={e=>{setRole(e.target.value);setToast(`已切换权限视图：${e.target.value}`)}} aria-label="角色权限预览"><option>公司管理员 / Owner</option><option>销售人员 / Sales</option><option>测量人员 / Measure</option><option>安装人员 / Installer</option><option>财务人员 / Finance</option><option>客户账户 / Client</option></select><button aria-label="通知" onClick={()=>go('待办与提醒')}>♢<em>8</em></button><div className="avatar" onClick={()=>go('系统设置')}>GS</div></div></header><div className="content">{active==='经营总览'?<Overview onOpen={setDrawer} go={go} onNew={()=>setNewOpen(true)}/>:<ModulePage name={active} onOpen={setDrawer} onNew={()=>setNewOpen(true)} search={search} setSearch={setSearch}/>}<footer><span>© 2026 Braun International, LLC</span><span>隐私政策 Privacy · 使用条款 Terms · 技术支持 Support</span></footer></div></main>{drawer&&<RecordDrawer id={drawer} close={()=>setDrawer(null)}/>} {newOpen&&<NewRecordModal module={active} close={()=>setNewOpen(false)} save={saveRecord}/>} {toast&&<div className="toast">✓ {toast}</div>}</div>;
}

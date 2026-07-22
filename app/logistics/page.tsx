"use client";

import { useMemo, useState } from "react";

type Carrier={name:string;kind:string;base:number;days:string;note:string};
const carriers:Carrier[]=[
{name:"Freightquote",kind:"Broker比价平台",base:82,days:"2–7个工作日",note:"适合同时比较多家LTL承运商"},
{name:"Uber Freight LTL",kind:"数字货运平台",base:88,days:"2–7个工作日",note:"在线询价、订舱和追踪"},
{name:"Estes",kind:"LTL承运商",base:94,days:"2–7个工作日",note:"西部及全国线路可重点比价"},
{name:"Saia",kind:"LTL承运商",base:98,days:"2–7个工作日",note:"西部、南部和中部线路常有竞争力"},
{name:"R+L Carriers",kind:"LTL承运商",base:101,days:"2–7个工作日",note:"全国LTL备选渠道"},
{name:"XPO",kind:"LTL承运商",base:104,days:"2–7个工作日",note:"全国网络，适合商业地址"},
{name:"Old Dominion",kind:"LTL承运商",base:108,days:"2–6个工作日",note:"服务稳定，适合高价值货物"},
{name:"uShip",kind:"长件拼车平台",base:76,days:"2–10个工作日",note:"单件长货、住宅地址可尝试回程车报价"}
];
const contacts=[
["Old Dominion Fontana","909-770-5339","877-711-0901","覆盖Ontario及Rancho Cucamonga"],
["Saia Customer Service","800-765-7242","customerservice@saia.com","全国LTL客服"],
["R+L Carriers","800-543-5589","—","全国LTL客服"],
["Uber Freight LTL","872-703-8100","ltl-uf@uber.com","数字LTL平台"],
["uShip","800-698-7447","support@uship.com","长件拼车与住宅配送"]
];
const money=(n:number)=>`$${Math.round(n).toLocaleString()}`;
const num=(v:string)=>Math.max(0,Number(v)||0);
function zoneFromZip(origin:string,destination:string){
 const a=Number(origin.slice(0,3)),b=Number(destination.slice(0,3));
 if(!Number.isFinite(a)||!Number.isFinite(b))return 3;
 const d=Math.abs(a-b);return d<80?1:d<180?2:d<350?3:d<550?4:5;
}
export default function LogisticsPage(){
 const [length,setLength]=useState("");const [width,setWidth]=useState("");const [height,setHeight]=useState("");const [weight,setWeight]=useState("");
 const [unit,setUnit]=useState<"kg"|"lb">("kg");const [quantity,setQuantity]=useState("1");const [originZip,setOriginZip]=useState("");const [destinationZip,setDestinationZip]=useState("");
 const [residential,setResidential]=useState(false);const [liftgate,setLiftgate]=useState(false);const [appointment,setAppointment]=useState(false);
 const L=num(length),W=num(width),H=num(height),Q=Math.max(1,num(quantity)),lb=unit==="kg"?num(weight)*2.20462:num(weight),ready=L>0&&W>0&&H>0&&lb>0&&/^\d{5}$/.test(originZip)&&/^\d{5}$/.test(destinationZip);
 const zone=zoneFromZip(originZip,destinationZip);
 const results=useMemo(()=>{if(!ready)return[];const cubic=L*W*H/1728;const lengthFactor=L>108?1.58:L>96?1.28:1;const volumeFactor=Math.max(1,Math.sqrt(cubic/6));const weightFactor=Math.max(1,Math.sqrt(lb/25));const unitFactor=1+Math.max(0,Q-1)*.22;const extras=(residential?68:0)+(liftgate?55:0)+(appointment?35:0);return carriers.map(c=>{const midpoint=(c.base+(zone-1)*36)*lengthFactor*volumeFactor*weightFactor*unitFactor+extras;const spread=c.name==="uShip"?.28:.18;return{...c,low:midpoint*(1-spread),high:midpoint*(1+spread)}}).sort((a,b)=>a.low-b.low)},[ready,L,W,H,lb,Q,zone,residential,liftgate,appointment]);
 const mode=!L?"请输入包装后的真实长度。":L>108?"超过普通包裹108英寸上限：建议LTL、长件拼车或改为分段包装。":L>96?"可尝试UPS/FedEx企业账号，但超长附加费可能使LTL更便宜。":"适合比较UPS/FedEx Ground企业折扣与LTL。";
 return <main className="page">
  <header className="hero"><div><span>BRAUN BLINDS · NATIONAL LOGISTICS</span><h1>全国物流与超长窗帘杆比价</h1><p>所有尺寸、重量、件数和邮编均由员工按每票货物手动输入。</p></div><a href="/">返回业务中心</a></header>
  <section className="notice"><b>重要：</b>页面显示的是预算参考区间，不是承运商实时合同价。最终发货前必须在对应平台重新询价。</section>
  <section className="grid"><article className="card"><div className="title"><span>01</span><div><h2>手动输入货物资料</h2><p>请填写包装后的外箱尺寸和毛重</p></div></div>
   <div className="formGrid">
    <label>起运ZIP<input inputMode="numeric" maxLength={5} value={originZip} onChange={e=>setOriginZip(e.target.value.replace(/\D/g,"").slice(0,5))} placeholder="例如 91761"/></label>
    <label>目的ZIP<input inputMode="numeric" maxLength={5} value={destinationZip} onChange={e=>setDestinationZip(e.target.value.replace(/\D/g,"").slice(0,5))} placeholder="例如 10001"/></label>
    <label>长度 Length (in)<input type="number" min="0" value={length} onChange={e=>setLength(e.target.value)} placeholder="手动输入"/></label>
    <label>宽度 Width (in)<input type="number" min="0" value={width} onChange={e=>setWidth(e.target.value)} placeholder="手动输入"/></label>
    <label>高度 Height (in)<input type="number" min="0" value={height} onChange={e=>setHeight(e.target.value)} placeholder="手动输入"/></label>
    <label>重量<input type="number" min="0" value={weight} onChange={e=>setWeight(e.target.value)} placeholder="手动输入"/></label>
    <label>重量单位<select value={unit} onChange={e=>setUnit(e.target.value as "kg"|"lb")}><option value="kg">公斤 kg</option><option value="lb">磅 lb</option></select></label>
    <label>件数 Quantity<input type="number" min="1" value={quantity} onChange={e=>setQuantity(e.target.value)}/></label>
   </div>
   <div className="checks"><label><input type="checkbox" checked={residential} onChange={e=>setResidential(e.target.checked)}/>住宅地址</label><label><input type="checkbox" checked={liftgate} onChange={e=>setLiftgate(e.target.checked)}/>需要尾板</label><label><input type="checkbox" checked={appointment} onChange={e=>setAppointment(e.target.checked)}/>需要预约</label></div>
   <div className={L>108?"decision danger":"decision"}><b>运输判断</b><p>{mode}</p>{ready?<small>实际重量 {lb.toFixed(1)} lb · 体积 {(L*W*H/1728).toFixed(1)} ft³ · 估算区域等级 {zone}</small>:<small>请完整填写尺寸、重量以及两个5位ZIP Code后查看比价。</small>}</div>
  </article>
  <article className="card"><div className="title"><span>02</span><div><h2>参考比价</h2><p>自动按参考价格从低到高排列</p></div></div>{!ready?<div className="empty">等待输入完整货物资料</div>:<div className="results">{results.map((r,i)=><div className={i===0?"quote best":"quote"} key={r.name}><div><b>{r.name}</b><small>{r.kind} · {r.days}</small></div><strong>{money(r.low)}–{money(r.high)}</strong><p>{r.note}</p>{i===0&&<em>当前参考最低</em>}</div>)}</div>}</article></section>
  <section className="card"><div className="title"><span>03</span><div><h2>推荐联系方式</h2><p>联系时提供完整尺寸、毛重、两端ZIP和送货条件</p></div></div><div className="table"><div className="tr head"><span>公司</span><span>电话</span><span>邮箱/备用电话</span><span>用途</span></div>{contacts.map(x=><div className="tr" key={x[0]}><b>{x[0]}</b><span>{x[1]}</span><span>{x[2]}</span><span>{x[3]}</span></div>)}</div></section>
  <section className="card"><div className="title"><span>04</span><div><h2>发货前检查清单</h2><p>Braun Blinds仓库标准</p></div></div><ol className="checklist"><li>填写包装后的真实外尺寸和毛重。</li><li>确认起运与收货ZIP、商业或住宅属性。</li><li>确认预约、尾板、室内搬运和偏远地区附加服务。</li><li>至少比较一个Broker平台和两个LTL承运商。</li><li>保存报价、BOL、PRO号码、包装照片和签收记录。</li></ol></section>
  <style jsx>{`:global(*){box-sizing:border-box}:global(body){margin:0;background:#f4f1eb;color:#19221d;font-family:Arial,"PingFang SC","Microsoft YaHei",sans-serif}.page{max-width:1440px;margin:auto;padding:28px}.hero{background:linear-gradient(135deg,#17382b,#2d604b);color:white;border-radius:26px;padding:38px;display:flex;justify-content:space-between;gap:30px}.hero span{font-size:12px;letter-spacing:2px;opacity:.75}.hero h1{font-size:38px;margin:12px 0}.hero p{line-height:1.7;opacity:.85}.hero a{color:white;text-decoration:none;border:1px solid #ffffff55;padding:12px 18px;border-radius:12px;height:max-content}.notice{margin:18px 0;background:#fff7da;border:1px solid #e7cf7a;padding:16px 20px;border-radius:14px}.grid{display:grid;grid-template-columns:.9fr 1.1fr;gap:18px}.card{background:white;border:1px solid #dfddd6;border-radius:22px;padding:24px;margin-bottom:18px;box-shadow:0 12px 35px #27352d0c}.title{display:flex;gap:14px;margin-bottom:20px}.title>span{display:grid;place-items:center;background:#e8efe9;color:#244f3d;border-radius:12px;width:42px;height:42px;font-weight:800}.title h2{margin:0 0 5px}.title p{margin:0;color:#748078}.formGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:13px}.formGrid label{font-size:13px;font-weight:700;color:#536158}.formGrid input,.formGrid select{display:block;width:100%;margin-top:7px;padding:12px;border:1px solid #cfd6d0;border-radius:10px;font-size:15px;background:white}.checks{display:flex;gap:18px;margin:18px 0;flex-wrap:wrap}.decision{padding:16px;border-radius:14px;background:#edf5ef;border-left:4px solid #438461}.decision.danger{background:#fff0e8;border-color:#c15f32}.decision p{margin:7px 0}.results{display:grid;gap:10px}.quote{position:relative;border:1px solid #dfe3df;border-radius:14px;padding:15px;display:grid;grid-template-columns:1fr auto;gap:5px 16px}.quote small{display:block;color:#778079;margin-top:4px}.quote strong{font-size:19px;color:#234d3b}.quote p{grid-column:1/-1;margin:3px 0;color:#66736b;font-size:13px}.quote.best{border:2px solid #3f7f5f;background:#f3faf5}.quote em{position:absolute;right:12px;bottom:10px;font-size:11px;color:#397657}.empty{padding:40px;text-align:center;color:#768078;background:#f6f7f4;border-radius:14px}.table{overflow:auto}.tr{min-width:850px;display:grid;grid-template-columns:1.2fr 1fr 1.4fr 1.7fr;gap:12px;padding:13px;border-bottom:1px solid #ecece8}.tr.head{background:#edf1ed;border-radius:10px;font-size:12px;font-weight:800}.checklist{line-height:2}.checklist li{padding-left:6px}@media(max-width:900px){.page{padding:14px}.hero{padding:24px;display:block}.hero h1{font-size:29px}.hero a{display:inline-block;margin-top:12px}.grid{grid-template-columns:1fr}.formGrid{grid-template-columns:1fr}.tr{min-width:700px}}`}</style>
 </main>
}

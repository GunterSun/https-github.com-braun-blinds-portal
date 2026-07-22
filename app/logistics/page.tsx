"use client";

import { useMemo, useState } from "react";

type Destination = { name:string; zone:number; examples:string };
type Carrier = { name:string; kind:string; base:number; days:string; note:string };

const destinations:Destination[] = [
  {name:"南加州 / Southern California",zone:1,examples:"Los Angeles · San Diego · Las Vegas"},
  {name:"美国西部 / West",zone:2,examples:"San Francisco · Phoenix · Salt Lake City"},
  {name:"中南部 / South Central",zone:3,examples:"Dallas · Houston · Denver"},
  {name:"中西部 / Midwest",zone:4,examples:"Chicago · Minneapolis · St. Louis"},
  {name:"美国东部 / East",zone:5,examples:"New York · Boston · Washington DC"},
  {name:"美国东南部 / Southeast",zone:5.3,examples:"Atlanta · Orlando · Miami"},
];

const carriers:Carrier[] = [
  {name:"Freightquote",kind:"Broker比价平台",base:82,days:"2–7个工作日",note:"适合同时比较多家LTL承运商"},
  {name:"Uber Freight LTL",kind:"Broker/数字货运平台",base:88,days:"2–7个工作日",note:"在线询价、订舱和追踪"},
  {name:"Estes",kind:"LTL承运商",base:94,days:"2–7个工作日",note:"西部及全国线路可重点比价"},
  {name:"Saia",kind:"LTL承运商",base:98,days:"2–7个工作日",note:"西部、南部和中部线路常有竞争力"},
  {name:"R+L Carriers",kind:"LTL承运商",base:101,days:"2–7个工作日",note:"全国LTL备选渠道"},
  {name:"Old Dominion",kind:"LTL承运商",base:108,days:"2–6个工作日",note:"服务稳定，适合高价值货物"},
  {name:"XPO",kind:"LTL承运商",base:104,days:"2–7个工作日",note:"全国网络，适合商业地址"},
  {name:"uShip",kind:"长件拼车平台",base:76,days:"2–10个工作日",note:"单件长货、住宅地址可尝试回程车报价"},
];

const contacts = [
  ["Old Dominion Fontana","909-770-5339","877-711-0901","覆盖Ontario及Rancho Cucamonga"],
  ["Saia Customer Service","800-765-7242","customerservice@saia.com","全国LTL客服"],
  ["R+L Carriers","800-543-5589","—","全国LTL客服"],
  ["Uber Freight LTL","872-703-8100","ltl-uf@uber.com","数字LTL平台"],
  ["uShip","800-698-7447","support@uship.com","长件拼车与住宅配送"],
];

function money(n:number){return `$${Math.round(n).toLocaleString()}`}

export default function LogisticsPage(){
  const [length,setLength]=useState(120);
  const [width,setWidth]=useState(10);
  const [height,setHeight]=useState(10);
  const [kg,setKg]=useState(10);
  const [zone,setZone]=useState(3);
  const [residential,setResidential]=useState(false);
  const [liftgate,setLiftgate]=useState(false);
  const [quantity,setQuantity]=useState(1);

  const results=useMemo(()=>{
    const cubic=(length*width*height)/1728;
    const actualLb=kg*2.20462;
    const lengthFactor=length>108?1.58:length>96?1.28:1;
    const volumeFactor=Math.max(1,Math.sqrt(cubic/6));
    const weightFactor=Math.max(1,Math.sqrt(actualLb/25));
    const unitFactor=1+Math.max(0,quantity-1)*0.22;
    const accessorial=(residential?68:0)+(liftgate?55:0);
    return carriers.map(c=>{
      const midpoint=(c.base+(zone-1)*36)*lengthFactor*volumeFactor*weightFactor*unitFactor+accessorial;
      const spread=c.name==="uShip"?.28:.18;
      return {...c,low:midpoint*(1-spread),high:midpoint*(1+spread)};
    }).sort((a,b)=>a.low-b.low);
  },[length,width,height,kg,zone,residential,liftgate,quantity]);

  const packageMode=length>108?"超过普通包裹108英寸上限：建议LTL、长件拼车或改为分段式包装。":length>96?"可尝试UPS/FedEx企业账号，但超长附加费可能使LTL更便宜。":"适合先比较UPS/FedEx Ground企业折扣与LTL。";

  return <main className="page">
    <header className="hero">
      <div><span>BRAUN BLINDS · NATIONAL LOGISTICS</span><h1>全国物流与超长窗帘杆比价</h1><p>适用于洛杉矶/Ontario仓库组装完成后，向美国各州配送窗帘杆、轨道和长件配件。</p></div>
      <a href="/">返回业务中心</a>
    </header>

    <section className="notice"><b>重要：</b>本页当前显示规划与预算用参考区间，不是承运商API实时合同报价。最终发货前必须用起运ZIP、收货ZIP、商业/住宅属性及附加服务重新询价。</section>

    <section className="grid">
      <article className="card inputCard">
        <div className="title"><span>01</span><div><h2>输入货物资料</h2><p>默认已填入120 × 10 × 10英寸、10公斤</p></div></div>
        <div className="formGrid">
          <label>长度 Length (in)<input type="number" value={length} onChange={e=>setLength(Number(e.target.value)||0)}/></label>
          <label>宽度 Width (in)<input type="number" value={width} onChange={e=>setWidth(Number(e.target.value)||0)}/></label>
          <label>高度 Height (in)<input type="number" value={height} onChange={e=>setHeight(Number(e.target.value)||0)}/></label>
          <label>重量 Weight (kg)<input type="number" value={kg} onChange={e=>setKg(Number(e.target.value)||0)}/></label>
          <label>件数 Quantity<input type="number" min="1" value={quantity} onChange={e=>setQuantity(Math.max(1,Number(e.target.value)||1))}/></label>
          <label>目的地区域<select value={zone} onChange={e=>setZone(Number(e.target.value))}>{destinations.map(x=><option key={x.name} value={x.zone}>{x.name}</option>)}</select></label>
        </div>
        <div className="checks"><label><input type="checkbox" checked={residential} onChange={e=>setResidential(e.target.checked)}/> 住宅地址 Residential</label><label><input type="checkbox" checked={liftgate} onChange={e=>setLiftgate(e.target.checked)}/> 需要尾板 Liftgate</label></div>
        <div className={length>108?"decision danger":"decision"}><b>运输判断</b><p>{packageMode}</p><small>实际重量：{(kg*2.20462).toFixed(1)} lb · 体积：{((length*width*height)/1728).toFixed(1)} ft³</small></div>
      </article>

      <article className="card resultCard">
        <div className="title"><span>02</span><div><h2>参考比价</h2><p>从最低参考区间开始排列</p></div></div>
        <div className="results">{results.map((r,i)=><div className={i===0?"quote best":"quote"} key={r.name}><div><b>{r.name}</b><small>{r.kind} · {r.days}</small></div><strong>{money(r.low)}–{money(r.high)}</strong><p>{r.note}</p>{i===0&&<em>当前参考最低</em>}</div>)}</div>
      </article>
    </section>

    <section className="card"><div className="title"><span>03</span><div><h2>120英寸产品执行规则</h2><p>减少超长附加费、损坏和错误报价</p></div></div><div className="rules">
      <div><b>优先改成分段式</b><p>将最长外箱控制在84–95英寸，优先比较UPS/FedEx企业折扣。</p></div>
      <div><b>完整120英寸走LTL</b><p>多根捆扎在长木托架上，两端不得悬空，并标记Do Not Bend / Do Not Stack。</p></div>
      <div><b>住宅订单单独收费</b><p>住宅、预约、尾板和偏远地区均可能产生附加费，不承诺统一Free Shipping。</p></div>
      <div><b>签收前检查</b><p>要求客户检查箱体弯折、端部撞击和破损；发现异常先拍照再签收。</p></div>
    </div></section>

    <section className="card"><div className="title"><span>04</span><div><h2>推荐联系方式</h2><p>联系时说明120英寸、22磅、长件窗帘五金</p></div></div><div className="table"><div className="tr head"><span>公司</span><span>电话</span><span>邮箱/备用电话</span><span>用途</span></div>{contacts.map(x=><div className="tr" key={x[0]}><b>{x[0]}</b><span>{x[1]}</span><span>{x[2]}</span><span>{x[3]}</span></div>)}</div></section>

    <section className="card"><div className="title"><span>05</span><div><h2>发货前检查清单</h2><p>Braun Blinds仓库标准</p></div></div><ol className="checklist"><li>核对订单号、收货ZIP及商业/住宅属性。</li><li>测量包装后的真实外尺寸，不使用产品净尺寸。</li><li>称取包装后毛重并拍摄包装照片。</li><li>确认是否需要预约、尾板、室内搬运或限制地点配送。</li><li>至少比较一个Broker平台和两个LTL承运商。</li><li>保存报价、BOL、PRO号码、提货照片和签收记录。</li></ol></section>

    <style jsx>{`
      :global(*){box-sizing:border-box} :global(body){margin:0;background:#f4f1eb;color:#19221d;font-family:Arial,"PingFang SC","Microsoft YaHei",sans-serif}.page{max-width:1440px;margin:auto;padding:28px}.hero{background:linear-gradient(135deg,#17382b,#2d604b);color:white;border-radius:26px;padding:38px;display:flex;justify-content:space-between;gap:30px;align-items:flex-start;box-shadow:0 20px 50px #17382b22}.hero span{font-size:12px;letter-spacing:2px;opacity:.75}.hero h1{font-size:38px;margin:12px 0}.hero p{max-width:780px;line-height:1.7;opacity:.85}.hero a{color:white;text-decoration:none;border:1px solid #ffffff55;padding:12px 18px;border-radius:12px;white-space:nowrap}.notice{margin:18px 0;background:#fff7da;border:1px solid #e7cf7a;padding:16px 20px;border-radius:14px;line-height:1.6}.grid{display:grid;grid-template-columns:.9fr 1.1fr;gap:18px}.card{background:white;border:1px solid #dfddd6;border-radius:22px;padding:24px;margin-bottom:18px;box-shadow:0 12px 35px #27352d0c}.title{display:flex;gap:14px;align-items:flex-start;margin-bottom:20px}.title>span{display:grid;place-items:center;background:#e8efe9;color:#244f3d;border-radius:12px;width:42px;height:42px;font-weight:800}.title h2{margin:0 0 5px;font-size:22px}.title p{margin:0;color:#748078}.formGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:13px}.formGrid label{font-size:13px;font-weight:700;color:#536158}.formGrid input,.formGrid select{display:block;width:100%;margin-top:7px;padding:12px;border:1px solid #cfd6d0;border-radius:10px;font-size:15px;background:white}.checks{display:flex;gap:18px;margin:18px 0;flex-wrap:wrap}.checks label{font-size:14px}.decision{padding:16px;border-radius:14px;background:#edf5ef;border-left:4px solid #438461}.decision.danger{background:#fff0e8;border-color:#c15f32}.decision p{margin:7px 0;line-height:1.55}.decision small{color:#68766e}.results{display:grid;gap:10px}.quote{position:relative;border:1px solid #dfe3df;border-radius:14px;padding:15px;display:grid;grid-template-columns:1fr auto;gap:5px 16px}.quote b{font-size:16px}.quote small{display:block;color:#778079;margin-top:4px}.quote strong{font-size:19px;color:#234d3b}.quote p{grid-column:1/-1;margin:3px 0;color:#66736b;font-size:13px}.quote.best{border:2px solid #3f7f5f;background:#f3faf5}.quote em{position:absolute;right:12px;bottom:10px;font-size:11px;color:#397657}.rules{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.rules div{background:#f7f7f3;padding:18px;border-radius:14px}.rules p{color:#667068;line-height:1.55;font-size:14px}.table{overflow:auto}.tr{min-width:850px;display:grid;grid-template-columns:1.2fr 1fr 1.4fr 1.7fr;gap:12px;padding:13px;border-bottom:1px solid #ecece8;align-items:center}.tr.head{background:#edf1ed;border-radius:10px;font-size:12px;font-weight:800;color:#657168}.checklist{display:grid;grid-template-columns:repeat(2,1fr);gap:12px 35px;line-height:1.6}.checklist li{padding:10px 12px;background:#f8f8f5;border-radius:10px}@media(max-width:900px){.page{padding:14px}.hero{padding:24px;display:block}.hero h1{font-size:29px}.hero a{display:inline-block;margin-top:12px}.grid{grid-template-columns:1fr}.rules{grid-template-columns:1fr 1fr}.checklist{grid-template-columns:1fr}}@media(max-width:560px){.formGrid,.rules{grid-template-columns:1fr}.quote{grid-template-columns:1fr}.quote strong{margin-top:6px}.hero h1{font-size:25px}}
    `}</style>
  </main>
}

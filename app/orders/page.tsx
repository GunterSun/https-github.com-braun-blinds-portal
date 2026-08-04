"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";

type OrderRow = {
  id:number; orderNumber:string; externalPrefix:string; customerCompany:string; customerName:string;
  projectName:string; projectAddress:string; status:string; paymentStatus:string; currency:string;
  grandTotal?:number; amountPaid?:number; balanceDue?:number; updatedAt:string;
};

export default function OrdersPage() {
  const [orders,setOrders]=useState<OrderRow[]>([]),[query,setQuery]=useState(""),[submittedQuery,setSubmittedQuery]=useState("");
  const [status,setStatus]=useState(""),[page,setPage]=useState(1),[total,setTotal]=useState(0),[loading,setLoading]=useState(true),[error,setError]=useState("");
  const pageSize=25;
  const load=useCallback(async()=>{
    setLoading(true);setError("");
    try{
      const params=new URLSearchParams({page:String(page),pageSize:String(pageSize)});
      if(submittedQuery)params.set("q",submittedQuery);if(status)params.set("status",status);
      const response=await fetch(`/api/v4/orders?${params}`,{cache:"no-store"});
      const data=await response.json();if(!response.ok)throw new Error(data.error||"Unable to load orders");
      setOrders(data.orders||[]);setTotal(Number(data.total)||0);
    }catch(reason){setError(reason instanceof Error?reason.message:"Unable to load orders");setOrders([]);}
    finally{setLoading(false)}
  },[page,status,submittedQuery]);
  // Initial and filter changes synchronize this page with the protected orders API.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(()=>{void load()},[load]);
  const search=(event:FormEvent)=>{event.preventDefault();setPage(1);setSubmittedQuery(query.trim())};
  return <main className="page"><header><div><small>BRN-002 · UNIFIED ORDER WORKSPACE</small><h1>统一订单中心 <span>Orders</span></h1><p>订单、客户、产品和状态均来自统一数据库，并按当前账号权限显示。</p></div><div className="header-actions"><Link href="/hub">返回门户 / Hub</Link><button onClick={()=>void load()}>刷新</button></div></header>
    <form className="filters" onSubmit={search}><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="订单号、CWF、客户、电话、邮箱或地址"/><select value={status} onChange={e=>{setStatus(e.target.value);setPage(1)}}><option value="">全部状态</option>{["draft","quoted","confirmed","in_production","ready_to_ship","shipped","installation_scheduled","installed","completed","cancelled","on_hold"].map(value=><option key={value}>{value}</option>)}</select><button>搜索</button></form>
    {error&&<div className="error">{error}</div>}<section className="card"><div className="summary"><b>{total}</b> 条当前账号可访问的订单</div><div className="table"><table><thead><tr><th>订单</th><th>客户 / 项目</th><th>状态</th><th>付款</th><th>金额</th><th>更新</th></tr></thead><tbody>{orders.map(order=><tr key={order.id}><td><Link className="order" href={`/orders/${order.orderNumber}`}>{order.externalPrefix?`${order.externalPrefix} `:""}{order.orderNumber}</Link></td><td><b>{order.customerCompany||order.customerName||"—"}</b><small>{order.projectName||order.projectAddress||"—"}</small></td><td><span className="pill">{order.status}</span></td><td>{order.paymentStatus||"—"}</td><td>{order.grandTotal===undefined?"受权限保护":`${order.currency} ${order.grandTotal.toFixed(2)}`}</td><td>{new Date(order.updatedAt).toLocaleString()}</td></tr>)}</tbody></table>{!loading&&!orders.length&&<div className="empty">没有符合条件的订单 / No matching orders</div>}{loading&&<div className="empty">正在读取真实订单…</div>}</div><div className="pagination"><button disabled={page<=1||loading} onClick={()=>setPage(value=>value-1)}>上一页</button><span>第 {page} 页</span><button disabled={page*pageSize>=total||loading} onClick={()=>setPage(value=>value+1)}>下一页</button></div></section>
    <style jsx>{`.page{min-height:100vh;background:#f4f2ed;color:#18352c;padding:30px;font-family:Arial,"PingFang SC",sans-serif}header,.filters,.card,.error{max-width:1450px;margin-left:auto;margin-right:auto}header{display:flex;justify-content:space-between;gap:20px}small{display:block;color:#6b7a74;margin-top:5px}h1{font-size:36px;margin:7px 0}h1 span{font-weight:400;color:#687871}.header-actions{display:flex;gap:10px;align-items:flex-start}a,button{border:0;border-radius:9px;padding:10px 14px;background:#1f5b49;color:white;text-decoration:none;font-weight:800}.filters{display:grid;grid-template-columns:1fr 240px auto;gap:10px;margin-top:22px}.filters input,.filters select{border:1px solid #cfd7d2;border-radius:10px;padding:12px;background:white}.card{background:white;border:1px solid #dedbd3;border-radius:18px;padding:20px;margin-top:16px}.summary{margin-bottom:12px}.table{overflow:auto}table{border-collapse:collapse;width:100%;min-width:950px}th,td{padding:13px;border-bottom:1px solid #e8e5de;text-align:left;font-size:13px}.order{background:none;color:#174f3e;padding:0}.pill{background:#e8f0eb;border-radius:999px;padding:6px 9px}.empty{text-align:center;padding:35px;color:#74817b}.pagination{display:flex;justify-content:center;align-items:center;gap:13px;margin-top:17px}.pagination button:disabled{opacity:.45}.error{margin-top:16px;background:#fff0ec;color:#95392e;padding:13px;border-radius:10px}@media(max-width:760px){.page{padding:15px}header{display:block}.header-actions{margin-top:12px}.filters{grid-template-columns:1fr}.card{padding:12px}}`}</style></main>;
}

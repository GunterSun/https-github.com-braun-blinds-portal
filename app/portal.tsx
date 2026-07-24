"use client";

import { useEffect, useMemo, useState } from "react";

type User = { displayName: string; email: string; isAdmin: boolean };
type Profile = { email: string; companyName: string; contactName: string; phone?: string; discountPercent: number; status: string };
type Customer = Profile & { id: number; username?: string|null; newPassword?:string };
type ZSeriesItem = {id:string;fabricCode:string;fabricCollection:string;description:string;productCode:string;system:string;style:string;structure:string;construction:string;limits:string;retail:number};
type WindowLine={id:string;room:string;fabricCode:string;productId:string;width:string;height:string;quantity:string;mount:string;motorized:boolean;remoteQuantity:string};
type SavedOrder={id:number;orderNumber:string;projectName:string;itemsJson:string;retailTotal:number;wholesaleTotal:number;discountPercent:number;status:string;invoiceNumber?:string|null;confirmedAt?:string|null;createdAt:string};
type SavedOrderItem={room?:string;fabricCode?:string;productCode?:string;system?:string;style?:string;structure?:string;construction?:string;width?:number;height?:number;areaSqM?:number;quantity?:number;mount?:string;motorized?:boolean;remoteQuantity?:number;lineWholesale?:number};

const CATALOG: Record<string, { zh:string; en:string; rate: number | null; minSqFt: number }> = {
  roman_plain: { zh:"罗马帘 · 普通款（价格待设置）",en:"Roman Shade · Plain Fold (price pending)",rate:null,minSqFt:12 },
  roman_relaxed: { zh:"罗马帘 · 柔式（价格待设置）",en:"Roman Shade · Relaxed (price pending)",rate:null,minSqFt:12 },
  roman_balloon: { zh:"罗马帘 · 气球款",en:"Roman Shade · Balloon",rate:10,minSqFt:12 },
  roller: { zh:"卷帘（价格待设置）",en:"Roller Shade (price pending)",rate:null,minSqFt:10 },
  zebra: { zh:"斑马帘（价格待设置）",en:"Zebra Shade (price pending)",rate:null,minSqFt:10 },
  drapery: { zh:"定制布艺窗帘（价格待设置）",en:"Custom Drapery (price pending)",rate:null,minSqFt:15 },
};
const money = (n: number) => new Intl.NumberFormat("en-US", {style:"currency",currency:"USD"}).format(n || 0);

export default function Portal({user, signOutPath, customerAuth}:{user:User;signOutPath:string;customerAuth:boolean}) {
  const [lang,setLang]=useState<"zh"|"en">("zh");
  const t=(zh:string,en:string)=>lang==="zh"?zh:en;
  const bi=(value:string)=>{
    const parts=value.split(" / ");
    return lang==="zh"?parts[0]:(parts.slice(1).join(" / ")||parts[0]);
  };
  const [profile,setProfile] = useState<Profile|null>(null);
  const [customers,setCustomers] = useState<Customer[]>([]);
  const [tab,setTab] = useState(user.isAdmin ? "admin" : "zseries");
  const [message,setMessage] = useState("");
  const [adminFeedback,setAdminFeedback]=useState<{type:"ok"|"error";text:string}|null>(null);
  const [createdCredentials,setCreatedCredentials]=useState<{company:string;username:string;password:string}|null>(null);
  const [copiedCredentials,setCopiedCredentials]=useState(false);
  const [creatingCustomer,setCreatingCustomer]=useState(false);
  const [savingCustomerId,setSavingCustomerId]=useState<number|null>(null);
  const [deletingCustomerId,setDeletingCustomerId]=useState<number|null>(null);
  const [zCatalog,setZCatalog]=useState<ZSeriesItem[]>([]);
  const [windows,setWindows]=useState<WindowLine[]>([{id:"window-1",room:"",fabricCode:"",productId:"",width:"36",height:"60",quantity:"1",mount:"Inside",motorized:false,remoteQuantity:"0"}]);
  const [orders,setOrders]=useState<SavedOrder[]>([]);
  const [savingOrder,setSavingOrder]=useState(false);
  const [editingOrderId,setEditingOrderId]=useState<number|null>(null);
  const [expandedOrderId,setExpandedOrderId]=useState<number|null>(null);
  const [newCustomer,setNewCustomer]=useState({username:"",password:"",email:"",companyName:"",contactName:"",phone:"",discountPercent:0,status:"active"});
  const [passwordForm,setPasswordForm]=useState({currentPassword:"",newPassword:"",confirmPassword:""});
  const [form,setForm] = useState({projectName:"",product:"roman_plain",fabricGroup:"K",width:"36",height:"60",quantity:"1",mount:"Inside",control:"Cordless",lining:"Privacy"});
  const fabricCodes = useMemo(()=>Array.from(new Set(zCatalog.map(item=>item.fabricCode))),[zCatalog]);
  const [zForm,setZForm] = useState({projectName:""});

  const loadProfile = () => fetch("/api/profile").then(r=>r.json()).then(d=>setProfile(d.profile));
  const loadCustomers = () => user.isAdmin && fetch("/api/customers",{cache:"no-store"})
    .then(async res=>({ok:res.ok,data:await res.json()}))
    .then(({ok,data})=>{
      if(!ok) throw new Error(data.error??"Unable to load customer accounts");
      setCustomers(data.customers??[]);
    });
  useEffect(()=>{
    loadProfile(); loadCustomers();
    if(!user.isAdmin) fetch("/api/z-series").then(r=>r.json()).then(d=>{
      const items=d.items??[]; setZCatalog(items);
      if(items[0]){
        setWindows(x=>x.map((line,index)=>index===0?{...line,fabricCode:items[0].fabricCode,productId:items[0].id}:line));
      }
    });
    if(!user.isAdmin) fetch("/api/orders").then(r=>r.json()).then(d=>setOrders(d.orders??[]));
  },[]);

  const totals = useMemo(()=>{
    const item=CATALOG[form.product];
    const sqft=Math.max(item.minSqFt,(Number(form.width)*Number(form.height))/144);
    const qty=Math.max(1,Number(form.quantity));
    const configured=item.rate !== null;
    const retail=configured ? Math.round(sqft*item.rate*qty*100)/100 : 0;
    const discount=profile?.status==="active" ? profile.discountPercent : 0;
    return {sqft,retail,wholesale:Math.round(retail*(1-discount/100)*100)/100,discount,configured};
  },[form,profile]);
  const orderLines=useMemo(()=>windows.map(line=>({line,item:zCatalog.find(item=>item.id===(line.productId||zCatalog.find(p=>p.fabricCode===line.fabricCode)?.id))})),[windows,zCatalog]);
  const orderTotals=useMemo(()=>{
    const priced=orderLines.map(({line,item})=>{
      const quantity=Math.max(1,Number(line.quantity)||1);
      const areaSqM=Math.max(1,(Math.max(0,Number(line.width))*Math.max(0,Number(line.height)))*0.00064516);
      const baseRetail=(item?.retail??0)*areaSqM*quantity;
      const addOns=(line.motorized?50*quantity:0)+10*Math.max(0,Math.floor(Number(line.remoteQuantity)||0));
      return {baseRetail,addOns};
    });
    const baseRetail=priced.reduce((sum,line)=>sum+line.baseRetail,0);
    const addOns=priced.reduce((sum,line)=>sum+line.addOns,0);
    const retail=baseRetail+addOns;
    const discount=profile?.status==="active"?profile.discountPercent:0;
    const wholesale=baseRetail*(1-discount/100)+addOns;
    return {retail:Math.round(retail*100)/100,discount,wholesale:Math.round(wholesale*100)/100,baseRetail,addOns};
  },[orderLines,profile]);

  const saveQuote=async()=>{
    setMessage("Saving…");
    const res=await fetch("/api/quotes",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({...form,width:Number(form.width),height:Number(form.height),quantity:Number(form.quantity),retailTotal:totals.retail})});
    const data=await res.json();
    setMessage(res.ok ? `Quote ${data.quote.quoteNumber} saved.` : (data.error ?? "Unable to save quote."));
  };
  const updateWindow=(id:string,patch:Partial<WindowLine>)=>setWindows(lines=>lines.map(line=>line.id===id?{...line,...patch}:line));
  const addWindow=()=>{
    const first=zCatalog[0];
    setWindows(lines=>[...lines,{id:crypto.randomUUID(),room:"",fabricCode:first?.fabricCode??"",productId:first?.id??"",width:"36",height:"60",quantity:"1",mount:"Inside",motorized:false,remoteQuantity:"0"}]);
  };
  const saveOrder=async()=>{
    setSavingOrder(true); setMessage(t("正在保存订单…","Saving order…"));
    try{
      const res=await fetch("/api/orders",{method:editingOrderId?"PATCH":"POST",headers:{"content-type":"application/json"},body:JSON.stringify({
        ...(editingOrderId?{id:editingOrderId,action:"save"}:{}),projectName:zForm.projectName,
        items:windows.map(line=>({room:line.room,itemId:line.productId,width:Number(line.width),height:Number(line.height),quantity:Number(line.quantity),mount:line.mount,motorized:line.motorized,remoteQuantity:Number(line.remoteQuantity)})),
      })});
      const data=await res.json();
      if(!res.ok)throw new Error(data.error??t("订单保存失败","Unable to save order"));
      setMessage(t(`订单 ${data.order.orderNumber} 已保存。`,`Order ${data.order.orderNumber} saved.`));
      setEditingOrderId(null);
      const list=await fetch("/api/orders").then(r=>r.json());
      setOrders(list.orders??[]);
    }catch(error){setMessage(error instanceof Error?error.message:t("订单保存失败","Unable to save order"));}
    finally{setSavingOrder(false);}
  };
  const editOrder=(order:SavedOrder)=>{
    if(order.status==="confirmed") return;
    const items=JSON.parse(order.itemsJson) as Array<{room?:string;itemId?:string;width?:number;height?:number;quantity?:number;mount?:string;motorized?:boolean;remoteQuantity?:number}>;
    setZForm({projectName:order.projectName??""});
    setWindows(items.map((item,index)=>{
      const product=zCatalog.find(product=>product.id===item.itemId);
      return {id:`edit-${order.id}-${index}`,room:item.room??"",fabricCode:product?.fabricCode??"",
        productId:item.itemId??"",width:String(item.width??36),height:String(item.height??60),
        quantity:String(item.quantity??1),mount:item.mount??"Inside",motorized:Boolean(item.motorized),remoteQuantity:String(item.remoteQuantity??0)};
    }));
    setEditingOrderId(order.id);
    window.scrollTo({top:0,behavior:"smooth"});
    setMessage(t(`正在修改订单 ${order.orderNumber}`,`Editing order ${order.orderNumber}`));
  };
  const cancelEditOrder=()=>{
    const first=zCatalog[0];
    setEditingOrderId(null); setZForm({projectName:""});
    setWindows([{id:crypto.randomUUID(),room:"",fabricCode:first?.fabricCode??"",productId:first?.id??"",width:"36",height:"60",quantity:"1",mount:"Inside",motorized:false,remoteQuantity:"0"}]);
  };
  const confirmOrder=async(order:SavedOrder)=>{
    if(!window.confirm(t(
      `确认订单 ${order.orderNumber}？确认后不能再修改，并会生成 Invoice。`,
      `Confirm order ${order.orderNumber}? It will be locked and an invoice will be created.`,
    ))) return;
    setSavingOrder(true);
    try{
      const res=await fetch("/api/orders",{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({id:order.id,action:"confirm"})});
      const data=await res.json();
      if(!res.ok) throw new Error(data.error??t("确认失败","Confirmation failed"));
      const list=await fetch("/api/orders").then(r=>r.json());
      setOrders(list.orders??[]);
      setMessage(t(`订单已确认，Invoice ${data.order.invoiceNumber} 已生成。`,`Order confirmed. Invoice ${data.order.invoiceNumber} created.`));
    }catch(error){setMessage(error instanceof Error?error.message:t("确认失败","Confirmation failed"));}
    finally{setSavingOrder(false);}
  };
  const deleteOrder=async(order:SavedOrder)=>{
    if(!window.confirm(t(`确定删除草稿订单 ${order.orderNumber}？此操作不可撤销。`,`Delete draft order ${order.orderNumber}? This cannot be undone.`)))return;
    setSavingOrder(true);
    try{
      const res=await fetch("/api/orders",{method:"DELETE",headers:{"content-type":"application/json"},body:JSON.stringify({id:order.id})});
      const data=await res.json();
      if(!res.ok)throw new Error(data.error??t("删除失败","Delete failed"));
      setOrders(current=>current.filter(item=>item.id!==order.id));
      if(editingOrderId===order.id)cancelEditOrder();
      setMessage(t(`订单 ${order.orderNumber} 已删除。`,`Order ${order.orderNumber} deleted.`));
    }catch(error){setMessage(error instanceof Error?error.message:t("删除失败","Delete failed"));}
    finally{setSavingOrder(false);}
  };
  const emailInvoice=(order:SavedOrder)=>{
    const subject=encodeURIComponent(`Invoice ${order.invoiceNumber} — Braun Blinds`);
    const body=encodeURIComponent(`Hello,\n\nYour order ${order.orderNumber} has been confirmed. Invoice ${order.invoiceNumber} is ready in your Braun Blinds Customer Portal.\n\nWholesale total: ${money(order.wholesaleTotal)}\n\nThank you.`);
    window.location.href=`mailto:${profile?.email??""}?subject=${subject}&body=${body}`;
  };
  const updateCustomer=async(c:Customer)=>{
    setSavingCustomerId(c.id); setAdminFeedback(null);
    try{
      const res=await fetch("/api/customers",{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify(c)});
      const data=await res.json();
      if(!res.ok) throw new Error(data.error??t("保存失败","Save failed"));
      setAdminFeedback({type:"ok",text:t(`${c.companyName||c.email} 已保存。`,`${c.companyName||c.email} saved.`)});
      if(c.newPassword) setCreatedCredentials({company:c.companyName||c.email,username:c.username||"",password:c.newPassword});
      await loadCustomers();
    }catch(error){
      setAdminFeedback({type:"error",text:error instanceof Error?error.message:t("保存失败，请重试。","Save failed. Please try again.")});
    }finally{setSavingCustomerId(null);}
  };
  const testCustomer=async(c:Customer)=>{
    setSavingCustomerId(c.id); setAdminFeedback(null);
    try{
      const res=await fetch("/api/customers/test-login",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({id:c.id})});
      const data=await res.json();
      if(!res.ok) throw new Error(data.error??t("无法测试此账号","Unable to test this account"));
      window.location.href="/?preview=customer";
    }catch(error){
      setAdminFeedback({type:"error",text:error instanceof Error?error.message:t("测试登录失败","Test login failed")});
      setSavingCustomerId(null);
    }
  };
  const credentialText=(details:{company:string;username:string;password:string})=>t(
    `Braun Blinds 客户门户\n网址：https://braun-wholesale-portal.sundagang91709.chatgpt.site\n用户名：${details.username}\n密码：${details.password}`,
    `Braun Blinds Customer Portal\nWebsite: https://braun-wholesale-portal.sundagang91709.chatgpt.site\nUsername: ${details.username}\nPassword: ${details.password}`,
  );
  const copyCustomer=async(c:Customer)=>{
    setSavingCustomerId(c.id); setAdminFeedback(null);
    try{
      const res=await fetch("/api/customers",{method:"PUT",headers:{"content-type":"application/json"},body:JSON.stringify({id:c.id})});
      const data=await res.json();
      if(!res.ok) throw new Error(data.error??t("复制失败","Copy failed"));
      const details={company:data.company,username:data.username,password:data.password};
      setCreatedCredentials(details);
      try{
        await navigator.clipboard.writeText(credentialText(details));
        setCopiedCredentials(true);
        window.setTimeout(()=>setCopiedCredentials(false),1800);
        setAdminFeedback({type:"ok",text:t("当前账号密码已复制，密码没有改变。","Current login details copied. The password was not changed.")});
      }catch{
        setAdminFeedback({type:"ok",text:t("账号密码已显示，请点击上方“复制账号密码”。","Login details are shown. Click “Copy Login Details” above.")});
      }
    }catch(error){
      setAdminFeedback({type:"error",text:error instanceof Error?error.message:t("复制失败，请重试。","Copy failed. Please try again.")});
    }finally{setSavingCustomerId(null);}
  };
  const deleteCustomer=async(c:Customer)=>{
    const name=c.companyName||c.username||c.email;
    if(!window.confirm(t(
      `确定删除客户“${name}”吗？删除后该账号将立即无法登录，此操作不可撤销。`,
      `Delete customer “${name}”? The account will immediately lose access. This cannot be undone.`,
    ))) return;
    setDeletingCustomerId(c.id); setAdminFeedback(null);
    try{
      const res=await fetch("/api/customers",{method:"DELETE",headers:{"content-type":"application/json"},body:JSON.stringify({id:c.id})});
      const data=await res.json();
      if(!res.ok) throw new Error(data.error??t("删除失败","Delete failed"));
      setCustomers(current=>current.filter(customer=>customer.id!==c.id));
      setAdminFeedback({type:"ok",text:t(`客户 ${name} 已删除。`,`Customer ${name} deleted.`)});
      await loadCustomers();
    }catch(error){
      setAdminFeedback({type:"error",text:error instanceof Error?error.message:t("删除失败，请重试。","Delete failed. Please try again.")});
    }finally{setDeletingCustomerId(null);}
  };
  const createCustomer=async()=>{
    setCreatingCustomer(true); setAdminFeedback(null);
    try{
      const res=await fetch("/api/customers",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(newCustomer)});
      const data=await res.json();
      if(!res.ok) throw new Error(data.error??t("创建失败","Create failed"));
      setAdminFeedback({type:"ok",text:t(`客户账号 ${data.customer.username} 已创建。`,`Customer account ${data.customer.username} created.`)});
      setCreatedCredentials({company:newCustomer.companyName||newCustomer.contactName||newCustomer.username,username:newCustomer.username,password:newCustomer.password});
      setCustomers(current=>[data.customer,...current.filter(customer=>customer.id!==data.customer.id)]);
      setNewCustomer({username:"",password:"",email:"",companyName:"",contactName:"",phone:"",discountPercent:0,status:"active"});
      await loadCustomers();
    }catch(error){
      setAdminFeedback({type:"error",text:error instanceof Error?error.message:t("创建失败，请重试。","Create failed. Please try again.")});
    }finally{setCreatingCustomer(false);}
  };
  const changePassword=async()=>{
    if(passwordForm.newPassword!==passwordForm.confirmPassword){setMessage("两次新密码不一致 / New passwords do not match");return;}
    const res=await fetch("/api/auth/change-password",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(passwordForm)});
    const data=await res.json();
    setMessage(res.ok?"密码已修改 / Password updated":(data.error??"Unable to update password."));
    if(res.ok)setPasswordForm({currentPassword:"",newPassword:"",confirmPassword:""});
  };
  const signOut=async()=>{
    if(customerAuth){await fetch("/api/auth/logout",{method:"POST"});window.location.href="/";}else window.location.href=signOutPath;
  };
  const copyCredentials=async()=>{
    if(!createdCredentials)return;
    await navigator.clipboard.writeText(credentialText(createdCredentials));
    setCopiedCredentials(true);
    window.setTimeout(()=>setCopiedCredentials(false),1800);
  };

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div><div className="brand-row"><div className="brand-mark small-mark">B</div><div><strong>BRAUN BLINDS</strong><span>Customer Portal</span></div></div>
          <nav>
            {!user.isAdmin && <button className={tab==="zseries"?"active":""} onClick={()=>setTab("zseries")}>{t("Z 系列","Z Series")}</button>}
            {!user.isAdmin && <button onClick={()=>window.open("/api/downloads/product-guide","_blank","noopener,noreferrer")}>{t("产品说明书","Product Guide")}</button>}
            {!user.isAdmin && <button className={tab==="account"?"active":""} onClick={()=>setTab("account")}>{t("修改密码","Change Password")}</button>}
            {user.isAdmin && <button className={tab==="admin"?"active":""} onClick={()=>setTab("admin")}>{t("客户价格管理","Customer Pricing")}</button>}
            {user.isAdmin && <button onClick={()=>window.open("https://braun-blinds-portal.sundagang91709.chatgpt.site","_blank","noopener,noreferrer")}>{t("Smart 业务门户","Smart Business Portal")}</button>}
            {user.isAdmin && <button onClick={()=>window.open("https://braunblinds-private-portal.sundagang91709.chatgpt.site","_blank","noopener,noreferrer")}>{t("Private 业务工具","Private Business Tools")}</button>}
          </nav>
        </div>
        <div className="account"><span>{user.displayName}</span><small>{user.email}</small><button onClick={signOut}>{t("退出","Sign out")}</button></div>
      </aside>
      <section className="content">
        <div className="top-actions"><button className="language-toggle" onClick={()=>setLang(lang==="zh"?"en":"zh")}>{lang==="zh"?"English":"中文"}</button></div>
        <header><div><p className="eyebrow">{user.isAdmin?t("管理中心","ADMINISTRATION"):t("客户价格","CUSTOMER PRICING")}</p><h1>{user.isAdmin?t("客户管理","Customer Management"):tab==="zseries"?t("Z 系列罗马帘","Z Series Roman Shades"):t("产品报价","Product Quote")}</h1></div><div className="status-pill">{profile?.status==="active"?t("已批准","Approved"):user.isAdmin?t("管理员账号","Owner Account"):t("等待批准","Approval Pending")}</div></header>
        {message && <div className="notice" onClick={()=>setMessage("")}>{message}</div>}
        {user.isAdmin ? (
          <div className="panel">
            <div className="admin-create">
              <div className="panel-title"><div><h2>{t("创建客户账号","Create Customer Login")}</h2><p>{t("设置用户名、初始密码、状态和专属折扣。","Set username, initial password, status and private discount.")}</p></div></div>
              <div className="create-grid">
                <label>{t("用户名","Username")}<input value={newCustomer.username} onChange={e=>setNewCustomer({...newCustomer,username:e.target.value})}/></label>
                <label>{t("初始密码","Initial Password")}<input type="text" value={newCustomer.password} onChange={e=>setNewCustomer({...newCustomer,password:e.target.value})}/></label>
                <label>{t("公司","Company")}<input value={newCustomer.companyName} onChange={e=>setNewCustomer({...newCustomer,companyName:e.target.value})}/></label>
                <label>{t("联系人","Contact")}<input value={newCustomer.contactName} onChange={e=>setNewCustomer({...newCustomer,contactName:e.target.value})}/></label>
                <label>{t("电话号码","Phone Number")}<input type="tel" value={newCustomer.phone} onChange={e=>setNewCustomer({...newCustomer,phone:e.target.value})}/></label>
                <label>{t("邮箱（可选）","Email (optional)")}<input type="email" value={newCustomer.email} onChange={e=>setNewCustomer({...newCustomer,email:e.target.value})}/></label>
                <label>{t("折扣 %","Discount %")}<input type="number" min="0" max="90" value={newCustomer.discountPercent} onChange={e=>setNewCustomer({...newCustomer,discountPercent:Number(e.target.value)})}/></label>
                <label>{t("状态","Status")}<select value={newCustomer.status} onChange={e=>setNewCustomer({...newCustomer,status:e.target.value})}><option value="active">{t("启用","Active")}</option><option value="pending">{t("暂停","Pending")}</option></select></label>
                <button type="button" className="save-small" disabled={creatingCustomer} onClick={createCustomer}>{creatingCustomer?t("创建中…","Creating…"):t("创建","Create")}</button>
              </div>
              {adminFeedback&&<div className={`admin-feedback ${adminFeedback.type}`}>{adminFeedback.text}</div>}
              {createdCredentials&&<div className="credentials-card">
                <div><span>{t("客户登录信息","Customer Login Details")}</span><strong>{createdCredentials.company}</strong></div>
                <div><span>{t("用户名","Username")}</span><code>{createdCredentials.username}</code></div>
                <div><span>{t("密码","Password")}</span><code>{createdCredentials.password}</code></div>
                <button type="button" onClick={copyCredentials}>{copiedCredentials?t("已复制","Copied"):t("复制账号密码","Copy Login Details")}</button>
              </div>}
            </div>
            <div className="panel-title"><div><h2>{t("客户账号","Customer Accounts")}</h2><p>{t("管理客户状态、折扣和密码。","Manage customer status, discounts and passwords.")}</p></div><span>{customers.length} {t("个账号","accounts")}</span></div>
            <div className="customer-list">
              {customers.length===0 && <div className="empty">{t("还没有客户账号。","No customer accounts yet.")}</div>}
              {customers.map((c,i)=><div className="customer-row" key={c.email}>
                <div className="customer-identity"><strong>{c.companyName||"New customer"}</strong><span>{c.username} · {c.email}</span></div>
                <label>{t("公司","Company")}<input value={c.companyName} onChange={e=>setCustomers(x=>x.map((v,n)=>n===i?{...v,companyName:e.target.value}:v))}/></label>
                <label>{t("电话号码","Phone Number")}<input type="tel" value={c.phone??""} onChange={e=>setCustomers(x=>x.map((v,n)=>n===i?{...v,phone:e.target.value}:v))}/></label>
                <label>{t("折扣 %","Discount %")}<input type="number" min="0" max="90" value={c.discountPercent} onChange={e=>setCustomers(x=>x.map((v,n)=>n===i?{...v,discountPercent:Number(e.target.value)}:v))}/></label>
                <label>{t("状态","Status")}<select value={c.status} onChange={e=>setCustomers(x=>x.map((v,n)=>n===i?{...v,status:e.target.value}:v))}><option value="pending">{t("暂停","Pending")}</option><option value="active">{t("启用","Active")}</option></select></label>
                <label>{t("保存当前密码","Save Current Password")}<input type="text" placeholder={t("旧账号首次录入时填写","Enter once for existing accounts")} value={c.newPassword??""} onChange={e=>setCustomers(x=>x.map((v,n)=>n===i?{...v,newPassword:e.target.value}:v))}/></label>
                <div className="row-actions">
                  <button type="button" className="save-small" disabled={savingCustomerId===c.id||deletingCustomerId===c.id} onClick={()=>updateCustomer(c)}>{savingCustomerId===c.id?t("处理中…","Working…"):t("保存","Save")}</button>
                  <button type="button" className="test-small" disabled={savingCustomerId===c.id||deletingCustomerId===c.id} onClick={()=>testCustomer(c)}>{t("进入客户系统","Enter Customer Portal")}</button>
                  <button type="button" className="copy-small" disabled={savingCustomerId===c.id||deletingCustomerId===c.id} onClick={()=>copyCustomer(c)}>{t("复制账号密码","Copy Login Details")}</button>
                  <button type="button" className="delete-small" disabled={savingCustomerId===c.id||deletingCustomerId===c.id} onClick={()=>deleteCustomer(c)}>{deletingCustomerId===c.id?t("删除中…","Deleting…"):t("删除","Delete")}</button>
                </div>
              </div>)}
            </div>
          </div>
        ):tab==="account"?(
          <div className="panel password-panel">
            <h2>{t("修改密码","Change Password")}</h2>
            <p>{t("新密码至少 8 位。","New password must be at least 8 characters.")}</p>
            <div className="password-fields">
              <label>{t("当前密码","Current Password")}<input type="password" value={passwordForm.currentPassword} onChange={e=>setPasswordForm({...passwordForm,currentPassword:e.target.value})}/></label>
              <label>{t("新密码","New Password")}<input type="password" value={passwordForm.newPassword} onChange={e=>setPasswordForm({...passwordForm,newPassword:e.target.value})}/></label>
              <label>{t("确认新密码","Confirm Password")}<input type="password" value={passwordForm.confirmPassword} onChange={e=>setPasswordForm({...passwordForm,confirmPassword:e.target.value})}/></label>
              <button className="primary-btn" onClick={changePassword}>{t("保存新密码","Save Password")}</button>
            </div>
          </div>
        ):tab==="zseries"?(
          <>
            {profile?.status!=="active" && <div className="approval-card"><strong>{t("账户正在等待批准。","Your account is awaiting approval.")}</strong><span>{t("Braun Blinds 批准账户并设置专属折扣后，价格才会显示。","Pricing appears after Braun Blinds approves your account and assigns your discount.")}</span></div>}
            <div className="resource-bar">
              <div><strong>{t("Z 系列罗马帘价格计算器","Z Series Roman Shade Calculator")}</strong><span>{t("800 个基础组合 · 支持 AOK 电动款 · 按平方米计价","800 base combinations · AOK motorized option · priced by square meter")}</span></div>
              <div className="resource-actions">
                <button onClick={()=>{window.location.href="/api/downloads/price-list"}}>{t("下载价格表","Download Price List")}</button>
                <button className="guide-button" onClick={()=>window.open("/api/downloads/product-guide","_blank","noopener,noreferrer")}>{t("产品说明书（中英文）","Product Guide (CN / EN)")}</button>
              </div>
            </div>
            <div className="quote-grid">
              <div className="panel form-panel">
                <h2>{t("产品信息","Product Information")}</h2>
                <label className="project-field">{t("项目名称 / 侧标","Project / Sidemark")}<input value={zForm.projectName} onChange={e=>setZForm({...zForm,projectName:e.target.value})}/></label>
                <div className="window-list">
                  {orderLines.map(({line,item},index)=>{
                    const options=zCatalog.filter(product=>product.fabricCode===line.fabricCode);
                    return <div className="window-card" key={line.id}>
                      <div className="window-heading"><strong>{t(`窗户 ${index+1}`,`Window ${index+1}`)}</strong>{windows.length>1&&<button type="button" onClick={()=>setWindows(lines=>lines.filter(v=>v.id!==line.id))}>{t("删除","Remove")}</button>}</div>
                      <div className="window-fields">
                        <label>{t("房间 / 位置","Room / Location")}<input value={line.room} onChange={e=>updateWindow(line.id,{room:e.target.value})}/></label>
                        <label>{t("面料编号","Fabric Code")}<select value={line.fabricCode} onChange={e=>{const next=e.target.value;const first=zCatalog.find(p=>p.fabricCode===next);updateWindow(line.id,{fabricCode:next,productId:first?.id??""})}}>{fabricCodes.map(code=><option key={code}>{code}</option>)}</select></label>
                        <label className="wide-window">{t("产品配置（中英文）","Product Configuration (Chinese / English)")}<select value={item?.id??""} onChange={e=>updateWindow(line.id,{productId:e.target.value})}>{options.map(product=><option key={product.id} value={product.id}>{product.productCode} · {product.system} · {product.style} · {product.structure} · {product.construction}</option>)}</select></label>
                        <label>{t("安装方式","Mount")}<select value={line.mount} onChange={e=>updateWindow(line.id,{mount:e.target.value})}><option value="Inside">{t("内装","Inside")}</option><option value="Outside">{t("外装","Outside")}</option></select></label>
                        <label>{t("宽度（英寸）","Width (in)")}<input type="number" min="1" value={line.width} onChange={e=>updateWindow(line.id,{width:e.target.value})}/></label>
                        <label>{t("高度（英寸）","Height (in)")}<input type="number" min="1" value={line.height} onChange={e=>updateWindow(line.id,{height:e.target.value})}/></label>
                        <label>{t("数量","Quantity")}<input type="number" min="1" value={line.quantity} onChange={e=>updateWindow(line.id,{quantity:e.target.value})}/></label>
                        <label>{t("操作方式","Operation")}<select value={line.motorized?"motorized":"standard"} onChange={e=>updateWindow(line.id,{motorized:e.target.value==="motorized"})}><option value="standard">{t("标准系统","Standard System")}</option><option value="motorized">{t("AOK 电动款（每樘 +$50，无折扣）","AOK Motorized (+$50/shade, no discount)")}</option></select></label>
                        <label>{t("遥控器数量（每个 +$10，无折扣）","Remote Quantity (+$10 each, no discount)")}<input type="number" min="0" step="1" value={line.remoteQuantity} onChange={e=>updateWindow(line.id,{remoteQuantity:e.target.value})}/></label>
                      </div>
                      {item&&<div className="window-summary"><span>{bi(item.system)} · {bi(item.style)} · {bi(item.structure)} · {bi(item.construction)}</span><span>{t("计价面积","Billable Area")}: {Math.max(1,(Number(line.width)||0)*(Number(line.height)||0)*0.00064516).toFixed(2)}㎡ · {t("最低 1㎡","1㎡ minimum")}<br/>{t("尺寸限制","Size Limits")}: {item.limits}</span><strong>{t("基础零售单价","Base Retail Rate")}: {money(item.retail)}/㎡</strong></div>}
                    </div>;
                  })}
                </div>
                <button type="button" className="add-window" onClick={addWindow}>＋ {t("添加窗户","Add Window")}</button>
              </div>
              <div className="price-card">
                <p>{t("价格汇总","PRICING SUMMARY")}</p>
                <div className="product-chip">{windows.length} {t("个窗户","windows")}</div>
                <div className="discount-banner"><span>{t("您的客户折扣","Your Customer Discount")}</span><strong>{orderTotals.discount}%</strong></div>
                {orderTotals.addOns>0&&<div className="addon-summary"><span>{t("AOK 电机及遥控器（无折扣）","AOK Motor & Remotes (no discount)")}</span><strong>{money(orderTotals.addOns)}</strong></div>}
                <div className="retail"><span>{t("建议零售价","Suggested Retail")}</span><strong>{profile?.status==="active"?money(orderTotals.retail):"—"}</strong></div>
                <div className="wholesale"><span>{t("您的批发价","Your Wholesale Price")}</span><strong>{profile?.status==="active"?money(orderTotals.wholesale):t("等待批准","Pending")}</strong></div>
                {profile?.status==="active" && <div className="savings">{t("节省","Savings")}: {money(orderTotals.retail-orderTotals.wholesale)}</div>}
                <button className="primary-btn full" disabled={profile?.status!=="active"||savingOrder} onClick={saveOrder}>{savingOrder?t("保存中…","Saving…"):editingOrderId?t("保存修改","Save Changes"):t("保存订单","Save Order")}</button>
                {editingOrderId&&<button className="cancel-edit" type="button" onClick={cancelEditOrder}>{t("取消修改","Cancel Editing")}</button>}
                <small>{t("最终价格需核对产品编码、尺寸和工艺。运费与安装费另计。","Final pricing is subject to product-code, dimension and construction review. Shipping and installation are not included.")}</small>
              </div>
            </div>
            <div className="panel orders-panel">
              <div className="panel-title"><div><h2>{t("我的订单","My Orders")}</h2><p>{t("未确认订单可以修改；确认后自动生成 Invoice。","Draft orders can be edited. Confirmed orders generate an invoice.")}</p></div><span>{orders.length}</span></div>
              {orders.length===0?<div className="empty">{t("还没有保存订单。","No saved orders yet.")}</div>:[...orders].sort((a,b)=>{
                if(a.invoiceNumber&&b.invoiceNumber)return Number(b.invoiceNumber)-Number(a.invoiceNumber);
                if(a.invoiceNumber)return 1;
                if(b.invoiceNumber)return -1;
                return new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime();
              }).map(order=><div className="order-block" key={order.id}>
                <div className="order-row">
                  <div><strong>{order.invoiceNumber?`Invoice ${order.invoiceNumber}`:order.orderNumber}</strong><span>{order.invoiceNumber?`${t("订单","Order")} ${order.orderNumber} · `:""}{order.projectName||t("无项目名称","No project name")} · {new Date(order.createdAt).toLocaleDateString()}</span><em className={order.status==="confirmed"?"confirmed":"draft"}>{order.status==="confirmed"?t("已确认","Confirmed"):t("草稿","Draft")}</em></div>
                  <div><span>{t("折扣","Discount")}</span><strong>{order.discountPercent}%</strong></div>
                  <div><span>{t("批发总价","Wholesale Total")}</span><strong>{money(order.wholesaleTotal)}</strong></div>
                  <div className="order-actions">
                    <button type="button" className="detail-order" onClick={()=>setExpandedOrderId(expandedOrderId===order.id?null:order.id)}>{expandedOrderId===order.id?t("收起明细","Hide Details"):t("查看明细","View Details")}</button>
                    {order.status!=="confirmed"&&<button type="button" onClick={()=>editOrder(order)}>{t("修改","Edit")}</button>}
                    {order.status!=="confirmed"&&<button type="button" className="confirm-order" disabled={savingOrder} onClick={()=>confirmOrder(order)}>{t("确认订单","Confirm Order")}</button>}
                    {order.status!=="confirmed"&&<button type="button" className="delete-order" disabled={savingOrder} onClick={()=>deleteOrder(order)}>{t("删除订单","Delete Order")}</button>}
                    {order.status==="confirmed"&&<button type="button" onClick={()=>window.open(`/api/orders/${order.id}/invoice`,"_blank","noopener,noreferrer")}>{t("查看 Invoice","View Invoice")}</button>}
                    {order.status==="confirmed"&&<button type="button" className="email-order" onClick={()=>emailInvoice(order)}>{t("回复邮件","Email Customer")}</button>}
                    <button type="button" className="secondary-order" onClick={()=>{window.location.href=`/api/orders/${order.id}/download`}}>{t("下载明细","Download Details")}</button>
                  </div>
                </div>
                {expandedOrderId===order.id&&<div className="order-detail">
                  <div className="order-detail-head"><strong>{t("订单产品明细","Order Item Details")}</strong><span>{t(`共 ${JSON.parse(order.itemsJson).length} 个窗位`,`${JSON.parse(order.itemsJson).length} window(s)`)}</span></div>
                  <div className="order-detail-table"><table><thead><tr><th>#</th><th>{t("房间 / 产品","Room / Product")}</th><th>{t("配置","Configuration")}</th><th>{t("尺寸 / 面积","Size / Area")}</th><th>{t("数量","Qty")}</th><th>{t("批发价","Wholesale")}</th></tr></thead><tbody>{(JSON.parse(order.itemsJson) as SavedOrderItem[]).map((item,index)=><tr key={`${order.id}-${index}`}><td>{index+1}</td><td><strong>{item.room||"—"}</strong><span>{item.fabricCode} / {item.productCode}</span></td><td>{bi(item.system||"")} · {bi(item.style||"")}<span>{bi(item.structure||"")} · {bi(item.construction||"")}{item.motorized?` · AOK ${t("电动","Motorized")}`:""}{Number(item.remoteQuantity)>0?` · ${t("遥控器","Remote")} × ${item.remoteQuantity}`:""}</span></td><td>{item.width} × {item.height} in<span>{Number(item.areaSqM).toFixed(3)} m² · {item.mount}</span></td><td>{item.quantity}</td><td><strong>{money(Number(item.lineWholesale)||0)}</strong></td></tr>)}</tbody></table></div>
                </div>}
              </div>)}
            </div>
          </>
        ):(
          <>
            {profile?.status!=="active" && <div className="approval-card"><strong>{t("账户正在等待批准。","Your account is awaiting approval.")}</strong><span>{t("设置专属折扣后才会显示产品价格。","Product prices remain hidden until your discount is assigned.")}</span></div>}
            <div className="quote-grid">
              <div className="panel form-panel">
                <h2>{t("产品信息","Product Information")}</h2>
                <div className="fields">
                  <label className="wide">{t("项目名称 / 侧标","Project / Sidemark")}<input value={form.projectName} onChange={e=>setForm({...form,projectName:e.target.value})} placeholder={t("客户或项目名称","Customer or project name")}/></label>
                  <label className="wide">{t("产品","Product")}<select value={form.product} onChange={e=>setForm({...form,product:e.target.value})}>{Object.entries(CATALOG).map(([k,v])=><option key={k} value={k}>{lang==="zh"?v.zh:v.en}</option>)}</select></label>
                  <label>{t("面料组","Fabric Group")}<input value={form.fabricGroup} onChange={e=>setForm({...form,fabricGroup:e.target.value})}/></label>
                  <label>{t("安装方式","Mount")}<select value={form.mount} onChange={e=>setForm({...form,mount:e.target.value})}><option value="Inside">{t("内装","Inside")}</option><option value="Outside">{t("外装","Outside")}</option></select></label>
                  <label>{t("宽度（英寸）","Width (in)")}<input type="number" min="1" value={form.width} onChange={e=>setForm({...form,width:e.target.value})}/></label>
                  <label>{t("高度（英寸）","Height (in)")}<input type="number" min="1" value={form.height} onChange={e=>setForm({...form,height:e.target.value})}/></label>
                  <label>{t("数量","Quantity")}<input type="number" min="1" value={form.quantity} onChange={e=>setForm({...form,quantity:e.target.value})}/></label>
                  <label>{t("控制方式","Control")}<select value={form.control} onChange={e=>setForm({...form,control:e.target.value})}><option>Cordless</option><option>Cord Loop</option><option>Motorized</option></select></label>
                  <label className="wide">{t("衬布","Lining")}<select value={form.lining} onChange={e=>setForm({...form,lining:e.target.value})}><option>Privacy</option><option>Blackout</option><option>Unlined</option></select></label>
                </div>
              </div>
              <div className="price-card">
                <p>{t("价格汇总","PRICING SUMMARY")}</p><div className="product-chip">{lang==="zh"?CATALOG[form.product].zh:CATALOG[form.product].en}</div>
                <div className="metric"><span>{t("计算面积","Calculated Area")}</span><strong>{totals.sqft.toFixed(2)} sq ft × {form.quantity}</strong></div>
                {!totals.configured && <div className="savings">{t("此产品基础价格尚未设置。","This product’s approved base price has not been configured.")}</div>}
                <div className="retail"><span>{t("建议零售价","Suggested Retail")}</span><strong>{profile?.status==="active"&&totals.configured?money(totals.retail):"—"}</strong></div>
                <div className="wholesale"><span>{t("您的批发价","Your Wholesale Price")}</span><strong>{profile?.status!=="active"?t("等待批准","Pending"):totals.configured?money(totals.wholesale):t("未设置","Not Configured")}</strong></div>
                {profile?.status==="active" && totals.configured && <div className="savings">{t(`您的 ${totals.discount}% 折扣节省 ${money(totals.retail-totals.wholesale)}`,`Your ${totals.discount}% partner discount saves ${money(totals.retail-totals.wholesale)}`)}</div>}
                <button className="primary-btn full" disabled={profile?.status!=="active"||!totals.configured} onClick={saveQuote}>{t("保存报价","Save Quote")}</button>
                <small>{t("最终价格需审核规格。运费与安装费另计。","Final pricing is subject to specification review. Shipping and installation are not included.")}</small>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

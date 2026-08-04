"use client";

import { useEffect, useMemo, useState } from "react";
import { UNIFIED_MODULES } from "@/lib/unified-modules";
import commonEn from "@/locales/en/common.json";import commonZh from "@/locales/zh-CN/common.json";

type Role = "owner" | "sales" | "factory" | "installer" | "customer";
type CurrentUser = { displayName:string; email:string; phone:string; role:Role; preferredLocale:"en"|"zh-CN" };

const roleNames:Record<Role,{zh:string;en:string}> = {
  owner:{zh:"老板 / 管理员",en:"Owner / Admin"},
  sales:{zh:"销售",en:"Sales"},
  factory:{zh:"工厂",en:"Factory"},
  installer:{zh:"安装工",en:"Installer"},
  customer:{zh:"客户",en:"Customer"},
};

export default function UnifiedHubPage(){
  const [lang,setLang]=useState<"zh-CN"|"en">("zh-CN");
  const [user,setUser]=useState<CurrentUser|null>(null);
  const [loading,setLoading]=useState(true);
  const [phone,setPhone]=useState("");
  const [phoneSaving,setPhoneSaving]=useState(false);
  const [phoneMessage,setPhoneMessage]=useState("");

  useEffect(()=>{
    fetch("/api/v4/auth/me",{cache:"no-store"})
      .then(async response=>response.ok?response.json():null)
      .then(data=>{
        if(data?.authenticated&&data.user?.role){
          const nextUser:CurrentUser={displayName:data.user.displayName||data.user.username||data.user.email,email:data.user.email,phone:data.user.phone||"",role:data.user.role,preferredLocale:data.user.preferredLocale==="en"?"en":"zh-CN"};
          setUser(nextUser);
          setPhone(nextUser.phone);
          setLang(nextUser.preferredLocale);
        }
      })
      .finally(()=>setLoading(false));
  },[]);

  const modules=useMemo(()=>{
    const role=user?.role||"customer";
    return UNIFIED_MODULES.filter(module=>module.roles.includes(role));
  },[user]);

  const t=(zh:string,en:string)=>lang==="zh-CN"?zh:en;const common=lang==="zh-CN"?commonZh:commonEn;
  const changeLanguage=async()=>{const preferredLocale=lang==="zh-CN"?"en":"zh-CN";setLang(preferredLocale);if(user){const response=await fetch("/api/v4/auth/me",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({preferredLocale})});if(response.ok)setUser(current=>current?{...current,preferredLocale}:current)}};
  const statusLabel=(status:"available"|"migrating"|"planned")=>{
    if(status==="available")return t("可使用","Available");
    if(status==="migrating")return t("正在整合","Migrating");
    return t("计划中","Planned");
  };
  const savePhone=async()=>{
    if(phoneSaving)return;
    setPhoneSaving(true);setPhoneMessage("");
    try{
      const response=await fetch("/api/v4/auth/me",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone})});
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||t("保存失败","Save failed"));
      setUser(current=>current?{...current,phone:data.phone}:current);
      setPhone(data.phone);
      setPhoneMessage(t("手机号已保存","Phone number saved"));
    }catch(reason){setPhoneMessage(reason instanceof Error?reason.message:t("保存失败","Save failed"))}finally{setPhoneSaving(false)}
  };

  return <main style={{minHeight:"100vh",background:"#f4f1ea",fontFamily:"Arial, PingFang SC, sans-serif",color:"#1f2a25"}}>
    <header style={{background:"#173f35",color:"white",padding:"20px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,flexWrap:"wrap"}}>
      <div><div style={{fontSize:13,opacity:.78,letterSpacing:1.2}}>BRAUN INTERNATIONAL, LLC</div><h1 style={{margin:"6px 0 0",fontSize:28}}>{t("Braun Smart Portal 统一入口","Braun Smart Portal Unified Hub")}</h1></div>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        {user&&<span style={{fontSize:14}}>{user.displayName} · {lang==="zh-CN"?roleNames[user.role].zh:roleNames[user.role].en}</span>}
        <button aria-label={common.language} onClick={()=>void changeLanguage()} style={{border:"1px solid rgba(255,255,255,.45)",background:"transparent",color:"white",borderRadius:9,padding:"9px 12px",cursor:"pointer"}}>{common.language}</button>
      </div>
    </header>

    <section style={{maxWidth:1180,margin:"0 auto",padding:"28px 20px 48px"}}>
      <div style={{background:"white",border:"1px solid #ded9ce",borderRadius:18,padding:22,marginBottom:22}}>
        <h2 style={{margin:"0 0 8px"}}>{t("以后只从这里进入","Use this as the single entry point")}</h2>
        <p style={{margin:0,lineHeight:1.7,color:"#5b655f"}}>{t("三个旧门户的有效功能会逐步迁移到这里。所有新客户、订单、Invoice、付款、物流和安装数据将统一写入同一数据库。迁移完成前，标记为“正在整合”的模块可能仍会打开现有页面。","Useful features from the three older portals are being moved here. New customers, orders, invoices, payments, shipments and installations will use one database. During migration, modules marked Migrating may still open an existing page.")}</p>
      </div>

      {user&&<section style={{background:"white",border:"1px solid #ded9ce",borderRadius:18,padding:22,marginBottom:22,display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(260px,100%),1fr))",gap:18,alignItems:"end"}}>
        <div><div style={{fontSize:12,color:"#7a847f",letterSpacing:.7}}>{t("老板账号资料","OWNER PROFILE")}</div><h2 style={{margin:"7px 0 5px",fontSize:20}}>{user.displayName}</h2><div style={{color:"#69716d",fontSize:14}}>{user.email}</div></div>
        <div><label style={{display:"block",fontSize:13,fontWeight:700,marginBottom:7}}>{t("手机号","Phone number")}</label><div style={{display:"flex",gap:8,flexWrap:"wrap"}}><input aria-label={t("手机号","Phone number")} type="tel" inputMode="tel" autoComplete="tel" placeholder={t("例如 626-555-0123","e.g. 626-555-0123")} value={phone} onChange={event=>setPhone(event.target.value)} style={{boxSizing:"border-box",flex:"1 1 190px",border:"1px solid #cbd5cf",borderRadius:9,padding:"10px 12px",font:"inherit"}}/><button onClick={()=>void savePhone()} disabled={phoneSaving} style={{border:0,borderRadius:9,padding:"10px 16px",background:"#1f5b49",color:"white",fontWeight:700,cursor:"pointer"}}>{phoneSaving?t("保存中…","Saving…"):t(user.phone?"更新手机号":"增加手机号",user.phone?"Update phone":"Add phone")}</button></div>{phoneMessage&&<div role="status" style={{marginTop:7,fontSize:12,color:phoneMessage.includes("失败")||phoneMessage.includes("valid")?"#9b3d30":"#17603f"}}>{phoneMessage}</div>}</div>
      </section>}

      {loading?<div style={{padding:30,textAlign:"center"}}>{t("正在读取账号权限…","Loading account permissions…")}</div>:
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:16}}>
        {modules.map(module=><a key={module.key} href={module.href} style={{display:"block",background:"white",border:"1px solid #ded9ce",borderRadius:16,padding:20,textDecoration:"none",color:"inherit",boxShadow:"0 8px 24px rgba(40,50,45,.04)"}}>
          <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"flex-start"}}>
            <h3 style={{margin:0,fontSize:19}}>{lang==="zh-CN"?module.zh:module.en}</h3>
            <span style={{fontSize:12,padding:"5px 8px",borderRadius:999,background:module.status==="available"?"#e4f3eb":module.status==="migrating"?"#fff2d8":"#ececea",color:module.status==="available"?"#17603f":module.status==="migrating"?"#8a5a00":"#626661",whiteSpace:"nowrap"}}>{statusLabel(module.status)}</span>
          </div>
          <p style={{margin:"12px 0 18px",lineHeight:1.6,color:"#69716d"}}>{lang==="zh-CN"?module.descriptionZh:module.descriptionEn}</p>
          <strong style={{color:"#1f5b49"}}>{t("进入模块 →","Open module →")}</strong>
        </a>)}
      </div>}

      {!user&&!loading&&<div style={{marginTop:22,background:"#fff7e4",border:"1px solid #ead39c",borderRadius:14,padding:16,display:"flex",justifyContent:"space-between",gap:14,alignItems:"center",flexWrap:"wrap"}}><span>{t("当前未登录 V4 账号，请登录后进入老板或团队工作区。","Sign in with your V4 account to open the Owner or team workspace.")}</span><a href="/login" style={{background:"#1f5b49",color:"white",padding:"10px 14px",borderRadius:9,textDecoration:"none",fontWeight:700}}>{t("登录统一门户 →","Sign in →")}</a></div>}
    </section>
  </main>;
}

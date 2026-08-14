"use client";
import { useEffect, useState } from "react";

type InstallPrompt=Event&{prompt:()=>Promise<void>;userChoice:Promise<{outcome:"accepted"|"dismissed"}>};

export default function OfflineRuntime(){
  const[prompt,setPrompt]=useState<InstallPrompt|null>(null),[status,setStatus]=useState("");
  useEffect(()=>{if(!("serviceWorker" in navigator)||location.protocol!=="https:")return;void navigator.serviceWorker.register("/sw.js",{scope:"/"}).then(registration=>registration.update());const available=(event:Event)=>{event.preventDefault();setPrompt(event as InstallPrompt)},installed=()=>{setPrompt(null);setStatus("Braun Field installed / 已安装")};window.addEventListener("beforeinstallprompt",available);window.addEventListener("appinstalled",installed);return()=>{window.removeEventListener("beforeinstallprompt",available);window.removeEventListener("appinstalled",installed)}},[]);
  const install=async()=>{if(!prompt)return;await prompt.prompt();const choice=await prompt.userChoice;setStatus(choice.outcome==="accepted"?"Installing Braun Field / 正在安装":"Installation cancelled / 已取消安装");setPrompt(null)};
  return <>{prompt&&<button type="button" onClick={()=>void install()} style={{position:"fixed",right:16,bottom:16,zIndex:9999,border:0,borderRadius:999,padding:"12px 16px",background:"#ddb158",color:"#173f35",fontWeight:800,boxShadow:"0 6px 22px #0003"}}>Install Braun Field / 安装应用</button>}<span aria-live="polite" style={{position:"fixed",width:1,height:1,overflow:"hidden",clipPath:"inset(50%)"}}>{status}</span></>;
}

"use client";
import { useEffect } from "react";

export default function OfflineRuntime(){
  useEffect(()=>{if(!("serviceWorker" in navigator)||location.protocol!=="https:")return;void navigator.serviceWorker.register("/sw.js",{scope:"/"})},[]);
  return null;
}

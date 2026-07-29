import { NextRequest, NextResponse } from "next/server";

type Parcel = { length:number; width:number; height:number; weight:number };
type Address = { name?:string; company?:string; street1:string; street2?:string; city:string; state:string; zip:string; country?:string; phone?:string; email?:string };
type RateRequest = { addressFrom:Address; addressTo:Address; parcels:Parcel[] };

const SHIPPO_URL = "https://api.goshippo.com/shipments";

function validate(body:RateRequest){
  if(!body?.addressFrom || !body?.addressTo || !Array.isArray(body.parcels) || body.parcels.length===0) return "缺少发货地址、收货地址或包裹信息";
  for(const p of body.parcels){
    if([p.length,p.width,p.height,p.weight].some(v=>!Number.isFinite(v)||v<=0)) return "包裹尺寸和重量必须大于0";
  }
  return "";
}

export async function POST(req:NextRequest){
  try{
    const token=process.env.SHIPPO_API_TOKEN;
    if(!token) return NextResponse.json({error:"SHIPPO_API_TOKEN 尚未配置",setupRequired:true},{status:503});
    const body=await req.json() as RateRequest;
    const error=validate(body);
    if(error) return NextResponse.json({error},{status:400});

    const payload={
      address_from:{...body.addressFrom,country:body.addressFrom.country||"US"},
      address_to:{...body.addressTo,country:body.addressTo.country||"US"},
      parcels:body.parcels.map(p=>({length:String(p.length),width:String(p.width),height:String(p.height),distance_unit:"in",weight:String(p.weight),mass_unit:"lb"})),
      async:false
    };

    const response=await fetch(SHIPPO_URL,{method:"POST",headers:{Authorization:`ShippoToken ${token}`,"Content-Type":"application/json"},body:JSON.stringify(payload),cache:"no-store"});
    const data=await response.json();
    if(!response.ok) return NextResponse.json({error:"Shippo 报价失败",details:data},{status:response.status});

    const rates=(data.rates||[]).map((r:any)=>({
      id:r.object_id,
      carrier:r.provider,
      service:r.servicelevel?.name||r.servicelevel?.token,
      amount:Number(r.amount),
      currency:r.currency,
      estimatedDays:r.estimated_days,
      durationTerms:r.duration_terms,
      arrivesBy:r.arrives_by,
      attributes:r.attributes||[]
    })).sort((a:any,b:any)=>a.amount-b.amount);

    return NextResponse.json({shipmentId:data.object_id,rates});
  }catch(error){
    return NextResponse.json({error:"无法获取物流报价",details:error instanceof Error?error.message:String(error)},{status:500});
  }
}

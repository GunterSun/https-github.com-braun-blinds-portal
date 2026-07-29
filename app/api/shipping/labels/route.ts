import { NextRequest, NextResponse } from "next/server";

type LabelRequest={rateId:string;orderNumber?:string;labelFileType?:"PDF"|"PDF_4x6"|"PNG"};

export async function POST(req:NextRequest){
  try{
    const token=process.env.SHIPPO_API_TOKEN;
    if(!token) return NextResponse.json({error:"SHIPPO_API_TOKEN 尚未配置",setupRequired:true},{status:503});
    const body=await req.json() as LabelRequest;
    if(!body.rateId) return NextResponse.json({error:"请选择一个运费报价"},{status:400});

    const response=await fetch("https://api.goshippo.com/transactions",{
      method:"POST",
      headers:{Authorization:`ShippoToken ${token}`,"Content-Type":"application/json"},
      body:JSON.stringify({rate:body.rateId,label_file_type:body.labelFileType||"PDF_4x6",async:false}),
      cache:"no-store"
    });
    const data=await response.json();
    if(!response.ok || data.status==="ERROR") return NextResponse.json({error:"购买运单失败",details:data},{status:response.ok?422:response.status});

    return NextResponse.json({
      transactionId:data.object_id,
      status:data.status,
      trackingNumber:data.tracking_number,
      trackingUrl:data.tracking_url_provider,
      labelUrl:data.label_url,
      commercialInvoiceUrl:data.commercial_invoice_url,
      orderNumber:body.orderNumber||""
    });
  }catch(error){
    return NextResponse.json({error:"无法生成运单",details:error instanceof Error?error.message:String(error)},{status:500});
  }
}

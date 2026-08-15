import { and, desc, eq, sql } from "drizzle-orm";
import { getCustomerSession } from "../../customer-auth";
import { getDb } from "../../../db";
import { customerOrders, invoiceSequences } from "../../../db/schema";
import { Z_SERIES_CATALOG, validateZSeriesDimensions, zSeriesWholesalePrice } from "../../z-series-data";

type OrderLine={room?:string;itemId?:string;width?:number;height?:number;depth?:number;quantity?:number;mount?:string;motorized?:boolean;remoteQuantity?:number};
const ORDER_NOTIFICATION_EMAIL="sundagang91709@gmail.com";

async function sendOrderNotification(details:{
  orderNumber:string;customerEmail:string;companyName:string;contactName:string;
  projectName:string;windowCount:number;retailTotal:number;wholesaleTotal:number;discountPercent:number;
}){
  try{
    const payload=new URLSearchParams({
      _subject:`New wholesale order saved: ${details.orderNumber}`,
      _template:"table",
      _captcha:"false",
      order_number:details.orderNumber,
      customer_company:details.companyName||"—",
      customer_contact:details.contactName||"—",
      customer_email:details.customerEmail,
      project_name:details.projectName||"—",
      windows:String(details.windowCount),
      retail_total:`$${details.retailTotal.toFixed(2)}`,
      customer_discount:`${details.discountPercent}%`,
      wholesale_total:`$${details.wholesaleTotal.toFixed(2)}`,
      saved_at:new Date().toLocaleString("en-US",{timeZone:"America/Los_Angeles"}),
    });
    const response=await fetch(`https://formsubmit.co/ajax/${ORDER_NOTIFICATION_EMAIL}`,{
      method:"POST",
      headers:{"content-type":"application/x-www-form-urlencoded","accept":"application/json"},
      body:payload.toString(),
    });
    return response.ok;
  }catch(error){
    console.error("Order notification email failed",error);
    return false;
  }
}

const dimensionMessage=(errors:string[],index:number)=>{
  const names:Record<string,string>={
    width_not_sixteenth:"宽度必须精确到 1/16 英寸 / Width must use 1/16-inch increments",
    height_not_sixteenth:"高度必须精确到 1/16 英寸 / Height must use 1/16-inch increments",
    depth_not_sixteenth:"深度必须精确到 1/16 英寸 / Depth must use 1/16-inch increments",
    width_too_small:"宽度低于允许范围 / Width below minimum",
    width_too_large:"宽度超过允许范围 / Width above maximum",
    height_too_small:"高度低于允许范围 / Height below minimum",
    height_too_large:"高度超过允许范围 / Height above maximum",
    depth_required:"必须填写安装深度 / Mounting depth is required",
    depth_too_small:"安装深度不足 / Mounting depth is too small",
  };
  return `第 ${index+1} 行尺寸不符合产品限制 / Line ${index+1} dimensions are invalid: ${errors.map(e=>names[e]??e).join(", ")}`;
};

function calculateOrder(incoming:OrderLine[],discountPercent:number){
  if(!incoming.length) throw new Error("请至少添加一个窗户 / Add at least one window");
  const items=incoming.map((line,index)=>{
    const product=Z_SERIES_CATALOG.find(item=>item.id===line.itemId);
    if(!product) throw new Error(`第 ${index+1} 行产品无效 / Invalid product on line ${index+1}`);
    const quantity=Math.max(1,Math.floor(Number(line.quantity)||1));
    const width=Number(line.width);
    const height=Number(line.height);
    const depth=line.depth==null?undefined:Number(line.depth);
    if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0){
      throw new Error(`第 ${index+1} 行必须填写有效宽度和高度 / Valid width and height required on line ${index+1}`);
    }
    const dimensionErrors=validateZSeriesDimensions(product,width,height,depth);
    if(dimensionErrors.length) throw new Error(dimensionMessage(dimensionErrors,index));

    // The approved Z-Series workbook lists a product price for each Fabric Code + Product Code.
    // Do not multiply that price by area or invent unapproved add-on prices.
    if(line.motorized||Number(line.remoteQuantity||0)>0){
      throw new Error(`第 ${index+1} 行电机/遥控器没有 Z 系列批准价格，不能自动估价 / Motor or remote pricing is not approved in the Z-Series price list for line ${index+1}`);
    }
    const baseUnitRetail=product.retail;
    const baseLineRetail=Math.round(baseUnitRetail*quantity*100)/100;
    const lineRetail=baseLineRetail;
    const lineWholesale=zSeriesWholesalePrice(baseLineRetail,discountPercent);
    return {
      room:String(line.room??""),itemId:product.id,fabricCode:product.fabricCode,productCode:product.productCode,
      descriptionZh:product.descriptionZh,descriptionEn:product.descriptionEn,
      system:product.system,style:product.style,structure:product.structure,construction:product.construction,
      width,height,depth,quantity,mount:String(line.mount??"Inside"),currency:product.currency,
      baseUnitRetail,baseLineRetail,lineRetail,lineWholesale,
      priceSource:"Z_Series_Customer_Price_List_CN_EN.xlsx",
      installationIncluded:false,shippingIncluded:false,
    };
  });
  const retailTotal=Math.round(items.reduce((sum,item)=>sum+item.lineRetail,0)*100)/100;
  const wholesaleTotal=Math.round(items.reduce((sum,item)=>sum+item.lineWholesale,0)*100)/100;
  return {items,retailTotal,wholesaleTotal};
}

export async function GET(){
  const customer=await getCustomerSession();
  if(!customer) return Response.json({error:"未登录 / Unauthorized"},{status:401});
  const db=await getDb();
  const orders=await db.select().from(customerOrders).where(eq(customerOrders.customerEmail,customer.email)).orderBy(desc(customerOrders.createdAt)).limit(30);
  return Response.json({orders});
}

export async function POST(request:Request){
  const customer=await getCustomerSession();
  if(!customer||customer.status!=="active") return Response.json({error:"未登录或账号未启用 / Unauthorized or inactive account"},{status:401});
  const body=await request.json() as {projectName?:string;items?:OrderLine[]};
  const incoming=Array.isArray(body.items)?body.items:[];
  let priced;
  try{priced=calculateOrder(incoming,customer.discountPercent);}
  catch(error){return Response.json({error:error instanceof Error?error.message:"订单无效 / Invalid order"},{status:400});}
  const {items,retailTotal,wholesaleTotal}=priced;
  const orderNumber=`Z-${new Date().toISOString().slice(0,10).replaceAll("-","")}-${crypto.randomUUID().slice(0,6).toUpperCase()}`;
  const db=await getDb();
  const [order]=await db.insert(customerOrders).values({
    orderNumber,customerEmail:customer.email,projectName:String(body.projectName??""),
    itemsJson:JSON.stringify(items),retailTotal,wholesaleTotal,discountPercent:customer.discountPercent,
  }).returning();
  const notificationSent=await sendOrderNotification({
    orderNumber,customerEmail:customer.email,companyName:customer.companyName,
    contactName:customer.contactName,projectName:String(body.projectName??""),
    windowCount:items.length,retailTotal,wholesaleTotal,discountPercent:customer.discountPercent,
  });
  return Response.json({order,notificationSent},{status:201});
}

export async function PATCH(request:Request){
  const customer=await getCustomerSession();
  if(!customer||customer.status!=="active") return Response.json({error:"未登录或账号未启用 / Unauthorized or inactive account"},{status:401});
  const body=await request.json() as {id?:number;projectName?:string;items?:OrderLine[];action?:"save"|"confirm"};
  const id=Number(body.id);
  if(!Number.isInteger(id)||id<=0) return Response.json({error:"订单 ID 无效 / Invalid order ID"},{status:400});
  const db=await getDb();
  const [existing]=await db.select().from(customerOrders).where(and(eq(customerOrders.id,id),eq(customerOrders.customerEmail,customer.email))).limit(1);
  if(!existing) return Response.json({error:"找不到订单 / Order not found"},{status:404});
  if(existing.status==="confirmed") return Response.json({error:"订单已确认，不能再修改 / Confirmed orders cannot be changed"},{status:409});

  if(body.action==="confirm"){
    const confirmedAt=new Date().toISOString();
    await db.insert(invoiceSequences).values({id:1,lastNumber:0}).onConflictDoNothing();
    const [sequence]=await db.update(invoiceSequences).set({
      lastNumber:sql`${invoiceSequences.lastNumber} + 1`,updatedAt:confirmedAt,
    }).where(eq(invoiceSequences.id,1)).returning({lastNumber:invoiceSequences.lastNumber});
    if(!sequence||sequence.lastNumber>99999) return Response.json({error:"Invoice 编号已达到上限 / Invoice number limit reached"},{status:409});
    const invoiceNumber=String(sequence.lastNumber).padStart(5,"0");
    const [order]=await db.update(customerOrders).set({status:"confirmed",confirmedAt,invoiceNumber}).where(eq(customerOrders.id,id)).returning();
    await sendOrderNotification({
      orderNumber:`${existing.orderNumber} (CONFIRMED / 已确认)`,customerEmail:customer.email,
      companyName:customer.companyName,contactName:customer.contactName,projectName:existing.projectName,
      windowCount:(JSON.parse(existing.itemsJson) as unknown[]).length,retailTotal:existing.retailTotal,
      wholesaleTotal:existing.wholesaleTotal,discountPercent:existing.discountPercent,
    });
    return Response.json({order});
  }

  const incoming=Array.isArray(body.items)?body.items:[];
  let priced;
  try{priced=calculateOrder(incoming,customer.discountPercent);}
  catch(error){return Response.json({error:error instanceof Error?error.message:"订单无效 / Invalid order"},{status:400});}
  const [order]=await db.update(customerOrders).set({
    projectName:String(body.projectName??""),itemsJson:JSON.stringify(priced.items),
    retailTotal:priced.retailTotal,wholesaleTotal:priced.wholesaleTotal,discountPercent:customer.discountPercent,
  }).where(eq(customerOrders.id,id)).returning();
  return Response.json({order});
}

export async function DELETE(request:Request){
  const customer=await getCustomerSession();
  if(!customer||customer.status!=="active") return Response.json({error:"未登录或账号未启用 / Unauthorized or inactive account"},{status:401});
  const body=await request.json() as {id?:number};
  const id=Number(body.id);
  if(!Number.isInteger(id)||id<=0) return Response.json({error:"订单 ID 无效 / Invalid order ID"},{status:400});
  const db=await getDb();
  const [existing]=await db.select().from(customerOrders).where(and(eq(customerOrders.id,id),eq(customerOrders.customerEmail,customer.email))).limit(1);
  if(!existing) return Response.json({error:"找不到订单 / Order not found"},{status:404});
  if(existing.status==="confirmed") return Response.json({error:"已确认订单属于财务记录，不能删除 / Confirmed orders cannot be deleted"},{status:409});
  await db.delete(customerOrders).where(and(eq(customerOrders.id,id),eq(customerOrders.customerEmail,customer.email)));
  return Response.json({deleted:true,id});
}
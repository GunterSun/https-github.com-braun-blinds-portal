import { and, desc, eq, like, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { blindSpecifications, catalogProducts, productAuditEvents, productCategories, shutterSpecifications } from "@/db/schema";
import { getCurrentAppUser } from "@/lib/v4-auth";

const clean=(value:unknown,max=200)=>String(value??"").replace(/\s+/g," ").trim().slice(0,max);
const jsonList=(value:unknown)=>JSON.stringify(Array.isArray(value)?value.map(item=>clean(item,80)).filter(Boolean).slice(0,50):[]);

export async function GET(request:NextRequest){
  const user=await getCurrentAppUser();
  if(!user)return NextResponse.json({error:"请先登录"},{status:401});
  const type=clean(request.nextUrl.searchParams.get("product_type"),30);
  const status=clean(request.nextUrl.searchParams.get("status"),30);
  const q=clean(request.nextUrl.searchParams.get("q"),100);
  const conditions=[];
  if(type)conditions.push(eq(catalogProducts.productType,type));
  if(status)conditions.push(eq(catalogProducts.status,status));
  else if(user.role!=="owner")conditions.push(eq(catalogProducts.status,"active"));
  if(q){const pattern=`%${q}%`;conditions.push(or(like(catalogProducts.sku,pattern),like(catalogProducts.nameEn,pattern),like(catalogProducts.nameZh,pattern))!)}
  const db=await getDb();
  const products=await db.select({id:catalogProducts.id,sku:catalogProducts.sku,productType:catalogProducts.productType,nameEn:catalogProducts.nameEn,nameZh:catalogProducts.nameZh,status:catalogProducts.status,defaultUom:catalogProducts.defaultUom,categoryCode:productCategories.code,categoryNameEn:productCategories.nameEn,categoryNameZh:productCategories.nameZh,updatedAt:catalogProducts.updatedAt}).from(catalogProducts).innerJoin(productCategories,eq(catalogProducts.categoryId,productCategories.id)).where(conditions.length?and(...conditions):undefined).orderBy(desc(catalogProducts.updatedAt)).limit(200);
  return NextResponse.json({products});
}

export async function POST(request:NextRequest){
  const user=await getCurrentAppUser();
  if(!user)return NextResponse.json({error:"请先登录"},{status:401});
  if(user.role!=="owner")return NextResponse.json({error:"仅 Owner 可以建立产品"},{status:403});
  let body:Record<string,unknown>;try{body=await request.json()}catch{return NextResponse.json({error:"请求格式错误"},{status:400})}
  const categoryId=Number(body.categoryId),sku=clean(body.sku,80).toUpperCase(),productType=clean(body.productType,30).toLowerCase(),nameEn=clean(body.nameEn),nameZh=clean(body.nameZh);
  if(!Number.isInteger(categoryId)||!sku||!nameEn||!nameZh||!["shutter","blind","shade","drapery","hardware","service"].includes(productType))return NextResponse.json({error:"分类、SKU、中英文名称和有效产品类型必填"},{status:400});
  const db=await getDb();
  const category=await db.select({id:productCategories.id}).from(productCategories).where(eq(productCategories.id,categoryId)).limit(1);
  if(!category.length)return NextResponse.json({error:"产品分类不存在"},{status:400});
  try{
    const created=await db.insert(catalogProducts).values({categoryId,sku,productType,nameEn,nameZh,descriptionEn:clean(body.descriptionEn,2000),descriptionZh:clean(body.descriptionZh,2000),status:"draft",defaultUom:clean(body.defaultUom,30)||"each",createdBy:user.id}).returning({id:catalogProducts.id});
    const productId=created[0].id,spec=(body.spec&&typeof body.spec==="object"?body.spec:{}) as Record<string,unknown>;
    if(productType==="shutter"){
      const material=clean(spec.material,80),panelConfiguration=clean(spec.panelConfiguration,80),louverSize=clean(spec.louverSize,50),frameType=clean(spec.frameType,80);
      if(!material||!panelConfiguration||!louverSize||!frameType){await db.delete(catalogProducts).where(eq(catalogProducts.id,productId));return NextResponse.json({error:"Shutter 必须填写材质、Panel、Louver 和 Frame"},{status:400})}
      await db.insert(shutterSpecifications).values({productId,material,panelConfiguration,louverSize,frameType,dividerRailRule:clean(spec.dividerRailRule,80)||"optional",tiltType:clean(spec.tiltType,80)||"traditional",hingeOptionsJson:jsonList(spec.hingeOptions),shapeOptionsJson:jsonList(spec.shapeOptions),colorOptionsJson:jsonList(spec.colorOptions)});
    }
    if(productType==="blind"){
      const blindType=clean(spec.blindType,80),material=clean(spec.material,80),orientation=clean(spec.orientation,30),slatOrVaneSize=clean(spec.slatOrVaneSize,50),liftType=clean(spec.liftType,80),tiltType=clean(spec.tiltType,80);
      if(!blindType||!material||!orientation||!slatOrVaneSize||!liftType||!tiltType){await db.delete(catalogProducts).where(eq(catalogProducts.id,productId));return NextResponse.json({error:"Blind 必须填写类型、材质、方向、Slat/Vane、Lift 和 Tilt"},{status:400})}
      await db.insert(blindSpecifications).values({productId,blindType,material,orientation,slatOrVaneSize,liftType,tiltType,valanceOptionsJson:jsonList(spec.valanceOptions),ladderOptionsJson:jsonList(spec.ladderOptions),colorOptionsJson:jsonList(spec.colorOptions)});
    }
    await db.insert(productAuditEvents).values({productId,userId:user.id,action:"product_created",detailsJson:JSON.stringify({sku,productType,status:"draft"})});
    return NextResponse.json({ok:true,productId},{status:201});
  }catch(error){
    const message=error instanceof Error?error.message:"";
    return NextResponse.json({error:message.includes("UNIQUE")?"SKU 已存在":"产品建立失败"},{status:message.includes("UNIQUE")?409:500});
  }
}

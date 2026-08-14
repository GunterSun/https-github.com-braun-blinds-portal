import { and, asc, desc, eq, inArray, max } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { measureProperties, measureRooms, measureWindows, measurementValues, measurementVersions } from "@/db/schema";
import { getCurrentAppUser, writeAuditLog } from "@/lib/v4-auth";

const clean=(value:unknown,max=300)=>String(value??"").replace(/\s+/g," ").trim().slice(0,max);
const allowedRoles=new Set(["owner","sales"]);
const productTypes=new Set(["drapery","roman","roller","zebra","honeycomb","shutter","blind","track_rod","cornice_valance","motorized"]);
const fieldKeys=new Set(["width_left","width_center","width_right","height_left","height_center","height_right","depth","ceiling_height","sill_height","floor_clearance","return_left","return_right","overlap_left","overlap_right","stack_back_left","stack_back_right","handle_projection"]);

async function actor(){const user=await getCurrentAppUser();if(!user)return {error:NextResponse.json({error:"请先登录 / Authentication required"},{status:401})};if(!allowedRoles.has(user.role))return {error:NextResponse.json({error:"无权使用测量中心 / Permission denied"},{status:403})};return {user}}
async function ownedProperty(propertyId:number,user:{id:number;role:string}){const db=await getDb(),where=user.role==="owner"?eq(measureProperties.id,propertyId):and(eq(measureProperties.id,propertyId),eq(measureProperties.createdBy,user.id));return (await db.select({id:measureProperties.id}).from(measureProperties).where(where).limit(1))[0]}

export async function GET(){
  const auth=await actor();if("error" in auth)return auth.error;const {user}=auth,db=await getDb();
  const properties=await db.select().from(measureProperties).where(user.role==="owner"?undefined:eq(measureProperties.createdBy,user.id)).orderBy(desc(measureProperties.updatedAt));
  const propertyIds=properties.map(item=>item.id);if(!propertyIds.length)return NextResponse.json({properties:[]});
  const rooms=await db.select().from(measureRooms).where(inArray(measureRooms.propertyId,propertyIds)).orderBy(asc(measureRooms.sortOrder),asc(measureRooms.id));
  const windows=await db.select().from(measureWindows).where(inArray(measureWindows.propertyId,propertyIds)).orderBy(asc(measureWindows.code));
  const windowIds=windows.map(item=>item.id),versions=windowIds.length?await db.select().from(measurementVersions).where(inArray(measurementVersions.windowId,windowIds)).orderBy(desc(measurementVersions.version)):[];
  const versionIds=versions.map(item=>item.id),values=versionIds.length?await db.select().from(measurementValues).where(inArray(measurementValues.measurementVersionId,versionIds)):[];
  return NextResponse.json({properties:properties.map(property=>({...property,rooms:rooms.filter(room=>room.propertyId===property.id).map(room=>({...room,windows:windows.filter(window=>window.roomId===room.id).map(window=>({...window,versions:versions.filter(version=>version.windowId===window.id).map(version=>({...version,values:values.filter(value=>value.measurementVersionId===version.id)}))}))}))}))});
}

export async function POST(request:NextRequest){
  const auth=await actor();if("error" in auth)return auth.error;const {user}=auth;let body:Record<string,unknown>;try{body=await request.json()}catch{return NextResponse.json({error:"请求格式错误 / Invalid request"},{status:400})}
  const action=clean(body.action,40),db=await getDb();
  try{
    if(action==="create_property"){
      const name=clean(body.name,160),address=clean(body.address,500);if(!name)return NextResponse.json({error:"项目名称必填 / Property name is required"},{status:400});
      const row=await db.insert(measureProperties).values({name,address,createdBy:user.id}).returning();await writeAuditLog({userId:user.id,action:"measure_property_created",entityType:"measure_property",entityId:String(row[0].id),details:{name}});return NextResponse.json({property:row[0]},{status:201});
    }
    const propertyId=Number(body.propertyId);if(!Number.isInteger(propertyId)||!await ownedProperty(propertyId,user))return NextResponse.json({error:"项目不存在或无权访问 / Property not found"},{status:404});
    if(action==="create_room"){
      const name=clean(body.name,120);if(!name)return NextResponse.json({error:"房间名称必填 / Room name is required"},{status:400});const row=await db.insert(measureRooms).values({propertyId,name}).returning();return NextResponse.json({room:row[0]},{status:201});
    }
    if(action==="create_window"){
      const roomId=Number(body.roomId),code=clean(body.code,40).toUpperCase(),room=(await db.select().from(measureRooms).where(and(eq(measureRooms.id,roomId),eq(measureRooms.propertyId,propertyId))).limit(1))[0];if(!room||!code)return NextResponse.json({error:"房间和 Window 编号必填 / Room and window code required"},{status:400});const row=await db.insert(measureWindows).values({propertyId,roomId,code,notes:clean(body.notes,1000)}).returning();return NextResponse.json({window:row[0]},{status:201});
    }
    if(action==="save_measurement"){
      const windowId=Number(body.windowId),window=(await db.select().from(measureWindows).where(and(eq(measureWindows.id,windowId),eq(measureWindows.propertyId,propertyId))).limit(1))[0],productType=clean(body.productType,40),rawValues=Array.isArray(body.values)?body.values:[];if(!window||!productTypes.has(productType))return NextResponse.json({error:"Window 或产品类型无效 / Invalid window or product"},{status:400});
      const values=rawValues.map(value=>value as Record<string,unknown>).filter(value=>fieldKeys.has(clean(value.fieldKey,50))).map(value=>{const whole=Number(value.wholeInches),fraction=Number(value.fractionSixteenths||0);if(!Number.isInteger(whole)||whole<0||!Number.isInteger(fraction)||fraction<0||fraction>15)throw new Error("INVALID_DIMENSION");return {fieldKey:clean(value.fieldKey,50),wholeInches:whole,fractionSixteenths:fraction,totalSixteenths:whole*16+fraction,sourceValue:fraction?`${whole} ${fraction}/16`:`${whole}`}});
      if(!values.some(value=>value.fieldKey.startsWith("width_"))||!values.some(value=>value.fieldKey.startsWith("height_")))return NextResponse.json({error:"至少填写一组宽度和高度 / Width and height are required"},{status:400});
      const latest=await db.select({version:max(measurementVersions.version)}).from(measurementVersions).where(eq(measurementVersions.windowId,windowId)),currentVersion=Number(latest[0]?.version||0),baseVersion=body.baseVersion===undefined?currentVersion:Number(body.baseVersion);
      if(!Number.isInteger(baseVersion)||baseVersion!==currentVersion)return NextResponse.json({error:"测量版本已变化，请刷新后人工核对 / Measurement changed; refresh and review before saving",code:"MEASUREMENT_VERSION_CONFLICT",expectedVersion:currentVersion,receivedVersion:baseVersion},{status:409});
      const version=currentVersion+1;
      const created=await db.insert(measurementVersions).values({windowId,version,productType,mountType:clean(body.mountType,30)||"inside",controlSide:clean(body.controlSide,30)||"unspecified",status:"draft",obstacleNotes:clean(body.obstacleNotes,2000),notes:clean(body.notes,2000),createdBy:user.id}).returning();
      await db.insert(measurementValues).values(values.map(value=>({...value,measurementVersionId:created[0].id})));
      await db.update(measureProperties).set({updatedAt:new Date().toISOString()}).where(eq(measureProperties.id,propertyId));await writeAuditLog({userId:user.id,action:"measurement_version_created",entityType:"measurement_version",entityId:String(created[0].id),details:{windowId,version,productType}});return NextResponse.json({measurement:{...created[0],values}},{status:201});
    }
    return NextResponse.json({error:"未知操作 / Unknown action"},{status:400});
  }catch(error){const message=error instanceof Error?error.message:"";return NextResponse.json({error:message==="INVALID_DIMENSION"?"尺寸必须为整数英寸加 0–15/16 / Invalid dimension":message.includes("UNIQUE")?"Window 编号已存在 / Window code already exists":"保存失败 / Save failed"},{status:message.includes("UNIQUE")?409:400})}
}

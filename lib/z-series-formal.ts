import { findZSeriesItem, validateZSeriesDimensions, zSeriesWholesalePrice } from '../app/z-series-data';

export type ZLineInput = { handoffId?: number; supplier?: string; room?: string; windowCode?: string; fabricCode?: string; productCode?: string; width?: number; height?: number; depth?: number; quantity?: number };
export type ZHandoff = { id: number; sourceHash: string; sourceSnapshotJson: string };
export const quoteMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
const id = (v: unknown): v is number => typeof v === 'number' && Number.isSafeInteger(v) && v > 0;
const label = (value: unknown, field: string, max = 160) => {
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw Error(`${field}无效 / Invalid ${field}`);
  return value.trim();
};
export function lineHandoffIds(lines: ZLineInput[], primaryId: number) {
  if (!Array.isArray(lines) || !lines.length || lines.length > 100 || !id(primaryId)) throw Error('报价需要 1–100 行和有效来源 / 1–100 lines and valid Handoff required');
  const ids = lines.map(line => { if (!line || typeof line !== 'object') throw Error('报价行无效 / Invalid line'); const value = line.handoffId ?? primaryId; if (!id(value)) throw Error('报价行来源无效 / Invalid line Handoff'); return value; });
  if (!ids.includes(primaryId)) throw Error('主来源必须包含在报价中 / Primary Handoff must be included');
  return [...new Set(ids)];
}
export function buildZSeriesLines(lines: ZLineInput[], primaryId: number, handoffs: ZHandoff[], mode: 'retail'|'wholesale', discount: number) {
  const ids = lineHandoffIds(lines, primaryId);
  const byId = new Map(handoffs.map(h => [h.id, h]));
  const primary = byId.get(primaryId);
  if (!primary || ids.some(id => !byId.has(id))) throw Error('报价来源不存在 / Handoff not found');
  const base = JSON.parse(primary.sourceSnapshotJson);
  const customerId = Number(base.property?.customerId), propertyId = Number(base.property?.id);
  if (!id(customerId) || !id(propertyId)) throw Error('项目必须关联客户 / Property must have a Customer');
  const pricedLines = lines.map((line, index) => {
    const handoff = byId.get(line.handoffId ?? primaryId)!;
    const source = JSON.parse(handoff.sourceSnapshotJson);
    if (Number(source.property?.id) !== propertyId || Number(source.property?.customerId) !== customerId) throw Error(`第 ${index+1} 行不属于同一客户和项目 / All lines must belong to the same Customer and Property`);
    const room = label(line.room, '房间'), windowCode = label(line.windowCode, '窗位');
    if (room !== String(source.room?.name ?? '').trim() || windowCode !== String(source.window?.code ?? '').trim()) throw Error(`第 ${index+1} 行房间和窗位与来源不符 / Room and Window must match their Handoff`);
    const item = findZSeriesItem(String(line.fabricCode ?? ''), String(line.productCode ?? ''));
    if (!item) throw Error(`第 ${index+1} 行产品组合无效 / Invalid product combination`);
    const width=Number(line.width),height=Number(line.height),depth=Number(line.depth),quantity=line.quantity===undefined?1:Number(line.quantity);
    if (![width,height,depth].every(v=>Number.isFinite(v)&&v>0) || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 10000) throw Error(`第 ${index+1} 行尺寸或数量无效 / Invalid dimensions or quantity`);
    const errors=validateZSeriesDimensions(item,width,height,depth);
    if(errors.length)throw Error(`第 ${index+1} 行尺寸超限 / Dimension limits: ${errors.join('; ')}`);
    const supplier=line.supplier===undefined?'待分配 / Unassigned':label(line.supplier,'供应商');
    const unitPrice=mode==='wholesale'?zSeriesWholesalePrice(item.retail,discount):item.retail;
    return {lineId:`line-${index+1}`,handoffId:handoff.id,sourceHash:handoff.sourceHash,supplier,room,windowCode,fabricCode:item.fabricCode,productCode:item.productCode,
      descriptionZh:item.descriptionZh,descriptionEn:item.descriptionEn,systemZh:item.systemZh,systemEn:item.systemEn,styleZh:item.styleZh,styleEn:item.styleEn,
      structureZh:item.structureZh,structureEn:item.structureEn,constructionZh:item.constructionZh,constructionEn:item.constructionEn,
      width,height,depth,quantity,unitPrice,lineTotal:quoteMoney(unitPrice*quantity),currency:'USD'};
  });
  return {base,customerId,propertyId,handoffIds:ids,pricedLines,subtotal:quoteMoney(pricedLines.reduce((sum,line)=>sum+line.lineTotal,0)),sources:ids.map(id=>{const h=byId.get(id)!;return {handoffId:id,sourceHash:h.sourceHash,source:JSON.parse(h.sourceSnapshotJson)};})};
}
// Old single-window quotes retain their original workflow association.
export function quoteHandoffIds(quote: {handoffId:number;sourceSnapshotJson:string}) {
  const source=JSON.parse(quote.sourceSnapshotJson);
  const ids=Array.isArray(source.zSeries?.lines)?source.zSeries.lines.map((l:ZLineInput)=>l.handoffId).filter(id):[];
  return [...new Set([quote.handoffId,...ids])] as number[];
}

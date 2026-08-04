export type CurrencyCode = "USD" | "RMB";

export type ImportSource = { fileName: string; sheetName: string; rowNumber: number };
export type NormalizedImportRow = {
  source: ImportSource;
  recordType: "order" | "expense" | "payment" | "settlement" | "unknown";
  orderNumber: string;
  customer: string;
  project: string;
  product: string;
  quantity: number | null;
  amount: number | null;
  currency: CurrencyCode | null;
  status: string;
  notes: string;
  warnings: string[];
  raw: unknown[];
};

export function cleanText(value: unknown) { return String(value ?? "").replace(/\s+/g, " ").trim(); }
export function toAmount(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) && Math.abs(value) <= 10_000_000 ? Math.round(value * 100) / 100 : null;
  const text = cleanText(value).replace(/[$¥,]/g, "");
  if (!/^[-+]?\d+(?:\.\d+)?$/.test(text)) return null;
  const number = Number(text);
  return Number.isFinite(number) && Math.abs(number) <= 10_000_000 ? Math.round(number * 100) / 100 : null;
}
export function normalizeOrderNumber(value: unknown) {
  const text = cleanText(value).toUpperCase();
  if (!text) return "";
  const cwf = text.match(/CWF\s*[-#:]?\s*(\d{5})/i); if (cwf) return `CWF ${cwf[1]}`;
  const five = text.match(/(?:^|\D)(\d{5})(?:\D|$)/); if (five) return five[1];
  const three = text.match(/(?:^|\D)(\d{3})(?:\D|$)/); return three ? three[1] : text;
}
export function excelSerialToIso(value: unknown) {
  if (typeof value !== "number" || value < 20_000 || value > 80_000) return "";
  return new Date(Date.UTC(1899, 11, 30) + Math.round(value) * 86_400_000).toISOString().slice(0, 10);
}
export function detectWorkbookType(sheetNames: string[]) {
  if (sheetNames.includes("Commerce订单汇总")) return "jin-commerce" as const;
  if (sheetNames.includes("汇总") && sheetNames.some(name => ["Paul", "林", "彭"].includes(name))) return "wholesale-sales" as const;
  return "unknown" as const;
}
function rowBase(fileName:string,sheetName:string,rowNumber:number,row:unknown[]): Pick<NormalizedImportRow,"source"|"quantity"|"warnings"|"raw"> {
  return { source:{fileName,sheetName,rowNumber}, quantity:null, warnings:[], raw:row };
}
export function parseCommerceRows(fileName:string,sheetName:string,rows:unknown[][]):NormalizedImportRow[]{
  return rows.slice(4).map<NormalizedImportRow>((row,index)=>{
    const orderNumber=normalizeOrderNumber(row[1]); const amount=toAmount(row[9]); const warnings:string[]=[];
    if(!orderNumber) warnings.push("缺少订单号"); if(amount===null) warnings.push("结算金额为空或无效");
    if(typeof row[3]==="number"&&Math.abs(row[3])>10_000_000) warnings.push("发现异常长数字，未作为金额导入");
    return {source:{fileName,sheetName,rowNumber:index+5},recordType:"order",orderNumber,customer:cleanText(row[5]),project:cleanText(row[6]),product:cleanText(row[7]),quantity:toAmount(row[8]),amount,currency:amount===null?null:"USD",status:cleanText(row[11]),notes:[cleanText(row[2]),cleanText(row[3]),cleanText(row[12])].filter(Boolean).join(" | "),warnings,raw:row};
  }).filter(row=>row.orderNumber||row.customer||row.amount!==null);
}
export function parseExpenseSheet(fileName:string,sheetName:string,rows:unknown[][]):NormalizedImportRow[]{
  const result:NormalizedImportRow[]=[];
  rows.forEach((row,index)=>{const usd=toAmount(row[5]);const rmb=toAmount(row[6]);const payee=cleanText(row[3]);const description=cleanText(row[4]);if(!payee&&usd===null&&rmb===null)return;
    const base={...rowBase(fileName,sheetName,index+1,row),recordType:"expense" as const,orderNumber:normalizeOrderNumber(`${description} ${cleanText(row[7])}`),customer:payee,project:"",product:description,status:"",notes:cleanText(row[7])};
    if(usd!==null)result.push({...base,amount:usd,currency:"USD"}); if(rmb!==null)result.push({...base,amount:rmb,currency:"RMB"});
  }); return result;
}
export function parseWholesaleSummary(fileName:string,sheetName:string,rows:unknown[][]):NormalizedImportRow[]{
  const result:NormalizedImportRow[]=[];
  rows.slice(1).forEach((row,index)=>{const customer=cleanText(row[0]);const orderNumber=normalizeOrderNumber(row[2]);const date=excelSerialToIso(row[1]);const receivable=toAmount(row[3]);
    if(!customer&&!orderNumber&&receivable===null)return;
    if(receivable!==null) result.push({...rowBase(fileName,sheetName,index+2,row),recordType:"order" as const,orderNumber,customer,project:cleanText(row[2]),product:"应收款",amount:receivable,currency:"USD",status:cleanText(row[16]),notes:[date,cleanText(row[19])].filter(Boolean).join(" | ")});
    for(let col=4;col<20;col++){const amount=toAmount(row[col]); if(amount===null)continue; const label=cleanText(rows[0]?.[col])||cleanText(row[col-1])||`支出列 ${col+1}`;
      result.push({...rowBase(fileName,sheetName,index+2,row),recordType:"expense" as const,orderNumber,customer,project:cleanText(row[2]),product:label,amount,currency:"RMB",status:"",notes:[date,cleanText(row[19]),`原列 ${col+1}`].filter(Boolean).join(" | "),warnings:["汇总页支出默认按人民币导入；请在预览中核对少数美元项目"]});}
  }); return result;
}
export function parsePaulSheet(fileName:string,sheetName:string,rows:unknown[][]):NormalizedImportRow[]{
  const result:NormalizedImportRow[]=[];
  rows.forEach((row,index)=>{
    const leftOrder=normalizeOrderNumber(row[0]); const leftAmount=toAmount(row[1]);
    if(/^\d{5,6}$/.test(leftOrder)&&leftAmount!==null) result.push({...rowBase(fileName,sheetName,index+1,row),recordType:"settlement",orderNumber:leftOrder,customer:"Paul",project:"",product:"订单结算",amount:leftAmount,currency:"USD",status:cleanText(row[2]),notes:cleanText(row[3])});
    const rightOrder=normalizeOrderNumber(row[5]); const rightAmount=toAmount(row[7]);
    if(/^\d{5,6}$/.test(rightOrder)&&rightAmount!==null) result.push({...rowBase(fileName,sheetName,index+1,row),recordType:"settlement",orderNumber:rightOrder,customer:"Paul",project:"",product:"差额/调整",amount:rightAmount,currency:"USD",status:cleanText(row[6]),notes:cleanText(row[8])});
    const transfer=cleanText(row[0]); const transferAmount=toAmount(row[1]);
    if(/转$/.test(transfer)&&transferAmount!==null) result.push({...rowBase(fileName,sheetName,index+1,row),recordType:"payment",orderNumber:"",customer:"Paul",project:"",product:transfer,amount:transferAmount,currency:"USD",status:cleanText(row[3]),notes:""});
  }); return result;
}
export function parseLinSheet(fileName:string,sheetName:string,rows:unknown[][]):NormalizedImportRow[]{
  const result:NormalizedImportRow[]=[];
  rows.forEach((row,index)=>{const label=cleanText(row[1]);const amount=toAmount(row[2]);const note=cleanText(row[3]);if(amount===null)return;
    if(/^项目款项/.test(label)||/项目款项小计/.test(label)) result.push({...rowBase(fileName,sheetName,index+1,row),recordType:"settlement",orderNumber:"",customer:"林",project:label,product:"应收项目",amount,currency:"USD",status:"",notes:note});
    else if(/付款|支票|Zelle|还款/.test(label)||amount<0) result.push({...rowBase(fileName,sheetName,index+1,row),recordType:"payment",orderNumber:normalizeOrderNumber(label),customer:"林",project:"",product:label,amount:Math.abs(amount),currency:"USD",status:"已记录",notes:note});
    else if(/单号|MATT|新增单据/.test(label)) result.push({...rowBase(fileName,sheetName,index+1,row),recordType:"order",orderNumber:normalizeOrderNumber(label),customer:"林",project:label,product:"新增订单/代收",amount,currency:"USD",status:cleanText(row[2]),notes:note});
  }); return result;
}
export function parseWholesaleWorkbook(fileName:string,sheets:Record<string,unknown[][]>):NormalizedImportRow[]{
  const result:NormalizedImportRow[]=[];
  for(const [sheetName,rows] of Object.entries(sheets)){
    if(sheetName==="汇总") result.push(...parseWholesaleSummary(fileName,sheetName,rows));
    else if(sheetName==="Paul") result.push(...parsePaulSheet(fileName,sheetName,rows));
    else if(sheetName==="林") result.push(...parseLinSheet(fileName,sheetName,rows));
    else if(sheetName==="彭") result.push(...parseExpenseSheet(fileName,sheetName,rows));
  }
  return result;
}
export function findDuplicates(rows:NormalizedImportRow[]){
  const counts=new Map<string,number>(); for(const row of rows){const key=[row.recordType,row.orderNumber,row.customer.toLowerCase(),row.product.toLowerCase(),row.amount,row.currency].join("|");counts.set(key,(counts.get(key)||0)+1);}
  return rows.map(row=>{const key=[row.recordType,row.orderNumber,row.customer.toLowerCase(),row.product.toLowerCase(),row.amount,row.currency].join("|");return counts.get(key)!>1?{...row,warnings:[...row.warnings,"疑似重复记录"]}:row;});
}

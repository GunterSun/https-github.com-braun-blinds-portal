import {buildOrderPreview,previewColumns,type Dataset,type Source,type Row} from './v5-order-preview';
export interface ReadDB { all(sql:string,params:(string|number)[]):Promise<Row[]> }
export class ReviewInputError extends Error {}
const roots = ['customer_orders','orders','quotes','customer_quote_versions','customer_billing_invoices','invoice_versions','measure_windows','manufacturing_drawings','factory_work_orders'] as const;
export const reviewSources = roots;
const dates: Partial<Record<Source,string>>={customer_orders:'created_at',orders:'created_at',quotes:'created_at',customer_quote_versions:'created_at',customer_billing_invoices:'created_at',invoice_versions:'created_at',measure_windows:'created_at',manufacturing_drawings:'created_at',factory_work_orders:'created_at'};
const search: Record<typeof roots[number],string>={
 customer_orders:"order_number LIKE ? ESCAPE '\\' OR customer_email LIKE ? ESCAPE '\\' OR project_name LIKE ? ESCAPE '\\' OR EXISTS (SELECT 1 FROM customers c WHERE c.email=t.customer_email AND (c.company_name LIKE ? ESCAPE '\\' OR c.contact_name LIKE ? ESCAPE '\\'))",
 quotes:"quote_number LIKE ? ESCAPE '\\' OR customer_email LIKE ? ESCAPE '\\' OR project_name LIKE ? ESCAPE '\\' OR EXISTS (SELECT 1 FROM customers c WHERE c.email=t.customer_email AND (c.company_name LIKE ? ESCAPE '\\' OR c.contact_name LIKE ? ESCAPE '\\'))",
 orders:"order_number LIKE ? ESCAPE '\\' OR project_name LIKE ? ESCAPE '\\' OR EXISTS (SELECT 1 FROM customers c WHERE c.id=t.customer_id AND (c.email LIKE ? ESCAPE '\\' OR c.company_name LIKE ? ESCAPE '\\' OR c.contact_name LIKE ? ESCAPE '\\'))",
 customer_quote_versions:"quote_number LIKE ? ESCAPE '\\' OR EXISTS (SELECT 1 FROM customers c WHERE c.id=t.customer_id AND (c.email LIKE ? ESCAPE '\\' OR c.company_name LIKE ? ESCAPE '\\' OR c.contact_name LIKE ? ESCAPE '\\'))",
 customer_billing_invoices:"invoice_number LIKE ? ESCAPE '\\' OR EXISTS (SELECT 1 FROM customers c WHERE c.id=t.customer_id AND (c.email LIKE ? ESCAPE '\\' OR c.company_name LIKE ? ESCAPE '\\' OR c.contact_name LIKE ? ESCAPE '\\'))",
 invoice_versions:"invoice_number LIKE ? ESCAPE '\\'",
 measure_windows:"code LIKE ? ESCAPE '\\' OR EXISTS (SELECT 1 FROM measure_properties p JOIN customers c ON c.id=p.customer_id WHERE p.id=t.property_id AND (p.name LIKE ? ESCAPE '\\' OR c.company_name LIKE ? ESCAPE '\\' OR c.contact_name LIKE ? ESCAPE '\\' OR c.email LIKE ? ESCAPE '\\'))",
 manufacturing_drawings:"CAST(id AS TEXT) LIKE ? ESCAPE '\\'",
 factory_work_orders:"factory_order_number LIKE ? ESCAPE '\\' OR factory_name LIKE ? ESCAPE '\\'",
};
const edges: Partial<Record<Source,[string,Source][]>>={
 orders:[['customer_id','customers']],measure_properties:[['customer_id','customers']],
 measure_windows:[['property_id','measure_properties']],measurement_versions:[['window_id','measure_windows']],
 customer_quote_versions:[['customer_id','customers'],['property_id','measure_properties']],
 customer_quote_signatures:[['quote_version_id','customer_quote_versions']],
 customer_billing_invoices:[['quote_version_id','customer_quote_versions'],['customer_id','customers'],['property_id','measure_properties']],
 invoice_versions:[['order_id','customer_orders']],
 manufacturing_drawings:[['window_id','measure_windows'],['measurement_version_id','measurement_versions']],
 manufacturing_factory_assignments:[['drawing_id','manufacturing_drawings']],
 factory_work_orders:[['window_id','measure_windows'],['measurement_version_id','measurement_versions'],['drawing_id','manufacturing_drawings'],['assignment_id','manufacturing_factory_assignments']],
};
function int(raw:string|null,fallback:number,max:number){if(raw===null)return fallback;if(!/^\d+$/.test(raw)||!Number.isSafeInteger(Number(raw))||Number(raw)>max)throw new ReviewInputError('分页参数无效');return Number(raw);}
export async function readReviewPage(db:ReadDB,url:URL){
 const source=(url.searchParams.get('source')||'customer_orders') as typeof roots[number];
 if(!roots.includes(source))throw new ReviewInputError('记录类型无效');
 const after=int(url.searchParams.get('after'),0,Number.MAX_SAFE_INTEGER),size=int(url.searchParams.get('size'),25,50);
 if(!size)throw new ReviewInputError('每页至少一条');
 const q=(url.searchParams.get('q')||'').trim();if(q.length>120)throw new ReviewInputError('搜索文字过长');
 const upper=url.searchParams.has('upper')?int(url.searchParams.get('upper'),0,Number.MAX_SAFE_INTEGER):Number((await db.all(`SELECT COALESCE(MAX(id),0) AS upper_id FROM ${source}`,[]))[0].upper_id);
 if(after>upper)throw new ReviewInputError('分页位置超过本批次上界');
 const where=['t.id > ?','t.id <= ?'],params:(string|number)[]=[after,upper];
 if(q){where.push(`(${search[source]})`);const literal='%'+q.replace(/[\\%_]/g,'\\$&')+'%';params.push(...Array((search[source].match(/\?/g)||[]).length).fill(literal));}
 for(const [key,op] of [['from','>='],['to','<=']] as const){const date=url.searchParams.get(key);if(date){if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date)throw new ReviewInputError('日期无效');where.push(`substr(t.${dates[source]},1,10) ${op} ?`);params.push(date);}}
 if(url.searchParams.get('from')&&url.searchParams.get('to')&&url.searchParams.get('from')!>url.searchParams.get('to')!)throw new ReviewInputError('开始日期晚于结束日期');
 const selected=await db.all(`SELECT ${previewColumns[source].split(',').map(c=>'t.'+c).join(',')} FROM ${source} t WHERE ${where.join(' AND ')} ORDER BY t.id LIMIT ?`,[...params,size+1]);
 const page=selected.slice(0,size),data=Object.fromEntries(Object.keys(previewColumns).map(k=>[k,[]])) as unknown as Dataset;data[source]=page;
 const fetched=new Set<string>(),signed=new Set<number>();for(const r of page)fetched.add(`${source}:${r.id}`);
 // Follow only exact references. Missing means queried-and-absent, never outside a page.
 for(let round=0;round<10;round++){
  let changed=false;
  for(const [from,relations] of Object.entries(edges) as [Source,[string,Source][]][]){
   for(const [field,to] of relations){const ids=[...new Set(data[from].map(r=>Number(r[field])).filter(id=>Number.isSafeInteger(id)&&id>0&&!fetched.has(`${to}:${id}`)))];
    if(!ids.length)continue;changed=true;for(const id of ids)fetched.add(`${to}:${id}`);
    for(let n=0;n<ids.length;n+=80){const chunk=ids.slice(n,n+80);data[to].push(...await db.all(`SELECT ${previewColumns[to]} FROM ${to} WHERE id IN (${chunk.map(()=>'?').join(',')})`,chunk));}
   }
  }
  const ids=data.customer_quote_versions.map(r=>Number(r.id)).filter(id=>!signed.has(id));
  for(let n=0;n<ids.length;n+=80){const chunk=ids.slice(n,n+80);chunk.forEach(id=>signed.add(id));const rows=await db.all(`SELECT ${previewColumns.customer_quote_signatures} FROM customer_quote_signatures WHERE quote_version_id IN (${chunk.map(()=>'?').join(',')})`,chunk);for(const r of rows)if(!data.customer_quote_signatures.some(x=>x.id===r.id))data.customer_quote_signatures.push(r);changed=true;}
  if(Object.values(data).reduce((n,r)=>n+r.length,0)>3000)throw Error('Reference expansion exceeds safe limit');
  if(!changed)break;if(round===9)throw Error('Incomplete reference expansion');
 }
 const model=buildOrderPreview(data);const keys=new Set(page.map(r=>`${source}:${r.id}`));const records=model.records.filter(r=>keys.has(r.key));
 return {readOnly:true,confirmationEnabled:false,records,related:model.records.filter(r=>!keys.has(r.key)),page:{source,size,after,upper,nextAfter:selected.length>size?Number(page.at(-1)!.id):null},counts:Object.fromEntries(['linked','review','conflict','orphan'].map(k=>[k,records.filter(r=>r.status===k).length])),scope:'统计仅涵盖本页。批次上界排除后续更大 ID 的新记录，但不冻结原记录修改或较小 ID 的补录；不是全库快照。'};
}
export async function readCandidates(db:ReadDB,url:URL){
 const id=int(url.searchParams.get('legacyId'),0,Number.MAX_SAFE_INTEGER),after=int(url.searchParams.get('after'),0,Number.MAX_SAFE_INTEGER);if(!id)throw new ReviewInputError('请选择旧订单');
 const legacy=(await db.all(`SELECT ${previewColumns.customer_orders} FROM customer_orders WHERE id=?`,[id]))[0];if(!legacy)throw new ReviewInputError('旧订单不存在');
 const candidates=await db.all(`SELECT ${previewColumns.orders.split(',').map(c=>'o.'+c).join(',')},c.email AS customer_email,c.company_name,c.contact_name FROM orders o LEFT JOIN customers c ON c.id=o.customer_id WHERE o.id>? AND ((?<>'' AND lower(trim(c.email))=lower(trim(?))) OR (?<>'' AND o.project_name=?) OR o.order_number=?) ORDER BY o.id LIMIT 21`,[after,String(legacy.customer_email||''),String(legacy.customer_email||''),String(legacy.project_name||''),String(legacy.project_name||''),String(legacy.order_number)]);
 return {readOnly:true,confirmationEnabled:false,legacy,candidates:candidates.slice(0,20).map(order=>({order,evidence:[...(String(order.customer_email||'').trim().toLowerCase()===String(legacy.customer_email||'').trim().toLowerCase()&&legacy.customer_email?['邮箱相同（非身份确认）']:[]),...(order.project_name===legacy.project_name&&legacy.project_name?['项目名称相同（非唯一标识）']:[]),...(order.order_number===legacy.order_number?['展示单号相同（不同编号体系）']:[])],warnings:[...(String(order.customer_email||'').trim().toLowerCase()!==String(legacy.customer_email||'').trim().toLowerCase()?['客户邮箱不同或缺失，需人工核验跨客户风险']:[]),'旧批发金额与 V4 含税/运费总额可能口径不同，不自动判错或改价。'],amountComparison:{legacyWholesale:legacy.wholesale_total,v4Total:order.grand_total,legacyCurrency:legacy.payment_currency,v4Currency:order.currency,sameCurrency:String(legacy.payment_currency||'').toUpperCase()===String(order.currency||'').toUpperCase(),basis:'不同口径展示，未判定可直接对账'},status:'review'})),nextAfter:candidates.length>20?Number(candidates[19].id):null,scope:'候选来自邮箱、项目名或展示编号相同的线索；未命中不表示没有关联。未确认、未保存。'};
}

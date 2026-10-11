/** Read-only review model. IDs are namespaced; no inferred matches are persisted. */
export type Row = Record<string, string | number | null>;
export const previewColumns = {
  customers: 'id,email,company_name,contact_name,phone',
  quotes: 'id,quote_number,customer_email,project_name,retail_total,wholesale_total',
  customer_orders: 'id,order_number,customer_email,project_name,retail_total,wholesale_total,payment_currency,status',
  orders: 'id,order_number,customer_id,project_name,project_address,grand_total,currency,status',
  customer_quote_versions: 'id,quote_number,version,customer_id,property_id,total,currency,status,document_sha256',
  customer_quote_signatures: 'id,quote_version_id,signed_document_sha256',
  customer_billing_invoices: 'id,invoice_number,quote_version_id,customer_id,property_id,total,currency,version,document_sha256',
  invoice_versions: 'id,order_id,invoice_number,version,document_sha256,snapshot_json',
  measure_properties: 'id,customer_id,name,address',
  measure_windows: 'id,property_id,room_id,code',
  measurement_versions: 'id,window_id,version,status',
  manufacturing_drawings: 'id,window_id,measurement_version_id,version,document_sha256,status',
  manufacturing_factory_assignments: 'id,drawing_id,factory_name',
  factory_work_orders: 'id,assignment_id,drawing_id,window_id,measurement_version_id,drawing_version,drawing_sha256,factory_name,factory_order_number,status',
} as const;
export type Source = keyof typeof previewColumns;
export type Dataset = Record<Source, Row[]>;
export type Proposal = { legacyOrderId: number; orderId: number };
export type Finding = {code: string; message: string};
export type PreviewRecord = {key: string; source: Source; original: Row; customer: Row | null; status: 'linked'|'review'|'conflict'|'orphan'; links: string[]; findings: Finding[]};
const issue = (code: string, message: string): Finding => ({code,message});
export function buildOrderPreview(data: Dataset, proposals: Proposal[] = []) {
  const index = Object.fromEntries(Object.entries(data).map(([table,rows]) => [table,new Map(rows.map(r => [Number(r.id),r]))])) as Record<Source,Map<number,Row>>;
  const records: PreviewRecord[] = [];
  const amountDiff = (a: unknown,b: unknown) => !Number.isFinite(Number(a)) || !Number.isFinite(Number(b)) || Math.round(Number(a)*100)!==Math.round(Number(b)*100);
  for (const source of Object.keys(previewColumns) as Source[]) {
    if (source==='customers') continue;
    for (const original of data[source]) {
      const links: string[] = [], findings: Finding[] = [];
      let customerId: number | undefined;
      const ref = (table: Source,id: unknown) => {
        const r = index[table].get(Number(id));
        if (!r) findings.push(issue('MISSING_REFERENCE', `引用不存在：${table}:${id ?? '空'}`));
        else links.push(`${table}:${r.id}`);
        return r;
      };
      const property = (id: unknown) => {const p=ref('measure_properties',id);if(p) customerId=Number(p.customer_id);return p;};
      if (source==='orders'||source==='measure_properties') customerId=Number(original.customer_id);
      if (source==='customer_orders'||source==='quotes') {
        findings.push(issue('LEGACY_IDENTITY_REVIEW','旧订单以邮箱识别客户，需人工核验；不会按邮箱自动绑定。'));
      }
      if (source==='customer_quote_versions'||source==='customer_billing_invoices') {
        const p=property(original.property_id);customerId=Number(original.customer_id);
        if(p && Number(p.customer_id)!==customerId) findings.push(issue('CROSS_CUSTOMER','单据客户与项目客户不一致。'));
      }
      if(source==='customer_quote_versions') {
        for(const s of data.customer_quote_signatures.filter(s=>s.quote_version_id===original.id)) {
          links.push(`customer_quote_signatures:${s.id}`);
          if(s.signed_document_sha256!==original.document_sha256) findings.push(issue('ISSUED_VERSION_CONFLICT','签名哈希与当前报价版本不一致。'));
        }
        if(original.status==='signed'&&!data.customer_quote_signatures.some(s=>s.quote_version_id===original.id)) findings.push(issue('ISSUED_VERSION_CONFLICT','报价标记已签署，但缺少签名记录。'));
      }
      if(source==='customer_billing_invoices') {
        const q=ref('customer_quote_versions',original.quote_version_id);
        if(q) {
          if(q.customer_id!==original.customer_id||q.property_id!==original.property_id) findings.push(issue('CROSS_CUSTOMER','账单与报价的客户或项目不同。'));
          if(q.currency!==original.currency||amountDiff(q.total,original.total)) findings.push(issue('AMOUNT_MISMATCH','账单与报价原始金额或币种不同，需核对选配及版本；不自动改价。'));
          if(q.status!=='signed') findings.push(issue('ISSUED_VERSION_CONFLICT','账单引用的报价不是已签署状态。'));
        }
      }
      if(source==='invoice_versions') ref('customer_orders',original.order_id);
      if(source==='customer_quote_signatures') {
        const q=ref('customer_quote_versions',original.quote_version_id);
        if(q) {customerId=Number(q.customer_id);if(q.document_sha256!==original.signed_document_sha256) findings.push(issue('ISSUED_VERSION_CONFLICT','签名与报价哈希不同。'));}
      }
      if(source==='measurement_versions') {const w=ref('measure_windows',original.window_id);if(w) property(w.property_id);}
      if(source==='manufacturing_factory_assignments') ref('manufacturing_drawings',original.drawing_id);
      if(source==='measure_windows') property(original.property_id);
      if(source==='manufacturing_drawings'||source==='factory_work_orders') {
        const w=ref('measure_windows',original.window_id);if(w) property(w.property_id);
        const m=ref('measurement_versions',original.measurement_version_id);
        if(m&&m.window_id!==original.window_id) findings.push(issue('WINDOW_CONFLICT','测量版本属于其他窗口。'));
      }
      if(source==='factory_work_orders') {
        const d=ref('manufacturing_drawings',original.drawing_id),a=ref('manufacturing_factory_assignments',original.assignment_id);
        if(a&&a.drawing_id!==original.drawing_id) findings.push(issue('ISSUED_VERSION_CONFLICT','工厂分配与生产单加工图不同。'));
        if(d&&(d.window_id!==original.window_id||d.measurement_version_id!==original.measurement_version_id||d.version!==original.drawing_version||d.document_sha256!==original.drawing_sha256)) findings.push(issue('ISSUED_VERSION_CONFLICT','生产单冻结的加工图版本、窗口或哈希不一致。'));
      }
      const customer=customerId?ref('customers',customerId)||null:null;
      if(customerId===0) findings.push(issue('MISSING_REFERENCE','未关联客户。'));
      const status = findings.some(f=>!['MISSING_REFERENCE','LEGACY_IDENTITY_REVIEW'].includes(f.code))?'conflict':findings.some(f=>f.code==='MISSING_REFERENCE')?'orphan':(source==='customer_orders'||source==='quotes')?'review':links.length?'linked':'review';
      records.push({key:`${source}:${original.id}`,source,original,customer,status,links,findings});
    }
  }
  // Explicit proposals are request-local comparison only, never inferred or saved.
  const candidates = proposals.map(p => {
    const legacy=index.customer_orders.get(p.legacyOrderId),order=index.orders.get(p.orderId),findings: Finding[]=[];
    if(!legacy||!order) findings.push(issue('MISSING_REFERENCE','候选关联中的旧订单或 V4 订单不存在。'));
    if(proposals.filter(x=>x.legacyOrderId===p.legacyOrderId).length>1) findings.push(issue('DUPLICATE_SOURCE','同一旧订单出现重复候选来源，不能重复确认。'));
    if(legacy&&order) {
      const c=index.customers.get(Number(order.customer_id));
      if(!c||String(c.email).trim().toLowerCase()!==String(legacy.customer_email).trim().toLowerCase()) findings.push(issue('CROSS_CUSTOMER','旧客户邮箱与目标客户不一致或目标客户缺失，必须核验身份。'));
      if(String(legacy.payment_currency).toUpperCase()!==String(order.currency).toUpperCase()||amountDiff(legacy.wholesale_total,order.grand_total)) findings.push(issue('AMOUNT_MISMATCH','旧订单原始批发总额与 V4 总额或币种不一致。'));
    }
    return {...p,legacy:legacy||null,order:order||null,status:findings.length?'conflict':'review',findings};
  });
  return {readOnly:true,confirmationEnabled:false,confirmationRole:'owner',scope:'linked 表示已有明确引用，不代表已经联通统一订单或通过金额验收。',records,candidates};
}

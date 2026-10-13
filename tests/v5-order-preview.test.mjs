import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {build} from 'esbuild';
const db=new DatabaseSync(':memory:');
for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())db.exec(fs.readFileSync('drizzle/'+f,'utf8'));
const token='isolated-fixture-token',hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token)))).map(b=>b.toString(16).padStart(2,'0')).join('');
db.exec("INSERT INTO app_users(id,email,password_hash,password_salt,role) VALUES(1,'owner@example.invalid','fixture','fixture','owner'); INSERT INTO customers(id,email,company_name) VALUES(1,'a@example.invalid','Original customer'),(2,'b@example.invalid','Other'); INSERT INTO orders(id,order_number,customer_id,grand_total) VALUES(1,'00001',1,100),(2,'00002',2,200); INSERT INTO customer_orders(id,order_number,customer_email,items_json,retail_total,wholesale_total,discount_percent) VALUES(1,'Z-KEEP-OLD','a@example.invalid','[]',120,100,0);");
db.prepare('INSERT INTO app_sessions(user_id,token_hash,expires_at) VALUES(1,?,?)').run(hash,'2099-01-01T00:00:00.000Z');
globalThis.previewCookie=token;
let queries=[];
globalThis.previewEnv={DB:{prepare(sql){assert.match(sql,/^SELECT /);queries.push(sql);let params=[];return {bind(...p){params=p;return this;},first(){return db.prepare(sql).get(...params)||null;},all(){return {success:true,results:db.prepare(sql).all(...params)};},sql};},batch(stmts){return stmts.map(s=>({success:true,results:db.prepare(s.sql).all()}));}}};
const route=await build({entryPoints:['app/api/v5/order-preview/route.ts'],bundle:true,write:false,format:'esm',platform:'node',plugins:[{name:'isolated',setup(b){b.onResolve({filter:/^(cloudflare:workers|next\/headers)$/},a=>({path:a.path,namespace:'test'}));b.onLoad({filter:/.*/,namespace:'test'},({path})=>({contents:path==='cloudflare:workers'?'export const env=globalThis.previewEnv;':'export const cookies=async()=>({get:()=>globalThis.previewCookie?{value:globalThis.previewCookie}:undefined});',loader:'js'}));}}]});
const api=await import('data:text/javascript;base64,'+Buffer.from(route.outputFiles[0].text).toString('base64'));
const model=await build({entryPoints:['lib/v5-order-preview.ts'],bundle:true,write:false,format:'esm',platform:'node'});
const {buildOrderPreview,previewColumns}=await import('data:text/javascript;base64,'+Buffer.from(model.outputFiles[0].text).toString('base64'));
const empty=()=>Object.fromEntries(Object.keys(previewColumns).map(k=>[k,[]]));
const get=(query='')=>api.GET(new Request('http://localhost/api/v5/order-preview?'+query));
const snapshot=()=>db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all().map(({name})=>[name,db.prepare(`SELECT * FROM "${name}"`).all()]);
test('preview on query_only database preserves every table and original amount/number',async()=>{
 const before=snapshot();db.exec('PRAGMA query_only=ON');const r=await get();assert.equal(r.status,200);const body=await r.json();assert.equal(body.records[0].status,'review');assert.equal(body.records[0].original.order_number,'Z-KEEP-OLD');assert.equal(body.records[0].original.wholesale_total,100);assert.equal(body.confirmationEnabled,false);assert.deepEqual(snapshot(),before);assert.match(r.headers.get('cache-control'),/no-store/);db.exec('PRAGMA query_only=OFF');
});
test('all non-owner roles denied before business reads',async()=>{
 for(const role of ['sales','factory','installer','customer']){db.prepare('UPDATE app_users SET role=?').run(role);queries=[];assert.equal((await get()).status,403);assert.equal(queries.length,1);}
 db.exec("UPDATE app_users SET role='owner'");globalThis.previewCookie=null;assert.equal((await get()).status,401);globalThis.previewCookie=token;
});
test('revoked session rejected and recovery config blocks without applying recovery',async()=>{
 db.exec("UPDATE app_sessions SET revoked_at='2026-01-01'");assert.equal((await get()).status,401);db.exec('UPDATE app_sessions SET revoked_at=NULL');globalThis.previewEnv.V4_OWNER_RECOVERY='configured';queries=[];assert.equal((await get()).status,503);assert.equal(queries.length,0);delete globalThis.previewEnv.V4_OWNER_RECOVERY;
});
test('confirmation writes are unavailable even for Owner',async()=>{const before=snapshot();assert.equal((await api.POST()).status,405);assert.deepEqual(snapshot(),before);});
test('candidate discovery returns evidence but never confirms',async()=>{
 const body=await (await get('mode=candidates&legacyId=1')).json();assert.equal(body.candidates[0].status,'review');assert.ok(body.candidates[0].evidence.some(s=>s.includes('邮箱')));assert.equal(body.confirmationEnabled,false);
});
test('invalid pagination and date rejected',async()=>{for(const q of ['size=0','size=51','after=-1','from=2026-02-30','from=2026-10-02&to=2026-10-01','source=app_users'])assert.equal((await get(q)).status,400,q);});
test('issued signature and frozen production version conflicts detected',()=>{
 const d=empty();d.customers=[{id:1}];d.measure_properties=[{id:1,customer_id:1}];d.measure_windows=[{id:1,property_id:1}];d.measurement_versions=[{id:1,window_id:1}];d.customer_quote_versions=[{id:1,customer_id:1,property_id:1,status:'signed',document_sha256:'current'}];d.customer_quote_signatures=[{id:1,quote_version_id:1,signed_document_sha256:'original'}];d.manufacturing_drawings=[{id:1,window_id:1,measurement_version_id:1,version:2,document_sha256:'new'}];d.manufacturing_factory_assignments=[{id:1,drawing_id:1}];d.factory_work_orders=[{id:1,assignment_id:1,drawing_id:1,window_id:1,measurement_version_id:1,drawing_version:1,drawing_sha256:'old'}];
 const r=buildOrderPreview(d);for(const k of ['customer_quote_versions:1','factory_work_orders:1'])assert.ok(r.records.find(x=>x.key===k).findings.some(f=>f.code==='ISSUED_VERSION_CONFLICT'));
});
test('namespaced legacy invoice relation does not point to V4 order with same numeric id',()=>{
 const d=empty();d.orders=[{id:1,customer_id:1}];d.invoice_versions=[{id:1,order_id:1,document_sha256:'hash',snapshot_json:'{}'}];assert.equal(buildOrderPreview(d).records.find(r=>r.key==='invoice_versions:1').status,'orphan');d.customer_orders=[{id:1}];assert.ok(buildOrderPreview(d).records.find(r=>r.key==='invoice_versions:1').links.includes('customer_orders:1'));
});
test('read failures never become empty success',async()=>{const old=globalThis.previewEnv.DB.prepare;globalThis.previewEnv.DB.prepare=sql=>{if(!sql.includes('app_sessions'))throw Error('fixture');return old(sql);};assert.equal((await get()).status,503);globalThis.previewEnv.DB.prepare=old;});
test('keyset pagination, customer search and inclusive date filter',async()=>{
 db.exec("UPDATE customer_orders SET created_at='2026-10-01'; INSERT INTO customer_orders(id,order_number,customer_email,project_name,items_json,retail_total,wholesale_total,discount_percent,created_at) VALUES(9,'Z-LATER','b@example.invalid','Long project','[]',90,80,0,'2026-10-02')");
 let body=await(await get('size=1')).json();assert.equal(body.page.nextAfter,1);body=await(await get('size=1&after=1')).json();assert.equal(body.records[0].original.id,9);assert.equal(body.page.nextAfter,null);
 body=await(await get('q=Original%20customer&from=2026-10-01&to=2026-10-01')).json();assert.equal(body.records.length,1);assert.equal(body.records[0].original.id,1);
 body=await(await get('q=%25')).json();assert.equal(body.records.length,0); // literal %, not wildcard
});
test('exact references outside page are hydrated and not false orphans',async()=>{
 const body=await(await get('source=orders&after=1&size=1')).json();assert.equal(body.records[0].original.id,2);assert.equal(body.records[0].customer.email,'b@example.invalid');assert.equal(body.records[0].status,'linked');
});
test('each source loads only a bounded page with selective relation reads',async()=>{
 queries=[];await get('source=orders&size=1');assert.ok(queries.every(q=>!q.includes('LIMIT 5001')));assert.ok(queries.length<8);assert.ok(!queries.some(q=>q.includes('FROM factory_work_orders')));
});
test('candidate query and all source pages remain read-only',async()=>{
 const before=snapshot();db.exec('PRAGMA query_only=ON');for(const source of ['customer_orders','orders','quotes','customer_quote_versions','customer_billing_invoices','invoice_versions','measure_windows','manufacturing_drawings','factory_work_orders'])assert.equal((await get('source='+source)).status,200,source);assert.equal((await get('mode=candidates&legacyId=1')).status,200);assert.deepEqual(snapshot(),before);db.exec('PRAGMA query_only=OFF');
});
test('amount-only invoice differences require review rather than declaring corrupt data',()=>{
 const d=empty();d.customers=[{id:1}];d.measure_properties=[{id:1,customer_id:1}];d.customer_quote_versions=[{id:1,customer_id:1,property_id:1,total:100,currency:'USD',status:'signed',document_sha256:'hash'}];d.customer_billing_invoices=[{id:1,quote_version_id:1,customer_id:1,property_id:1,total:120,currency:'USD',document_sha256:'invoice'}];assert.equal(buildOrderPreview(d).records.find(r=>r.key==='customer_billing_invoices:1').status,'review');
});
test('missing document evidence is explicit',()=>{const d=empty();d.customer_orders=[{id:1}];d.invoice_versions=[{id:1,order_id:1,document_sha256:'',snapshot_json:''}];assert.ok(buildOrderPreview(d).records.find(r=>r.key==='invoice_versions:1').findings.some(f=>f.code==='MISSING_DOCUMENT_EVIDENCE'));});
test('read observation has unique request IDs and changes fingerprint when loaded content changes',async()=>{
 const a=await(await get()).json(),b=await(await get()).json();assert.notEqual(a.audit.requestId,b.audit.requestId);assert.equal(a.audit.contentHash,b.audit.contentHash);assert.equal(a.audit.kind,'read-observation-not-database-snapshot');
 db.exec('UPDATE customer_orders SET wholesale_total=101 WHERE id=1');const c=await(await get()).json();assert.notEqual(a.audit.contentHash,c.audit.contentHash);db.exec('UPDATE customer_orders SET wholesale_total=100 WHERE id=1');
});

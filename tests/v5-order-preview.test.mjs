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
globalThis.previewEnv={DB:{prepare(sql){assert.match(sql,/^SELECT /);queries.push(sql);let params=[];return {bind(...p){params=p;return this;},first(){return db.prepare(sql).get(...params)||null;},sql};},batch(stmts){return stmts.map(s=>({success:true,results:db.prepare(s.sql).all()}));}}};
const route=await build({entryPoints:['app/api/v5/order-preview/route.ts'],bundle:true,write:false,format:'esm',platform:'node',plugins:[{name:'isolated',setup(b){b.onResolve({filter:/^(cloudflare:workers|next\/headers)$/},a=>({path:a.path,namespace:'test'}));b.onLoad({filter:/.*/,namespace:'test'},({path})=>({contents:path==='cloudflare:workers'?'export const env=globalThis.previewEnv;':'export const cookies=async()=>({get:()=>globalThis.previewCookie?{value:globalThis.previewCookie}:undefined});',loader:'js'}));}}]});
const api=await import('data:text/javascript;base64,'+Buffer.from(route.outputFiles[0].text).toString('base64'));
const model=await build({entryPoints:['lib/v5-order-preview.ts'],bundle:true,write:false,format:'esm',platform:'node'});
const {buildOrderPreview,previewColumns}=await import('data:text/javascript;base64,'+Buffer.from(model.outputFiles[0].text).toString('base64'));
const empty=()=>Object.fromEntries(Object.keys(previewColumns).map(k=>[k,[]]));
const get=p=>api.GET(new Request('http://localhost/api/v5/order-preview?pairs='+encodeURIComponent(JSON.stringify(p||[]))));
const snapshot=()=>db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all().map(({name})=>[name,db.prepare(`SELECT * FROM "${name}"`).all()]);
test('preview on query_only database preserves every table and original amount/number',async()=>{
 const before=snapshot();db.exec('PRAGMA query_only=ON');const r=await get([{legacyOrderId:1,orderId:1}]);assert.equal(r.status,200);const body=await r.json();assert.equal(body.candidates[0].status,'review');assert.equal(body.candidates[0].legacy.order_number,'Z-KEEP-OLD');assert.equal(body.candidates[0].legacy.wholesale_total,100);assert.equal(body.confirmationEnabled,false);assert.deepEqual(snapshot(),before);assert.match(r.headers.get('cache-control'),/no-store/);db.exec('PRAGMA query_only=OFF');
});
test('all non-owner roles denied before business reads',async()=>{
 for(const role of ['sales','factory','installer','customer']){db.prepare('UPDATE app_users SET role=?').run(role);queries=[];assert.equal((await get()).status,403);assert.equal(queries.length,1);}
 db.exec("UPDATE app_users SET role='owner'");globalThis.previewCookie=null;assert.equal((await get()).status,401);globalThis.previewCookie=token;
});
test('revoked session rejected and recovery config blocks without applying recovery',async()=>{
 db.exec("UPDATE app_sessions SET revoked_at='2026-01-01'");assert.equal((await get()).status,401);db.exec('UPDATE app_sessions SET revoked_at=NULL');globalThis.previewEnv.V4_OWNER_RECOVERY='configured';queries=[];assert.equal((await get()).status,503);assert.equal(queries.length,0);delete globalThis.previewEnv.V4_OWNER_RECOVERY;
});
test('confirmation writes are unavailable even for Owner',async()=>{const before=snapshot();assert.equal((await api.POST()).status,405);assert.deepEqual(snapshot(),before);});
test('duplicate proposed source, cross customer and differing amounts are explicit',async()=>{
 const body=await (await get([{legacyOrderId:1,orderId:1},{legacyOrderId:1,orderId:2}])).json();assert.ok(body.candidates[0].findings.some(f=>f.code==='DUPLICATE_SOURCE'));for(const code of ['CROSS_CUSTOMER','AMOUNT_MISMATCH'])assert.ok(body.candidates[1].findings.some(f=>f.code===code));
});
test('invalid proposal rejected',async()=>{assert.equal((await get([{legacyOrderId:-1,orderId:1}])).status,400);});
test('issued signature and frozen production version conflicts detected',()=>{
 const d=empty();d.customers=[{id:1}];d.measure_properties=[{id:1,customer_id:1}];d.measure_windows=[{id:1,property_id:1}];d.measurement_versions=[{id:1,window_id:1}];d.customer_quote_versions=[{id:1,customer_id:1,property_id:1,status:'signed',document_sha256:'current'}];d.customer_quote_signatures=[{id:1,quote_version_id:1,signed_document_sha256:'original'}];d.manufacturing_drawings=[{id:1,window_id:1,measurement_version_id:1,version:2,document_sha256:'new'}];d.manufacturing_factory_assignments=[{id:1,drawing_id:1}];d.factory_work_orders=[{id:1,assignment_id:1,drawing_id:1,window_id:1,measurement_version_id:1,drawing_version:1,drawing_sha256:'old'}];
 const r=buildOrderPreview(d);for(const k of ['customer_quote_versions:1','factory_work_orders:1'])assert.ok(r.records.find(x=>x.key===k).findings.some(f=>f.code==='ISSUED_VERSION_CONFLICT'));
});
test('namespaced legacy invoice relation does not point to V4 order with same numeric id',()=>{
 const d=empty();d.orders=[{id:1,customer_id:1}];d.invoice_versions=[{id:1,order_id:1}];assert.equal(buildOrderPreview(d).records.find(r=>r.key==='invoice_versions:1').status,'orphan');d.customer_orders=[{id:1}];assert.ok(buildOrderPreview(d).records.find(r=>r.key==='invoice_versions:1').links.includes('customer_orders:1'));
});
test('data read failure cannot return an empty success',async()=>{const old=globalThis.previewEnv.DB.batch;globalThis.previewEnv.DB.batch=()=>{throw Error('fixture failure');};assert.equal((await get()).status,503);globalThis.previewEnv.DB.batch=old;});
test('truncated read refuses classification instead of falsely marking orphans',async()=>{const old=globalThis.previewEnv.DB.batch;globalThis.previewEnv.DB.batch=()=>[{success:true,results:Array(5001).fill({id:1})}];assert.equal((await get()).status,413);globalThis.previewEnv.DB.batch=old;});

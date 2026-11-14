import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {drizzle} from 'drizzle-orm/sqlite-proxy';
import {build} from 'esbuild';
const db=new DatabaseSync(':memory:');
for(const file of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())db.exec(fs.readFileSync('drizzle/'+file,'utf8'));
globalThis.accessTestDb=drizzle(async(sql,params)=>{const stmt=db.prepare(sql);stmt.setReturnArrays(true);return {rows:stmt.all(...params)};});
const out=await build({entryPoints:['app/api/v4/orders/route.ts'],bundle:true,write:false,format:'esm',platform:'node',plugins:[{name:'test-runtime',setup(b){
 b.onResolve({filter:/^(next\/server|@\/db|@\/lib\/v4-auth)$/},args=>({path:args.path,namespace:'test-runtime'}));
 b.onLoad({filter:/.*/,namespace:'test-runtime'},({path})=>({contents:path==='next/server'?'export const NextResponse=Response;':path==='@/db'?'export const getDb=async()=>globalThis.accessTestDb;':'export const getCurrentAppUser=async()=>globalThis.accessTestUser;export const writeAuditLog=async()=>{};',loader:'js'}));
}}]});
const {POST}=await import('data:text/javascript;base64,'+Buffer.from(out.outputFiles[0].text).toString('base64'));
db.exec("INSERT INTO customers(id,email,sales_owner_user_id) VALUES(1,'one@example.invalid',10),(2,'two@example.invalid',20)");
const post=(role,customerId)=>{globalThis.accessTestUser=role?{id:role==='owner'?1:10,role,customerId:null}:null;return POST(new Request('http://localhost/api/v4/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({customerId,projectName:'Access regression'})}));};
const orders=()=>db.prepare('SELECT COUNT(*) n FROM orders').get().n;
test('denies unauthenticated and non-sales roles without changing records',async()=>{
 for(const [role,status] of [[null,401],['customer',403],['factory',403],['installer',403]])assert.equal((await post(role,1)).status,status);
 assert.equal(orders(),0);
});
test('sales cannot claim a foreign customer or advance the sequence',async()=>{
 const before=db.prepare('SELECT * FROM order_sequences').all();assert.equal((await post('sales',2)).status,404);assert.equal(orders(),0);assert.deepEqual(db.prepare('SELECT * FROM order_sequences').all(),before);
});
test('sales owned and explicitly assigned customers work; owner can create for any customer',async()=>{
 assert.equal((await post('sales',1)).status,201);
 const owner=await post('owner',2);assert.equal(owner.status,201);const {order}=await owner.json();
 db.prepare('INSERT INTO unified_order_assignments(order_id,user_id) VALUES(?,?)').run(order.id,10);
 assert.equal((await post('sales',2)).status,201);assert.equal(orders(),3);
});

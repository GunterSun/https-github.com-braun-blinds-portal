// Synthetic isolated SQLite only. Executes the actual V5.2 read model.
import fs from 'node:fs';import {DatabaseSync} from 'node:sqlite';import {build} from 'esbuild';import os from 'node:os';
const out=await build({entryPoints:['lib/v5-review-reader.ts'],bundle:true,write:false,format:'esm',platform:'node'});
const {readReviewPage,readCandidates}=await import('data:text/javascript;base64,'+Buffer.from(out.outputFiles[0].text).toString('base64'));
const db=new DatabaseSync(':memory:');for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())db.exec(fs.readFileSync('drizzle/'+f,'utf8'));
const c=db.prepare('INSERT INTO customers(id,email,company_name,contact_name) VALUES(?,?,?,?)'),o=db.prepare('INSERT INTO orders(id,order_number,customer_id,project_name,grand_total,created_at) VALUES(?,?,?,?,100,?)'),l=db.prepare("INSERT INTO customer_orders(id,order_number,customer_email,project_name,items_json,retail_total,wholesale_total,discount_percent,created_at) VALUES(?,?,?,?,'[]',120,100,0,?)");
const report={environment:{node:process.version,sqlite:db.prepare('select sqlite_version() v').get().v,cpu:os.cpus()[0].model,platform:os.platform(),database:'in-memory synthetic SQLite; not D1; no HTTP/network/concurrency'},samples:[],warmup:3,runs:20};let previous=0;
for(const count of [10000,100000,500000]){
 db.exec('PRAGMA query_only=OFF;BEGIN');for(let id=previous+1;id<=count;id++){const email=`c${id}@example.invalid`,project=`Project ${id}`,date='2026-10-'+String(1+id%28).padStart(2,'0');c.run(id,email,'Customer '+id,'Contact '+id);o.run(id,String(id).padStart(6,'0'),id,project,date);l.run(id,'Z-'+id,email,project,date);}db.exec('COMMIT;PRAGMA query_only=ON');previous=count;
 const scenarios=[['page','source=orders'],['deep-page',`source=orders&after=${count-100}`],['customer-search','source=orders&q=Customer%209999'],['complex-no-match','source=orders&q=not-present&from=2026-10-01&to=2026-10-28'],['candidate',`mode=candidates&legacyId=${count}`]];
 for(const [name,query] of scenarios){const durations=[],plans=new Map();let errors=0,maxQueries=0,maxRows=0;
  for(let i=-3;i<20;i++){let queries=0,rows=0;const adapter={all:async(sql,params)=>{queries++;if(i===0)plans.set(sql,db.prepare('EXPLAIN QUERY PLAN '+sql).all(...params));const result=db.prepare(sql).all(...params);rows+=result.length;return result;}};const start=performance.now();try{await(name==='candidate'?readCandidates:readReviewPage)(adapter,new URL('http://isolated/?'+query));}catch(e){errors++;}const ms=performance.now()-start;if(i>=0){durations.push(ms);maxQueries=Math.max(maxQueries,queries);maxRows=Math.max(maxRows,rows);}}
  durations.sort((a,b)=>a-b);report.samples.push({recordsPerCoreTable:count,scenario:name,p50Ms:durations[9],p95Ms:durations[18],maxMs:durations[19],errors,totalRuns:23,maxQueries,maxReturnedRowsIncludingReferences:maxRows,plans:[...plans].map(([sql,plan])=>({sql,plan}))});console.log(count,name,'P95',durations[18].toFixed(2),'ms');
 }
}
fs.writeFileSync('docs/v5/validation/v52-performance.json',JSON.stringify(report,null,2)+'\n');db.close();

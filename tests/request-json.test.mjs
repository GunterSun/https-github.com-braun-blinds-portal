import {test} from 'node:test';import assert from 'node:assert/strict';import {build} from 'esbuild';
const out=await build({entryPoints:['lib/request-json.ts'],bundle:true,write:false,format:'esm'});
const {requestJson,requestSession}=await import('data:text/javascript;base64,'+Buffer.from(out.outputFiles[0].text).toString('base64'));
test('401 is signed out; 503 is an operational error',async()=>{
 const original=globalThis.fetch;try{globalThis.fetch=async()=>Response.json({authenticated:false},{status:401});assert.equal(await requestSession(),null);globalThis.fetch=async()=>new Response('<html>Error</html>',{status:503});await assert.rejects(requestSession(),e=>e.status===503&&!e.message.includes('Unexpected'));}finally{globalThis.fetch=original;}
});
test('timeout aborts and POST is never repeated',async()=>{
 const original=globalThis.fetch;let calls=0;try{globalThis.fetch=(_url,{signal})=>{calls++;return new Promise((_,reject)=>signal.addEventListener('abort',()=>reject(new Error('aborted'))));};await assert.rejects(requestJson('/test',{method:'POST',body:'{}'},5),/Timed out/);assert.equal(calls,1);}finally{globalThis.fetch=original;}
});
test('successful JSON and server validation messages survive',async()=>{
 const original=globalThis.fetch;try{globalThis.fetch=async()=>Response.json({ok:true});assert.deepEqual(await requestJson('/test'),{ok:true});globalThis.fetch=async()=>Response.json({error:'Invalid dimensions'},{status:400});await assert.rejects(requestJson('/test'),/Invalid dimensions/);}finally{globalThis.fetch=original;}
});

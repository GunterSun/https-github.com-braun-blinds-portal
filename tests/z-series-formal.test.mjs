import assert from 'node:assert/strict';
import test from 'node:test';
import {build} from 'esbuild';
const compile=await build({entryPoints:['lib/z-series-formal.ts'],bundle:true,write:false,format:'esm',platform:'node'});
const {buildZSeriesLines,lineHandoffIds,quoteHandoffIds}=await import('data:text/javascript;base64,'+Buffer.from(compile.outputFiles[0].text).toString('base64'));
const handoff=(id,property=1,customer=10)=>({id,sourceHash:'hash-'+id,sourceSnapshotJson:JSON.stringify({property:{id:property,customerId:customer},room:{name:'Room '+id},window:{code:'W'+id}})});
const line=(id,supplier='Factory A')=>({handoffId:id,room:'Room '+id,windowCode:'W'+id,supplier,fabricCode:'BZM11',productCode:'LM0002',width:36,height:60,depth:4,quantity:2});
test('multiple windows, multiple products and suppliers retain provenance and exact totals',()=>{
 const a=line(1),b=line(2,'Factory B'),c={...line(2,'Factory C'),quantity:1};
 const result=buildZSeriesLines([a,b,c],1,[handoff(1),handoff(2)],'retail',0);
 assert.equal(result.pricedLines.length,3);assert.equal(result.subtotal,2797.75);assert.deepEqual(result.handoffIds,[1,2]);assert.equal(result.pricedLines[2].supplier,'Factory C');assert.equal(result.sources[1].sourceHash,'hash-2');
});
test('old single-window payload remains valid and wholesale is server calculated',()=>{
 const old=line(1);delete old.handoffId;delete old.supplier;old.unitPrice=.01;
 const result=buildZSeriesLines([old],1,[handoff(1)],'wholesale',30);assert.equal(result.pricedLines[0].unitPrice,391.68);assert.equal(result.subtotal,783.36);
});
test('rejects foreign customer/property, mismatched windows, unknown products, malformed quantities and dimensions',()=>{
 for(const [lines,hs]of [ [[line(1),line(2)],[handoff(1),handoff(2,2)]],[[line(1),line(2)],[handoff(1),handoff(2,1,20)]],[[{...line(1),windowCode:'W2'}],[handoff(1)]],[[{...line(1),productCode:'FAKE'}],[handoff(1)]],[[{...line(1),quantity:1.5}],[handoff(1)]],[[{...line(1),quantity:0}],[handoff(1)]],[[{...line(1),width:99999}],[handoff(1)]],[[{...line(1),supplier:''}],[handoff(1)]] ])assert.throws(()=>buildZSeriesLines(lines,1,hs,'retail',0));
});
test('requires bounded lines and valid source; downstream associations include every window',()=>{
 assert.throws(()=>lineHandoffIds([],1));assert.throws(()=>lineHandoffIds(Array(101).fill(line(1)),1));assert.throws(()=>lineHandoffIds([line(2)],1));
 assert.deepEqual(quoteHandoffIds({handoffId:1,sourceSnapshotJson:JSON.stringify({zSeries:{lines:[line(1),line(2),line(2)]}})}),[1,2]);
 assert.deepEqual(quoteHandoffIds({handoffId:1,sourceSnapshotJson:'{}'}),[1]);
});

// Run only against the isolated local QA database prepared by .sites-runtime/qa.sql.
import assert from 'node:assert/strict';
const base='http://127.0.0.1:5180';
async function api(path,body,role='owner',key=crypto.randomUUID()){
 const r=await fetch(base+path,{method:body?'POST':'GET',headers:{Cookie:`braun_v4_session=local-formal-qa-${role}`,'Content-Type':'application/json','Idempotency-Key':key},body:body?JSON.stringify(body):undefined});return {status:r.status,data:await r.json()};
}
const setup=await api('/api/v4/z-series-quotes?setup=1');assert.equal(setup.status,200);assert.equal(setup.data.items.length,800);
const line=(handoffId,supplier,quantity)=>({handoffId,supplier,room:'Room '+handoffId,windowCode:'W'+handoffId,fabricCode:'BZM11',productCode:'LM0002',width:36,height:60,depth:4,quantity});
const body={handoffId:99031,lines:[line(99031,'Supplier A',1),line(99032,'Supplier B',2)],priceMode:'retail',discountPercent:0,taxAmount:10,shippingFee:20,installationFee:30,depositRequired:100,validUntil:'2099-01-01',terms:'Local test only'};
const key=crypto.randomUUID();const results=await Promise.all([api('/api/v4/z-series-quotes',body,'owner',key),api('/api/v4/z-series-quotes',body,'owner',key)]);
for(const r of results)assert.ok([200,201].includes(r.status),JSON.stringify(r));
const q=results[0].data.quote;assert.equal(q.id,results[1].data.quote.id);assert.equal(q.total,1738.65);assert.equal(q.shippingFee,20);assert.equal(q.source.zSeries.lines.length,2);assert.equal(q.source.zSeries.handoffs.length,2);
assert.equal((await api('/api/v4/z-series-quotes',{...body,taxAmount:11},'owner',key)).status,409);
assert.equal((await api('/api/v4/z-series-quotes',{...body,lines:[{...body.lines[0],quantity:1.5}]})).status,400);
assert.equal((await api('/api/v4/z-series-quotes',body,'customer')).status,403);
assert.equal((await api('/api/v4/z-series-quotes?setup=1',undefined,'customer')).status,403);
const signed=await api('/api/v4/customer-quotes/sign',{quoteId:q.id,printedName:'Local QA',signatureText:'Local QA',timezone:'America/Los_Angeles',acceptDisclaimer:true},'customer');assert.equal(signed.status,201,JSON.stringify(signed));
const bill=await api('/api/v4/customer-billing',{quoteVersionId:q.id,dueDate:'2099-01-01'});assert.equal(bill.status,201,JSON.stringify(bill));assert.equal(bill.data.invoice.customerSnapshot.source.zSeries.lines.length,2);assert.equal(bill.data.invoice.total,1738.65);
const general=await api('/api/v4/customer-quotes');assert.equal(general.status,200);assert.equal(general.data.quotes.find(x=>x.id===q.id).shippingFee,20);
console.log('PASS: 2-window / 2-supplier issuance, concurrent duplicate protection, input validation, customer permissions, signature, invoice and shipping totals');

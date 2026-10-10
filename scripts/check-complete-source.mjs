import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const path=new URL('../public/complete/app.js',import.meta.url);
const source=fs.readFileSync(path,'utf8');
new vm.Script(source,{filename:path.pathname});
assert.ok(Buffer.byteLength(source)>200000,'Complete source is unexpectedly small: possible truncated upload');
for(const name of ['calculateItemPrice','calculateFabricationDetails','exportFabricationExcel','exportInvoiceLongPdf'])assert.match(source,new RegExp('function '+name+'\\('),`Missing ${name}`);
console.log(`Complete source verified: ${Buffer.byteLength(source)} bytes; pricing, fabrication and Invoice export functions present.`);

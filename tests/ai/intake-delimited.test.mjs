import test from 'node:test';
import assert from 'node:assert/strict';
import {parseDelimitedInquiry} from '../../lib/ai/intake-delimited.ts';
test('converts tabular windows to numbered inquiry text',()=>{
 const result=parseDelimitedInquiry('Window,Model,Width,Height,Qty,Color\nW01,JL3601,39 5/8,40 5/8,1,White\nW02,ML-1801,36,60,2,Beige',',');
 assert.equal(result.rows,2);assert.match(result.text,/W01: JL3601 39 5\/8 x 40 5\/8 qty 1 White/);
});
test('quoted commas and newlines remain within cells',()=>{
 const result=parseDelimitedInquiry('Window,Model,Width,Height,Notes\nW01,JL3601,36,60,"Living, west"',',');
 assert.match(result.text,/Living, west/);
});
test('requires explicit dimension columns',()=>assert.throws(()=>parseDelimitedInquiry('model,price\nJL3601,100',',')));
test('rejects unclosed quotes',()=>assert.throws(()=>parseDelimitedInquiry('model,width,height\n"JL3601,36,60',',')));
test('TSV supported',()=>assert.equal(parseDelimitedInquiry('model\twidth\theight\nJL3601\t36\t60','\t').rows,1));


test('retains original source, row and column evidence, fraction inches',()=>{
 const raw='Window,Model,Width,Height,Qty,Notes\nLiving-A,JL3601,39 5/8,40 5/8,2,"Customer, original"';
 const r=parseDelimitedInquiry(raw,',');
 assert.equal(r.sourceText,raw);assert.equal(r.records[0].sourceWindowId,'Living-A');
 assert.equal(r.records[0].sourceRow,2);assert.equal(r.records[0].cells[2].column,3);
 assert.equal(r.records[0].widthRaw,'39 5/8');assert.match(r.records[0].originalRow,/Customer, original/);
});
test('duplicate source window IDs fail closed, evidence retained in error',()=>{
 assert.throws(()=>parseDelimitedInquiry('window,model,width,height\nW01,JL3601,36,40\nw01,JL3601,38,42',','),error=>error.issues?.some(x=>x.includes('Duplicate'))&&error.records?.length===2);
});
test('zero, decimal, negative, blank and nonnumeric quantities fail',()=>{
 for(const qty of ['0','1.5','-2','','abc'])assert.throws(()=>parseDelimitedInquiry('model,width,height,qty\nJL3601,36,40,'+qty,','),/requires correction/);
});
test('missing data cells and header-only file fail',()=>{
 assert.throws(()=>parseDelimitedInquiry('model,width,height\nJL3601,36',','),/requires correction/);
 assert.throws(()=>parseDelimitedInquiry('model,width,height',','),/No data rows/);
});
test('quoted multiline input keeps original row and source line',()=>{
 const r=parseDelimitedInquiry('model,width,height,notes\nJL3601,36,60,"first\nsecond"',',');
 assert.equal(r.records[0].sourceRow,2);assert.match(r.records[0].originalRow,/first\nsecond/);
});

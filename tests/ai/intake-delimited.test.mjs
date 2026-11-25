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

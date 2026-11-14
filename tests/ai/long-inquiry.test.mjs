import assert from 'node:assert/strict';
import test from 'node:test';
import {extractInquiryLines} from '../../lib/ai/extract-lines.ts';

test('long inquiries warn that truncated source must be manually reviewed',()=>{
 const input='1. JL3601 White LF WH 36 x 60 qty 1\n'+' '.repeat(12000)+'\n2. ML-1801 40 x 50 qty 2';
 const result=extractInquiryLines(input);
 assert.equal(result.status,'needs_review');
 assert.ok(result.warnings.some(w=>/truncat/i.test(w)));
 assert.equal(result.lines.length,1);
});

test('exactly 12,000 characters does not trigger truncation warning',()=>{
 const input='1. JL3601 36 x 60 qty 1'+ ' '.repeat(12000-'1. JL3601 36 x 60 qty 1'.length);
 const result=extractInquiryLines(input);
 assert.ok(!result.warnings.some(w=>/truncat/i.test(w)));
});

test('long unnumbered inquiries retain both truncation and missing-number warnings',()=>{
 const result=extractInquiryLines('JL3601 36 x 60 qty 1 '+ 'x'.repeat(12001));
 assert.equal(result.lines.length,1);
 assert.ok(result.warnings.some(w=>/truncat/i.test(w)));
 assert.ok(result.warnings.some(w=>/No explicit line numbering/i.test(w)));
});

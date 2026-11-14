import assert from 'node:assert/strict';
import test from 'node:test';
import { build } from 'esbuild';
const result = await build({entryPoints:['lib/ai/extract-inquiry.ts'],bundle:true,write:false,format:'esm',platform:'node'});
const {extractInquiryDraft,parseInches}=await import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'));
test('fractional inches',()=>{assert.equal(parseInches('39 5/8'),39.625);assert.equal(parseInches('40 5/8'),40.625);assert.equal(parseInches('3/0'),null);});
test('extracts customer request as draft only',()=>{const d=extractInquiryDraft('JL3601 White LF 39 5/8 x 40 5/8 qty 1 Square Valance');assert.equal(d.productCode,'JL3601');assert.equal(d.widthInches,39.625);assert.equal(d.heightInches,40.625);assert.equal(d.quantity,1);assert.equal(d.status,'needs_review');});
test('missing fields never auto approve',()=>{const d=extractInquiryDraft('JL3601 White');assert.ok(d.missing.includes('widthInches'));assert.ok(d.missing.includes('heightInches'));assert.equal(d.status,'needs_review');});

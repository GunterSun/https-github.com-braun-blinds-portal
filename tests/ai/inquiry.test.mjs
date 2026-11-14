import assert from 'node:assert/strict';
import test from 'node:test';
import {extractInquiryDraft,parseInches} from '../../lib/ai/extract-inquiry.ts';
test('mixed fractions and inch validation',()=>{
 assert.equal(parseInches('39 5/8'),39.625);
 assert.equal(parseInches('40 5/8"'),40.625);
 assert.equal(parseInches('3/0'),null);
 assert.equal(parseInches('0'),null);
});
test('customer inquiry is review-only',()=>{
 const d=extractInquiryDraft('JL3601 White LF 39 5/8 x 40 5/8 qty 1 Square Valance');
 assert.equal(d.productCode,'JL3601');
 assert.equal(d.widthInches,39.625);
 assert.equal(d.heightInches,40.625);
 assert.equal(d.quantity,1);
 assert.deepEqual(d.options,['square_valance','light_filtering']);
 assert.equal(d.status,'needs_review');
});
test('motorized option is extracted but not quoted',()=>{
 const d=extractInquiryDraft('ML-1801 36 x 60 quantity 2 motorized with remote');
 assert.equal(d.productCode,'ML-1801');
 assert.deepEqual(d.options,['motorized','remote']);
 assert.equal(d.status,'needs_review');
});
test('missing fields block approval',()=>{
 const d=extractInquiryDraft('JL3601 White');
 assert.deepEqual(d.missing,['widthInches','heightInches','quantity']);
 assert.equal(d.status,'needs_review');
});

test('LF and WH are not verified fabric codes',()=>{
 const d=extractInquiryDraft('JL3601 White LF WH 39 5/8 x 40 5/8 qty 1');
 assert.equal(d.fabricCode,null);
 assert.equal(d.status,'needs_review');
});

test('hardware and opacity tokens are options, never verified fabrics',()=>{
 const d=extractInquiryDraft('JL3601 LF WH 36 x 60 qty 1');
 assert.equal(d.fabricCode,null);
 assert.deepEqual(d.options,['light_filtering','white_hardware']);
 const blackout=extractInquiryDraft('JL3601 BO 36 x 60 qty 1');
 assert.deepEqual(blackout.options,['blackout']);
});

test('BK means black hardware, not blackout',()=>{
 const d=extractInquiryDraft('JL3601 White LF BK 36 x 60 qty 1');
 assert.equal(d.fabricCode,null);
 assert.deepEqual(d.options,['light_filtering','black_hardware']);
});

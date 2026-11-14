import assert from 'node:assert/strict';
import test from 'node:test';
import {extractInquiryDraft} from '../../lib/ai/extract-inquiry.ts';
import {quoteDraftGate,assertNotAuthorizedForIssuance} from '../../lib/ai/quote-adapter.ts';
test('complete extraction still cannot issue an unverified quote',()=>{
 const draft=extractInquiryDraft('JL3601 White 36 x 60 qty 1');
 assert.deepEqual(draft.missing,[]);
 assert.equal(quoteDraftGate(draft).allowed,false);
 assert.equal(quoteDraftGate(draft).requiresOwnerReview,true);
 assert.throws(()=>assertNotAuthorizedForIssuance(draft));
});
test('missing data remains blocked',()=>{
 const draft=extractInquiryDraft('JL3601 White');
 assert.equal(quoteDraftGate(draft).allowed,false);
 assert.ok(quoteDraftGate(draft).missing.includes('widthInches'));
});

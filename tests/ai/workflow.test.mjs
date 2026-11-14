import assert from 'node:assert/strict';
import test from 'node:test';
import {reviewInquiryDraft} from '../../lib/ai/workflow-engine.ts';
const input={status:'needs_review',actorRole:'owner',decision:'approve',hasVerifiedPricingEvidence:true,hasCompleteInquiry:true};
test('owner may approve only manual quote preparation',()=>{
 const r=reviewInquiryDraft(input);
 assert.equal(r.ok,true);
 assert.equal(r.next,'approved_for_manual_quote');
});
test('sales and customers cannot approve',()=>{
 for(const actorRole of ['sales','customer','supplier','finance']){
  const r=reviewInquiryDraft({...input,actorRole});
  assert.equal(r.ok,false);
 }
});
test('missing verification and repeated approval are blocked',()=>{
 assert.equal(reviewInquiryDraft({...input,hasVerifiedPricingEvidence:false}).ok,false);
 assert.equal(reviewInquiryDraft({...input,hasCompleteInquiry:false}).ok,false);
 assert.equal(reviewInquiryDraft({...input,status:'approved_for_manual_quote'}).ok,false);
});
test('owner can reject pending draft',()=>{
 const r=reviewInquiryDraft({...input,decision:'reject'});
 assert.equal(r.next,'rejected');
});

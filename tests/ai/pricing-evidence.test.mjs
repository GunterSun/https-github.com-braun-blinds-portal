import assert from 'node:assert/strict';
import test from 'node:test';
import {checkPricingEvidence} from '../../lib/ai/pricing-evidence.ts';
const evidence={customerId:10,catalogId:'z',catalogVersion:'v1',catalogCurrency:'USD',discountProfileId:'d10',discountProfileVersion:'v3',discountCustomerId:10,exchangeRateSnapshotId:'fx-v1',validUntil:'2026-12-13'};
test('complete snapshots allow review, not issuance',()=>{
 const r=checkPricingEvidence(evidence);
 assert.equal(r.readyForHumanReview,true);
 assert.deepEqual(r.missing,[]);
 assert.ok(r.warnings.some(x=>x.includes('Human')));
});
test('cross-customer discount never passes',()=>{
 const r=checkPricingEvidence({...evidence,discountCustomerId:11});
 assert.equal(r.readyForHumanReview,false);
 assert.ok(r.missing.includes('discountCustomerMatch'));
});
test('missing FX snapshot and catalog version block review',()=>{
 const r=checkPricingEvidence({...evidence,exchangeRateSnapshotId:null,catalogVersion:''});
 assert.equal(r.readyForHumanReview,false);
 assert.ok(r.missing.includes('exchangeRateSnapshot'));
 assert.ok(r.missing.includes('catalogSnapshot'));
});
test('RMB source is not silently treated as USD',()=>{
 const r=checkPricingEvidence({...evidence,catalogCurrency:'RMB'});
 assert.ok(r.warnings.some(x=>x.includes('RMB')));
});

test('invalid calendar date is not accepted as a quote validity date',()=>{
 const r=checkPricingEvidence({...evidence,validUntil:'2026-02-31'});
 assert.equal(r.readyForHumanReview,false);
 assert.ok(r.missing.includes('validUntil'));
});

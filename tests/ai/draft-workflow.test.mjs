import assert from 'node:assert/strict';
import test from 'node:test';
import {transitionDraft} from '../../lib/ai/draft-workflow.ts';
test('system may extract but not approve',()=>{
 assert.deepEqual(transitionDraft('new','extract','system').state,'needs_review');
 assert.equal(transitionDraft('ready_for_review','approve','system',true).ok,false);
});
test('human approval requires verified evidence and owner/admin role',()=>{
 assert.equal(transitionDraft('needs_review','complete','sales',true).state,'ready_for_review');
 assert.equal(transitionDraft('ready_for_review','approve','sales',true).ok,false);
 assert.equal(transitionDraft('ready_for_review','approve','owner',false).ok,false);
 assert.equal(transitionDraft('ready_for_review','approve','owner',true).state,'approved_for_manual_action');
});
test('rejected and approved states cannot bypass review',()=>{
 assert.equal(transitionDraft('rejected','approve','owner',true).ok,false);
 assert.equal(transitionDraft('approved_for_manual_action','approve','owner',true).ok,false);
});

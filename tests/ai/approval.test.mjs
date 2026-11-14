import assert from 'node:assert/strict';
import test from 'node:test';
import {canExecuteApprovedAction} from '../../lib/ai/approval-policy.ts';
const paid={currency:'USD',orderTotalMinor:100000,clearedAllocatedMinor:100000,financeApproved:true,allocationVerified:true};
test('no action without explicit approval',()=>{
 for(const action of ['issue_quote','send_customer_email','submit_supplier_order','issue_refund','schedule_installation'])
   assert.equal(canExecuteApprovedAction(action,'owner',false,paid).allowed,false);
});
test('production requires 100% cleared and allocated, not deposit',()=>{
 assert.equal(canExecuteApprovedAction('submit_supplier_order','owner',true,{...paid,clearedAllocatedMinor:50000}).allowed,false);
 assert.equal(canExecuteApprovedAction('submit_supplier_order','owner',true,{...paid,financeApproved:false}).allowed,false);
 assert.equal(canExecuteApprovedAction('submit_supplier_order','owner',true,{...paid,allocationVerified:false}).allowed,false);
 assert.equal(canExecuteApprovedAction('submit_supplier_order','owner',true).allowed,false);
 assert.equal(canExecuteApprovedAction('submit_supplier_order','owner',true,paid).allowed,true);
});
test('roles, currencies and integer cents must be valid',()=>{
 assert.equal(canExecuteApprovedAction('submit_supplier_order','sales',true,paid).allowed,false);
 assert.equal(canExecuteApprovedAction('submit_supplier_order','admin',true,{...paid,currency:'RMB'}).allowed,true);
 assert.equal(canExecuteApprovedAction('submit_supplier_order','admin',true,{...paid,currency:'US'}).allowed,false);
 assert.equal(canExecuteApprovedAction('submit_supplier_order','admin',true,{...paid,orderTotalMinor:12.5}).allowed,false);
 assert.equal(canExecuteApprovedAction('issue_refund','admin',true).allowed,false);
 assert.equal(canExecuteApprovedAction('issue_refund','owner',true).allowed,true);
});

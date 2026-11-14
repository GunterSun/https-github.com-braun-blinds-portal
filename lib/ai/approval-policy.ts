/** Explicit business policy. This module makes no network/database calls. */
export type ApprovalAction='issue_quote'|'send_customer_email'|'submit_supplier_order'|'issue_refund'|'schedule_installation';
export type ApprovalRole='owner'|'admin'|'sales'|'finance'|'customer'|'supplier';
export type PaymentEvidence={
  currency:string;
  orderTotalMinor:number;
  clearedAllocatedMinor:number;
  financeApproved:boolean;
  allocationVerified:boolean;
};
export type ApprovalDecision={allowed:boolean;reason:string};
const validMoney=(n:number)=>Number.isSafeInteger(n)&&n>=0;
export function canExecuteApprovedAction(action:ApprovalAction,role:ApprovalRole,explicitApproval:boolean,payment?:PaymentEvidence):ApprovalDecision {
  if(!explicitApproval)return {allowed:false,reason:'Explicit human approval is required'};
  if(action==='submit_supplier_order'){
    if(role!=='owner'&&role!=='admin')return {allowed:false,reason:'Only owner/admin may release a supplier order'};
    if(!payment)return {allowed:false,reason:'Missing order-allocated cleared payment evidence'};
    if(!/^[A-Z]{3}$/.test(payment.currency)||!validMoney(payment.orderTotalMinor)||!validMoney(payment.clearedAllocatedMinor)||payment.orderTotalMinor===0)
      return {allowed:false,reason:'Invalid payment amount or currency'};
    if(!payment.allocationVerified||!payment.financeApproved)return {allowed:false,reason:'Allocation verification and finance approval required'};
    if(payment.clearedAllocatedMinor<payment.orderTotalMinor)return {allowed:false,reason:'Full cleared and allocated payment required before production'};
    return {allowed:true,reason:'Human-approved payment gate satisfied; downstream server authorization still required'};
  }
  if(action==='issue_refund')return role==='owner'?{allowed:true,reason:'Owner approval recorded; refund processor must revalidate'}:{allowed:false,reason:'Refund requires owner approval'};
  if(action==='issue_quote'||action==='send_customer_email')return role==='owner'||role==='admin'?{allowed:true,reason:'Human approval recorded; server must revalidate'}:{allowed:false,reason:'Owner/admin approval required'};
  if(action==='schedule_installation')return role==='owner'||role==='admin'?{allowed:true,reason:'Human approval recorded; server must revalidate'}:{allowed:false,reason:'Owner/admin approval required'};
  return {allowed:false,reason:'Unknown action'};
}

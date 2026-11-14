/** Pure review workflow: no D1 writes or external side effects. */
export type DraftStatus='needs_review'|'approved_for_manual_quote'|'rejected';
export type ReviewInput={status:DraftStatus;actorRole:'owner'|'admin'|'sales'|'finance'|'customer'|'supplier';decision:'approve'|'reject';hasVerifiedPricingEvidence:boolean;hasCompleteInquiry:boolean};
export type ReviewTransition={ok:boolean;next:DraftStatus;reason:string};
export function reviewInquiryDraft(input:ReviewInput):ReviewTransition {
 if(input.status!=='needs_review')return {ok:false,next:input.status,reason:'Only pending drafts may be reviewed'};
 if(input.actorRole!=='owner'&&input.actorRole!=='admin')return {ok:false,next:input.status,reason:'Owner/admin review required'};
 if(input.decision==='reject')return {ok:true,next:'rejected',reason:'Rejected by human reviewer'};
 if(!input.hasCompleteInquiry||!input.hasVerifiedPricingEvidence)return {ok:false,next:input.status,reason:'Inquiry and pricing evidence must be verified'};
 return {ok:true,next:'approved_for_manual_quote',reason:'May proceed to manual quote preparation; not quote issuance'};
}

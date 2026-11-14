/** Pure draft lifecycle. State transitions never send mail, charge, or place orders. */
export type DraftState='new'|'needs_review'|'ready_for_review'|'approved_for_manual_action'|'rejected';
export type DraftEvent='extract'|'complete'|'approve'|'reject';
export type DraftActor='system'|'owner'|'admin'|'sales'|'customer'|'supplier';
export type Transition={ok:boolean;state:DraftState;reason:string};
export function transitionDraft(state:DraftState,event:DraftEvent,actor:DraftActor,hasVerifiedEvidence=false):Transition {
  if(event==='extract'&&state==='new'&&actor==='system')
    return {ok:true,state:'needs_review',reason:'Extracted draft awaits human review'};
  if(event==='complete'&&state==='needs_review'&&hasVerifiedEvidence&&['owner','admin','sales'].includes(actor))
    return {ok:true,state:'ready_for_review',reason:'Evidence present; approval still required'};
  if(event==='approve'&&state==='ready_for_review'&&hasVerifiedEvidence&&['owner','admin'].includes(actor))
    return {ok:true,state:'approved_for_manual_action',reason:'Approval does not execute the action'};
  if(event==='reject'&&['needs_review','ready_for_review'].includes(state)&&['owner','admin'].includes(actor))
    return {ok:true,state:'rejected',reason:'Draft rejected'};
  return {ok:false,state,reason:'Transition denied'};
}

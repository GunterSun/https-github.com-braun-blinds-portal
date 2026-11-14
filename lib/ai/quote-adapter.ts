import type {InquiryDraft} from './extract-inquiry';
export type QuoteDraftGate = {allowed:false;reason:string;missing:string[];requiresOwnerReview:true};
export function quoteDraftGate(draft:InquiryDraft):QuoteDraftGate {
  const missing=[...draft.missing];
  // Extraction hints cannot prove a catalog match, account-specific pricing, or installation details.
  return {
    allowed:false,
    reason:draft.notes.length?'询价存在配置冲突或多个型号等未解决问题，必须联系客户核实；禁止自动正式签发':missing.length?'询价信息不完整，必须补充并人工确认':'尚未核验客户价格表、产品目录和报价版本，禁止自动正式签发',
    missing,requiresOwnerReview:true,
  };
}
/** Never call the production issuance endpoint from an AI extraction result. */
export function assertNotAuthorizedForIssuance(_draft:InquiryDraft):never {
  throw new Error('AI inquiry drafts are not authorized to issue quotes or factory orders');
}

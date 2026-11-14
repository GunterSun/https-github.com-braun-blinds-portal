/** Privacy-safe event envelope. Persistence and authorization belong to server adapters. */
export type AiAuditEvent={
  eventType:'inquiry_parsed'|'draft_reviewed'|'quote_preparation_requested'|'policy_blocked';
  entityType:'ai_inquiry'|'ai_quote_draft';
  entityId:string;
  actorUserId:string;
  occurredAt:string;
  correlationId:string;
  outcome:'success'|'blocked';
};
export function validateAuditEvent(event:AiAuditEvent):AiAuditEvent {
  if(!event.entityId||!event.actorUserId||!event.correlationId)throw new Error('Missing audit identifiers');
  if(!Number.isFinite(Date.parse(event.occurredAt)))throw new Error('Invalid audit timestamp');
  if(!['inquiry_parsed','draft_reviewed','quote_preparation_requested','policy_blocked'].includes(event.eventType))throw new Error('Invalid event type');
  if(!['ai_inquiry','ai_quote_draft'].includes(event.entityType))throw new Error('Invalid entity type');
  if(!['success','blocked'].includes(event.outcome))throw new Error('Invalid outcome');
  return {...event};
}

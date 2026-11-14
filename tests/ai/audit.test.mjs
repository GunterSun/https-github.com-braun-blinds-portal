import assert from 'node:assert/strict';
import test from 'node:test';
import {validateAuditEvent} from '../../lib/ai/audit-log.ts';
const event={eventType:'policy_blocked',entityType:'ai_inquiry',entityId:'1',actorUserId:'owner-1',occurredAt:'2026-11-13T12:00:00Z',correlationId:'request-1',outcome:'blocked'};
test('audit envelope contains no customer text',()=>{
 const r=validateAuditEvent(event);
 assert.equal(r.eventType,'policy_blocked');
 assert.equal('sourceText' in r,false);
});
test('audit requires actor and correlation',()=>{
 assert.throws(()=>validateAuditEvent({...event,actorUserId:''}));
 assert.throws(()=>validateAuditEvent({...event,correlationId:''}));
});

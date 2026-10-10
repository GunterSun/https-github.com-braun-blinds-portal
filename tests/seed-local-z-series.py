from pathlib import Path
import hashlib,json
rows=[]
for uid,role in [(99001,'owner'),(99002,'customer')]:
 token='local-formal-qa-'+role
 rows.append(f"INSERT OR IGNORE INTO app_users(id,email,password_hash,password_salt,display_name,role) VALUES ({uid},'qa-{role}@example.invalid','unused','unused','Local QA','{role}');")
 rows.append(f"INSERT OR IGNORE INTO app_sessions(user_id,token_hash,expires_at) VALUES ({uid},'{hashlib.sha256(token.encode()).hexdigest()}','2099-01-01T00:00:00.000Z');")
rows.append("INSERT OR IGNORE INTO customer_property_access(user_id,customer_id,property_id,granted_by) VALUES (99002,99010,99020,99001);")
for i in [99031,99032]:
 snapshot=json.dumps({'property':{'id':99020,'customerId':99010,'name':'LOCAL QA'},'room':{'name':'Room '+str(i)},'window':{'code':'W'+str(i)},'design':{'version':1}})
 rows.append(f"INSERT OR IGNORE INTO workflow_handoffs(id,window_id,measurement_version_id,design_version_id,qa_run_id,revision,source_hash,source_snapshot_json,idempotency_key,created_by) VALUES({i},{i},1,1,1,1,'hash-{i}','{snapshot}','local-qa-{i}',99001);")
 for kind in ['quote','customer_approval','order']:
  rows.append(f"INSERT OR IGNORE INTO workflow_artifacts(handoff_id,artifact_type,status,snapshot_json) VALUES ({i},'{kind}','prepared','{{}}');")
Path('.sites-runtime/qa.sql').write_text('\n'.join(rows))

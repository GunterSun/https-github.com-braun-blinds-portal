import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {build} from 'esbuild';
const compiled=await build({entryPoints:['lib/owner-recovery.ts'],bundle:true,write:false,format:'esm',platform:'node'});
const {parseOwnerRecovery,ownerRecoveryStatements}=await import('data:text/javascript;base64,'+Buffer.from(compiled.outputFiles[0].text).toString('base64'));
const recovery={userId:1,email:'owner@example.invalid',previousHash:'a'.repeat(64),previousSalt:'b'.repeat(32),hash:'c'.repeat(64),salt:'d'.repeat(32)};
test('rotation is targeted, revokes sessions and is idempotent',()=>{
 const db=new DatabaseSync(':memory:');
 db.exec(`CREATE TABLE app_users(id INTEGER,email TEXT,role TEXT,status TEXT,password_hash TEXT,password_salt TEXT,updated_at TEXT);CREATE TABLE app_sessions(user_id INTEGER,revoked_at TEXT);CREATE TABLE audit_logs(user_id INTEGER,action TEXT,entity_type TEXT,entity_id TEXT,details_json TEXT,ip_address TEXT);`);
 for(const [id,email,role] of [[1,recovery.email,'owner'],[2,'customer@example.invalid','customer']])db.prepare('INSERT INTO app_users VALUES (?,?,?,?,?,?,NULL)').run(id,email,role,'active',recovery.previousHash,recovery.previousSalt);
 db.exec('INSERT INTO app_sessions VALUES(1,NULL),(2,NULL)');
 const apply=r=>{db.exec('BEGIN');for(const x of ownerRecoveryStatements(r,'2026-10-10T00:00:00Z'))db.prepare(x.sql).run(...x.params);db.exec('COMMIT');};
 apply({...recovery,email:'wrong@example.invalid'});assert.equal(db.prepare('SELECT COUNT(*) n FROM audit_logs').get().n,0);
 apply(recovery);apply(recovery);
 assert.equal(db.prepare('SELECT password_hash FROM app_users WHERE id=1').get().password_hash,recovery.hash);
 assert.equal(db.prepare('SELECT password_hash FROM app_users WHERE id=2').get().password_hash,recovery.previousHash);
 assert.ok(db.prepare('SELECT revoked_at FROM app_sessions WHERE user_id=1').get().revoked_at);
 assert.equal(db.prepare('SELECT revoked_at FROM app_sessions WHERE user_id=2').get().revoked_at,null);
 assert.equal(db.prepare('SELECT COUNT(*) n FROM audit_logs').get().n,1);
 db.close();
});
test('recovery configuration rejects invalid or identical credentials',()=>{
 assert.equal(parseOwnerRecovery(undefined),null);assert.deepEqual(parseOwnerRecovery(JSON.stringify(recovery)),recovery);
 for(const r of [{...recovery,userId:0},{...recovery,hash:'bad'},{...recovery,hash:recovery.previousHash}])assert.throws(()=>parseOwnerRecovery(JSON.stringify(r)));
});

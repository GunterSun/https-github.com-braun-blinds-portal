// Operator-configured, one-time credential rotation. Plaintext passwords are never stored here.
export type OwnerRecovery = { userId:number; email:string; previousHash:string; previousSalt:string; hash:string; salt:string };
export function parseOwnerRecovery(value:string|undefined):OwnerRecovery|null {
 if(!value)return null;
 const r=JSON.parse(value);
 if(!Number.isSafeInteger(r.userId)||r.userId<1||typeof r.email!=='string'||!r.email.includes('@')||
 ![r.previousHash,r.hash].every(v=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v))||
 ![r.previousSalt,r.salt].every(v=>typeof v==='string'&&/^[a-f0-9]{32}$/.test(v))||r.hash===r.previousHash)throw Error('Invalid owner recovery configuration');
 return r;
}
export function ownerRecoveryStatements(r:OwnerRecovery,now:string){
 const match="id = ? AND email = ? AND role = 'owner' AND status = 'active' AND password_hash = ? AND password_salt = ?";
 const target=[r.userId,r.email,r.previousHash,r.previousSalt];
 return [
  {sql:`UPDATE app_sessions SET revoked_at = ? WHERE revoked_at IS NULL AND user_id IN (SELECT id FROM app_users WHERE ${match})`,params:[now,...target]},
  {sql:`INSERT INTO audit_logs (user_id,action,entity_type,entity_id,details_json,ip_address) SELECT id,'owner_password_recovered','app_user',CAST(id AS TEXT),'{}','' FROM app_users WHERE ${match}`,params:target},
  {sql:`UPDATE app_users SET password_hash = ?, password_salt = ?, updated_at = ? WHERE ${match}`,params:[r.hash,r.salt,now,...target]},
 ];
}

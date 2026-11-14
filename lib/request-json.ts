export class RequestError extends Error {
  constructor(message:string,public status:number){super(message);this.name='RequestError';}
}
// Do not retry mutations automatically: callers retain their form/idempotency key.
export async function requestJson<T>(url:string,options:RequestInit={},timeoutMs=15000):Promise<T>{
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeoutMs);
 try {
  const response=await fetch(url,{...options,signal:controller.signal});
  const data=await response.json().catch(()=>null);
  if(!response.ok)throw new RequestError(data?.error||(response.status===401?'请先登录 / Please sign in':'服务暂不可用，请重试 / Service unavailable; retry'),response.status);
  if(data===null)throw new RequestError('服务器响应异常，请重试 / Invalid server response; retry',response.status);
  return data as T;
 } catch(error){
  if(controller.signal.aborted)throw new RequestError('连接超时，已保留当前表单，请重试 / Timed out; keep this form and retry',0);
  if(error instanceof RequestError)throw error;
  throw new RequestError('网络连接失败，已保留当前表单，请重试 / Connection failed; keep this form and retry',0);
 } finally {clearTimeout(timer);}
}
export async function requestSession<T>():Promise<T|null>{
 try{return await requestJson<T>('/api/v4/auth/me',{cache:'no-store'});}
 catch(error){if(error instanceof RequestError&&error.status===401)return null;throw error;}
}

"use client";

import { useState } from "react";
import { extractInquiryDraft, type InquiryDraft } from "./extract-inquiry";
import { quoteDraftGate } from "./quote-adapter";
import { transitionDraft, type DraftState } from "./draft-workflow";

/**
 * Isolated local preview. No API calls, no persistence, no outbound email.
 * Not linked from the production navigation until role-based access is implemented.
 */
export default function AiInquiryDraftPreview() {
  const [source, setSource] = useState("");
  const [draft, setDraft] = useState<InquiryDraft | null>(null);
  const [state, setState] = useState<DraftState>("new");
  const [notice, setNotice] = useState("");
  const extract = () => {
    if (!source.trim()) { setNotice("请先粘贴客户询价内容。"); return; }
    const next = extractInquiryDraft(source);
    setDraft(next);
    setState("needs_review");
    setNotice("已生成待审核草稿。数据只在当前页面内存中，刷新后消失。");
  };
  const update = (field: "productCode" | "quantity" | "widthInches" | "heightInches", value: string) => {
    if (!draft) return;
    const number = field === "quantity" || field === "widthInches" || field === "heightInches";
    const parsed = number ? Number(value) : value.trim();
    const next = { ...draft, [field]: number ? (value.trim() && Number.isFinite(parsed) && Number(parsed) > 0 ? Number(parsed) : null) : (parsed || null) };
    const missing = ["productCode", "quantity", "widthInches", "heightInches"].filter(key => !next[key as keyof typeof next]);
    setDraft({ ...next, missing, status: "needs_review" } as InquiryDraft);
    setState("needs_review");
  };
  const check = () => {
    if (!draft) return;
    const result = transitionDraft(state, "complete", "sales", false);
    setNotice(result.ok ? "可以提交审核" : "草稿仍需核验客户、目录、尺寸及价格证据；不能自动审批。");
  };
  return (
    <main style={{maxWidth:900,margin:"32px auto",padding:24,fontFamily:"system-ui",color:"#152235"}}>
      <h1 style={{fontSize:28,fontWeight:700}}>Braun Blinds · AI 询价草稿工作台</h1>
      <p>内部开发预览：只识别和编辑询价草稿，不保存、发送报价或下生产单。</p>
      <label htmlFor="inquiry" style={{display:"block",fontWeight:600,marginTop:20}}>客户邮件 / 短信 / 微信询价</label>
      <textarea id="inquiry" value={source} onChange={e=>setSource(e.target.value)} rows={7}
        placeholder={'例如：JL3601 White LF 39 5/8 x 40 5/8 qty 1 Square Valance'}
        style={{width:"100%",padding:12,border:"1px solid #9ca3af",borderRadius:8}} />
      <button type="button" onClick={extract} style={{marginTop:12,padding:"10px 18px",background:"#123d5a",color:"white",borderRadius:8}}>识别询价</button>
      {notice && <p role="status" style={{marginTop:14}}>{notice}</p>}
      {draft && <section style={{marginTop:28,border:"1px solid #cbd5e1",borderRadius:10,padding:20}}>
        <h2 style={{fontSize:21,fontWeight:700}}>待审核草稿</h2>
        <p><strong>状态：</strong>{state} · 禁止自动签发报价</p>
        {([["productCode","产品型号"],["widthInches","宽度（英寸）"],["heightInches","高度（英寸）"],["quantity","数量"]] as const).map(([key,label])=>
          <label key={key} style={{display:"block",margin:"12px 0"}}>{label}
            <input type={key==="productCode"?"text":"number"} min={key==="productCode"?undefined:"0.001"} step="any"
              value={draft[key] ?? ""} onChange={e=>update(key,e.target.value)}
              style={{display:"block",width:"100%",padding:9,border:"1px solid #9ca3af",borderRadius:6}}/>
          </label>
        )}
        <p><strong>颜色：</strong>{draft.color ?? "未识别"}　<strong>提示代码：</strong>{draft.fabricCode ?? "未识别"}</p>
        <p><strong>选项：</strong>{draft.options.join("、") || "无"}</p>
        <p><strong>缺失字段：</strong>{draft.missing.join("、") || "无（仍需核验）"}</p>
        <p><strong>报价检查：</strong>{quoteDraftGate(draft).reason}</p>
        <button type="button" onClick={check} style={{padding:"10px 18px",border:"1px solid #123d5a",borderRadius:8}}>检查是否可提交审核</button>
      </section>}
      <p style={{marginTop:30,fontSize:13,color:"#475569"}}>此页面尚无服务端权限保护，不能用于真实客户敏感信息。生产部署前必须完成身份认证与角色权限。</p>
    </main>
  );
}

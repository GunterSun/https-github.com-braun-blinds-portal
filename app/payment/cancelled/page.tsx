import Link from "next/link";

export default function PaymentCancelledPage() {
  return (
    <main style={{minHeight:"100vh",display:"grid",placeItems:"center",background:"#f5f3ee",padding:24,fontFamily:"Arial, PingFang SC, sans-serif"}}>
      <section style={{maxWidth:620,background:"white",border:"1px solid #e2ded5",borderRadius:20,padding:36,textAlign:"center",boxShadow:"0 14px 40px rgba(28,38,33,.08)"}}>
        <h1>付款未完成 / Payment Not Completed</h1>
        <p>本次没有扣款。您可以返回 Invoice 页面重新付款，或联系 Braun Blinds。</p>
        <p>No charge was made. Return to the invoice page to try again.</p>
        <Link href="/" style={{display:"inline-block",marginTop:18,padding:"12px 20px",borderRadius:10,background:"#1f5b49",color:"white",textDecoration:"none",fontWeight:700}}>返回客户门户 / Return to Portal</Link>
      </section>
    </main>
  );
}

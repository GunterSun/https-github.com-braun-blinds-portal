export default function PaymentSuccessPage() {
  return (
    <main style={{minHeight:"100vh",display:"grid",placeItems:"center",background:"#f5f3ee",padding:24,fontFamily:"Arial, PingFang SC, sans-serif"}}>
      <section style={{maxWidth:620,background:"white",border:"1px solid #e2ded5",borderRadius:20,padding:36,textAlign:"center",boxShadow:"0 14px 40px rgba(28,38,33,.08)"}}>
        <div style={{fontSize:46}}>✓</div>
        <h1>付款已提交 / Payment Received</h1>
        <p>我们正在确认信用卡付款。确认完成后，对应 Invoice 将自动更新为“已付款”。</p>
        <p>Your card payment is being confirmed. The invoice will automatically update to Paid.</p>
        <a href="/" style={{display:"inline-block",marginTop:18,padding:"12px 20px",borderRadius:10,background:"#1f5b49",color:"white",textDecoration:"none",fontWeight:700}}>返回客户门户 / Return to Portal</a>
      </section>
    </main>
  );
}
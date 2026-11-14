import { redirect } from "next/navigation";
import { getCurrentAppUser } from "@/lib/v4-auth";
import AiInquiryDraftPreview from "@/lib/ai/inquiry-draft-preview";

export const dynamic = "force-dynamic";

/** Owner-only server-rendered gate; no AI data is persisted or sent to a backend. */
export default async function AiInquiryWorkbench() {
  const user = await getCurrentAppUser();
  if (!user) redirect("/login");
  if (user.role !== "owner") {
    return <main style={{padding:32}}><h1>403 · 无权访问</h1><p>AI 询价工作台仅限 Owner 使用。</p></main>;
  }
  return <AiInquiryDraftPreview />;
}

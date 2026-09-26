import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { orders, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ReplyForm } from "@/components/ReplyForm";
import Link from "next/link";

export default async function GirlOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser("girl");

  const [order] = await db
    .select({
      id: orders.id,
      fantasyType: orders.fantasyType,
      fantasyDetail: orders.fantasyDetail,
      tone: orders.tone,
      scene: orders.scene,
      status: orders.status,
      girlReply: orders.girlReply,
      replyOpening: orders.replyOpening,
      replyDuring: orders.replyDuring,
      replyEnding: orders.replyEnding,
      aftercare: orders.aftercare,
      extraPay: orders.extraPay,
      extraDemand: orders.extraDemand,
      extraStatus: orders.extraStatus,
      part: orders.part,
      depth: orders.depth,
      partName: orders.partName,
      createdAt: orders.createdAt,
      clientName: users.displayName,
    })
    .from(orders)
    .innerJoin(users, eq(orders.clientId, users.id))
    .where(and(eq(orders.id, id), eq(orders.girlId, user.id)))
    .limit(1);

  if (!order) notFound();

  const toneMap: Record<string, string> = {
    cold: "冷淡克制",
    tease: "轻挑戏弄",
    gentle: "温柔低语",
    dominant: "强势主导",
    submissive: "顺从依恋",
  };

  const hook = order.fantasyDetail.split(/[。！？\n]/).filter(Boolean)[0] || order.fantasyDetail;

  return (
    <div className="min-h-screen">
      <header className="border-b border-[#1c1c22] px-6 py-4">
        <Link href="/dashboard" className="text-xs text-[#8b8793] hover:text-[#c9a87c]">
          ← 回接客面板
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-8">
        <div>
          <p className="text-xs text-[#a85c5c] mb-2">有人点了你</p>
          <h1 className="text-xl text-[#c9a87c]">{order.clientName}</h1>
          <p className="text-sm text-[#e6e4e0] mt-3 leading-relaxed">「{hook}」</p>
          {order.part ? <p className="text-xs text-[#c9a87c] mt-2">他买的是你的{order.partName || order.part} · {order.depth}</p> : null}
          <p className="text-xs text-[#5a5860] mt-2">
            {new Date(order.createdAt).toLocaleString("zh-CN")}
            {order.scene ? ` · ${order.scene}` : ""} · {toneMap[order.tone] || order.tone}
          </p>
        </div>

        <section className="bg-[#0f0a0a] border border-[#3a2222] rounded-xl p-6">
          <p className="text-xs text-[#8b8793] mb-3">他要这样用你：</p>
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-[#e6e4e0]">
            {order.fantasyDetail}
          </p>
        </section>

        {order.status !== "completed" && order.status !== "rejected" ? (
          <section className="bg-[#0f0a0a] border border-[#3a2222] rounded-xl p-6">
            <p className="text-sm text-[#c9a87c] font-medium mb-2">现在开始服侍</p>
            <p className="text-xs text-[#a88a8a] leading-relaxed mb-5">
              用第一人称。把他当主人。一段一段写，不要一次交卷。不要说角色扮演。
            </p>
            <ReplyForm
              orderId={order.id}
              opening={order.replyOpening || ""}
              during={order.replyDuring || ""}
              ending={order.replyEnding || ""}
              aftercare={order.aftercare || ""}
              extraPay={order.extraPay}
              extraDemand={order.extraDemand || ""}
              extraStatus={order.extraStatus || "none"}
            />
          </section>
        ) : (
          <section className="space-y-4">
            <div className="bg-[#111114] border border-[#1c1c22] rounded-xl p-6">
              <p className="text-xs text-[#8b8793] mb-3">你已经完成的服侍</p>
              <div className="text-sm leading-relaxed whitespace-pre-wrap text-[#e6e4e0]">
                {order.girlReply || "（无）"}
              </div>
            </div>
            {order.aftercare && (
              <div className="bg-[#111114] border border-[#2a2a22] rounded-xl p-6">
                <p className="text-xs text-[#c9a87c] mb-3">只给你看的余韵</p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-[#c9b8b8]">
                  {order.aftercare}
                </p>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

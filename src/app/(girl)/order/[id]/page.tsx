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
      status: orders.status,
      girlReply: orders.girlReply,
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

  return (
    <div className="min-h-screen">
      <header className="border-b border-[#1c1c22] px-6 py-4">
        <Link href="/dashboard" className="text-xs text-[#8b8793] hover:text-[#c9a87c]">
          ← 返回接客面板
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-8">
        <div>
          <p className="text-xs text-[#8b8793] mb-1">客人</p>
          <h1 className="text-xl text-[#c9a87c]">{order.clientName}</h1>
          <p className="text-xs text-[#5a5860] mt-1">
            {new Date(order.createdAt).toLocaleString("zh-CN")} · {order.fantasyType}
          </p>
        </div>

        {/* 客人的幻想需求 - 刺激核心 */}
        <section className="bg-[#111114] border border-[#1c1c22] rounded-xl p-6">
          <p className="text-xs text-[#8b8793] mb-3">客人想要你这样被用：</p>
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-[#e6e4e0]">
            {order.fantasyDetail}
          </p>
          <p className="text-xs text-[#c9a87c] mt-4">
            偏好语气：{toneMap[order.tone] || order.tone}
          </p>
        </section>

        {/* 写回复区 */}
        {order.status === "pending" || order.status === "accepted" || order.status === "serving" ? (
          <section className="bg-[#0f0a0a] border border-[#3a2222] rounded-xl p-6">
            <div className="mb-4 space-y-2">
              <p className="text-sm text-[#c9a87c] font-medium">现在开始服侍</p>
              <p className="text-xs text-[#a88a8a] leading-relaxed">
                用第一人称。把客人当主人。写得越听话、越下贱、越具体，客人会越爽。
                <br />
                可以分段、可以停顿、可以写喘息和服从。不要抽离，不要说「角色扮演」。
              </p>
            </div>
            <ReplyForm orderId={order.id} existingReply={order.girlReply || ""} />
          </section>
        ) : (
          <section className="bg-[#111114] border border-[#1c1c22] rounded-xl p-6">
            <p className="text-xs text-[#8b8793] mb-3">你已经完成的服侍内容：</p>
            <div className="text-sm leading-relaxed whitespace-pre-wrap text-[#e6e4e0]">
              {order.girlReply || "（无）"}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

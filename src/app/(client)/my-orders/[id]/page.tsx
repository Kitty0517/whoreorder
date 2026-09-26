import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { orders, users, reviews } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ReviewForm } from "@/components/ReviewForm";

export default async function ClientOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser("client");

  const [order] = await db
    .select({
      id: orders.id,
      fantasyType: orders.fantasyType,
      fantasyDetail: orders.fantasyDetail,
      status: orders.status,
      girlReply: orders.girlReply,
      createdAt: orders.createdAt,
      girlId: orders.girlId,
      girlName: users.displayName,
    })
    .from(orders)
    .innerJoin(users, eq(orders.girlId, users.id))
    .where(and(eq(orders.id, id), eq(orders.clientId, user.id)))
    .limit(1);

  if (!order) notFound();

  const [existingReview] = await db
    .select()
    .from(reviews)
    .where(eq(reviews.orderId, id))
    .limit(1);

  return (
    <div className="min-h-screen">
      <header className="border-b border-[#1c1c22] px-6 py-4">
        <Link href="/my-orders" className="text-xs text-[#8b8793] hover:text-[#c9a87c]">
          ← 返回我的订单
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-8">
        <div>
          <h1 className="text-xl text-[#c9a87c]">{order.girlName}</h1>
          <p className="text-xs text-[#5a5860] mt-1">
            {order.fantasyType} · {new Date(order.createdAt).toLocaleString("zh-CN")}
          </p>
        </div>

        <section className="bg-[#111114] border border-[#1c1c22] rounded-xl p-6">
          <p className="text-xs text-[#8b8793] mb-2">你的需求</p>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{order.fantasyDetail}</p>
        </section>

        {order.status === "completed" && order.girlReply ? (
          <section className="bg-[#0f0a0a] border border-[#3a2222] rounded-xl p-6">
            <p className="text-xs text-[#c9a87c] mb-3">她的服侍内容</p>
            <div className="text-sm leading-relaxed whitespace-pre-wrap text-[#e6e4e0]">
              {order.girlReply}
            </div>
          </section>
        ) : (
          <div className="bg-[#111114] border border-[#1c1c22] rounded-xl p-6 text-center text-[#8b8793] text-sm">
            {order.status === "pending"
              ? "她还没接单，请稍等。"
              : "她正在写，马上就好。"}
          </div>
        )}

        {order.status === "completed" && !existingReview && (
          <section className="bg-[#111114] border border-[#1c1c22] rounded-xl p-6">
            <p className="text-sm text-[#c9a87c] mb-4">评价这次服务</p>
            <ReviewForm orderId={order.id} girlId={order.girlId} />
          </section>
        )}

        {existingReview && (
          <section className="bg-[#111114] border border-[#1c1c22] rounded-xl p-6">
            <p className="text-xs text-[#8b8793] mb-2">你的评价</p>
            <p className="text-sm">
              {"★".repeat(existingReview.rating)}
              {"☆".repeat(5 - existingReview.rating)}
            </p>
            <p className="text-sm mt-2 text-[#e6e4e0]">{existingReview.content}</p>
          </section>
        )}
      </main>
    </div>
  );
}

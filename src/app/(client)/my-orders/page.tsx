import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { orders, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";

export default async function MyOrdersPage() {
  const user = await requireUser("client");

  const myOrders = await db
    .select({
      id: orders.id,
      fantasyType: orders.fantasyType,
      status: orders.status,
      girlReply: orders.girlReply,
      createdAt: orders.createdAt,
      girlName: users.displayName,
    })
    .from(orders)
    .innerJoin(users, eq(orders.girlId, users.id))
    .where(eq(orders.clientId, user.id))
    .orderBy(desc(orders.createdAt));

  const statusMap: Record<string, string> = {
    pending: "等待她接单",
    accepted: "她已接单，正在写",
    serving: "服务中",
    completed: "已完成",
    rejected: "已拒绝",
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-[#1c1c22] px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-[#c9a87c] tracking-widest text-lg">我的订单</h1>
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/browse" className="text-xs text-[#8b8793] hover:text-[#c9a87c]">
            继续点人
          </Link>
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-5">
        {myOrders.length === 0 ? (
          <p className="text-[#5a5860] text-sm text-center">还没有点过任何人。</p>
        ) : (
          myOrders.map((o) => (
            <Link
              key={o.id}
              href={`/my-orders/${o.id}`}
              className="block bg-[#111114] border border-[#1c1c22] rounded-xl p-5 hover:border-[#c9a87c]/40 transition"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[#c9a87c]">{o.girlName}</span>
                <span className="text-xs text-[#8b8793]">{statusMap[o.status]}</span>
              </div>
              <p className="text-xs text-[#5a5860]">{o.fantasyType} · {new Date(o.createdAt).toLocaleString("zh-CN")}</p>
              {o.status === "completed" && o.girlReply && (
                <p className="text-sm text-[#e6e4e0] mt-3 line-clamp-2">{o.girlReply}</p>
              )}
            </Link>
          ))
        )}
      </main>
    </div>
  );
}

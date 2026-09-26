import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { orders, girlProfiles, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { StatusSwitcher } from "@/components/StatusSwitcher";
import { LogoutButton } from "@/components/LogoutButton";

export default async function GirlDashboard() {
  const user = await requireUser("girl");

  const [profile] = await db
    .select()
    .from(girlProfiles)
    .where(eq(girlProfiles.userId, user.id))
    .limit(1);

  const pendingOrders = await db
    .select({
      id: orders.id,
      fantasyType: orders.fantasyType,
      fantasyDetail: orders.fantasyDetail,
      tone: orders.tone,
      status: orders.status,
      createdAt: orders.createdAt,
      clientName: users.displayName,
    })
    .from(orders)
    .innerJoin(users, eq(orders.clientId, users.id))
    .where(eq(orders.girlId, user.id))
    .orderBy(desc(orders.createdAt))
    .limit(20);

  const pending = pendingOrders.filter((o) => o.status === "pending");
  const active = pendingOrders.filter((o) => ["accepted", "serving"].includes(o.status));
  const done = pendingOrders.filter((o) => o.status === "completed");

  const statusMap: Record<string, string> = {
    idle: "空闲可约",
    busy: "接客中",
    off: "今日已收工",
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-[#1c1c22] px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-[#c9a87c] tracking-widest text-lg">Noir Atelier</h1>
          <p className="text-xs text-[#8b8793]">接客面板 · {user.displayName}</p>
        </div>
        <LogoutButton />
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-10">
        <section className="bg-[#111114] border border-[#1c1c22] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-[#8b8793] mb-1">当前状态</p>
              <p className="text-2xl text-[#c9a87c] font-medium">
                {statusMap[profile?.status || "idle"]}
              </p>
            </div>
            <div className="text-4xl">{profile?.avatarEmoji || "🖤"}</div>
          </div>
          <StatusSwitcher current={profile?.status || "idle"} />
          <p className="text-xs text-[#5a5860] mt-4">
            切换状态会立刻被客人看到。空闲时更容易被点。
          </p>
        </section>

        <section>
          <h2 className="text-sm text-[#8b8793] tracking-wider mb-4">
            有人点了你 · 待接订单 ({pending.length})
          </h2>
          {pending.length === 0 ? (
            <div className="bg-[#111114] border border-[#1c1c22] rounded-xl p-8 text-center text-[#5a5860] text-sm">
              暂时没人点你。把状态保持在「空闲可约」，客人会来的。
            </div>
          ) : (
            <div className="space-y-4">
              {pending.map((o) => (
                <Link
                  key={o.id}
                  href={`/order/${o.id}`}
                  className="block bg-[#111114] border border-[#1c1c22] rounded-xl p-5 hover:border-[#c9a87c]/40 transition"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[#c9a87c] text-sm">客人：{o.clientName}</span>
                    <span className="text-xs text-[#5a5860]">
                      {new Date(o.createdAt).toLocaleString("zh-CN")}
                    </span>
                  </div>
                  <p className="text-xs text-[#8b8793] mb-1">幻想类型 · {o.fantasyType}</p>
                  <p className="text-sm text-[#e6e4e0] line-clamp-3 leading-relaxed">
                    {o.fantasyDetail}
                  </p>
                  <p className="text-xs text-[#c9a87c] mt-3">点击进入 → 开始服侍</p>
                </Link>
              ))}
            </div>
          )}
        </section>

        {active.length > 0 && (
          <section>
            <h2 className="text-sm text-[#8b8793] tracking-wider mb-4">
              正在服侍 ({active.length})
            </h2>
            <div className="space-y-3">
              {active.map((o) => (
                <Link
                  key={o.id}
                  href={`/order/${o.id}`}
                  className="block bg-[#111114] border border-[#2a3a2a] rounded-xl p-4 text-sm"
                >
                  <span className="text-[#5c8a5c]">服务中</span> · {o.clientName}
                </Link>
              ))}
            </div>
          </section>
        )}

        {done.length > 0 && (
          <section>
            <h2 className="text-sm text-[#8b8793] tracking-wider mb-4">
              已完成的服务 ({done.length})
            </h2>
            <div className="space-y-2">
              {done.slice(0, 5).map((o) => (
                <Link
                  key={o.id}
                  href={`/order/${o.id}`}
                  className="block text-sm text-[#5a5860] hover:text-[#8b8793]"
                >
                  {o.clientName} · {new Date(o.createdAt).toLocaleDateString("zh-CN")}
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="pt-6 border-t border-[#1c1c22] text-center">
          <Link href="/profile/edit" className="text-xs text-[#8b8793] hover:text-[#c9a87c]">
            编辑我的接客资料（简介 / 标签 / 价格）
          </Link>
        </div>
      </main>
    </div>
  );
}

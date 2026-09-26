import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { orders, girlProfiles, users, serviceLogs } from "@/db/schema";
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
      scene: orders.scene,
      status: orders.status,
      createdAt: orders.createdAt,
      clientName: users.displayName,
    })
    .from(orders)
    .innerJoin(users, eq(orders.clientId, users.id))
    .where(eq(orders.girlId, user.id))
    .orderBy(desc(orders.createdAt))
    .limit(20);

  const logs = await db
    .select()
    .from(serviceLogs)
    .where(eq(serviceLogs.girlId, user.id))
    .orderBy(desc(serviceLogs.createdAt))
    .limit(8);

  const pending = pendingOrders.filter((o) => o.status === "pending");
  const active = pendingOrders.filter((o) => ["accepted", "serving"].includes(o.status));
  const done = pendingOrders.filter((o) => o.status === "completed");

  const statusMap: Record<string, string> = {
    idle: "空闲可约",
    busy: "接客中",
    off: "今日已收工",
  };

  const hasTonight =
    !!profile?.tonightPersona || !!profile?.tonightBody || !!profile?.tonightOpening;

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
            上钟前先写好今晚牌。空闲时更容易被点。
          </p>
        </section>

        <section className="bg-[#0f0a0a] border border-[#3a2222] rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm text-[#c9a87c]">今晚牌</h2>
            <Link href="/clock-in" className="text-xs text-[#8b8793] hover:text-[#c9a87c]">
              {hasTonight ? "改今晚的自己" : "上钟 · 写下今晚"}
            </Link>
          </div>
          {hasTonight ? (
            <div className="space-y-2 text-sm text-[#e6e4e0]">
              {profile?.tonightPersona && <p>身份：{profile.tonightPersona}</p>}
              {profile?.tonightBody && <p>身体：{profile.tonightBody}</p>}
              {profile?.tonightAllowed && <p>今晚可被：{profile.tonightAllowed}</p>}
              {profile?.tonightOpening && (
                <p className="text-[#c9a87c] pt-2">「{profile.tonightOpening}」</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-[#8a6a6a]">
              还没上钟。客人现在看到的只是空简介，不像一个在等人的人。
            </p>
          )}
        </section>

        <section>
          <h2 className="text-sm text-[#8b8793] tracking-wider mb-4">
            有人点了你 · {pending.length}
          </h2>
          {pending.length === 0 ? (
            <div className="bg-[#111114] border border-[#1c1c22] rounded-xl p-8 text-center text-[#5a5860] text-sm">
              暂时没人点你。把今晚牌亮出来，状态保持空闲。
            </div>
          ) : (
            <div className="space-y-4">
              {pending.map((o) => (
                <Link
                  key={o.id}
                  href={`/order/${o.id}`}
                  className="block bg-[#0f0a0a] border border-[#3a2222] rounded-xl p-5 hover:border-[#c9a87c]/40 transition"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[#c9a87c] text-sm">{o.clientName} 点了你</span>
                    <span className="text-xs text-[#5a5860]">
                      {new Date(o.createdAt).toLocaleString("zh-CN")}
                    </span>
                  </div>
                  {o.scene && <p className="text-xs text-[#8b8793] mb-2">场景 · {o.scene}</p>}
                  <p className="text-sm text-[#e6e4e0] leading-relaxed">
                    「{o.fantasyDetail.slice(0, 90)}
                    {o.fantasyDetail.length > 90 ? "……" : ""}」
                  </p>
                  <p className="text-xs text-[#c9a87c] mt-3">他在等你开门</p>
                </Link>
              ))}
            </div>
          )}
        </section>

        {active.length > 0 && (
          <section>
            <h2 className="text-sm text-[#8b8793] tracking-wider mb-4">
              正在被用 ({active.length})
            </h2>
            <div className="space-y-3">
              {active.map((o) => (
                <Link
                  key={o.id}
                  href={`/order/${o.id}`}
                  className="block bg-[#111114] border border-[#2a3a2a] rounded-xl p-4 text-sm"
                >
                  <span className="text-[#5c8a5c]">还没完</span> · {o.clientName}
                </Link>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-sm text-[#8b8793] tracking-wider mb-4">只给你看的接客日志</h2>
          {logs.length === 0 ? (
            <p className="text-xs text-[#5a5860]">还没有被用过的记录。</p>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="bg-[#111114] border border-[#1c1c22] rounded-xl p-4">
                  <p className="text-[11px] text-[#5a5860] mb-1">
                    {new Date(log.createdAt).toLocaleString("zh-CN")} · {log.clientName}
                  </p>
                  <p className="text-sm text-[#c9b8b8] leading-relaxed">{log.summary}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {done.length > 0 && (
          <section>
            <h2 className="text-sm text-[#8b8793] tracking-wider mb-4">已完成 ({done.length})</h2>
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

        <div className="pt-6 border-t border-[#1c1c22] text-center space-x-4">
          <Link href="/clock-in" className="text-xs text-[#8b8793] hover:text-[#c9a87c]">今晚牌</Link>
          <Link href="/clock-out" className="text-xs text-[#8b8793] hover:text-[#c9a87c]">下钟</Link>
          <Link href="/live" className="text-xs text-[#8b8793] hover:text-[#c9a87c]">等候室</Link>
          <Link href="/profile/edit" className="text-xs text-[#8b8793] hover:text-[#c9a87c]">固定资料</Link>
        </div>
      </main>
    </div>
  );
}

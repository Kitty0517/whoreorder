import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { orders, girlProfiles, users, serviceLogs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { StatusSwitcher } from "@/components/StatusSwitcher";
import { LogoutButton } from "@/components/LogoutButton";
import { callText, DEPTH_LABEL, PART_LABEL, formatClock, roomLeftSeconds } from "@/lib/house";
import { parseMenu, PARTS } from "@/lib/bodyMenu";
import { parsePricing, floorFromPrice } from "@/lib/pricing";

function watchingNow(raw?: string | null) {
  try {
    const now = Math.floor(Date.now() / 1000);
    const arr = JSON.parse(raw || "[]");
    if (!Array.isArray(arr)) return 0;
    return arr.filter((w: any) => w && w.until > now).length;
  } catch { return 0; }
}

export default async function GirlDashboard() {
  const user = await requireUser("girl");
  const [profile] = await db.select().from(girlProfiles).where(eq(girlProfiles.userId, user.id)).limit(1);

  const rows = await db
    .select({
      id: orders.id,
      fantasyDetail: orders.fantasyDetail,
      part: orders.part,
      depth: orders.depth,
      partName: orders.partName,
      status: orders.status,
      unlockedDepth: orders.unlockedDepth,
      roomEndsAt: orders.roomEndsAt,
      callNo: orders.callNo,
      extraStatus: orders.extraStatus,
      createdAt: orders.createdAt,
      clientName: users.displayName,
    })
    .from(orders)
    .innerJoin(users, eq(orders.clientId, users.id))
    .where(eq(orders.girlId, user.id))
    .orderBy(desc(orders.createdAt))
    .limit(20);

  const logs = await db.select().from(serviceLogs).where(eq(serviceLogs.girlId, user.id)).orderBy(desc(serviceLogs.createdAt)).limit(8);
  const pending = rows.filter((o) => o.status === "pending");
  const active = rows.filter((o) => ["accepted", "serving"].includes(o.status));
  const menu = parseMenu(profile?.bodyMenu);
  const selling = PARTS.filter((p) => menu[p.key]?.enabled).map((p) => p.label);
  const pricing = parsePricing(menu);
  const priceFrom = floorFromPrice(pricing, menu);

  const statusMap: Record<string, string> = { idle: "在柜上", busy: "房里有人", off: "已下钟" };

  return (
    <div className="min-h-screen">
      <header className="border-b border-[#1c1c22] px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-[#c9a87c] tracking-widest text-lg">柜上</h1>
          <p className="text-xs text-[#8b8793]">{user.displayName}</p>
        </div>
        <LogoutButton />
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        <section className="bg-[#111114] border border-[#1c1c22] rounded-xl p-6">
          <div className="flex justify-between mb-3">
            <div>
              <p className="text-xs text-[#8b8793]">状态</p>
              <p className="text-2xl text-[#c9a87c]">{statusMap[profile?.status || "off"]}</p>
            </div>
            <span className="text-4xl">{profile?.avatarEmoji}</span>
          </div>
          <StatusSwitcher current={profile?.status || "off"} />
          <p className="text-xs text-[#8b8793] mt-3">今晚卖：{selling.length ? selling.join("、") : "还没摆货"}</p>
          <p className="text-xs text-[#c9a87c] mt-1">
            {priceFrom} 币起 · 基数 {pricing.base}
            {pricing.overnightEnabled !== "off" ? " · 有包夜" : ""}
          </p>
          <p className="text-xs text-[#c9a87c] mt-1">
              {watchingNow((profile as any)?.watchers)
                ? `${watchingNow((profile as any)?.watchers)} 人正在看你`
                : `${profile?.viewCount || 0} 人翻过你`}
            </p>
        </section>

        <section>
          <h2 className="text-sm text-[#c9a87c] mb-4">叫号 · {pending.length}</h2>
          {pending.length === 0 ? (
            <p className="text-sm text-[#5a5860] border border-[#1c1c22] rounded-xl p-6 text-center">没人叫你。在柜上站着。</p>
          ) : (
            <div className="space-y-3">
              {pending.map((o) => (
                <Link key={o.id} href={`/order/${o.id}`} className="block bg-[#0f0a0a] border border-[#3a2222] rounded-xl p-5 hover:border-[#c9a87c]/40">
                  <p className="text-[#c9a87c] text-sm">
                    {o.callNo ? `${o.callNo} 号 · ` : ""}
                    {callText(o.part, o.depth, o.partName)}
                  </p>
                  <p className="text-xs text-[#8b8793] mt-1">{o.clientName}</p>
                  <p className="text-sm text-[#e6e4e0] mt-2 line-clamp-2">「{o.fantasyDetail}」</p>
                  <p className="text-xs text-[#c9a87c] mt-3">进房 →</p>
                </Link>
              ))}
            </div>
          )}
        </section>

        {active.length > 0 && (
          <section>
            <h2 className="text-sm text-[#8b8793] mb-3">房里</h2>
            {active.map((o) => {
              const left = roomLeftSeconds(o.roomEndsAt);
              return (
                <Link key={o.id} href={`/order/${o.id}`} className="block border border-[#2a3a2a] rounded-xl p-4 mb-2">
                  <span className="text-[#5c8a5c] text-sm">还在用 · {PART_LABEL[o.part] || o.part}</span>
                  <span className="text-xs text-[#8b8793] ml-2">钟 {formatClock(left)}</span>
                  <span className="text-xs text-[#8b8793] ml-2">{o.clientName}</span>
                </Link>
              );
            })}
          </section>
        )}

        <section>
          <h2 className="text-sm text-[#8b8793] mb-3">结账本</h2>
          {logs.length === 0 ? (
            <p className="text-xs text-[#5a5860]">还没有。</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="border border-[#1c1c22] rounded-xl p-3 mb-2">
                <p className="text-[11px] text-[#5a5860]">{new Date(log.createdAt).toLocaleString("zh-CN")}</p>
                <p className="text-sm text-[#c9b8b8]">{log.summary}</p>
              </div>
            ))
          )}
        </section>

        <div className="pt-4 border-t border-[#1c1c22] flex flex-wrap gap-4 text-xs text-[#8b8793]">
          <Link href="/body" className="hover:text-[#c9a87c]">摆货</Link>
          <Link href="/heat" className="hover:text-[#c9a87c]">发情档</Link>
          <Link href="/sisters" className="hover:text-[#c9a87c]">姐妹柜后</Link>
          <Link href="/pricing" className="hover:text-[#c9a87c]">标价</Link>
          <Link href="/clock-in" className="hover:text-[#c9a87c]">上钟</Link>
          <Link href="/clock-out" className="hover:text-[#c9a87c]">下钟</Link>
          <Link href="/live" className="hover:text-[#c9a87c]">等候室</Link>
          <Link href="/profile/edit" className="hover:text-[#c9a87c]">资料</Link>
        </div>
      </main>
    </div>
  );
}

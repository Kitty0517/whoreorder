import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { girlProfiles, users, orders } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";
import { parseMenu, PARTS } from "@/lib/bodyMenu";

export default async function FloorPage() {
  const user = await requireUser("client");

  const girls = await db
    .select({
      id: users.id,
      displayName: users.displayName,
      status: girlProfiles.status,
      avatarEmoji: girlProfiles.avatarEmoji,
      price: girlProfiles.price,
      bodyMenu: girlProfiles.bodyMenu,
      tonightOpening: girlProfiles.tonightOpening,
      viewCount: girlProfiles.viewCount,
    })
    .from(girlProfiles)
    .innerJoin(users, eq(girlProfiles.userId, users.id));

  const busyRooms = await db
    .select({ girlId: orders.girlId })
    .from(orders)
    .where(inArray(orders.status, ["pending", "accepted", "serving"]));
  const busySet = new Set(busyRooms.map((b) => b.girlId));
  const onFloor = girls.filter((g) => g.status === "idle" || g.status === "busy");

  return (
    <div className="min-h-screen">
      <header className="border-b border-[#1c1c22] px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-[#c9a87c] tracking-widest text-lg">楼面</h1>
          <p className="text-xs text-[#8b8793]">谁在柜上 · 卖什么 · 能不能叫</p>
        </div>
        <div className="flex gap-3 items-center">
          <Link href="/my-orders" className="text-xs text-[#8b8793]">我的房</Link>
          <Link href="/wallet" className="text-xs text-[#8b8793]">钱包</Link>
          <LogoutButton />
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-10 space-y-4">
        <p className="text-xs text-[#5a5860]">进门指人指处指档。房里有人就等。</p>
        {onFloor.length === 0 ? (
          <p className="text-[#5a5860] text-sm">柜上没人。</p>
        ) : (
          onFloor.map((g) => {
            const menu = parseMenu(g.bodyMenu);
            const selling = PARTS.filter((p) => menu[p.key]?.enabled).map((p) => p.label);
            const inRoom = busySet.has(g.id) || g.status === "busy";
            return (
              <Link
                key={g.id}
                href={inRoom ? "#" : `/girl/${g.id}`}
                className={`block border rounded-xl p-5 ${
                  inRoom
                    ? "border-[#2a2a32] opacity-60 pointer-events-none"
                    : "border-[#1c1c22] hover:border-[#c9a87c]/40"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <span className="text-3xl">{g.avatarEmoji}</span>
                    <div>
                      <p className="text-[#e6e4e0] font-medium">{g.displayName}</p>
                      <p className="text-xs text-[#8b8793] mt-1">
                        {inRoom ? "房里有人" : "空着可叫"} · {g.price} 币起 · {g.viewCount || 0} 人翻过
                      </p>
                      <p className="text-sm text-[#c9a87c] mt-2">
                        卖：{selling.length ? selling.join("、") : "还没摆货"}
                      </p>
                      {g.tonightOpening && (
                        <p className="text-xs text-[#5a5860] mt-1">「{g.tonightOpening}」</p>
                      )}
                    </div>
                  </div>
                  {!inRoom && <span className="text-xs text-[#c9a87c]">叫她 →</span>}
                </div>
              </Link>
            );
          })
        )}
        <p className="text-[11px] text-[#5a5860] pt-6">
          {user.displayName} · 赛博鸡店模拟 · 站内币 · 非真钱非线下
        </p>
      </main>
    </div>
  );
}

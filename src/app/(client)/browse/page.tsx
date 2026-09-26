import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { girlProfiles, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";

export default async function BrowsePage() {
  await requireUser("client");

  const girls = await db
    .select({
      id: users.id,
      displayName: users.displayName,
      bio: girlProfiles.bio,
      tags: girlProfiles.tags,
      price: girlProfiles.price,
      status: girlProfiles.status,
      avatarEmoji: girlProfiles.avatarEmoji,
      totalOrders: girlProfiles.totalOrders,
      avgRating: girlProfiles.avgRating,
    })
    .from(girlProfiles)
    .innerJoin(users, eq(girlProfiles.userId, users.id));

  const statusMap: Record<string, { text: string; color: string }> = {
    idle: { text: "空闲可约", color: "text-[#5c8a5c]" },
    busy: { text: "接客中", color: "text-[#c9a87c]" },
    off: { text: "已收工", color: "text-[#5a5860]" },
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-[#1c1c22] px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-[#c9a87c] tracking-widest text-lg">Noir Atelier</h1>
          <p className="text-xs text-[#8b8793]">点一个听话的</p>
        </div>
        <div className="flex gap-3 items-center">
          <Link href="/plaza" className="text-xs text-[#8b8793]">广场</Link>
          <Link href="/rank" className="text-xs text-[#8b8793]">排行</Link>
          <Link href="/wallet" className="text-xs text-[#8b8793]">钱包</Link>
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <h2 className="text-sm text-[#8b8793] tracking-wider mb-6">
          当前可点的赛博妓女
        </h2>

        {girls.length === 0 ? (
          <p className="text-[#5a5860] text-sm">暂时还没有人在接客。</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {girls.map((g) => {
              const tags = JSON.parse(g.tags || "[]") as string[];
              const st = statusMap[g.status] || statusMap.off;
              return (
                <Link
                  key={g.id}
                  href={`/girl/${g.id}`}
                  className="bg-[#111114] border border-[#1c1c22] rounded-xl overflow-hidden hover:border-[#c9a87c]/40 transition"
                >
                  <div className="h-32 bg-gradient-to-b from-[#1a1a22] to-[#0f0f14] flex items-center justify-center text-4xl relative">
                    {g.avatarEmoji}
                    <span className={`absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full border border-[#2a2a32] bg-black/50 ${st.color}`}>
                      {st.text}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-[#e6e4e0] font-medium mb-1">{g.displayName}</h3>
                    <p className="text-xs text-[#8b8793] line-clamp-2 mb-3">{g.bio}</p>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {tags.slice(0, 4).map((t) => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 bg-[#1a1a22] border border-[#2a2a32] rounded text-[#8b8793]">
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#c9a87c]">{g.price} / 次</span>
                      <span className="text-[#5a5860]">
                        {g.totalOrders} 次服务
                        {g.avgRating > 0 && ` · ${(g.avgRating / 10).toFixed(1)}★`}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

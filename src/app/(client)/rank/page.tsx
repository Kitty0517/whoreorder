import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { girlProfiles, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";

export default async function RankPage() {
  await requireUser("client");
  const girls = await db.select({
    id: users.id,
    displayName: users.displayName,
    totalOrders: girlProfiles.totalOrders,
    avgRating: girlProfiles.avgRating,
    viewCount: girlProfiles.viewCount,
    status: girlProfiles.status,
  }).from(girlProfiles).innerJoin(users, eq(girlProfiles.userId, users.id)).orderBy(desc(girlProfiles.totalOrders), desc(girlProfiles.avgRating));

  return (
    <div className="min-h-screen">
      <header className="border-b border-[#1c1c22] px-6 py-4">
        <Link href="/browse" className="text-xs text-[#8b8793]">← 点人</Link>
      </header>
      <main className="max-w-md mx-auto px-6 py-8 space-y-3">
        <h1 className="text-[#c9a87c] mb-4">被用得最多</h1>
        {girls.map((g, i) => (
          <Link key={g.id} href={`/girl/${g.id}`} className="block border border-[#1c1c22] rounded p-4">
            <p className="text-sm">{i + 1}. {g.displayName}</p>
            <p className="text-xs text-[#8b8793]">{g.totalOrders} 次 · {(g.avgRating/10).toFixed(1)}★ · {g.viewCount} 人看过</p>
          </Link>
        ))}
      </main>
    </div>
  );
}

import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { girlProfiles, users, reviews, orders } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { OrderForm } from "@/components/OrderForm";

export default async function GirlDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireUser("client");

  const [girl] = await db
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
    .innerJoin(users, eq(girlProfiles.userId, users.id))
    .where(eq(users.id, id))
    .limit(1);

  if (!girl) notFound();

  const recentReviews = await db
    .select({
      rating: reviews.rating,
      content: reviews.content,
      createdAt: reviews.createdAt,
      clientName: users.displayName,
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.clientId, users.id))
    .where(eq(reviews.girlId, id))
    .orderBy(desc(reviews.createdAt))
    .limit(5);

  const tags = JSON.parse(girl.tags || "[]") as string[];
  const canOrder = girl.status === "idle";

  return (
    <div className="min-h-screen">
      <header className="border-b border-[#1c1c22] px-6 py-4">
        <Link href="/browse" className="text-xs text-[#8b8793] hover:text-[#c9a87c]">
          ← 返回列表
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-8">
        <div className="flex items-start gap-5">
          <div className="text-5xl">{girl.avatarEmoji}</div>
          <div>
            <h1 className="text-2xl text-[#c9a87c]">{girl.displayName}</h1>
            <p className="text-sm text-[#8b8793] mt-1">{girl.bio}</p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {tags.map((t) => (
                <span key={t} className="text-[10px] px-1.5 py-0.5 bg-[#1a1a22] border border-[#2a2a32] rounded text-[#8b8793]">
                  {t}
                </span>
              ))}
            </div>
            <p className="text-sm text-[#c9a87c] mt-3">{girl.price} / 次服务</p>
          </div>
        </div>

        {canOrder ? (
          <section className="bg-[#0f0a0a] border border-[#3a2222] rounded-xl p-6">
            <p className="text-sm text-[#c9a87c] mb-4">写下你想怎么用她</p>
            <OrderForm girlId={girl.id} />
          </section>
        ) : (
          <div className="bg-[#111114] border border-[#1c1c22] rounded-xl p-6 text-center text-[#8b8793] text-sm">
            她现在{girl.status === "busy" ? "正在接客" : "已收工"}，暂时无法点单。
          </div>
        )}

        {recentReviews.length > 0 && (
          <section>
            <h2 className="text-sm text-[#8b8793] tracking-wider mb-4">客人评价</h2>
            <div className="space-y-4">
              {recentReviews.map((r, i) => (
                <div key={i} className="bg-[#111114] border border-[#1c1c22] rounded-xl p-4">
                  <div className="flex justify-between text-xs text-[#5a5860] mb-2">
                    <span>{r.clientName}</span>
                    <span>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                  </div>
                  <p className="text-sm text-[#e6e4e0] leading-relaxed">{r.content}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

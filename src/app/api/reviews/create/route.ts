import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { reviews, girlProfiles, orders } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser("client");
    const { orderId, girlId, rating, content } = await req.json();

    if (!orderId || !girlId || !rating || !content) {
      return NextResponse.json({ error: "参数不完整" }, { status: 400 });
    }

    // 确认订单属于当前用户且已完成
    const [order] = await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.clientId, user.id), eq(orders.status, "completed")))
      .limit(1);

    if (!order) {
      return NextResponse.json({ error: "订单不存在或未完成" }, { status: 400 });
    }

    // 防重复评价
    const existing = await db.select().from(reviews).where(eq(reviews.orderId, orderId)).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ error: "已评价过" }, { status: 400 });
    }

    await db.insert(reviews).values({
      id: uuidv4(),
      orderId,
      clientId: user.id,
      girlId,
      rating,
      content,
    });

    // 更新平均分（简单计算）
    const allReviews = await db.select({ rating: reviews.rating }).from(reviews).where(eq(reviews.girlId, girlId));
    const avg = Math.round((allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length) * 10);

    await db
      .update(girlProfiles)
      .set({ avgRating: avg })
      .where(eq(girlProfiles.userId, girlId));

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "错误" }, { status: 401 });
  }
}

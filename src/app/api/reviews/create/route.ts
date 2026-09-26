import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { reviews, girlProfiles, orders } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser("client");
    const { orderId, girlId, obedient, filthy, listen, content } = await req.json();
    if (!orderId || !girlId || !content) return NextResponse.json({ error: "把她这次写清楚" }, { status: 400 });
    if (/像小说|像AI|角色扮演|ChatGPT/i.test(content)) {
      return NextResponse.json({ error: "评价只写她乖不乖、脏不脏、听不听话" }, { status: 400 });
    }
    const [order] = await db.select().from(orders).where(and(eq(orders.id, orderId), eq(orders.clientId, user.id), eq(orders.status, "completed"))).limit(1);
    if (!order) return NextResponse.json({ error: "这单还没完事" }, { status: 400 });
    const existing = await db.select().from(reviews).where(eq(reviews.orderId, orderId)).limit(1);
    if (existing.length) return NextResponse.json({ error: "已经评过了" }, { status: 400 });
    const o = Number(obedient) || 5, f = Number(filthy) || 5, l = Number(listen) || 5;
    const rating = Math.round((o + f + l) / 3);
    await db.insert(reviews).values({ id: uuidv4(), orderId, clientId: user.id, girlId, rating, obedient: o, filthy: f, listen: l, content });
    const all = await db.select().from(reviews).where(eq(reviews.girlId, girlId));
    const avg = Math.round((all.reduce((s, r) => s + r.rating, 0) / all.length) * 10);
    await db.update(girlProfiles).set({ avgRating: avg }).where(eq(girlProfiles.userId, girlId));
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "先登录" }, { status: 401 });
  }
}

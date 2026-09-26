import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { orders, girlProfiles } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser("girl");
    const { orderId, reply, action } = await req.json();

    if (!orderId || !reply) {
      return NextResponse.json({ error: "缺少内容" }, { status: 400 });
    }

    const [order] = await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.girlId, user.id)))
      .limit(1);

    if (!order) {
      return NextResponse.json({ error: "订单不存在" }, { status: 404 });
    }

    const newStatus = action === "complete" ? "completed" : "accepted";

    await db
      .update(orders)
      .set({
        girlReply: reply,
        status: newStatus,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    if (action === "complete") {
      await db
        .update(girlProfiles)
        .set({
          totalOrders: sql`${girlProfiles.totalOrders} + 1`,
        })
        .where(eq(girlProfiles.userId, user.id));
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "错误" }, { status: 401 });
  }
}

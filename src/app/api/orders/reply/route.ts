import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { orders, girlProfiles, serviceLogs, users } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

function combineReply(opening: string, during: string, ending: string) {
  return [opening && `【开场】\n${opening}`, during && `【被用】\n${during}`, ending && `【收场】\n${ending}`]
    .filter(Boolean)
    .join("\n\n");
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser("girl");
    const { orderId, opening, during, ending, aftercare, action } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "缺少订单" }, { status: 400 });
    }

    const [order] = await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.girlId, user.id)))
      .limit(1);

    if (!order) {
      return NextResponse.json({ error: "订单不存在" }, { status: 404 });
    }

    const replyOpening = opening ?? order.replyOpening ?? "";
    const replyDuring = during ?? order.replyDuring ?? "";
    const replyEnding = ending ?? order.replyEnding ?? "";
    const after = aftercare ?? order.aftercare ?? "";

    if (action === "complete") {
      if (!replyOpening.trim() || !replyDuring.trim() || !replyEnding.trim()) {
        return NextResponse.json({ error: "开场、被用、收场三段都要写完才能完成这次服侍" }, { status: 400 });
      }
    }

    const girlReply = combineReply(replyOpening, replyDuring, replyEnding);
    const newStatus = action === "complete" ? "completed" : action === "serving" ? "serving" : "accepted";

    await db
      .update(orders)
      .set({
        girlReply,
        replyOpening,
        replyDuring,
        replyEnding,
        aftercare: after,
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

      const [client] = await db.select().from(users).where(eq(users.id, order.clientId)).limit(1);
      const summary = `客人「${client?.displayName || "匿名"}」点了你。今晚人设下被这样用过：${order.fantasyDetail.slice(0, 80)}……你写了开场、被用、收场。${after ? "收工时你留下了余韵。" : ""}`;

      await db.insert(serviceLogs).values({
        id: uuidv4(),
        girlId: user.id,
        orderId,
        clientName: client?.displayName || "客人",
        summary,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "错误" }, { status: 401 });
  }
}

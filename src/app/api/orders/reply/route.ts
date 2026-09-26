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
    const { orderId, opening, during, ending, aftercare, action, send } = await req.json();
    if (!orderId) return NextResponse.json({ error: "客人还在门口" }, { status: 400 });

    const [order] = await db.select().from(orders).where(and(eq(orders.id, orderId), eq(orders.girlId, user.id))).limit(1);
    if (!order) return NextResponse.json({ error: "这单已经不在了" }, { status: 404 });

    const replyOpening = opening ?? order.replyOpening ?? "";
    const replyDuring = during ?? order.replyDuring ?? "";
    const replyEnding = ending ?? order.replyEnding ?? "";
    const after = aftercare ?? order.aftercare ?? "";

    if (action === "complete" && (!replyOpening.trim() || !replyDuring.trim() || !replyEnding.trim())) {
      return NextResponse.json({ error: "开场、被用、收场都要写完才能完事" }, { status: 400 });
    }

    const patch: any = {
      girlReply: combineReply(replyOpening, replyDuring, replyEnding),
      replyOpening,
      replyDuring,
      replyEnding,
      aftercare: after,
      updatedAt: new Date(),
    };

    if (send === "opening") patch.sentOpening = 1;
    if (send === "during") patch.sentDuring = 1;
    if (send === "ending") patch.sentEnding = 1;

    if (action === "complete") {
      patch.status = "completed";
      patch.sentOpening = 1;
      patch.sentDuring = 1;
      patch.sentEnding = 1;
    } else if (action === "serving" || send === "during") {
      patch.status = "serving";
    } else if (action === "accept" || send === "opening") {
      patch.status = "accepted";
    }

    await db.update(orders).set(patch).where(eq(orders.id, orderId));

    if (action === "complete") {
      await db.update(girlProfiles).set({ totalOrders: sql`${girlProfiles.totalOrders} + 1` }).where(eq(girlProfiles.userId, user.id));
      const [client] = await db.select().from(users).where(eq(users.id, order.clientId)).limit(1);
      await db.insert(serviceLogs).values({
        id: uuidv4(),
        girlId: user.id,
        orderId,
        clientName: client?.displayName || "客人",
        summary: `客人「${client?.displayName || "匿名"}」点了你。${order.extraPay ? `加码 ${order.extraPay}。` : ""}${after ? "你留下了余韵。" : ""}`,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "客人还在门口" }, { status: 401 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { orders, girlProfiles, serviceLogs, users } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { PART_LABEL, DEPTH_LABEL, isRoomExpired, allowedSegments } from "@/lib/house";

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
    if (!order) return NextResponse.json({ error: "这间房没了" }, { status: 404 });
    if (order.status === "completed" || order.status === "rejected") {
      return NextResponse.json({ error: "这间房已经关了" }, { status: 400 });
    }

    const expired = isRoomExpired(order.roomEndsAt);
    const unlocked = order.unlockedDepth || "look";
    const allow = allowedSegments(unlocked);

    // 钟到了：只能送客，不能再发新段
    if (expired && action !== "complete") {
      return NextResponse.json({ error: "钟到了。续钟或送客。不能再写。" }, { status: 400 });
    }

    const replyOpening = opening ?? order.replyOpening ?? "";
    const replyDuring = during ?? order.replyDuring ?? "";
    const replyEnding = ending ?? order.replyEnding ?? "";
    const after = aftercare ?? order.aftercare ?? "";

    // 档没开：不许写入更深段
    if (!allow.during && replyDuring.trim() && replyDuring !== (order.replyDuring || "")) {
      return NextResponse.json({ error: "这一档还没开。加码接了才能写被用。" }, { status: 400 });
    }
    if (!allow.ending && replyEnding.trim() && replyEnding !== (order.replyEnding || "")) {
      return NextResponse.json({ error: "还没开到收场这一层。" }, { status: 400 });
    }
    if (send === "during" && !allow.during) {
      return NextResponse.json({ error: "这一档还没开。" }, { status: 400 });
    }
    if (send === "ending" && !allow.ending) {
      return NextResponse.json({ error: "还没开到这一层。" }, { status: 400 });
    }

    // 送客：至少开场；更深段按已开档要求
    if (action === "complete") {
      if (!replyOpening.trim()) {
        return NextResponse.json({ error: "至少把门开开再送客。" }, { status: 400 });
      }
      if (allow.during && !replyDuring.trim() && !expired) {
        return NextResponse.json({ error: "这一档开了，被用要写。" }, { status: 400 });
      }
      if (allow.ending && !replyEnding.trim() && !expired) {
        return NextResponse.json({ error: "收场要写。钟到了可以直接送客。" }, { status: 400 });
      }
    }

    const patch: any = {
      girlReply: combineReply(replyOpening, allow.during ? replyDuring : "", allow.ending ? replyEnding : ""),
      replyOpening,
      replyDuring: allow.during ? replyDuring : order.replyDuring || "",
      replyEnding: allow.ending ? replyEnding : order.replyEnding || "",
      aftercare: after,
      updatedAt: new Date(),
    };

    if (send === "opening") patch.sentOpening = 1;
    if (send === "during" && allow.during) patch.sentDuring = 1;
    if (send === "ending" && allow.ending) patch.sentEnding = 1;

    if (action === "complete") {
      patch.status = "completed";
      patch.sentOpening = 1;
      if (allow.during && replyDuring.trim()) patch.sentDuring = 1;
      if (allow.ending && replyEnding.trim()) patch.sentEnding = 1;
    } else if (action === "serving" || send === "during") {
      patch.status = "serving";
    } else if (action === "accept" || send === "opening") {
      patch.status = "accepted";
    }

    await db.update(orders).set(patch).where(eq(orders.id, orderId));

    if (action === "accept" || send === "opening") {
      await db.update(girlProfiles).set({ status: "busy" }).where(eq(girlProfiles.userId, user.id));
    }

    if (action === "complete") {
      await db.update(girlProfiles).set({
        totalOrders: sql`${girlProfiles.totalOrders} + 1`,
        status: "idle",
      }).where(eq(girlProfiles.userId, user.id));
      const [client] = await db.select().from(users).where(eq(users.id, order.clientId)).limit(1);
      const part = order.partName || PART_LABEL[order.part] || order.part;
      const depth = DEPTH_LABEL[order.unlockedDepth || order.depth] || order.depth;
      await db.insert(serviceLogs).values({
        id: uuidv4(),
        girlId: user.id,
        orderId,
        clientName: client?.displayName || "客人",
        summary: `${client?.displayName || "客人"}叫了你的${part}，开到${depth}。${expired ? "钟到送客。" : ""}${order.extraStatus === "accepted" ? "加过档。" : ""}`,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "客人还在门口" }, { status: 401 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { orders, girlProfiles, users, walletTxns } from "@/db/schema";
import { and, eq, inArray, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { parseMenu } from "@/lib/bodyMenu";
import { prevDepth } from "@/lib/house";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser("client");
    const { girlId, fantasyType, tone, fantasyDetail, scene, bodyAnchor, contract, part, depth, partName, minutes, playTags, specialTags } = await req.json();

    if (!girlId || !part || !depth) {
      return NextResponse.json({ error: "先指人、指处、指档" }, { status: 400 });
    }
    if (!fantasyDetail || fantasyDetail.length < 10) {
      return NextResponse.json({ error: "进房指令写一句具体的" }, { status: 400 });
    }

    const [profile] = await db.select().from(girlProfiles).where(eq(girlProfiles.userId, girlId)).limit(1);
    if (!profile || profile.status !== "idle") {
      return NextResponse.json({ error: "她不在柜上，或房里有人" }, { status: 400 });
    }

    // 一房一女：她若有进行中的房，不能再叫
    const active = await db
      .select({ id: orders.id })
      .from(orders)
      .where(and(eq(orders.girlId, girlId), inArray(orders.status, ["pending", "accepted", "serving"])))
      .limit(1);
    if (active.length) {
      return NextResponse.json({ error: "她房里有人" }, { status: 400 });
    }

    const menu = parseMenu(profile.bodyMenu);
    const partState = menu[part];
    if (!partState?.enabled) {
      return NextResponse.json({ error: "她今晚不卖这里" }, { status: 400 });
    }
    const choice = partState.depths?.[depth];
    if (choice !== "allow" && choice !== "markup") {
      return NextResponse.json({ error: "这档她不卖" }, { status: 400 });
    }

    const price = profile.price || 200;
    const roomMinutes = [20, 40, 60].includes(Number(minutes)) ? Number(minutes) : 20;
    const total = price + (roomMinutes === 40 ? 50 : roomMinutes === 60 ? 100 : 0);

    if (user.coins < total) {
      return NextResponse.json({ error: `币不够，这钟要 ${total}` }, { status: 400 });
    }

    // 叫号：今日序号粗略用 totalOrders+1
    const callNo = (profile.totalOrders || 0) + 1;
    const unlockedDepth = choice === "markup" ? prevDepth(depth) : depth;
    const extraStatus = choice === "markup" ? "pending" : "none";
    const extraDemand = choice === "markup" ? `要开到「${depth}」这一档` : "";
    const extraPay = choice === "markup" ? Math.max(50, Math.floor(price / 2)) : 0;

    await db.update(users).set({ coins: user.coins - total }).where(eq(users.id, user.id));
    await db.insert(walletTxns).values({
      id: uuidv4(),
      userId: user.id,
      amount: -total,
      reason: `叫人开房 ${roomMinutes} 分钟`,
    });
    const [girlUser] = await db.select().from(users).where(eq(users.id, girlId)).limit(1);
    if (girlUser) {
      await db.update(users).set({ coins: girlUser.coins + total }).where(eq(users.id, girlId));
      await db.insert(walletTxns).values({
        id: uuidv4(),
        userId: girlId,
        amount: total,
        reason: "有人叫你进房",
      });
    }

    // 进房后她变忙
    await db.update(girlProfiles).set({ status: "busy" }).where(eq(girlProfiles.userId, girlId));

    const id = uuidv4();
    const ends = Math.floor(Date.now() / 1000) + roomMinutes * 60;
    await db.insert(orders).values({
      id,
      clientId: user.id,
      girlId,
      fantasyType: fantasyType || "进房",
      fantasyDetail,
      tone: tone || "submissive",
      scene: scene || "",
      bodyAnchor: bodyAnchor || part,
      contract: contract || "obey",
      part: part || "",
      depth: depth || "",
      partName: partName || "",
      playTags: JSON.stringify(Array.isArray(playTags) ? playTags.slice(0, 3) : []),
      specialTags: JSON.stringify(Array.isArray(specialTags) ? specialTags : []),
      extraPay,
      extraDemand,
      extraStatus,
      unlockedDepth,
      roomMinutes,
      roomEndsAt: ends,
      callNo,
      status: "pending",
    });

    return NextResponse.json({ ok: true, orderId: id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "柜上忙" }, { status: 401 });
  }
}

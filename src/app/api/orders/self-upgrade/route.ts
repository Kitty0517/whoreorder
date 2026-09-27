import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { orders, girlProfiles, users, walletTxns } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { parseHeat, nextDepth, depthWithinHeat } from "@/lib/heat";
import { parsePricing, markupStepPrice } from "@/lib/pricing";
import { parseMenu } from "@/lib/bodyMenu";
import { DEPTH_LABEL } from "@/lib/house";

/** 发情房：她自己求加一档（在预授权上限内） */
export async function POST(req: NextRequest) {
  const user = await requireUser("girl");
  const { orderId } = await req.json();
  const [order] = await db.select().from(orders).where(and(eq(orders.id, orderId), eq(orders.girlId, user.id))).limit(1);
  if (!order) return NextResponse.json({ error: "房没了" }, { status: 404 });
  if (!["accepted", "serving", "pending"].includes(order.status)) {
    return NextResponse.json({ error: "房已关" }, { status: 400 });
  }

  const [profile] = await db.select().from(girlProfiles).where(eq(girlProfiles.userId, user.id)).limit(1);
  if (!profile?.heatOn) {
    return NextResponse.json({ error: "不在发情档，不能自己求加档" }, { status: 400 });
  }
  const heat = parseHeat(profile.heatConfig);
  if (!heat.allowSelfUpgrade) {
    return NextResponse.json({ error: "你关掉了自己求加档" }, { status: 400 });
  }

  const current = order.unlockedDepth || "look";
  const nxt = nextDepth(current);
  if (!nxt) return NextResponse.json({ error: "已经最深" }, { status: 400 });
  if (!depthWithinHeat(nxt, heat.maxDepth)) {
    return NextResponse.json({ error: `发情预授权只到「${DEPTH_LABEL[heat.maxDepth] || heat.maxDepth}」` }, { status: 400 });
  }

  // 客人付加档差价
  const menu = parseMenu(profile.bodyMenu);
  const pricing = parsePricing(menu);
  const fee = markupStepPrice(pricing.base, current, nxt);
  const [client] = await db.select().from(users).where(eq(users.id, order.clientId)).limit(1);
  if (!client || client.coins < fee) {
    return NextResponse.json({ error: `客人币不够付加档（${fee}）` }, { status: 400 });
  }
  await db.update(users).set({ coins: client.coins - fee }).where(eq(users.id, client.id));
  await db.update(users).set({ coins: user.coins + fee }).where(eq(users.id, user.id));
  await db.insert(walletTxns).values({ id: uuidv4(), userId: client.id, amount: -fee, reason: "她求加档" });
  await db.insert(walletTxns).values({ id: uuidv4(), userId: user.id, amount: fee, reason: "自己求加档收入" });

  await db.update(orders).set({
    unlockedDepth: nxt,
    depth: nxt,
    extraStatus: "accepted",
    extraDemand: `她自己求到「${DEPTH_LABEL[nxt] || nxt}」`,
    extraPay: fee,
    updatedAt: new Date(),
  }).where(eq(orders.id, orderId));

  return NextResponse.json({ ok: true, unlockedDepth: nxt, fee });
}

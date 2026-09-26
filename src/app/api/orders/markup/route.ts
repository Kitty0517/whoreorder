import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { orders, users, walletTxns } from "@/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "先登录" }, { status: 401 });
  const { orderId, extraPay, extraDemand, decision } = await req.json();
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) return NextResponse.json({ error: "这单不在了" }, { status: 404 });

  if (user.role === "client" && order.clientId === user.id) {
    const pay = Math.max(0, Number(extraPay) || 0);
    if (!extraDemand || extraDemand.length < 8) {
      return NextResponse.json({ error: "加码要求写清楚" }, { status: 400 });
    }
    if (user.coins < pay) return NextResponse.json({ error: "币不够" }, { status: 400 });
    await db.update(orders).set({ extraPay: pay, extraDemand, extraStatus: "pending", updatedAt: new Date() }).where(eq(orders.id, orderId));
    return NextResponse.json({ ok: true });
  }

  if (user.role === "girl" && order.girlId === user.id) {
    if (decision === "accept" && order.extraStatus === "pending") {
      const [client] = await db.select().from(users).where(eq(users.id, order.clientId)).limit(1);
      if (!client || client.coins < order.extraPay) {
        return NextResponse.json({ error: "客人币不够" }, { status: 400 });
      }
      await db.update(users).set({ coins: client.coins - order.extraPay }).where(eq(users.id, client.id));
      await db.update(users).set({ coins: user.coins + order.extraPay }).where(eq(users.id, user.id));
      await db.insert(walletTxns).values({ id: uuidv4(), userId: client.id, amount: -order.extraPay, reason: "加码付给她" });
      await db.insert(walletTxns).values({ id: uuidv4(), userId: user.id, amount: order.extraPay, reason: "收了加码" });
      await db.update(orders).set({
        extraStatus: "accepted",
        unlockedDepth: order.depth || order.unlockedDepth,
        updatedAt: new Date(),
      }).where(eq(orders.id, orderId));
    } else if (decision === "reject") {
      await db.update(orders).set({ extraStatus: "rejected", updatedAt: new Date() }).where(eq(orders.id, orderId));
    } else if (decision === "clarify") {
      await db.update(orders).set({ extraStatus: "clarify", updatedAt: new Date() }).where(eq(orders.id, orderId));
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "不行" }, { status: 403 });
}

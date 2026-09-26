import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { orders, users, walletTxns } from "@/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { isRoomExpired } from "@/lib/house";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "client") {
    return NextResponse.json({ error: "只有客人能续钟" }, { status: 401 });
  }
  const { orderId, minutes } = await req.json();
  const add = [10, 20, 40].includes(Number(minutes)) ? Number(minutes) : 20;
  const cost = add === 10 ? 30 : add === 40 ? 100 : 50;

  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order || order.clientId !== user.id) {
    return NextResponse.json({ error: "这间房不是你的" }, { status: 404 });
  }
  if (!["pending", "accepted", "serving"].includes(order.status)) {
    return NextResponse.json({ error: "房已经关了" }, { status: 400 });
  }
  if (user.coins < cost) {
    return NextResponse.json({ error: `续 ${add} 分钟要 ${cost} 币` }, { status: 400 });
  }

  const nowSec = Math.floor(Date.now() / 1000);
  const base = order.roomEndsAt && !isRoomExpired(order.roomEndsAt)
    ? Number(order.roomEndsAt)
    : nowSec;
  const newEnds = base + add * 60;

  await db.update(users).set({ coins: user.coins - cost }).where(eq(users.id, user.id));
  await db.insert(walletTxns).values({ id: uuidv4(), userId: user.id, amount: -cost, reason: `续钟 ${add} 分钟` });
  const [girl] = await db.select().from(users).where(eq(users.id, order.girlId)).limit(1);
  if (girl) {
    await db.update(users).set({ coins: girl.coins + cost }).where(eq(users.id, girl.id));
    await db.insert(walletTxns).values({ id: uuidv4(), userId: girl.id, amount: cost, reason: "客人续钟" });
  }
  await db.update(orders).set({
    roomEndsAt: newEnds,
    roomMinutes: (order.roomMinutes || 20) + add,
    updatedAt: new Date(),
  }).where(eq(orders.id, orderId));

  return NextResponse.json({ ok: true, roomEndsAt: newEnds });
}

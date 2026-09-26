import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { users, walletTxns } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "先登录" }, { status: 401 });
  const txns = await db.select().from(walletTxns).where(eq(walletTxns.userId, user.id)).orderBy(desc(walletTxns.createdAt)).limit(20);
  return NextResponse.json({ coins: user.coins, txns });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "先登录" }, { status: 401 });
  const { amount } = await req.json();
  const add = Math.min(5000, Math.max(100, Number(amount) || 0));
  await db.update(users).set({ coins: user.coins + add }).where(eq(users.id, user.id));
  await db.insert(walletTxns).values({ id: uuidv4(), userId: user.id, amount: add, reason: "站内充币（模拟，非真钱）" });
  return NextResponse.json({ ok: true, coins: user.coins + add });
}

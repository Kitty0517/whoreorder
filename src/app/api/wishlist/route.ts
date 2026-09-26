import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { wishlists } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  const user = await requireUser("client");
  const { girlId } = await req.json();
  const existing = await db.select().from(wishlists).where(and(eq(wishlists.clientId, user.id), eq(wishlists.girlId, girlId))).limit(1);
  if (existing.length) return NextResponse.json({ ok: true });
  await db.insert(wishlists).values({ id: uuidv4(), clientId: user.id, girlId });
  return NextResponse.json({ ok: true });
}

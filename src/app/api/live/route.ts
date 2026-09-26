import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { girlProfiles, liveMessages } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: NextRequest) {
  const girlId = req.nextUrl.searchParams.get("girlId");
  if (!girlId) return NextResponse.json({ messages: [] });
  const messages = await db.select().from(liveMessages).where(eq(liveMessages.girlId, girlId)).orderBy(desc(liveMessages.createdAt)).limit(40);
  return NextResponse.json({ messages: messages.reverse() });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "先登录" }, { status: 401 });
  const { girlId, content, liveOn } = await req.json();

  if (user.role === "girl" && typeof liveOn === "number") {
    await db.update(girlProfiles).set({ liveOn }).where(eq(girlProfiles.userId, user.id));
    return NextResponse.json({ ok: true });
  }

  if (!girlId || !content || String(content).length < 1) {
    return NextResponse.json({ error: "写一句" }, { status: 400 });
  }
  await db.insert(liveMessages).values({
    id: uuidv4(),
    girlId: user.role === "girl" ? user.id : girlId,
    userId: user.id,
    displayName: user.displayName,
    content: String(content).slice(0, 200),
  });
  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { sisterReplies, sisterPosts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  const user = await requireUser("girl");
  const { postId, content } = await req.json();
  const text = String(content || "").trim();
  if (!postId || text.length < 1 || text.length > 400) {
    return NextResponse.json({ error: "回复太短或太长" }, { status: 400 });
  }
  const [post] = await db.select().from(sisterPosts).where(eq(sisterPosts.id, postId)).limit(1);
  if (!post) return NextResponse.json({ error: "帖子不在了" }, { status: 404 });
  await db.insert(sisterReplies).values({
    id: uuidv4(),
    postId,
    girlId: user.id,
    content: text,
  });
  return NextResponse.json({ ok: true });
}

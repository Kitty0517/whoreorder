import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { sisterPosts, sisterReplies, users } from "@/db/schema";
import { desc, eq, inArray } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  await requireUser("girl");
  const posts = await db
    .select({
      id: sisterPosts.id,
      content: sisterPosts.content,
      mood: sisterPosts.mood,
      createdAt: sisterPosts.createdAt,
      girlId: sisterPosts.girlId,
      name: users.displayName,
    })
    .from(sisterPosts)
    .innerJoin(users, eq(sisterPosts.girlId, users.id))
    .orderBy(desc(sisterPosts.createdAt))
    .limit(40);

  const ids = posts.map((p) => p.id);
  let replies: any[] = [];
  if (ids.length) {
    replies = await db
      .select({
        id: sisterReplies.id,
        postId: sisterReplies.postId,
        content: sisterReplies.content,
        createdAt: sisterReplies.createdAt,
        girlId: sisterReplies.girlId,
        name: users.displayName,
      })
      .from(sisterReplies)
      .innerJoin(users, eq(sisterReplies.girlId, users.id))
      .where(inArray(sisterReplies.postId, ids))
      .orderBy(sisterReplies.createdAt);
  }

  const byPost: Record<string, any[]> = {};
  for (const r of replies) {
    (byPost[r.postId] ||= []).push(r);
  }

  return NextResponse.json({
    posts: posts.map((p) => ({ ...p, replies: byPost[p.id] || [] })),
  });
}

export async function POST(req: NextRequest) {
  const user = await requireUser("girl");
  const { content, mood } = await req.json();
  const text = String(content || "").trim();
  if (text.length < 2 || text.length > 800) {
    return NextResponse.json({ error: "写短一点，2～800 字" }, { status: 400 });
  }
  const id = uuidv4();
  await db.insert(sisterPosts).values({
    id,
    girlId: user.id,
    content: text,
    mood: String(mood || "").slice(0, 40),
  });
  return NextResponse.json({ ok: true, id });
}

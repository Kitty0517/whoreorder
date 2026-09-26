import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { plazaPosts } from "@/db/schema";
import { desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  const posts = await db.select().from(plazaPosts).orderBy(desc(plazaPosts.createdAt)).limit(40);
  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "先登录" }, { status: 401 });
  const { content } = await req.json();
  if (!content || content.length < 2) return NextResponse.json({ error: "写一句" }, { status: 400 });
  await db.insert(plazaPosts).values({
    id: uuidv4(),
    userId: user.id,
    role: user.role,
    displayName: user.displayName,
    content: String(content).slice(0, 300),
  });
  return NextResponse.json({ ok: true });
}

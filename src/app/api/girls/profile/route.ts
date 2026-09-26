import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { girlProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const user = await requireUser("girl");
    const [profile] = await db
      .select()
      .from(girlProfiles)
      .where(eq(girlProfiles.userId, user.id))
      .limit(1);
    return NextResponse.json(profile || {});
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser("girl");
    const { bio, tags, price, avatarEmoji } = await req.json();
    await db
      .update(girlProfiles)
      .set({
        bio: bio || "",
        tags: JSON.stringify(tags || []),
        price: price || 200,
        avatarEmoji: avatarEmoji || "🖤",
      })
      .where(eq(girlProfiles.userId, user.id));
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 });
  }
}

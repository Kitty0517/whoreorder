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
    const body = await req.json();
    const patch: Record<string, unknown> = {};
    if (body.bio !== undefined) patch.bio = body.bio || "";
    if (body.tags !== undefined) patch.tags = JSON.stringify(body.tags || []);
    if (body.price !== undefined) patch.price = body.price || 200;
    if (body.avatarEmoji !== undefined) patch.avatarEmoji = body.avatarEmoji || "🖤";
    if (body.photoUrl !== undefined) patch.photoUrl = body.photoUrl || "";
    if (body.voiceUrl !== undefined) patch.voiceUrl = body.voiceUrl || "";
    if (body.clockOutNote !== undefined) patch.clockOutNote = body.clockOutNote || "";
    if (body.showPublicReviews !== undefined) patch.showPublicReviews = body.showPublicReviews ? 1 : 0;
    await db.update(girlProfiles).set(patch).where(eq(girlProfiles.userId, user.id));
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 });
  }
}

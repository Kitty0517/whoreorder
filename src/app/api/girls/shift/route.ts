import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { orders, reviews, girlProfiles } from "@/db/schema";
import { eq, and, gte, desc } from "drizzle-orm";
import { DEPTH_LABEL, PART_LABEL, depthIndex } from "@/lib/house";
import { playTagLabel, specialLabel } from "@/lib/bodyMenu";

export async function GET() {
  const user = await requireUser("girl");
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const startSec = Math.floor(start.getTime() / 1000);

  const rows = await db
    .select()
    .from(orders)
    .where(and(eq(orders.girlId, user.id), gte(orders.createdAt, new Date(startSec * 1000))))
    .orderBy(desc(orders.createdAt));

  const done = rows.filter((o) => o.status === "completed");
  const markupAccepted = done.filter((o) => o.extraStatus === "accepted").length;
  const markupRejected = rows.filter((o) => o.extraStatus === "rejected").length;

  let deepest = { part: "", depth: "", score: -1 };
  for (const o of done) {
    const score = depthIndex(o.unlockedDepth || o.depth || "");
    if (score > deepest.score) {
      deepest = {
        part: o.partName || PART_LABEL[o.part] || o.part,
        depth: DEPTH_LABEL[o.unlockedDepth || o.depth] || o.unlockedDepth || o.depth,
        score,
      };
    }
  }

  const partCount: Record<string, number> = {};
  for (const o of done) {
    const p = PART_LABEL[o.part] || o.part || "?";
    partCount[p] = (partCount[p] || 0) + 1;
  }

  const [profile] = await db.select().from(girlProfiles).where(eq(girlProfiles.userId, user.id)).limit(1);
  const recentReviews = await db
    .select()
    .from(reviews)
    .where(eq(reviews.girlId, user.id))
    .orderBy(desc(reviews.createdAt))
    .limit(3);

  return NextResponse.json({
    totalOrders: profile?.totalOrders || 0,
    todayCount: done.length,
    todayPending: rows.filter((o) => o.status === "pending").length,
    markupAccepted,
    markupRejected,
    deepest,
    partCount,
    stingReview: recentReviews[0]?.content || "",
    stingScores: recentReviews[0]
      ? { obedient: recentReviews[0].obedient, filthy: recentReviews[0].filthy, listen: recentReviews[0].listen }
      : null,
  });
}

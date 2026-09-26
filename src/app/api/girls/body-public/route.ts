import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { girlProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { parseMenu, openParts, PARTS } from "@/lib/bodyMenu";

export async function GET(req: NextRequest) {
  const girlId = req.nextUrl.searchParams.get("girlId");
  if (!girlId) return NextResponse.json({ menu: {} });
  const [profile] = await db.select().from(girlProfiles).where(eq(girlProfiles.userId, girlId)).limit(1);
  const menu = parseMenu(profile?.bodyMenu);
  const open = openParts(menu).map((p) => ({
    key: p.key,
    label: p.label,
    ...menu[p.key],
    catalog: PARTS.find((x) => x.key === p.key),
  }));
  return NextResponse.json({ open, menu });
}

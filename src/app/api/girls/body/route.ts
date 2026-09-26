import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { girlProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { PARTS, emptyPart, parseMenu, scorePart, type PartState } from "@/lib/bodyMenu";

export async function GET() {
  const user = await requireUser("girl");
  const [profile] = await db.select().from(girlProfiles).where(eq(girlProfiles.userId, user.id)).limit(1);
  const menu = parseMenu(profile?.bodyMenu);
  for (const p of PARTS) if (!menu[p.key]) menu[p.key] = emptyPart();
  return NextResponse.json({ menu });
}

export async function POST(req: NextRequest) {
  const user = await requireUser("girl");
  const { menu } = await req.json();
  const next: Record<string, PartState> = {};
  for (const p of PARTS) {
    const raw = (menu?.[p.key] || emptyPart()) as PartState;
    next[p.key] = scorePart({
      enabled: !!raw.enabled,
      photos: Array.isArray(raw.photos) ? raw.photos.slice(0, 3).map((x) => String(x || "")) : ["", ""],
      depths: { look: raw.depths?.look || "deny", use: raw.depths?.use || "deny", enter: raw.depths?.enter || "deny", dirty: raw.depths?.dirty || "deny" },
      namesFree: raw.namesFree || [],
      namesPaid: raw.namesPaid || [],
      scoreLook: 0,
      scoreUse: 0,
      scoreFilth: 0,
    });
  }
  const enabled = PARTS.filter((p) => next[p.key].enabled).map((p) => p.key);
  if (enabled.length && !(enabled.includes("mouth") && (enabled.includes("breast") || enabled.includes("pussy")))) {
    return NextResponse.json({ error: "要上钟，至少卖嘴，再加奶或逼其中一处。" }, { status: 400 });
  }
  await db.update(girlProfiles).set({ bodyMenu: JSON.stringify(next) }).where(eq(girlProfiles.userId, user.id));
  return NextResponse.json({ ok: true, menu: next });
}

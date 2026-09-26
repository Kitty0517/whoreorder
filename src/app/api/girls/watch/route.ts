import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { girlProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";

type Watcher = { id: string; until: number };

function parseWatchers(raw?: string | null): Watcher[] {
  try {
    const arr = JSON.parse(raw || "[]");
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function clean(list: Watcher[]) {
  const now = Math.floor(Date.now() / 1000);
  return list.filter((w) => w && w.until > now);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "先登录" }, { status: 401 });
  const { girlId } = await req.json();
  if (!girlId) return NextResponse.json({ error: "无" }, { status: 400 });
  if (user.id === girlId) return NextResponse.json({ ok: true, watching: 0 });

  const [profile] = await db.select().from(girlProfiles).where(eq(girlProfiles.userId, girlId)).limit(1);
  if (!profile) return NextResponse.json({ error: "无" }, { status: 404 });

  let list = clean(parseWatchers((profile as any).watchers));
  list = list.filter((w) => w.id !== user.id);
  list.push({ id: user.id, until: Math.floor(Date.now() / 1000) + 90 });
  await db.update(girlProfiles).set({ watchers: JSON.stringify(list) } as any).where(eq(girlProfiles.userId, girlId));
  return NextResponse.json({ ok: true, watching: list.length });
}

export async function GET(req: NextRequest) {
  const girlId = req.nextUrl.searchParams.get("girlId");
  if (!girlId) return NextResponse.json({ watching: 0 });
  const [profile] = await db.select().from(girlProfiles).where(eq(girlProfiles.userId, girlId)).limit(1);
  if (!profile) return NextResponse.json({ watching: 0 });
  const list = clean(parseWatchers((profile as any).watchers));
  if (list.length !== parseWatchers((profile as any).watchers).length) {
    await db.update(girlProfiles).set({ watchers: JSON.stringify(list) } as any).where(eq(girlProfiles.userId, girlId));
  }
  return NextResponse.json({ watching: list.length });
}

import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { girlProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { parseHeat, DEFAULT_HEAT } from "@/lib/heat";

export async function GET() {
  const user = await requireUser("girl");
  const [p] = await db.select().from(girlProfiles).where(eq(girlProfiles.userId, user.id)).limit(1);
  return NextResponse.json({
    heatOn: !!p?.heatOn,
    config: parseHeat(p?.heatConfig),
    status: p?.status || "off",
  });
}

export async function POST(req: NextRequest) {
  const user = await requireUser("girl");
  const body = await req.json();
  const [p] = await db.select().from(girlProfiles).where(eq(girlProfiles.userId, user.id)).limit(1);
  if (!p) return NextResponse.json({ error: "先完善资料" }, { status: 400 });

  // 只存配置
  if (body.config) {
    const c = parseHeat(JSON.stringify(body.config));
    await db.update(girlProfiles).set({ heatConfig: JSON.stringify(c) }).where(eq(girlProfiles.userId, user.id));
    return NextResponse.json({ ok: true, config: c });
  }

  // 发情上钟 / 退出发情
  if (typeof body.heatOn === "boolean" || typeof body.heatOn === "number") {
    const on = body.heatOn ? 1 : 0;
    if (on) {
      await db.update(girlProfiles).set({
        heatOn: 1,
        status: "idle",
      }).where(eq(girlProfiles.userId, user.id));
    } else {
      await db.update(girlProfiles).set({ heatOn: 0 }).where(eq(girlProfiles.userId, user.id));
    }
    return NextResponse.json({ ok: true, heatOn: !!on });
  }

  return NextResponse.json({ error: "无操作" }, { status: 400 });
}

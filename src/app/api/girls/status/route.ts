import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { girlProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser("girl");
    const { status } = await req.json();
    if (!["idle", "busy", "off"].includes(status)) {
      return NextResponse.json({ error: "无效状态" }, { status: 400 });
    }
    await db
      .update(girlProfiles)
      .set({ status })
      .where(eq(girlProfiles.userId, user.id));
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "错误" }, { status: 401 });
  }
}

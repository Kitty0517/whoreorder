import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { girlProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser("girl");
    const body = await req.json();
    const patch: Record<string, unknown> = {
      tonightPersona: body.tonightPersona || "",
      tonightBody: body.tonightBody || "",
      tonightAllowed: body.tonightAllowed || "",
      tonightOpening: body.tonightOpening || "",
    };
    if (body.status && ["idle", "busy", "off"].includes(body.status)) {
      patch.status = body.status;
    }
    await db.update(girlProfiles).set(patch).where(eq(girlProfiles.userId, user.id));
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 });
  }
}

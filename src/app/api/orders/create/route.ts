import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser("client");
    const { girlId, fantasyType, tone, fantasyDetail, scene, bodyAnchor, contract } = await req.json();

    if (!girlId || !fantasyType || !tone || !fantasyDetail || fantasyDetail.length < 20) {
      return NextResponse.json({ error: "写清楚你要怎么用她" }, { status: 400 });
    }

    const id = uuidv4();
    await db.insert(orders).values({
      id,
      clientId: user.id,
      girlId,
      fantasyType,
      fantasyDetail,
      tone,
      scene: scene || "",
      bodyAnchor: bodyAnchor || "",
      contract: contract || "obey",
      status: "pending",
    });

    return NextResponse.json({ ok: true, orderId: id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "错误" }, { status: 401 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { girlProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { parseMenu, openParts, PARTS, getSpecial, PLAY_TAGS, SPECIAL_KINKS } from "@/lib/bodyMenu";
import { parsePricing, floorFromPrice, partDepthPrice } from "@/lib/pricing";
import { parseHeat } from "@/lib/heat";

export async function GET(req: NextRequest) {
  const girlId = req.nextUrl.searchParams.get("girlId");
  if (!girlId) return NextResponse.json({ menu: {}, open: [], special: {} });
  const [profile] = await db.select().from(girlProfiles).where(eq(girlProfiles.userId, girlId)).limit(1);
  const menu = parseMenu(profile?.bodyMenu);
  const open = openParts(menu).map((p) => ({
    key: p.key,
    label: p.label,
    ...menu[p.key],
    catalog: PARTS.find((x) => x.key === p.key),
  }));
  const special = getSpecial(menu);
  const specialOpen = SPECIAL_KINKS.filter((k) => special[k.key]).map((k) => ({
    key: k.key,
    label: k.label,
    hint: k.hint,
  }));
  const pricing = parsePricing(menu);
  const openWithPrice = open.map((p) => ({
    ...p,
    priceFrom: partDepthPrice(pricing.base, p.key, "look"),
    prices: {
      look: partDepthPrice(pricing.base, p.key, "look"),
      use: partDepthPrice(pricing.base, p.key, "use"),
      enter: partDepthPrice(pricing.base, p.key, "enter"),
      dirty: partDepthPrice(pricing.base, p.key, "dirty"),
    },
  }));
  return NextResponse.json({
    open: openWithPrice,
    menu,
    special,
    specialOpen,
    playTagCatalog: PLAY_TAGS,
    pricing,
    floorFrom: floorFromPrice(pricing, menu),
    heatOn: !!profile?.heatOn,
    heat: profile?.heatOn ? parseHeat(profile.heatConfig) : null,
  });
}

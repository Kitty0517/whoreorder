/**
 * 妓女标价：基数 B + 部位系数 + 深度系数 + 时长 + 玩法 + 多人
 * 存在 bodyMenu._pricing，下单时服务端重算，不信任前端总额。
 */

export type PricingConfig = {
  base: number;
  overnightLight: number;
  overnightStd: number;
  overnightFull: number;
  multiPerSeat: number;
  /** 包夜是否开 */
  overnightEnabled: "off" | "light" | "std" | "full";
};

export const DEFAULT_PRICING: PricingConfig = {
  base: 200,
  overnightLight: 1000,
  overnightStd: 1600,
  overnightFull: 2800,
  multiPerSeat: 120,
  overnightEnabled: "off",
};

/** 部位相对基数 */
export const PART_FACTOR: Record<string, number> = {
  mouth: 0.8,
  breast: 0.6,
  pussy: 1.0,
  ass: 1.5,
  feet: 0.6,
};

/** 深度相对部位价 */
export const DEPTH_FACTOR: Record<string, number> = {
  look: 0.5,
  use: 1.0,
  enter: 1.5,
  dirty: 2.0,
};

/** 玩法加价（相对 B） */
export const TAG_ADD_FACTOR: Record<string, number> = {
  watch_only: 0,
  self_open: 0.05,
  count: 0.1,
  silent: 0.1,
  must_sound: 0.05,
  resist_then: 0.15,
  cold_face: 0,
  marks: 0.15,
  edge: 0.15,
  objectify: 0.2,
  kneel: 0.1,
  show_after: 0.15,
  multi: 0, // 用 multiSeats
  nonhuman: 0.3,
  tentacle: 0.25,
  public_play: 0.2,
  harsh_object: 0.2,
  play_dog: 0.25,
  play_pony: 0.25,
  play_pig: 0.3,
  play_livestock: 0.25,
  rimming: 0.25,
  footjob: 0.15,
  used_by_feet: 0.2,
  ass_mouth: 0.25,
  filth_service: 0.3,
};

export function parsePricing(menu: Record<string, any> | null | undefined): PricingConfig {
  const raw = menu?._pricing || {};
  return {
    base: clamp(Number(raw.base) || DEFAULT_PRICING.base, 50, 5000),
    overnightLight: clamp(Number(raw.overnightLight) || DEFAULT_PRICING.overnightLight, 200, 20000),
    overnightStd: clamp(Number(raw.overnightStd) || DEFAULT_PRICING.overnightStd, 200, 30000),
    overnightFull: clamp(Number(raw.overnightFull) || DEFAULT_PRICING.overnightFull, 200, 50000),
    multiPerSeat: clamp(Number(raw.multiPerSeat) || DEFAULT_PRICING.multiPerSeat, 0, 2000),
    overnightEnabled: ["off", "light", "std", "full"].includes(raw.overnightEnabled)
      ? raw.overnightEnabled
      : "off",
  };
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.round(n)));
}

export function partDepthPrice(base: number, part: string, depth: string) {
  const pf = PART_FACTOR[part] ?? 1;
  const df = DEPTH_FACTOR[depth] ?? 1;
  return clamp(base * pf * df, 20, 20000);
}

export function markupStepPrice(base: number, fromDepth: string, toDepth: string) {
  const a = partDepthPrice(base, "pussy", fromDepth); // 相对幅度用逼作尺
  const b = partDepthPrice(base, "pussy", toDepth);
  return clamp(Math.max(40, b - a), 40, 5000);
}

export type QuoteInput = {
  part: string;
  depth: string;
  minutes?: number;
  playTags?: string[];
  specialTags?: string[];
  multiSeats?: number; // 1 = 仅主客
  packageType?: "none" | "light" | "std" | "full";
};

export type QuoteResult = {
  total: number;
  breakdown: { label: string; amount: number }[];
  base: number;
};

export function calculateQuote(pricing: PricingConfig, input: QuoteInput): QuoteResult {
  const breakdown: { label: string; amount: number }[] = [];
  const B = pricing.base;

  if (input.packageType && input.packageType !== "none") {
    const map = {
      light: pricing.overnightLight,
      std: pricing.overnightStd,
      full: pricing.overnightFull,
    } as const;
    const amount = map[input.packageType];
    breakdown.push({ label: `包夜·${input.packageType}`, amount });
    let total = amount;
    const seats = Math.min(3, Math.max(1, Number(input.multiSeats) || 1));
    if (seats > 1) {
      const add = (seats - 1) * pricing.multiPerSeat;
      breakdown.push({ label: `多人 ×${seats - 1}`, amount: add });
      total += add;
    }
    return { total, breakdown, base: B };
  }

  const partPrice = partDepthPrice(B, input.part, input.depth);
  breakdown.push({ label: "处·档", amount: partPrice });

  let tagsAdd = 0;
  const tags = [...(input.playTags || []), ...(input.specialTags || [])].slice(0, 6);
  for (const t of tags) {
    const f = TAG_ADD_FACTOR[t] ?? 0;
    if (f > 0) tagsAdd += B * f;
  }
  tagsAdd = clamp(Math.min(tagsAdd, B * 0.5), 0, B * 0.5);
  if (tagsAdd > 0) breakdown.push({ label: "玩法", amount: tagsAdd });

  const minutes = [20, 40, 60].includes(Number(input.minutes)) ? Number(input.minutes) : 20;
  let timeAdd = 0;
  if (minutes === 40) timeAdd = Math.round(B * 0.25);
  if (minutes === 60) timeAdd = Math.round(B * 0.5);
  if (timeAdd > 0) breakdown.push({ label: `${minutes}分钟`, amount: timeAdd });

  const seats = Math.min(3, Math.max(1, Number(input.multiSeats) || 1));
  let multiAdd = 0;
  if (seats > 1) {
    multiAdd = (seats - 1) * pricing.multiPerSeat;
    breakdown.push({ label: `多人 ×${seats - 1}`, amount: multiAdd });
  }

  const total = clamp(partPrice + tagsAdd + timeAdd + multiAdd, 20, 50000);
  return { total, breakdown, base: B };
}

export function floorFromPrice(pricing: PricingConfig, menu: Record<string, any>) {
  let min = Infinity;
  for (const part of Object.keys(PART_FACTOR)) {
    const st = menu[part];
    if (!st?.enabled) continue;
    for (const d of ["look", "use", "enter", "dirty"]) {
      if (st.depths?.[d] === "allow" || st.depths?.[d] === "markup") {
        min = Math.min(min, partDepthPrice(pricing.base, part, d));
      }
    }
  }
  return min === Infinity ? pricing.base : min;
}

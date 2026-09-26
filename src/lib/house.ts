export const DEPTH_ORDER = ["look", "use", "enter", "dirty"] as const;
export type DepthKey = (typeof DEPTH_ORDER)[number];

export const DEPTH_LABEL: Record<string, string> = {
  look: "只许看",
  use: "口/手",
  enter: "许进",
  dirty: "弄脏",
};

export const PART_LABEL: Record<string, string> = {
  mouth: "嘴",
  breast: "奶",
  pussy: "逼",
  ass: "屁眼",
  feet: "足",
};

export function depthIndex(d: string) {
  const i = DEPTH_ORDER.indexOf(d as DepthKey);
  return i < 0 ? 0 : i;
}

export function prevDepth(d: string) {
  const i = depthIndex(d);
  return i <= 0 ? "look" : DEPTH_ORDER[i - 1];
}

export function callText(part: string, depth: string, partName?: string) {
  const p = partName || PART_LABEL[part] || part || "货";
  const d = DEPTH_LABEL[depth] || depth || "";
  return `有人叫你的${p}${d ? "，" + d : ""}`;
}

export function roomLeftSeconds(endsAt?: Date | number | null) {
  if (endsAt == null) return null;
  const t = typeof endsAt === "number" ? endsAt * 1000 : new Date(endsAt).getTime();
  return Math.max(0, Math.floor((t - Date.now()) / 1000));
}

export function isRoomExpired(endsAt?: Date | number | null) {
  const left = roomLeftSeconds(endsAt);
  return left !== null && left <= 0;
}

export function formatClock(sec: number | null) {
  if (sec === null) return "--:--";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** 开到哪一档，允许写哪几段 */
export function allowedSegments(unlockedDepth: string) {
  const i = depthIndex(unlockedDepth || "look");
  return {
    opening: true,
    during: i >= 1,
    ending: i >= 2,
  };
}

export function segmentBlockedReason(seg: "opening" | "during" | "ending", unlockedDepth: string) {
  const a = allowedSegments(unlockedDepth);
  if (a[seg]) return null;
  if (seg === "during") return "这一档还没开。客人加码你接了，才能写被用。";
  if (seg === "ending") return "还没开到这一层。加档或开到「许进」才能收场。";
  return "档不够";
}

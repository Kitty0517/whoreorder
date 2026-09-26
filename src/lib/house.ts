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
  if (!endsAt) return null;
  const t = typeof endsAt === "number" ? endsAt * 1000 : endsAt.getTime();
  return Math.max(0, Math.floor((t - Date.now()) / 1000));
}

export function formatClock(sec: number | null) {
  if (sec === null) return "--:--";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

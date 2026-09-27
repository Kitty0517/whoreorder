import type { DepthKey } from "./house";
import { DEPTH_ORDER } from "./house";

export type HeatConfig = {
  maxDepth: string;
  playTags: string[];
  specialTags: string[];
  scenes: string[];
  allowSelfUpgrade: boolean;
  defaultMinutes: number;
};

export const DEFAULT_HEAT: HeatConfig = {
  maxDepth: "enter",
  playTags: ["objectify", "count", "kneel"],
  specialTags: [],
  scenes: ["hotel_window", "door_unlocked", "counter_knows"],
  allowSelfUpgrade: true,
  defaultMinutes: 20,
};

export function parseHeat(raw?: string | null): HeatConfig {
  try {
    const o = JSON.parse(raw || "{}");
    return {
      maxDepth: DEPTH_ORDER.includes(o.maxDepth) ? o.maxDepth : DEFAULT_HEAT.maxDepth,
      playTags: Array.isArray(o.playTags) ? o.playTags.slice(0, 6) : DEFAULT_HEAT.playTags,
      specialTags: Array.isArray(o.specialTags) ? o.specialTags.slice(0, 6) : [],
      scenes: Array.isArray(o.scenes) ? o.scenes.slice(0, 6) : DEFAULT_HEAT.scenes,
      allowSelfUpgrade: o.allowSelfUpgrade !== false,
      defaultMinutes: [20, 40, 60].includes(Number(o.defaultMinutes)) ? Number(o.defaultMinutes) : 20,
    };
  } catch {
    return { ...DEFAULT_HEAT };
  }
}

export function nextDepth(current: string): string | null {
  const i = DEPTH_ORDER.indexOf(current as DepthKey);
  if (i < 0 || i >= DEPTH_ORDER.length - 1) return null;
  return DEPTH_ORDER[i + 1];
}

export function depthWithinHeat(current: string, maxDepth: string) {
  const a = DEPTH_ORDER.indexOf(current as DepthKey);
  const b = DEPTH_ORDER.indexOf(maxDepth as DepthKey);
  if (a < 0) return true;
  if (b < 0) return a <= 2;
  return a <= b;
}

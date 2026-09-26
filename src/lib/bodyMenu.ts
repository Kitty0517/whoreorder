export const PARTS = [
  {
    key: "mouth",
    label: "嘴",
    hint: "几乎每单都会先用到。不开，很多客人会空。",
    depths: [
      { key: "look", label: "只许看" },
      { key: "use", label: "含 / 舔 / 报数" },
      { key: "enter", label: "深，不许随便抬头" },
      { key: "dirty", label: "结束时展示、吐或咽" },
    ],
    namesFree: ["嘴", "用处", "含东西的地方"],
    namesPaid: ["不会拒绝的那张", "先含着再说话"],
  },
  {
    key: "breast",
    label: "奶",
    hint: "看、含、夹、磨。乳尖可以单独加价。",
    depths: [
      { key: "look", label: "只许看" },
      { key: "use", label: "含乳尖 / 挤" },
      { key: "enter", label: "夹、磨、留印" },
      { key: "dirty", label: "用奶完成指定动作" },
    ],
    namesFree: ["奶", "被看的那对"],
    namesPaid: ["认错用的", "不许出声的尖"],
  },
  {
    key: "pussy",
    label: "逼",
    hint: "核心货。看、扒、口、进，分档卖。",
    depths: [
      { key: "look", label: "只许看 / 自己扒开" },
      { key: "use", label: "口或手，不许进" },
      { key: "enter", label: "许进，深度你来定上限" },
      { key: "dirty", label: "许弄脏 / 在里面结束" },
    ],
    namesFree: ["逼", "今晚卖的那里"],
    namesPaid: ["先看十分钟的地方", "加钱才进的洞"],
  },
  {
    key: "ass",
    label: "屁眼",
    hint: "很多人绕到这里。你可以只卖看，不卖进。",
    depths: [
      { key: "look", label: "只许看缝" },
      { key: "use", label: "外围，不许进" },
      { key: "enter", label: "许进" },
      { key: "dirty", label: "当主货用，不只是加码" },
    ],
    namesFree: ["屁眼", "后面"],
    namesPaid: ["加码才给的那处", "只许看的缝"],
  },
  {
    key: "feet",
    label: "足",
    hint: "独立客单。不开不挡主货，开了就能单独被点。",
    depths: [
      { key: "look", label: "只许看" },
      { key: "use", label: "趾缝分开 / 接触指定位置" },
      { key: "enter", label: "踩踏姿势 / 夹" },
      { key: "dirty", label: "鞋的规则听客人" },
    ],
    namesFree: ["脚", "足"],
    namesPaid: ["自己送上来的", "要分开给看的趾"],
  },
] as const;

/** 常用玩法标签：挂在每一处主货下，默认关 */
export const PLAY_TAGS = [
  { key: "watch_only", label: "只准看" },
  { key: "self_open", label: "自己扒开" },
  { key: "count", label: "报数" },
  { key: "silent", label: "不许出声" },
  { key: "must_sound", label: "必须出声" },
  { key: "resist_then", label: "先拒后软" },
  { key: "cold_face", label: "表面冷淡" },
  { key: "marks", label: "留印" },
  { key: "edge", label: "边缘" },
  { key: "objectify", label: "物化称呼" },
  { key: "kneel", label: "跪着完成" },
  { key: "show_after", label: "用后展示" },
] as const;

/**
 * 特殊癖好：整店级，二次确认才开。
 * 跨物种 = 非人/魔物/兽人等幻想形态，不是真实动物。
 */
export const SPECIAL_KINKS = [
  {
    key: "multi",
    label: "多人",
    hint: "同一房里被多于一人使用、排队、被看着被用。纯文字幻想。",
  },
  {
    key: "nonhuman",
    label: "跨物种·非人",
    hint: "魔物、兽人、触手、非人形态等幻想。不是真实动物。",
  },
  {
    key: "tentacle",
    label: "触手",
    hint: "被缠、被填、被固定。可与非人叠加。",
  },
  {
    key: "public_play",
    label: "半公开",
    hint: "有人可能看见、柜上知道你在被用。仍在店内文字。",
  },
  {
    key: "harsh_object",
    label: "重物化",
    hint: "更短的指令、更少的人话、当器具用。",
  },
] as const;

export type PartKey = (typeof PARTS)[number]["key"];

export type DepthChoice = "deny" | "allow" | "markup";

export type PartState = {
  enabled: boolean;
  photos: string[];
  depths: Record<string, DepthChoice>;
  namesFree: string[];
  namesPaid: string[];
  playTags: string[];
  scoreLook: number;
  scoreUse: number;
  scoreFilth: number;
};

export type SpecialState = Record<string, boolean>;

export function emptyPart(): PartState {
  return {
    enabled: false,
    photos: ["", ""],
    depths: { look: "deny", use: "deny", enter: "deny", dirty: "deny" },
    namesFree: [],
    namesPaid: [],
    playTags: [],
    scoreLook: 0,
    scoreUse: 0,
    scoreFilth: 0,
  };
}

export function emptySpecial(): SpecialState {
  const s: SpecialState = {};
  for (const k of SPECIAL_KINKS) s[k.key] = false;
  return s;
}

export function scorePart(part: PartState): PartState {
  const photos = part.photos.filter((p) => p.trim()).length;
  const allow = Object.values(part.depths).filter((v) => v === "allow").length;
  const markup = Object.values(part.depths).filter((v) => v === "markup").length;
  const names = part.namesFree.length + part.namesPaid.length;
  const tags = part.playTags?.length || 0;
  if (!part.enabled) {
    return { ...part, scoreLook: 0, scoreUse: 0, scoreFilth: 0 };
  }
  return {
    ...part,
    scoreLook: Math.min(10, 4 + photos * 2 + (part.enabled ? 1 : 0)),
    scoreUse: Math.min(10, 3 + allow * 2 + markup),
    scoreFilth: Math.min(10, 3 + names + markup + tags + (allow > 1 ? 1 : 0)),
  };
}

export function parseMenu(raw?: string | null) {
  try {
    const data = JSON.parse(raw || "{}") as Record<string, any>;
    return data;
  } catch {
    return {};
  }
}

export function getSpecial(menu: Record<string, any>): SpecialState {
  const base = emptySpecial();
  const raw = menu._special || {};
  for (const k of Object.keys(base)) {
    base[k] = !!raw[k];
  }
  return base;
}

export function openParts(menu: Record<string, PartState>) {
  return PARTS.filter((p) => menu[p.key]?.enabled);
}

export function playTagLabel(key: string) {
  return PLAY_TAGS.find((t) => t.key === key)?.label || key;
}

export function specialLabel(key: string) {
  return SPECIAL_KINKS.find((t) => t.key === key)?.label || key;
}

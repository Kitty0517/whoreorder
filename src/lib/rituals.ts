/** 玩法进房即规程：提示词、软校验、反应按钮 */

export type Ritual = {
  placeholder: string;
  hint: string;
  reactions?: string[];
  /** 若匹配则软警告（仍可提交） */
  softWarn?: RegExp;
  softWarnText?: string;
  /** 开场建议必须沾边的词（软） */
  openingNeed?: RegExp;
  openingNeedText?: string;
};

export const PLAY_RITUALS: Record<string, Ritual> = {
  watch_only: {
    placeholder: "只写被看：姿态、被盯着的地方、不准动。不要写进入。",
    hint: "这一单核心是看。少写动作，多写被注视。",
    softWarn: /进|插|含进去|射/,
    softWarnText: "玩法是只准看。写深了会出戏。",
  },
  self_open: {
    placeholder: "写你自己用手分开、送到他眼前。",
    hint: "要有自己动手的动作。",
    openingNeed: /自己|扒|分开|用手/,
    openingNeedText: "自己扒开：开场里最好出现你自己动手。",
  },
  count: {
    placeholder: "带数字：第几次、数到几、还剩几下。",
    hint: "报数。没有数字就不算完成这条玩法。",
    openingNeed: /\d|一|二|三|四|五|六|七|八|九|十|次/,
    openingNeedText: "报数：这段里要有数字或次数。",
    reactions: ["一……", "二……", "数不清了……"],
  },
  silent: {
    placeholder: "尽量少拟声。用动作和身体反应，少写叫。",
    hint: "不许出声。少写啊嗯之类。",
    softWarn: /啊+|嗯+|呀+|叫出/,
    softWarnText: "玩法不许出声。叫声写多了会破。",
  },
  must_sound: {
    placeholder: "必须有声音：喘、叫、求、承认。",
    hint: "必须出声。",
    openingNeed: /啊|嗯|叫|喘|求|说/,
    openingNeedText: "必须出声：写一点声音出来。",
  },
  resist_then: {
    placeholder: "先写不愿意或推拒，再写软下去。",
    hint: "先拒后软。开场先顶一下，再塌。",
    openingNeed: /不|别|不要|求你|推/,
    openingNeedText: "先拒后软：开场里先有拒的意思。",
  },
  cold_face: {
    placeholder: "脸冷、话少，身体却在配合。",
    hint: "表面冷淡。少写热情，多写被迫的顺。",
  },
  marks: {
    placeholder: "留下印：咬、掐、红、肿的痕迹。",
    hint: "要有痕迹。",
    openingNeed: /印|痕|咬|掐|红/,
    openingNeedText: "留印：写到痕迹。",
  },
  edge: {
    placeholder: "靠近、停下、请示、不准到。",
    hint: "边缘。写被按在边上。",
    reactions: ["还不能……", "请示……", "停……"],
  },
  objectify: {
    placeholder: "短句。少人话。当器具在被用。",
    hint: "物化。别写大段心理。",
    softWarn: /我爱|喜欢你|我们/,
    softWarnText: "物化单少写恋爱话。",
  },
  kneel: {
    placeholder: "跪着：膝、地、高度、跪不住。",
    hint: "跪着完成。",
    openingNeed: /跪/,
    openingNeedText: "跪着：文里要出现跪。",
    reactions: ["跪好了……", "膝……"],
  },
  show_after: {
    placeholder: "用完展示：打开、给看、报状态。",
    hint: "收场要展示。",
  },
  rimming: {
    placeholder: "写口与后庭：靠近、气味、舔、反应。重口如实写。",
    hint: "舔后庭。少绕弯。",
    openingNeed: /舔|后|眼|肛|缝/,
    openingNeedText: "舔后庭：开场沾到口与后庭。",
  },
  footjob: {
    placeholder: "用脚侍奉：趾、心、夹、节奏。",
    hint: "足交·你在用脚。",
    openingNeed: /脚|足|趾/,
    openingNeedText: "足交：写出脚在做什么。",
  },
  used_by_feet: {
    placeholder: "被脚使用：踩、蹭、踩在脸上或身上。你是被踩的那方。",
    hint: "被脚使用。",
    openingNeed: /踩|脚|踏/,
    openingNeedText: "被脚用：写出被踩/被蹭。",
  },
  ass_mouth: {
    placeholder: "嘴与后庭的关系：清理感、侍奉、服从。",
    hint: "嘴侍后庭相关。",
  },
  filth_service: {
    placeholder: "重口侍奉：更脏、更短句、少解释。",
    hint: "重口总项。按她已开的处写。",
  },
};

export const SPECIAL_RITUALS: Record<string, Ritual> = {
  multi: {
    placeholder: "写被多于一人盯着或轮流；谁在看、谁在用。",
    hint: "多人幻想。点出不止一双眼睛或手。",
  },
  nonhuman: {
    placeholder: "非人：形态、触感、不是人的节奏。纯幻想。",
    hint: "跨物种·非人幻想。",
  },
  tentacle: {
    placeholder: "缠、固定、填满、抽不走。",
    hint: "触手。",
  },
  public_play: {
    placeholder: "有人可能看见；柜上知道你在被用。",
    hint: "半公开。",
  },
  harsh_object: {
    placeholder: "更短。更少解释。只写被怎么使。",
    hint: "重物化。",
  },
  play_dog: {
    placeholder: "狗：跪爬、项圈感、短指令、报。不许长篇人话。",
    hint: "拟狗。人设，不是真狗。",
    openingNeed: /跪|爬|项|主人|汪|四/,
    openingNeedText: "狗档：沾一点跪爬或畜类自居。",
    reactions: ["……", "爬好了", "报……"],
  },
  play_pony: {
    placeholder: "马：步伐、辔、展示、负重感。短句。",
    hint: "拟马。人设，不是真马。",
    reactions: ["一步……", "停。"],
  },
  play_pig: {
    placeholder: "猪：更脏的畜类词、饲养感、趴。",
    hint: "拟猪。人设，不是真猪。",
  },
  play_livestock: {
    placeholder: "牲口：被赶、被看货、被使用。少人话。",
    hint: "牲口总项。",
  },
};

export function ritualsFor(playTags: string[], specialTags: string[]) {
  const list: Ritual[] = [];
  for (const t of playTags || []) if (PLAY_RITUALS[t]) list.push(PLAY_RITUALS[t]);
  for (const t of specialTags || []) if (SPECIAL_RITUALS[t]) list.push(SPECIAL_RITUALS[t]);
  return list;
}

export function buildPlaceholder(playTags: string[], specialTags: string[], segment: string) {
  const rites = ritualsFor(playTags, specialTags);
  if (!rites.length) {
    if (segment === "opening") return "门开的那一瞬。第一人称。";
    if (segment === "during") return "正在被用。按已开的档写。";
    return "他还没走。收场。";
  }
  return rites.map((r) => r.placeholder).join(" / ");
}

export function buildHint(playTags: string[], specialTags: string[]) {
  return ritualsFor(playTags, specialTags)
    .map((r) => r.hint)
    .filter(Boolean)
    .join(" · ");
}

export function ritualReactions(playTags: string[], specialTags: string[]) {
  const set = new Set<string>();
  for (const r of ritualsFor(playTags, specialTags)) {
    (r.reactions || []).forEach((x) => set.add(x));
  }
  return Array.from(set);
}

export function softCheck(text: string, playTags: string[], specialTags: string[], segment: string) {
  const warns: string[] = [];
  const rites = ritualsFor(playTags, specialTags);
  for (const r of rites) {
    if (r.softWarn && r.softWarn.test(text) && r.softWarnText) warns.push(r.softWarnText);
    if (segment === "opening" && r.openingNeed && text.trim() && !r.openingNeed.test(text) && r.openingNeedText) {
      warns.push(r.openingNeedText);
    }
  }
  return warns;
}

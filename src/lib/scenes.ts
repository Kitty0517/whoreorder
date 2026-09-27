/** 场景芯片：点选，不靠自由填空 */
export const SCENES = [
  { key: "hotel_window", label: "酒店落地窗", heat: true },
  { key: "bathroom", label: "浴室雾气", heat: true },
  { key: "car_back", label: "车后座", heat: true },
  { key: "hallway", label: "楼道拐角", heat: true },
  { key: "door_unlocked", label: "门没锁的房间", heat: true },
  { key: "mirror", label: "镜面房", heat: true },
  { key: "her_room", label: "她自己的房间", heat: false },
  { key: "client_bath", label: "客人家浴室", heat: false },
  { key: "elevator", label: "电梯将到（幻想）", heat: true },
  { key: "parking", label: "停车场（文字）", heat: true },
  { key: "counter_knows", label: "柜上知道你在被用", heat: true },
  { key: "nonhuman_nest", label: "非人巢穴（幻想）", heat: true },
] as const;

export function sceneLabel(keyOrLabel: string) {
  const hit = SCENES.find((s) => s.key === keyOrLabel || s.label === keyOrLabel);
  return hit?.label || keyOrLabel;
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { playTagLabel, specialLabel } from "@/lib/bodyMenu";
import { calculateQuote, DEFAULT_PRICING, type PricingConfig } from "@/lib/pricing";

export function OrderForm({ girlId }: { girlId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState<any[]>([]);
  const [specialOpen, setSpecialOpen] = useState<any[]>([]);
  const [pricing, setPricing] = useState<PricingConfig>(DEFAULT_PRICING);
  const [part, setPart] = useState("");
  const [depth, setDepth] = useState("");
  const [partName, setPartName] = useState("");
  const [playTags, setPlayTags] = useState<string[]>([]);
  const [specialTags, setSpecialTags] = useState<string[]>([]);
  const [multiSeats, setMultiSeats] = useState(1);
  const [packageType, setPackageType] = useState<"none" | "light" | "std" | "full">("none");
  const [detail, setDetail] = useState("");
  const [scene, setScene] = useState("雨夜酒店");
  const [minutes, setMinutes] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/girls/body-public?girlId=" + girlId)
      .then((r) => r.json())
      .then((d) => {
        const list = d.open || [];
        setOpen(list);
        setSpecialOpen(d.specialOpen || []);
        if (d.pricing) setPricing(d.pricing);
        if (list[0]) setPart(list[0].key);
      });
  }, [girlId]);

  const current = open.find((p) => p.key === part);
  const depthOptions = (current?.catalog?.depths || []).filter((d: any) => {
    const ch = current?.depths?.[d.key];
    return ch === "allow" || ch === "markup";
  });
  const names = [...(current?.namesFree || []), ...(current?.namesPaid || [])];
  const availableTags = current?.playTags || [];
  const multiAllowed = specialOpen.some((k) => k.key === "multi");

  const quote = useMemo(() => {
    if (!part || (!depth && packageType === "none")) return null;
    return calculateQuote(pricing, {
      part: part || "pussy",
      depth: depth || "use",
      minutes,
      playTags,
      specialTags,
      multiSeats: multiAllowed ? multiSeats : 1,
      packageType,
    });
  }, [pricing, part, depth, minutes, playTags, specialTags, multiSeats, packageType, multiAllowed]);

  function togglePlay(tag: string) {
    setPlayTags((prev) => {
      if (prev.includes(tag)) return prev.filter((t) => t !== tag);
      if (prev.length >= 3) return prev;
      return [...prev, tag];
    });
  }

  function toggleSpecial(tag: string) {
    setSpecialTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!part) {
      setError("她今晚还没把货摆出来。");
      return;
    }
    if (packageType === "none" && !depth) {
      setError("先选做到哪一层。");
      return;
    }
    if (!detail.trim() || detail.length < 10) {
      setError("进房第一句指令，写具体。");
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch("/api/orders/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        girlId,
        fantasyType: "进房",
        tone: "submissive",
        fantasyDetail: detail,
        scene,
        part,
        depth: depth || "use",
        partName,
        playTags,
        specialTags,
        minutes,
        multiSeats: multiAllowed ? multiSeats : 1,
        packageType,
        bodyAnchor: current?.label || part,
        contract: current?.depths?.[depth] === "markup" ? "markup" : "obey",
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "没点上");
      setLoading(false);
      return;
    }
    router.push("/my-orders");
  }

  if (!open.length) {
    return <p className="text-sm text-[#8b8793]">她还没摆货。今晚不卖具体部位。</p>;
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {pricing.overnightEnabled !== "off" && (
        <div>
          <label className="block text-xs text-[#8b8793] mb-1.5">包夜</label>
          <select
            value={packageType}
            onChange={(e) => setPackageType(e.target.value as any)}
            className="w-full bg-[#0a0a0c] border border-[#1c1c22] rounded-md px-3 py-2.5 text-sm"
          >
            <option value="none">不包夜 · 按钟点</option>
            {(pricing.overnightEnabled === "light" || pricing.overnightEnabled === "std" || pricing.overnightEnabled === "full") && (
              <option value="light">轻包夜 · {pricing.overnightLight} 币</option>
            )}
            {(pricing.overnightEnabled === "std" || pricing.overnightEnabled === "full") && (
              <option value="std">标准包夜 · {pricing.overnightStd} 币</option>
            )}
            {pricing.overnightEnabled === "full" && (
              <option value="full">无下限包夜 · {pricing.overnightFull} 币</option>
            )}
          </select>
        </div>
      )}

      <div>
        <label className="block text-xs text-[#8b8793] mb-1.5">先买哪一处</label>
        <select
          value={part}
          onChange={(e) => {
            setPart(e.target.value);
            setDepth("");
            setPartName("");
            setPlayTags([]);
          }}
          className="w-full bg-[#0a0a0c] border border-[#1c1c22] rounded-md px-3 py-2.5 text-sm"
        >
          {open.map((p) => (
            <option key={p.key} value={p.key}>
              {p.label}
              {p.prices ? ` · 口/手 ${p.prices.use} 起` : ""}
            </option>
          ))}
        </select>
      </div>

      {packageType === "none" && (
        <div>
          <label className="block text-xs text-[#8b8793] mb-1.5">做到哪一层</label>
          <select
            value={depth}
            onChange={(e) => setDepth(e.target.value)}
            className="w-full bg-[#0a0a0c] border border-[#1c1c22] rounded-md px-3 py-2.5 text-sm"
          >
            <option value="">选一层</option>
            {depthOptions.map((d: any) => (
              <option key={d.key} value={d.key}>
                {d.label}
                {current?.prices?.[d.key] ? ` · ${current.prices[d.key]} 币` : ""}
                {current?.depths?.[d.key] === "markup" ? "（加码）" : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      {names.length > 0 && (
        <div>
          <label className="block text-xs text-[#8b8793] mb-1.5">你怎么叫这里</label>
          <select
            value={partName}
            onChange={(e) => setPartName(e.target.value)}
            className="w-full bg-[#0a0a0c] border border-[#1c1c22] rounded-md px-3 py-2.5 text-sm"
          >
            <option value="">用本字</option>
            {names.map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </div>
      )}

      {availableTags.length > 0 && (
        <div>
          <label className="block text-xs text-[#8b8793] mb-1.5">玩法（最多 3 个）</label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag: string) => (
              <button
                key={tag}
                type="button"
                onClick={() => togglePlay(tag)}
                className={`text-xs px-2 py-1 rounded border ${
                  playTags.includes(tag) ? "border-[#c9a87c] text-[#c9a87c]" : "border-[#2a2a32] text-[#5a5860]"
                }`}
              >
                {playTagLabel(tag)}
              </button>
            ))}
          </div>
        </div>
      )}

      {specialOpen.length > 0 && (
        <div>
          <label className="block text-xs text-[#8b8793] mb-1.5">特殊癖好</label>
          <div className="flex flex-wrap gap-2">
            {specialOpen.map((k) => (
              <button
                key={k.key}
                type="button"
                onClick={() => toggleSpecial(k.key)}
                className={`text-xs px-2 py-1 rounded border ${
                  specialTags.includes(k.key) ? "border-[#c9a87c] text-[#c9a87c]" : "border-[#2a2a32] text-[#5a5860]"
                }`}
              >
                {k.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {multiAllowed && (
        <div>
          <label className="block text-xs text-[#8b8793] mb-1.5">多人位数（含你）</label>
          <select
            value={multiSeats}
            onChange={(e) => setMultiSeats(Number(e.target.value))}
            className="w-full bg-[#0a0a0c] border border-[#1c1c22] rounded-md px-3 py-2.5 text-sm"
          >
            <option value={1}>就你一个</option>
            <option value={2}>双人 · +{pricing.multiPerSeat}</option>
            <option value={3}>三人 · +{pricing.multiPerSeat * 2}</option>
          </select>
        </div>
      )}

      {packageType === "none" && (
        <div>
          <label className="block text-xs text-[#8b8793] mb-1.5">这钟多久</label>
          <select
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
            className="w-full bg-[#0a0a0c] border border-[#1c1c22] rounded-md px-3 py-2.5 text-sm"
          >
            <option value={20}>20 分钟</option>
            <option value={40}>40 分钟</option>
            <option value={60}>60 分钟</option>
          </select>
        </div>
      )}

      <div>
        <label className="block text-xs text-[#8b8793] mb-1.5">放在哪</label>
        <select
          value={scene}
          onChange={(e) => setScene(e.target.value)}
          className="w-full bg-[#0a0a0c] border border-[#1c1c22] rounded-md px-3 py-2.5 text-sm"
        >
          <option>雨夜酒店</option>
          <option>车后座</option>
          <option>客人家里的浴室</option>
          <option>楼道</option>
          <option>她自己的房间</option>
          <option>非人巢穴（幻想）</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-[#8b8793] mb-1.5">进房第一句</label>
        <textarea
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          rows={4}
          placeholder="在她允许的范围内，一句具体指令。"
          className="w-full bg-[#0a0a0c] border border-[#1c1c22] rounded-md px-3 py-2.5 text-sm"
        />
      </div>

      {quote && (
        <div className="border border-[#c9a87c]/30 rounded-md px-4 py-3 space-y-1">
          <p className="text-sm text-[#c9a87c]">本单 {quote.total} 币</p>
          {quote.breakdown.map((b, i) => (
            <p key={i} className="text-[11px] text-[#8b8793]">
              {b.label} · {b.amount}
            </p>
          ))}
        </div>
      )}

      {error && <p className="text-[#a85c5c] text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-[#c9a87c] text-[#070708] font-medium rounded-md disabled:opacity-50"
      >
        {loading ? "在点…" : quote ? `支付 ${quote.total} 币 · 叫她进房` : "叫她进房"}
      </button>
    </form>
  );
}

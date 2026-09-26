"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function OrderForm({ girlId }: { girlId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState<any[]>([]);
  const [part, setPart] = useState("");
  const [depth, setDepth] = useState("");
  const [partName, setPartName] = useState("");
  const [fantasyType, setFantasyType] = useState("情景代入");
  const [tone, setTone] = useState("submissive");
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
        if (list[0]) setPart(list[0].key);
      });
  }, [girlId]);

  const current = open.find((p) => p.key === part);
  const depthOptions = (current?.catalog?.depths || []).filter((d: any) => {
    const ch = current?.depths?.[d.key];
    return ch === "allow" || ch === "markup";
  });
  const names = [...(current?.namesFree || []), ...(current?.namesPaid || [])];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!part) {
      setError("她今晚还没把货摆出来。");
      return;
    }
    if (!depth) {
      setError("先选做到哪一层。");
      return;
    }
    if (!detail.trim() || detail.length < 20) {
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
        fantasyType,
        tone,
        fantasyDetail: detail,
        scene,
        part,
        depth,
        partName,
        minutes,
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
      <div>
        <label className="block text-xs text-[#8b8793] mb-1.5">先买哪一处</label>
        <select value={part} onChange={(e) => { setPart(e.target.value); setDepth(""); setPartName(""); }}
          className="w-full bg-[#0a0a0c] border border-[#1c1c22] rounded-md px-3 py-2.5 text-sm">
          {open.map((p) => (
            <option key={p.key} value={p.key}>{p.label} · 耐看{p.scoreLook} 好用{p.scoreUse}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs text-[#8b8793] mb-1.5">做到哪一层</label>
        <select value={depth} onChange={(e) => setDepth(e.target.value)}
          className="w-full bg-[#0a0a0c] border border-[#1c1c22] rounded-md px-3 py-2.5 text-sm">
          <option value="">选一层</option>
          {depthOptions.map((d: any) => (
            <option key={d.key} value={d.key}>
              {d.label}{current?.depths?.[d.key] === "markup" ? "（加码）" : ""}
            </option>
          ))}
        </select>
      </div>
      {names.length > 0 && (
        <div>
          <label className="block text-xs text-[#8b8793] mb-1.5">你怎么叫这里</label>
          <select value={partName} onChange={(e) => setPartName(e.target.value)}
            className="w-full bg-[#0a0a0c] border border-[#1c1c22] rounded-md px-3 py-2.5 text-sm">
            <option value="">用本字</option>
            {names.map((n) => <option key={n}>{n}</option>)}
          </select>
        </div>
      )}
      <div>
        <label className="block text-xs text-[#8b8793] mb-1.5">这钟多久</label>
        <select value={minutes} onChange={(e) => setMinutes(Number(e.target.value))}
          className="w-full bg-[#0a0a0c] border border-[#1c1c22] rounded-md px-3 py-2.5 text-sm">
          <option value={20}>20 分钟</option>
          <option value={40}>40 分钟（+50币）</option>
          <option value={60}>60 分钟（+100币）</option>
        </select>
      </div>
      <div>
        <label className="block text-xs text-[#8b8793] mb-1.5">放在哪</label>
        <select value={scene} onChange={(e) => setScene(e.target.value)}
          className="w-full bg-[#0a0a0c] border border-[#1c1c22] rounded-md px-3 py-2.5 text-sm">
          <option>雨夜酒店</option>
          <option>车后座</option>
          <option>客人家里的浴室</option>
          <option>楼道</option>
          <option>她自己的房间</option>
        </select>
      </div>
      <div>
        <label className="block text-xs text-[#8b8793] mb-1.5">过程（写在她允许的范围内）</label>
        <textarea value={detail} onChange={(e) => setDetail(e.target.value)} rows={5}
          placeholder="先写你怎么用这一处。不要越她勾掉的档。"
          className="w-full bg-[#0a0a0c] border border-[#1c1c22] rounded-md px-3 py-2.5 text-sm" />
      </div>
      <input type="hidden" value={fantasyType} />
      <input type="hidden" value={tone} />
      {error && <p className="text-[#a85c5c] text-sm">{error}</p>}
      <button type="submit" disabled={loading} className="w-full py-3 bg-[#c9a87c] text-[#070708] font-medium rounded-md disabled:opacity-50">
        {loading ? "在点…" : "叫她进房"}
      </button>
    </form>
  );
}

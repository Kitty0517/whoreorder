"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function MarkupForm({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [extraPay, setExtraPay] = useState(50);
  const [extraDemand, setExtraDemand] = useState("");
  const [msg, setMsg] = useState("");
  async function send() {
    const res = await fetch("/api/orders/markup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, extraPay, extraDemand }),
    });
    const d = await res.json();
    setMsg(res.ok ? "加码已经递过去，等她接。" : d.error);
    router.refresh();
  }
  return (
    <div className="space-y-3">
      <p className="text-xs text-[#c9a87c]">加码。写清楚多给这些币，她要多听话什么。</p>
      <input type="number" value={extraPay} onChange={e=>setExtraPay(Number(e.target.value))} className="w-full bg-[#0a0a0c] border border-[#1c1c22] rounded px-3 py-2 text-sm" />
      <textarea value={extraDemand} onChange={e=>setExtraDemand(e.target.value)} rows={3} className="w-full bg-[#0a0a0c] border border-[#1c1c22] rounded px-3 py-2 text-sm" placeholder="加这点币，你要跪着把那句再说一遍。" />
      <button onClick={send} className="w-full py-2 bg-[#c9a87c] text-black rounded text-sm">递加码</button>
      {msg && <p className="text-xs text-[#8b8793]">{msg}</p>}
    </div>
  );
}

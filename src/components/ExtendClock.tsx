"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function ExtendClock({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function extend(minutes: number) {
    setLoading(true);
    setMsg("");
    const res = await fetch("/api/orders/extend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, minutes }),
    });
    const data = await res.json();
    setMsg(res.ok ? `续了 ${minutes} 分钟。` : data.error || "续不上");
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="border border-[#3a2222] rounded-xl p-4 space-y-2">
      <p className="text-xs text-[#c9a87c]">续钟。不续，她钟到只能送客。</p>
      <div className="flex gap-2">
        <button type="button" disabled={loading} onClick={() => extend(10)} className="text-xs px-3 py-1.5 border border-[#c9a87c]/40 text-[#c9a87c] rounded">+10 分 · 30币</button>
        <button type="button" disabled={loading} onClick={() => extend(20)} className="text-xs px-3 py-1.5 border border-[#c9a87c]/40 text-[#c9a87c] rounded">+20 分 · 50币</button>
        <button type="button" disabled={loading} onClick={() => extend(40)} className="text-xs px-3 py-1.5 border border-[#c9a87c]/40 text-[#c9a87c] rounded">+40 分 · 100币</button>
      </div>
      {msg && <p className="text-xs text-[#8b8793]">{msg}</p>}
    </div>
  );
}

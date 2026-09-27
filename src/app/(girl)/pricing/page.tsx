"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PARTS, parseMenu } from "@/lib/bodyMenu";
import { DEFAULT_PRICING, type PricingConfig, partDepthPrice, floorFromPrice } from "@/lib/pricing";

export default function PricingPage() {
  const router = useRouter();
  const [pricing, setPricing] = useState<PricingConfig>(DEFAULT_PRICING);
  const [menu, setMenu] = useState<Record<string, any>>({});
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/girls/body")
      .then((r) => r.json())
      .then((d) => {
        const m = d.menu || {};
        setMenu(m);
        setPricing(m._pricing || DEFAULT_PRICING);
      });
  }, []);

  async function save() {
    setLoading(true);
    setMsg("");
    const res = await fetch("/api/girls/body", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        menu: { ...menu, _pricing: pricing, _special: menu._special },
      }),
    });
    // 同步资料上的展示价 = 基数
    await fetch("/api/girls/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price: pricing.base }),
    });
    setLoading(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setMsg(d.error || "没存上");
      return;
    }
    setMsg("价目已挂上柜。");
    router.refresh();
  }

  const from = floorFromPrice(pricing, menu);

  return (
    <div className="min-h-screen">
      <header className="border-b border-[#1c1c22] px-6 py-4 flex justify-between">
        <Link href="/dashboard" className="text-xs text-[#8b8793]">
          ← 回柜上
        </Link>
        <Link href="/body" className="text-xs text-[#8b8793]">
          摆货
        </Link>
      </header>
      <main className="max-w-md mx-auto px-6 py-10 space-y-6">
        <div>
          <h1 className="text-xl text-[#c9a87c]">标价</h1>
          <p className="text-xs text-[#8b8793] mt-2 leading-relaxed">
            只调基数和包夜、多人。各处各档自动算。楼面显示「{from} 币起」。
          </p>
        </div>

        <section className="bg-[#111114] border border-[#1c1c22] rounded-xl p-5 space-y-4">
          <div>
            <label className="text-xs text-[#8b8793]">基数 B</label>
            <input
              type="number"
              value={pricing.base}
              onChange={(e) => setPricing({ ...pricing, base: Number(e.target.value) || 200 })}
              className="w-full mt-1 bg-[#0a0a0c] border border-[#1c1c22] rounded px-3 py-2.5 text-sm"
            />
          </div>
          <div className="text-xs text-[#8b8793] space-y-1.5 border border-[#1c1c22] rounded-md p-3">
            {PARTS.map((p) => (
              <p key={p.key}>
                <span className="text-[#c9a87c]">{p.label}</span>
                {" "}看 {partDepthPrice(pricing.base, p.key, "look")} · 口/手{" "}
                {partDepthPrice(pricing.base, p.key, "use")} · 进{" "}
                {partDepthPrice(pricing.base, p.key, "enter")} · 脏{" "}
                {partDepthPrice(pricing.base, p.key, "dirty")}
              </p>
            ))}
          </div>
          <div>
            <label className="text-xs text-[#8b8793]">包夜</label>
            <select
              value={pricing.overnightEnabled}
              onChange={(e) => setPricing({ ...pricing, overnightEnabled: e.target.value as any })}
              className="w-full mt-1 bg-[#0a0a0c] border border-[#1c1c22] rounded px-3 py-2.5 text-sm"
            >
              <option value="off">不包夜</option>
              <option value="light">轻包夜</option>
              <option value="std">标准包夜</option>
              <option value="full">无下限包夜</option>
            </select>
          </div>
          {pricing.overnightEnabled !== "off" && (
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  ["overnightLight", "轻", pricing.overnightLight],
                  ["overnightStd", "标准", pricing.overnightStd],
                  ["overnightFull", "无下限", pricing.overnightFull],
                ] as const
              ).map(([key, label, val]) => (
                <div key={key}>
                  <label className="text-[10px] text-[#5a5860]">{label}</label>
                  <input
                    type="number"
                    value={val}
                    onChange={(e) => setPricing({ ...pricing, [key]: Number(e.target.value) || 0 })}
                    className="w-full bg-[#0a0a0c] border border-[#1c1c22] rounded px-2 py-1.5 text-sm"
                  />
                </div>
              ))}
            </div>
          )}
          <div>
            <label className="text-xs text-[#8b8793]">多人每位加价</label>
            <input
              type="number"
              value={pricing.multiPerSeat}
              onChange={(e) => setPricing({ ...pricing, multiPerSeat: Number(e.target.value) || 0 })}
              className="w-full mt-1 bg-[#0a0a0c] border border-[#1c1c22] rounded px-3 py-2.5 text-sm"
            />
            <p className="text-[11px] text-[#5a5860] mt-1">需在摆货里打开「多人」客人才选得到。</p>
          </div>
        </section>

        {msg && <p className="text-xs text-[#c9a87c]">{msg}</p>}
        <button
          type="button"
          disabled={loading}
          onClick={save}
          className="w-full py-3 bg-[#c9a87c] text-[#070708] rounded-md disabled:opacity-50"
        >
          {loading ? "挂上…" : "挂上柜"}
        </button>
      </main>
    </div>
  );
}

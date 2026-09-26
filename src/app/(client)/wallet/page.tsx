"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function WalletPage() {
  const [coins, setCoins] = useState(0);
  const [txns, setTxns] = useState<any[]>([]);
  async function load() {
    const r = await fetch("/api/wallet");
    const d = await r.json();
    setCoins(d.coins || 0);
    setTxns(d.txns || []);
  }
  useEffect(() => { load(); }, []);
  async function topup() {
    await fetch("/api/wallet", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount: 500 }) });
    load();
  }
  return (
    <div className="min-h-screen">
      <header className="border-b border-[#1c1c22] px-6 py-4">
        <Link href="/browse" className="text-xs text-[#8b8793]">← 回去点人</Link>
      </header>
      <main className="max-w-md mx-auto px-6 py-10 space-y-6">
        <h1 className="text-[#c9a87c] text-xl">钱包</h1>
        <p className="text-3xl">{coins} <span className="text-sm text-[#8b8793]">站内币</span></p>
        <p className="text-xs text-[#5a5860]">这是站内模拟币，不是真钱收款。用来点人和加码。</p>
        <button onClick={topup} className="w-full py-3 bg-[#c9a87c] text-black rounded">充 500 币（模拟）</button>
        <div className="space-y-2">
          {txns.map((t) => (
            <p key={t.id} className="text-xs text-[#8b8793]">{t.reason} · {t.amount > 0 ? "+" : ""}{t.amount}</p>
          ))}
        </div>
      </main>
    </div>
  );
}

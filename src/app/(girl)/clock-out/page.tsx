"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ClockOutPage() {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("/api/girls/profile").then(r => r.json()).then(setStats);
  }, []);

  async function submit() {
    await fetch("/api/girls/tonight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tonightPersona: stats?.tonightPersona || "",
        tonightBody: stats?.tonightBody || "",
        tonightAllowed: stats?.tonightAllowed || "",
        tonightOpening: stats?.tonightOpening || "",
        tonightContract: stats?.tonightContract || "obey",
        status: "off",
      }),
    });
    await fetch("/api/girls/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clockOutNote: note }),
    });
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-[#1c1c22] px-6 py-4">
        <Link href="/dashboard" className="text-xs text-[#8b8793]">← 回面板</Link>
      </header>
      <main className="max-w-md mx-auto px-6 py-10 space-y-6">
        <h1 className="text-xl text-[#c9a87c]">下钟</h1>
        <p className="text-sm text-[#8b8793]">今天接了 {stats?.totalOrders || 0} 次。看完再走。</p>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4}
          placeholder="写一句下钟的话。写完才算收工。"
          className="w-full bg-[#0a0a0c] border border-[#1c1c22] rounded-md px-3 py-2.5 text-sm" />
        <button onClick={submit} className="w-full py-3 bg-[#c9a87c] text-[#070708] rounded-md">收工</button>
      </main>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ClockOutPage() {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [stats, setStats] = useState<any>(null);
  const [shift, setShift] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/girls/profile").then((r) => r.json()).then(setStats);
    fetch("/api/girls/shift").then((r) => r.json()).then(setShift);
  }, []);

  async function submit() {
    if (!note.trim()) {
      alert("写一句再走。");
      return;
    }
    setLoading(true);
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

  const parts = shift?.partCount
    ? Object.entries(shift.partCount)
        .map(([k, v]) => `${k}${v}次`)
        .join("、")
    : "无";

  return (
    <div className="min-h-screen">
      <header className="border-b border-[#1c1c22] px-6 py-4">
        <Link href="/dashboard" className="text-xs text-[#8b8793]">
          ← 回柜上
        </Link>
      </header>
      <main className="max-w-md mx-auto px-6 py-10 space-y-6">
        <h1 className="text-xl text-[#c9a87c]">下钟 · 结账</h1>
        <div className="bg-[#0f0a0a] border border-[#3a2222] rounded-xl p-5 space-y-2 text-sm">
          <p className="text-[#e6e4e0]">今天送客 {shift?.todayCount ?? "…"} 次</p>
          <p className="text-[#8b8793]">卖过：{parts}</p>
          {shift?.deepest?.part ? (
            <p className="text-[#c9a87c]">
              开得最深：{shift.deepest.part} · {shift.deepest.depth}
            </p>
          ) : null}
          <p className="text-[#8b8793]">
            加档接了 {shift?.markupAccepted ?? 0} 次，拒了 {shift?.markupRejected ?? 0} 次
          </p>
          {shift?.stingReview ? (
            <div className="pt-2 border-t border-[#2a2a32]">
              <p className="text-xs text-[#5a5860]">最近一句评价</p>
              <p className="text-[#c9b8b8] mt-1">「{shift.stingReview}」</p>
              {shift.stingScores && (
                <p className="text-[11px] text-[#5a5860] mt-1">
                  乖{shift.stingScores.obedient} · 脏{shift.stingScores.filthy} · 听{shift.stingScores.listen}
                </p>
              )}
            </div>
          ) : null}
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          placeholder="看完上面再写一句。写完才算收工。"
          className="w-full bg-[#0a0a0c] border border-[#1c1c22] rounded-md px-3 py-2.5 text-sm"
        />
        <button
          onClick={submit}
          disabled={loading}
          className="w-full py-3 bg-[#c9a87c] text-[#070708] rounded-md disabled:opacity-50"
        >
          收工
        </button>
      </main>
    </div>
  );
}

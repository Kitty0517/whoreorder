"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ClockInPage() {
  const router = useRouter();
  const [persona, setPersona] = useState("");
  const [body, setBody] = useState("");
  const [allowed, setAllowed] = useState("");
  const [opening, setOpening] = useState("");
  const [contract, setContract] = useState("obey");
  const [goIdle, setGoIdle] = useState(true);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/girls/profile")
      .then((r) => r.json())
      .then((d) => {
        setPersona(d.tonightPersona || "");
        setBody(d.tonightBody || "");
        setAllowed(d.tonightAllowed || "");
        setOpening(d.tonightOpening || "");
        setContract(d.tonightContract || "obey");
      })
      .catch(() => {});
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!persona.trim() || !opening.trim()) {
      setMsg("至少写下今晚身份，和开门的那一句。");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/girls/tonight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tonightPersona: persona,
        tonightBody: body,
        tonightAllowed: allowed,
        tonightOpening: opening,
        tonightContract: contract,
        status: goIdle ? "idle" : undefined,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      setMsg("没写进去，再试一次。");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-[#1c1c22] px-6 py-4">
        <Link href="/dashboard" className="text-xs text-[#8b8793] hover:text-[#c9a87c]">
          ← 回接客面板
        </Link>
      </header>
      <main className="max-w-md mx-auto px-6 py-10">
        <h1 className="text-xl text-[#c9a87c] mb-2">上钟</h1>
        <p className="text-xs text-[#8b8793] mb-8 leading-relaxed">
          写下今晚的自己。客人点你之前会先看到这张牌。
        </p>
        <form onSubmit={save} className="space-y-5">
          <div>
            <label className="block text-xs text-[#8b8793] mb-1.5">今晚身份</label>
            <input
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
              placeholder="冷淡人妻 / 刚被罚过的新人 / 洗完澡的学妹"
              className="w-full bg-[#0a0a0c] border border-[#1c1c22] rounded-md px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-[#8b8793] mb-1.5">今晚身体</label>
            <input
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="头发还湿，腿有点软，嘴上还留着颜色"
              className="w-full bg-[#0a0a0c] border border-[#1c1c22] rounded-md px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-[#8b8793] mb-1.5">今晚可以被做什么</label>
            <input
              value={allowed}
              onChange={(e) => setAllowed(e.target.value)}
              placeholder="可被当面羞辱 / 可跪着等 / 可被加价加码"
              className="w-full bg-[#0a0a0c] border border-[#1c1c22] rounded-md px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-[#8b8793] mb-1.5">今晚契约</label>
            <select value={contract} onChange={(e) => setContract(e.target.value)} className="w-full bg-[#0a0a0c] border border-[#1c1c22] rounded-md px-3 py-2.5 text-sm">
              <option value="obey">完全听话</option>
              <option value="cold">表面冷淡、身体很贱</option>
              <option value="resist">先拒后软</option>
              <option value="switch">短暂主导再被按回去</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#8b8793] mb-1.5">开门的那一句</label>
            <textarea
              value={opening}
              onChange={(e) => setOpening(e.target.value)}
              rows={3}
              placeholder="妆已经化好了。现在开始等人。"
              className="w-full bg-[#0a0a0c] border border-[#1c1c22] rounded-md px-3 py-2.5 text-sm"
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-[#8b8793]">
            <input type="checkbox" checked={goIdle} onChange={(e) => setGoIdle(e.target.checked)} />
            写完直接变成「空闲可约」
          </label>
          {msg && <p className="text-xs text-[#a85c5c]">{msg}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#c9a87c] text-[#070708] font-medium rounded-md disabled:opacity-50"
          >
            {loading ? "正在上钟..." : "上钟"}
          </button>
        </form>
      </main>
    </div>
  );
}

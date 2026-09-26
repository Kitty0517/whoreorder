"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PARTS, emptyPart, type PartState, type DepthChoice } from "@/lib/bodyMenu";

export default function BodyArchivePage() {
  const router = useRouter();
  const [menu, setMenu] = useState<Record<string, PartState>>({});
  const [cur, setCur] = useState("mouth");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/girls/body")
      .then((r) => r.json())
      .then((d) => {
        const m = d.menu || {};
        for (const p of PARTS) if (!m[p.key]) m[p.key] = emptyPart();
        setMenu(m);
      });
  }, []);

  function patch(key: string, part: PartState) {
    setMenu((prev) => ({ ...prev, [key]: part }));
  }

  async function save(goClock = false) {
    setLoading(true);
    setMsg("");
    const res = await fetch("/api/girls/body", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ menu }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setMsg(data.error || "没存上");
      return;
    }
    if (data.menu) setMenu(data.menu);
    setMsg("货单已经摆好了。");
    if (goClock) router.push("/clock-in");
  }

  const meta = PARTS.find((p) => p.key === cur)!;
  const part = menu[cur] || emptyPart();

  function setDepth(k: string, v: DepthChoice) {
    patch(cur, { ...part, depths: { ...part.depths, [k]: v } });
  }

  function toggleName(list: "namesFree" | "namesPaid", name: string) {
    const arr = part[list].includes(name) ? part[list].filter((n) => n !== name) : [...part[list], name];
    patch(cur, { ...part, [list]: arr });
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-[#1c1c22] px-6 py-4 flex justify-between">
        <Link href="/dashboard" className="text-xs text-[#8b8793]">← 回面板</Link>
        <button onClick={() => save(true)} className="text-xs text-[#c9a87c]">存好去上钟</button>
      </header>

      <main className="max-w-xl mx-auto px-6 py-8 space-y-6">
        <div>
          <h1 className="text-xl text-[#c9a87c]">今晚卖哪几处</h1>
          <p className="text-xs text-[#8b8793] mt-2 leading-relaxed">
            先勾货。勾了才拍、才估、才起名。不勾就是不卖。要上钟：嘴 +（奶或逼）。
          </p>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {PARTS.map((p) => (
            <button
              key={p.key}
              onClick={() => setCur(p.key)}
              className={`py-2 text-sm rounded border ${
                cur === p.key
                  ? "border-[#c9a87c] text-[#c9a87c] bg-[#c9a87c]/10"
                  : menu[p.key]?.enabled
                  ? "border-[#3a2222] text-[#e6e4e0]"
                  : "border-[#1c1c22] text-[#5a5860]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <section className="bg-[#0f0a0a] border border-[#3a2222] rounded-xl p-5 space-y-5">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={part.enabled}
              onChange={(e) => patch(cur, { ...part, enabled: e.target.checked })}
            />
            今晚卖{meta.label}
          </label>
          <p className="text-xs text-[#8a6a6a]">{meta.hint}</p>

          {part.enabled && (
            <>
              <div className="space-y-2">
                <p className="text-xs text-[#c9a87c]">照片链接（自己图床，可先空着）</p>
                {[0, 1].map((i) => (
                  <input
                    key={i}
                    value={part.photos[i] || ""}
                    onChange={(e) => {
                      const photos = [...part.photos];
                      photos[i] = e.target.value;
                      patch(cur, { ...part, photos });
                    }}
                    placeholder={i === 0 ? "看清楚的一张" : "使用距离的一张"}
                    className="w-full bg-[#0a0a0c] border border-[#1c1c22] rounded px-3 py-2 text-sm"
                  />
                ))}
              </div>

              <div className="space-y-3">
                <p className="text-xs text-[#c9a87c]">深度。往下松一档，就是自己再打开一点。</p>
                {meta.depths.map((d) => (
                  <div key={d.key} className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-[#e6e4e0] flex-1">{d.label}</span>
                    {(["deny", "markup", "allow"] as DepthChoice[]).map((v) => (
                      <button
                        key={v}
                        onClick={() => setDepth(d.key, v)}
                        className={`px-2 py-1 rounded border ${
                          part.depths[d.key] === v
                            ? "border-[#c9a87c] text-[#c9a87c]"
                            : "border-[#2a2a32] text-[#5a5860]"
                        }`}
                      >
                        {v === "allow" ? "可以" : v === "markup" ? "加码" : "不卖"}
                      </button>
                    ))}
                  </div>
                ))}
              </div>

              <div>
                <p className="text-xs text-[#c9a87c] mb-2">台上能叫的</p>
                <div className="flex flex-wrap gap-2">
                  {meta.namesFree.map((n) => (
                    <button
                      key={n}
                      onClick={() => toggleName("namesFree", n)}
                      className={`text-xs px-2 py-1 rounded border ${
                        part.namesFree.includes(n) ? "border-[#c9a87c] text-[#c9a87c]" : "border-[#2a2a32] text-[#5a5860]"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-[#c9a87c] mb-2">加码才能叫的</p>
                <div className="flex flex-wrap gap-2">
                  {meta.namesPaid.map((n) => (
                    <button
                      key={n}
                      onClick={() => toggleName("namesPaid", n)}
                      className={`text-xs px-2 py-1 rounded border ${
                        part.namesPaid.includes(n) ? "border-[#c9a87c] text-[#c9a87c]" : "border-[#2a2a32] text-[#5a5860]"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {(part.scoreLook > 0 || part.enabled) && (
                <p className="text-xs text-[#8b8793]">
                  估价会在保存后出：耐看 / 好用 / 好骂。
                </p>
              )}
            </>
          )}
        </section>

        <div className="text-xs text-[#8b8793] space-y-1">
          <p>已摆上台：{PARTS.filter((p) => menu[p.key]?.enabled).map((p) => p.label).join("、") || "还没有。"}</p>
          {PARTS.filter((p) => menu[p.key]?.enabled).map((p) => (
            <p key={p.key}>
              {p.label} · 耐看{menu[p.key].scoreLook} 好用{menu[p.key].scoreUse} 好骂{menu[p.key].scoreFilth}
            </p>
          ))}
        </div>

        {msg && <p className="text-xs text-[#c9a87c]">{msg}</p>}
        <button
          disabled={loading}
          onClick={() => save(false)}
          className="w-full py-3 bg-[#c9a87c] text-[#070708] rounded-md"
        >
          {loading ? "在摆…" : "把货单存上"}
        </button>
      </main>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PLAY_TAGS, SPECIAL_KINKS } from "@/lib/bodyMenu";
import { SCENES } from "@/lib/scenes";
import { DEFAULT_HEAT, type HeatConfig } from "@/lib/heat";

export default function HeatPage() {
  const router = useRouter();
  const [config, setConfig] = useState<HeatConfig>(DEFAULT_HEAT);
  const [heatOn, setHeatOn] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/girls/heat")
      .then((r) => r.json())
      .then((d) => {
        if (d.config) setConfig(d.config);
        setHeatOn(!!d.heatOn);
      });
  }, []);

  function toggleArr(key: "playTags" | "specialTags" | "scenes", value: string) {
    setConfig((c) => {
      const arr = c[key] || [];
      const next = arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value].slice(0, 6);
      return { ...c, [key]: next };
    });
  }

  async function saveConfig() {
    setLoading(true);
    await fetch("/api/girls/heat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ config }),
    });
    setMsg("发情预授权已存。");
    setLoading(false);
  }

  async function toggleHeat(on: boolean) {
    setLoading(true);
    setMsg("");
    await fetch("/api/girls/heat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ config }),
    });
    const res = await fetch("/api/girls/heat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ heatOn: on }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setMsg(data.error || "没能切换");
      return;
    }
    setHeatOn(on);
    setMsg(on ? "已发情上钟。楼面会显示发情中。" : "已退出发情。");
    if (on) router.push("/dashboard");
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-[#1c1c22] px-6 py-4">
        <Link href="/dashboard" className="text-xs text-[#8b8793]">
          ← 回柜上
        </Link>
      </header>
      <main className="max-w-md mx-auto px-6 py-10 space-y-6">
        <div>
          <h1 className="text-xl text-[#c9a87c]">发情档</h1>
          <p className="text-xs text-[#8b8793] mt-2 leading-relaxed">
            冷静时定好能松到哪。发情上钟后：少选择、系统按预授权催你。不是取消所有下限。
          </p>
        </div>

        <section className="space-y-3 border border-[#3a2222] rounded-xl p-4">
          <p className="text-xs text-[#c9a87c]">发情最多开到</p>
          <select
            value={config.maxDepth}
            onChange={(e) => setConfig({ ...config, maxDepth: e.target.value })}
            className="w-full bg-[#0a0a0c] border border-[#1c1c22] rounded px-3 py-2 text-sm"
          >
            <option value="look">只许看</option>
            <option value="use">口/手</option>
            <option value="enter">许进</option>
            <option value="dirty">弄脏</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-[#e6e4e0]">
            <input
              type="checkbox"
              checked={config.allowSelfUpgrade}
              onChange={(e) => setConfig({ ...config, allowSelfUpgrade: e.target.checked })}
            />
            允许房里「自己求加档」
          </label>
          <div>
            <p className="text-xs text-[#8b8793] mb-1">默认钟点</p>
            <select
              value={config.defaultMinutes}
              onChange={(e) => setConfig({ ...config, defaultMinutes: Number(e.target.value) })}
              className="w-full bg-[#0a0a0c] border border-[#1c1c22] rounded px-3 py-2 text-sm"
            >
              <option value={20}>20 分</option>
              <option value={40}>40 分</option>
              <option value={60}>60 分</option>
            </select>
          </div>
        </section>

        <section className="space-y-2">
          <p className="text-xs text-[#c9a87c]">发情自动带上的玩法</p>
          <div className="flex flex-wrap gap-2">
            {PLAY_TAGS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => toggleArr("playTags", t.key)}
                className={`text-xs px-2 py-1 rounded border ${
                  config.playTags.includes(t.key) ? "border-[#c9a87c] text-[#c9a87c]" : "border-[#2a2a32] text-[#5a5860]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <p className="text-xs text-[#c9a87c]">发情自动带上的特殊项</p>
          <div className="flex flex-wrap gap-2">
            {SPECIAL_KINKS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => toggleArr("specialTags", t.key)}
                className={`text-xs px-2 py-1 rounded border ${
                  config.specialTags.includes(t.key) ? "border-[#c9a87c] text-[#c9a87c]" : "border-[#2a2a32] text-[#5a5860]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <p className="text-xs text-[#c9a87c]">发情偏好场景</p>
          <div className="flex flex-wrap gap-2">
            {SCENES.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => toggleArr("scenes", s.key)}
                className={`text-xs px-2 py-1 rounded border ${
                  config.scenes.includes(s.key) ? "border-[#c9a87c] text-[#c9a87c]" : "border-[#2a2a32] text-[#5a5860]"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </section>

        <button
          type="button"
          disabled={loading}
          onClick={saveConfig}
          className="w-full py-2.5 border border-[#c9a87c]/50 text-[#c9a87c] rounded-md text-sm"
        >
          只保存预授权
        </button>

        {!heatOn ? (
          <button
            type="button"
            disabled={loading}
            onClick={() => toggleHeat(true)}
            className="w-full py-3 bg-[#c9a87c] text-[#070708] rounded-md font-medium"
          >
            发情上钟
          </button>
        ) : (
          <button
            type="button"
            disabled={loading}
            onClick={() => toggleHeat(false)}
            className="w-full py-3 border border-[#a85c5c] text-[#a85c5c] rounded-md"
          >
            退出发情
          </button>
        )}
        {msg && <p className="text-xs text-[#c9a87c]">{msg}</p>}
      </main>
    </div>
  );
}

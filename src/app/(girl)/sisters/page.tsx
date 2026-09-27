"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const MOODS = ["刚下钟", "发情中", "想更贱", "求重口建议", "分享一单", "只是喘口气"];

export default function SistersPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [mood, setMood] = useState(MOODS[0]);
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    const r = await fetch("/api/sisters/posts");
    const d = await r.json();
    setPosts(d.posts || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function publish() {
    setLoading(true);
    setMsg("");
    const res = await fetch("/api/sisters/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, mood }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setMsg(data.error || "没发出去");
      return;
    }
    setContent("");
    setMsg("已贴上柜后。");
    load();
  }

  async function reply(postId: string) {
    const text = (replyDraft[postId] || "").trim();
    if (!text) return;
    setLoading(true);
    const res = await fetch("/api/sisters/replies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, content: text }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setMsg(data.error || "回复失败");
      return;
    }
    setReplyDraft((d) => ({ ...d, [postId]: "" }));
    load();
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-[#1c1c22] px-6 py-4 flex justify-between items-center">
        <Link href="/dashboard" className="text-xs text-[#8b8793]">
          ← 回柜上
        </Link>
        <span className="text-xs text-[#5a5860]">仅姐妹可见</span>
      </header>
      <main className="max-w-lg mx-auto px-6 py-8 space-y-6">
        <div>
          <h1 className="text-xl text-[#c9a87c]">柜后 · 姐妹</h1>
          <p className="text-xs text-[#8b8793] mt-2 leading-relaxed">
            下钟后喘口气、换重口经验、问会不会太贱。客人和楼面进不来。
          </p>
        </div>

        <section className="border border-[#3a2222] rounded-xl p-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {MOODS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMood(m)}
                className={`text-[11px] px-2 py-1 rounded border ${
                  mood === m ? "border-[#c9a87c] text-[#c9a87c]" : "border-[#2a2a32] text-[#5a5860]"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            placeholder="例如：第一次接舔后庭，腿在抖，但好兴奋……"
            className="w-full bg-[#0a0a0c] border border-[#1c1c22] rounded-md px-3 py-2.5 text-sm"
          />
          <button
            type="button"
            disabled={loading}
            onClick={publish}
            className="w-full py-2.5 bg-[#c9a87c] text-[#070708] rounded-md text-sm"
          >
            贴到柜后
          </button>
          {msg && <p className="text-xs text-[#c9a87c]">{msg}</p>}
        </section>

        <div className="space-y-4">
          {posts.map((p) => (
            <article key={p.id} className="border border-[#1c1c22] rounded-xl p-4 space-y-3">
              <div className="flex justify-between text-[11px] text-[#5a5860]">
                <span>
                  {p.name}
                  {p.mood ? ` · ${p.mood}` : ""}
                </span>
                <span>{new Date(p.createdAt).toLocaleString("zh-CN")}</span>
              </div>
              <p className="text-sm text-[#e6e4e0] whitespace-pre-wrap leading-relaxed">{p.content}</p>
              <div className="space-y-2 pl-2 border-l border-[#2a2a32]">
                {(p.replies || []).map((r: any) => (
                  <div key={r.id} className="text-xs">
                    <span className="text-[#c9a87c]">{r.name}</span>
                    <span className="text-[#8b8793]"> · {r.content}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={replyDraft[p.id] || ""}
                  onChange={(e) => setReplyDraft((d) => ({ ...d, [p.id]: e.target.value }))}
                  placeholder="回她一句"
                  className="flex-1 bg-[#0a0a0c] border border-[#1c1c22] rounded px-2 py-1.5 text-xs"
                />
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => reply(p.id)}
                  className="text-xs text-[#c9a87c] px-2"
                >
                  回
                </button>
              </div>
            </article>
          ))}
          {!posts.length && <p className="text-sm text-[#5a5860]">还没人说话。你可以先贴第一条。</p>}
        </div>
      </main>
    </div>
  );
}

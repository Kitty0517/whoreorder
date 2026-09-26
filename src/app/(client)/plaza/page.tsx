"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function PlazaPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [content, setContent] = useState("");
  async function load() {
    const r = await fetch("/api/plaza");
    setPosts((await r.json()).posts || []);
  }
  useEffect(() => { load(); }, []);
  async function send() {
    await fetch("/api/plaza", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content }) });
    setContent("");
    load();
  }
  return (
    <div className="min-h-screen">
      <header className="border-b border-[#1c1c22] px-6 py-4 flex justify-between">
        <Link href="/browse" className="text-xs text-[#8b8793]">← 点人</Link>
        <Link href="/rank" className="text-xs text-[#c9a87c]">排行</Link>
      </header>
      <main className="max-w-md mx-auto px-6 py-8 space-y-4">
        <h1 className="text-[#c9a87c]">广场</h1>
        <textarea value={content} onChange={(e)=>setContent(e.target.value)} rows={3} placeholder="一句话。不要写教程，不要真钱交易。" className="w-full bg-[#0a0a0c] border border-[#1c1c22] rounded px-3 py-2 text-sm" />
        <button onClick={send} className="w-full py-2 bg-[#c9a87c] text-black rounded text-sm">发</button>
        {posts.map(p => (
          <div key={p.id} className="border border-[#1c1c22] rounded p-3">
            <p className="text-xs text-[#c9a87c]">{p.displayName} · {p.role === "girl" ? "在接客" : "客人"}</p>
            <p className="text-sm mt-1">{p.content}</p>
          </div>
        ))}
      </main>
    </div>
  );
}

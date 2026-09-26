"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function ClientLivePage() {
  const params = useParams();
  const girlId = String(params.id || "");
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  async function load() {
    const r = await fetch("/api/live?girlId=" + girlId);
    setMessages((await r.json()).messages || []);
  }
  useEffect(() => { load(); const t = setInterval(load, 4000); return () => clearInterval(t); }, [girlId]);
  async function send() {
    await fetch("/api/live", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ girlId, content: text }) });
    setText(""); load();
  }
  return (
    <div className="min-h-screen">
      <header className="border-b border-[#1c1c22] px-6 py-4">
        <Link href={`/girl/${girlId}`} className="text-xs text-[#8b8793]">← 回她主页</Link>
      </header>
      <main className="max-w-md mx-auto px-6 py-8 space-y-3">
        <h1 className="text-[#c9a87c]">她的等候室</h1>
        {messages.map(m => <p key={m.id} className="text-sm"><span className="text-[#c9a87c]">{m.displayName}：</span>{m.content}</p>)}
        <div className="flex gap-2 pt-4">
          <input value={text} onChange={e=>setText(e.target.value)} className="flex-1 bg-[#0a0a0c] border border-[#1c1c22] rounded px-3 py-2 text-sm" />
          <button onClick={send} className="px-3 bg-[#c9a87c] text-black rounded">说</button>
        </div>
      </main>
    </div>
  );
}

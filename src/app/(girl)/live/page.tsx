"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function GirlLivePage() {
  const [on, setOn] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [me, setMe] = useState("");

  useEffect(() => {
    fetch("/api/girls/profile").then(r=>r.json()).then(d => {
      setOn(!!d.liveOn);
      setMe(d.userId);
      load(d.userId);
    });
  }, []);

  async function load(id?: string) {
    const gid = id || me;
    if (!gid) return;
    const r = await fetch("/api/live?girlId=" + gid);
    const d = await r.json();
    setMessages(d.messages || []);
  }

  async function toggle() {
    const next = on ? 0 : 1;
    await fetch("/api/live", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ liveOn: next }) });
    setOn(!on);
  }

  async function send() {
    if (!text.trim()) return;
    await fetch("/api/live", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ girlId: me, content: text }) });
    setText("");
    load();
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-[#1c1c22] px-6 py-4 flex justify-between">
        <Link href="/dashboard" className="text-xs text-[#8b8793]">← 回面板</Link>
        <button onClick={toggle} className="text-xs text-[#c9a87c]">{on ? "关直播等候室" : "开直播等候室"}</button>
      </header>
      <main className="max-w-md mx-auto px-6 py-8 space-y-4">
        <h1 className="text-[#c9a87c]">等候室</h1>
        <p className="text-xs text-[#8b8793]">{on ? "客人可以进来跟你说话。" : "还没开。"}</p>
        <div className="space-y-2 min-h-48">
          {messages.map((m) => (
            <p key={m.id} className="text-sm"><span className="text-[#c9a87c]">{m.displayName}：</span>{m.content}</p>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={text} onChange={(e)=>setText(e.target.value)} className="flex-1 bg-[#0a0a0c] border border-[#1c1c22] rounded px-3 py-2 text-sm" />
          <button onClick={send} className="px-3 bg-[#c9a87c] text-black rounded text-sm">说</button>
        </div>
      </main>
    </div>
  );
}

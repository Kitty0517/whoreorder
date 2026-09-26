"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

function Stars({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-[#8b8793] w-16">{label}</span>
      <div className="flex gap-1">
        {[1,2,3,4,5].map((n) => (
          <button key={n} type="button" onClick={() => onChange(n)} className={`text-lg ${n <= value ? "text-[#c9a87c]" : "text-[#3a3a42]"}`}>★</button>
        ))}
      </div>
    </div>
  );
}

export function ReviewForm({ orderId, girlId }: { orderId: string; girlId: string }) {
  const router = useRouter();
  const [obedient, setObedient] = useState(5);
  const [filthy, setFilthy] = useState(5);
  const [listen, setListen] = useState(5);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    setErr("");
    const res = await fetch("/api/reviews/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, girlId, obedient, filthy, listen, content }),
    });
    const data = await res.json();
    if (!res.ok) setErr(data.error || "没评上去");
    router.refresh();
    setLoading(false);
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Stars value={obedient} onChange={setObedient} label="乖不乖" />
      <Stars value={filthy} onChange={setFilthy} label="脏不脏" />
      <Stars value={listen} onChange={setListen} label="听不听" />
      <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={3}
        placeholder="只写她这次服侍：哪里够贱，哪里不够听话。不要写小说，不要写AI。"
        className="w-full bg-[#0a0a0c] border border-[#1c1c22] rounded-md px-3 py-2.5 text-sm" />
      {err && <p className="text-xs text-[#a85c5c]">{err}</p>}
      <button type="submit" disabled={loading} className="w-full py-2.5 bg-[#c9a87c] text-[#070708] text-sm font-medium rounded-md disabled:opacity-50">留下这句话</button>
    </form>
  );
}

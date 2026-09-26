"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const REACTIONS = ["嗯……", "等一下……", "好深……", "听你的。", "不要停。", "我很听话。"];

export function ReplyForm(props: {
  orderId: string;
  opening: string;
  during: string;
  ending: string;
  aftercare: string;
  extraPay?: number;
  extraDemand?: string;
  extraStatus?: string;
}) {
  const router = useRouter();
  const [o, setO] = useState(props.opening);
  const [d, setD] = useState(props.during);
  const [e, setE] = useState(props.ending);
  const [a, setA] = useState(props.aftercare);
  const [focus, setFocus] = useState<"o" | "d" | "e">("o");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  function insert(text: string) {
    if (focus === "o") setO((v) => v + text);
    if (focus === "d") setD((v) => v + text);
    if (focus === "e") setE((v) => v + text);
  }

  async function submit(action: string, send?: string) {
    if (action === "complete" && (!o.trim() || !d.trim() || !e.trim())) {
      setMsg("三段都要写完才能完事。");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/orders/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: props.orderId, opening: o, during: d, ending: e, aftercare: a, action, send }),
    });
    const data = await res.json();
    setMsg(res.ok ? (send ? "这段已经给他看了。" : action === "complete" ? "完事了。余韵只留给你。" : "还没写完，先跪着等。") : data.error);
    router.refresh();
    setLoading(false);
  }

  async function markup(decision: string) {
    await fetch("/api/orders/markup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: props.orderId, decision }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {props.extraStatus === "pending" && (
        <div className="border border-[#c9a87c]/40 rounded-md p-4 space-y-2">
          <p className="text-xs text-[#c9a87c]">他加了 {props.extraPay} 币，要你多听话这个：</p>
          <p className="text-sm">{props.extraDemand}</p>
          <div className="flex gap-2 pt-1">
            <button onClick={() => markup("accept")} className="text-xs px-3 py-1.5 bg-[#c9a87c] text-black rounded">接加码</button>
            <button onClick={() => markup("clarify")} className="text-xs px-3 py-1.5 border border-[#3a2222] rounded">再写清楚</button>
            <button onClick={() => markup("reject")} className="text-xs px-3 py-1.5 border border-[#3a2222] rounded">拒</button>
          </div>
        </div>
      )}
      {props.extraStatus === "accepted" && (
        <p className="text-xs text-[#c9a87c]">加码已接：{props.extraDemand}</p>
      )}

      <div className="flex flex-wrap gap-2">
        {REACTIONS.map((r) => (
          <button key={r} type="button" onClick={() => insert(r)} className="text-[11px] px-2 py-1 border border-[#3a2222] rounded text-[#c9b8b8]">
            {r}
          </button>
        ))}
      </div>

      {[
        { k: "o" as const, label: "1. 开场", hint: "门开的那一瞬", val: o, set: setO, send: "opening" },
        { k: "d" as const, label: "2. 被用", hint: "正在被拆开", val: d, set: setD, send: "during" },
        { k: "e" as const, label: "3. 收场", hint: "他还没走", val: e, set: setE, send: "ending" },
      ].map((seg) => (
        <div key={seg.k}>
          <label className="block text-xs text-[#c9a87c] mb-1.5">{seg.label} · {seg.hint}</label>
          <textarea value={seg.val} onFocus={() => setFocus(seg.k)} onChange={(ev) => seg.set(ev.target.value)} rows={seg.k === "d" ? 6 : 4}
            className="w-full bg-[#0a0a0c] border border-[#3a2222] rounded-md px-4 py-3 text-sm leading-relaxed" />
          <button disabled={loading || !seg.val.trim()} onClick={() => submit("serving", seg.send)} className="mt-2 text-xs text-[#c9a87c]">
            先把这段发给他
          </button>
        </div>
      ))}

      <div>
        <label className="block text-xs text-[#8b8793] mb-1.5">只给你看的余韵</label>
        <textarea value={a} onChange={(ev) => setA(ev.target.value)} rows={3} className="w-full bg-[#0a0a0c] border border-[#1c1c22] rounded-md px-4 py-3 text-sm" />
      </div>

      <div className="flex gap-3">
        <button disabled={loading} onClick={() => submit("accept")} className="flex-1 py-2.5 border border-[#c9a87c]/60 text-[#c9a87c] text-sm rounded-md">还没写完，先跪着等</button>
        <button disabled={loading} onClick={() => submit("complete")} className="flex-1 py-2.5 bg-[#c9a87c] text-[#070708] text-sm rounded-md">完事</button>
      </div>
      {msg && <p className="text-xs text-[#c9a87c]">{msg}</p>}
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { allowedSegments, DEPTH_LABEL, formatClock, roomLeftSeconds } from "@/lib/house";
import { buildHint, buildPlaceholder, ritualReactions, softCheck } from "@/lib/rituals";
import { playTagLabel, specialLabel } from "@/lib/bodyMenu";

const BASE_REACTIONS = ["嗯……", "等一下……", "好深……", "听你的。", "不要停。", "我很听话。"];

export function ReplyForm(props: {
  orderId: string;
  opening: string;
  during: string;
  ending: string;
  aftercare: string;
  extraPay?: number;
  extraDemand?: string;
  extraStatus?: string;
  unlockedDepth?: string;
  roomEndsAt?: number | Date | null;
  playTags?: string[];
  specialTags?: string[];
}) {
  const router = useRouter();
  const unlocked = props.unlockedDepth || "look";
  const allow = allowedSegments(unlocked);
  const playTags = props.playTags || [];
  const specialTags = props.specialTags || [];
  const [o, setO] = useState(props.opening);
  const [d, setD] = useState(props.during);
  const [e, setE] = useState(props.ending);
  const [a, setA] = useState(props.aftercare);
  const [focus, setFocus] = useState<"o" | "d" | "e">("o");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [left, setLeft] = useState(roomLeftSeconds(props.roomEndsAt));

  useEffect(() => {
    const t = setInterval(() => setLeft(roomLeftSeconds(props.roomEndsAt)), 1000);
    return () => clearInterval(t);
  }, [props.roomEndsAt]);

  const expired = left !== null && left <= 0;
  const hint = buildHint(playTags, specialTags);
  const reactions = [...ritualReactions(playTags, specialTags), ...BASE_REACTIONS].slice(0, 10);
  const tagLine = [
    ...playTags.map(playTagLabel),
    ...specialTags.map(specialLabel),
  ].filter(Boolean);

  function insert(text: string) {
    if (expired) return;
    if (focus === "o") setO((v) => v + text);
    if (focus === "d" && allow.during) setD((v) => v + text);
    if (focus === "e" && allow.ending) setE((v) => v + text);
  }

  async function submit(action: string, send?: string) {
    if (expired && action !== "complete") {
      setMsg("钟到了。等他续钟，或直接送客。");
      return;
    }
    if (send === "during" && !allow.during) {
      setMsg("这一档还没开。");
      return;
    }
    if (send === "ending" && !allow.ending) {
      setMsg("还没开到收场。");
      return;
    }
    if (action === "complete" && !o.trim()) {
      setMsg("至少把门开开。");
      return;
    }

    const textForCheck = send === "during" ? d : send === "ending" ? e : o;
    const warns = softCheck(textForCheck, playTags, specialTags, send === "during" ? "during" : send === "ending" ? "ending" : "opening");
    if (warns.length && action !== "complete") {
      setMsg(warns[0] + "（仍可发，但会出戏）");
    }

    setLoading(true);
    const res = await fetch("/api/orders/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: props.orderId, opening: o, during: d, ending: e, aftercare: a, action, send }),
    });
    const data = await res.json();
    if (!res.ok) setMsg(data.error);
    else if (!warns.length) {
      setMsg(send ? "这段已经给他看了。" : action === "complete" ? "送客了。你回柜上。" : "还没写完，先跪着等。");
    }
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
      <div className={`text-sm px-4 py-3 rounded-md border ${expired ? "border-[#a85c5c] text-[#a85c5c]" : "border-[#3a2222] text-[#c9a87c]"}`}>
        钟 {formatClock(left)}
        {expired ? " · 到了。续钟或送客。" : null}
        <span className="text-[#8b8793] ml-2">已开到：{DEPTH_LABEL[unlocked] || unlocked}</span>
      </div>

      {tagLine.length > 0 && (
        <div className="border border-[#3a2222] rounded-md px-4 py-3 space-y-1">
          <p className="text-xs text-[#c9a87c]">本房规程（钉死）</p>
          <p className="text-sm text-[#e6e4e0]">{tagLine.join(" · ")}</p>
          {hint && <p className="text-xs text-[#8a6a6a]">{hint}</p>}
        </div>
      )}

      {props.extraStatus === "pending" && (
        <div className="border border-[#c9a87c]/40 rounded-md p-4 space-y-2">
          <p className="text-xs text-[#c9a87c]">门在敲。他加了 {props.extraPay} 币：</p>
          <p className="text-sm">{props.extraDemand}</p>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={() => markup("accept")} className="text-xs px-3 py-1.5 bg-[#c9a87c] text-black rounded">接</button>
            <button type="button" onClick={() => markup("clarify")} className="text-xs px-3 py-1.5 border border-[#3a2222] rounded">再写清楚</button>
            <button type="button" onClick={() => markup("reject")} className="text-xs px-3 py-1.5 border border-[#3a2222] rounded">拒</button>
          </div>
        </div>
      )}

      {!expired && (
        <div className="flex flex-wrap gap-2">
          {reactions.map((r) => (
            <button key={r} type="button" onClick={() => insert(r)} className="text-[11px] px-2 py-1 border border-[#3a2222] rounded text-[#c9b8b8]">
              {r}
            </button>
          ))}
        </div>
      )}

      <div>
        <label className="block text-xs text-[#c9a87c] mb-1.5">1. 开场</label>
        <textarea
          value={o}
          onFocus={() => setFocus("o")}
          onChange={(ev) => setO(ev.target.value)}
          disabled={expired}
          rows={4}
          placeholder={buildPlaceholder(playTags, specialTags, "opening")}
          className="w-full bg-[#0a0a0c] border border-[#3a2222] rounded-md px-4 py-3 text-sm leading-relaxed disabled:opacity-50"
        />
        {!expired && (
          <button type="button" disabled={loading || !o.trim()} onClick={() => submit("accept", "opening")} className="mt-2 text-xs text-[#c9a87c]">
            先把开场发给他
          </button>
        )}
      </div>

      <div>
        <label className="block text-xs text-[#c9a87c] mb-1.5">2. 被用</label>
        {!allow.during ? (
          <p className="text-xs text-[#5a5860] border border-[#1c1c22] rounded-md px-4 py-3">这一档还没开。加码接了才能写。</p>
        ) : (
          <>
            <textarea
              value={d}
              onFocus={() => setFocus("d")}
              onChange={(ev) => setD(ev.target.value)}
              disabled={expired}
              rows={6}
              placeholder={buildPlaceholder(playTags, specialTags, "during")}
              className="w-full bg-[#0a0a0c] border border-[#3a2222] rounded-md px-4 py-3 text-sm leading-relaxed disabled:opacity-50"
            />
            {!expired && (
              <button type="button" disabled={loading || !d.trim()} onClick={() => submit("serving", "during")} className="mt-2 text-xs text-[#c9a87c]">
                把这段发给他
              </button>
            )}
          </>
        )}
      </div>

      <div>
        <label className="block text-xs text-[#c9a87c] mb-1.5">3. 收场</label>
        {!allow.ending ? (
          <p className="text-xs text-[#5a5860] border border-[#1c1c22] rounded-md px-4 py-3">还没开到这一层。</p>
        ) : (
          <>
            <textarea
              value={e}
              onFocus={() => setFocus("e")}
              onChange={(ev) => setE(ev.target.value)}
              disabled={expired}
              rows={4}
              placeholder={buildPlaceholder(playTags, specialTags, "ending")}
              className="w-full bg-[#0a0a0c] border border-[#3a2222] rounded-md px-4 py-3 text-sm leading-relaxed disabled:opacity-50"
            />
            {!expired && (
              <button type="button" disabled={loading || !e.trim()} onClick={() => submit("serving", "ending")} className="mt-2 text-xs text-[#c9a87c]">
                把收场发给他
              </button>
            )}
          </>
        )}
      </div>

      <div>
        <label className="block text-xs text-[#8b8793] mb-1.5">只给你看的余韵</label>
        <textarea value={a} onChange={(ev) => setA(ev.target.value)} rows={3} className="w-full bg-[#0a0a0c] border border-[#1c1c22] rounded-md px-4 py-3 text-sm" />
      </div>

      <div className="flex gap-3">
        {!expired && (
          <button type="button" disabled={loading} onClick={() => submit("accept")} className="flex-1 py-2.5 border border-[#c9a87c]/60 text-[#c9a87c] text-sm rounded-md">
            还没写完，先跪着等
          </button>
        )}
        <button type="button" disabled={loading} onClick={() => submit("complete")} className="flex-1 py-2.5 bg-[#c9a87c] text-[#070708] text-sm rounded-md">
          {expired ? "钟到了 · 送客" : "送客"}
        </button>
      </div>
      {msg && <p className="text-xs text-[#c9a87c]">{msg}</p>}
    </div>
  );
}

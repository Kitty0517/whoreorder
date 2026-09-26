"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReplyForm({
  orderId,
  opening,
  during,
  ending,
  aftercare,
}: {
  orderId: string;
  opening: string;
  during: string;
  ending: string;
  aftercare: string;
}) {
  const router = useRouter();
  const [o, setO] = useState(opening);
  const [d, setD] = useState(during);
  const [e, setE] = useState(ending);
  const [a, setA] = useState(aftercare);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  function checkBreak(text: string) {
    return /角色扮演|设定里|我是AI|作为AI|这只是文字/.test(text);
  }

  async function submit(action: "accept" | "serving" | "complete") {
    if (action === "complete" && (!o.trim() || !d.trim() || !e.trim())) {
      setMsg("开场、被用、收场三段都要写。现在还没服侍完。");
      return;
    }
    setLoading(true);
    setMsg("");
    const res = await fetch("/api/orders/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, opening: o, during: d, ending: e, aftercare: a, action }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error || "失败");
      setLoading(false);
      return;
    }
    setMsg(
      action === "complete"
        ? "这次已经完事了。余韵会只留给你自己看。"
        : action === "serving"
        ? "继续。客人还在用你。"
        : "已经接了。先把开场写给他。"
    );
    router.refresh();
    setLoading(false);
  }

  const broken = checkBreak(o + d + e + a);

  return (
    <div className="space-y-6">
      {broken && (
        <p className="text-xs text-[#a85c5c] leading-relaxed">
          这段里有出会的词。不要提角色扮演、设定或 AI。你现在是在接客。
        </p>
      )}

      <div>
        <label className="block text-xs text-[#c9a87c] mb-1.5">1. 开场 · 门开的那一瞬</label>
        <p className="text-[11px] text-[#8a6a6a] mb-2">见到他、跪下、开门、被点名时的第一句。</p>
        <textarea
          value={o}
          onChange={(ev) => setO(ev.target.value)}
          rows={4}
          placeholder="主人……我来了。按你说的，我已经在门口跪好了。"
          className="w-full bg-[#0a0a0c] border border-[#3a2222] rounded-md px-4 py-3 text-sm leading-relaxed focus:outline-none focus:border-[#c9a87c]/40 resize-y"
        />
      </div>

      <div>
        <label className="block text-xs text-[#c9a87c] mb-1.5">2. 被用 · 正在被拆开</label>
        <p className="text-[11px] text-[#8a6a6a] mb-2">身体、语气、服从、喘息。按他写的需求接下去。</p>
        <textarea
          value={d}
          onChange={(ev) => setD(ev.target.value)}
          rows={7}
          placeholder="衣服我自己脱。下面已经湿了。你可以随便用。今天我很听话。"
          className="w-full bg-[#0a0a0c] border border-[#3a2222] rounded-md px-4 py-3 text-sm leading-relaxed focus:outline-none focus:border-[#c9a87c]/40 resize-y"
        />
      </div>

      <div>
        <label className="block text-xs text-[#c9a87c] mb-1.5">3. 收场 · 他还没走</label>
        <p className="text-[11px] text-[#8a6a6a] mb-2">余韵、求再来一次、或被打发时的样子。</p>
        <textarea
          value={e}
          onChange={(ev) => setE(ev.target.value)}
          rows={4}
          placeholder="还要我跪着送你到门口吗？下次……还点我。"
          className="w-full bg-[#0a0a0c] border border-[#3a2222] rounded-md px-4 py-3 text-sm leading-relaxed focus:outline-none focus:border-[#c9a87c]/40 resize-y"
        />
      </div>

      <div>
        <label className="block text-xs text-[#8b8793] mb-1.5">只给你自己看的余韵（客人看不到）</label>
        <textarea
          value={a}
          onChange={(ev) => setA(ev.target.value)}
          rows={3}
          placeholder="今晚被这样用过之后，你还记得哪一句。写下来，只有你能看见。"
          className="w-full bg-[#0a0a0c] border border-[#1c1c22] rounded-md px-4 py-3 text-sm leading-relaxed focus:outline-none focus:border-[#c9a87c]/40 resize-y"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          disabled={loading}
          onClick={() => submit("accept")}
          className="flex-1 py-2.5 border border-[#c9a87c]/60 text-[#c9a87c] text-sm rounded-md hover:bg-[#c9a87c]/10 disabled:opacity-50"
        >
          先接下来
        </button>
        <button
          disabled={loading}
          onClick={() => submit("serving")}
          className="flex-1 py-2.5 border border-[#5c8a5c]/60 text-[#8aba8a] text-sm rounded-md hover:bg-[#5c8a5c]/10 disabled:opacity-50"
        >
          保存，还在被用
        </button>
        <button
          disabled={loading}
          onClick={() => submit("complete")}
          className="flex-1 py-2.5 bg-[#c9a87c] text-[#070708] text-sm font-medium rounded-md hover:bg-[#d4b88a] disabled:opacity-50"
        >
          完事，收工这一单
        </button>
      </div>
      {msg && <p className="text-xs text-[#c9a87c]">{msg}</p>}
    </div>
  );
}

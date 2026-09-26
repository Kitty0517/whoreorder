"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReplyForm({
  orderId,
  existingReply,
}: {
  orderId: string;
  existingReply: string;
}) {
  const router = useRouter();
  const [reply, setReply] = useState(existingReply);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function submit(action: "accept" | "complete") {
    if (!reply.trim()) {
      setMsg("请先写下你的服侍内容");
      return;
    }
    setLoading(true);
    setMsg("");
    const res = await fetch("/api/orders/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, reply, action }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error || "失败");
      setLoading(false);
      return;
    }
    setMsg(action === "complete" ? "服务已完成，客人可以看到了" : "已接单，继续写完再点完成");
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <textarea
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        rows={12}
        placeholder={`示例：\n\n主人……我来了。\n\n按你说的，我已经跪好了。衣服……还要我自己脱吗？还是你想亲手撕开？\n\n我下面已经湿了。你可以随便用。今天我很听话。`}
        className="w-full bg-[#0a0a0c] border border-[#3a2222] rounded-md px-4 py-3 text-sm leading-relaxed focus:outline-none focus:border-[#c9a87c]/40 resize-y"
      />
      <div className="flex gap-3">
        <button
          disabled={loading}
          onClick={() => submit("accept")}
          className="flex-1 py-2.5 border border-[#c9a87c]/60 text-[#c9a87c] text-sm rounded-md hover:bg-[#c9a87c]/10 disabled:opacity-50"
        >
          先接单（保存草稿）
        </button>
        <button
          disabled={loading}
          onClick={() => submit("complete")}
          className="flex-1 py-2.5 bg-[#c9a87c] text-[#070708] text-sm font-medium rounded-md hover:bg-[#d4b88a] disabled:opacity-50"
        >
          完成这次服侍
        </button>
      </div>
      {msg && <p className="text-xs text-[#c9a87c]">{msg}</p>}
    </div>
  );
}

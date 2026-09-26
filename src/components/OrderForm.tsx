"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function OrderForm({ girlId }: { girlId: string }) {
  const router = useRouter();
  const [fantasyType, setFantasyType] = useState("情景代入");
  const [tone, setTone] = useState("submissive");
  const [detail, setDetail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!detail.trim() || detail.length < 20) {
      setError("请写得再具体一点（至少20字），她才知道怎么被你用");
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch("/api/orders/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ girlId, fantasyType, tone, fantasyDetail: detail }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "下单失败");
      setLoading(false);
      return;
    }
    router.push(`/my-orders`);
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-xs text-[#8b8793] mb-1.5">幻想类型</label>
        <select
          value={fantasyType}
          onChange={(e) => setFantasyType(e.target.value)}
          className="w-full bg-[#0a0a0c] border border-[#1c1c22] rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[#c9a87c]/50"
        >
          <option>情景代入</option>
          <option>角色扮演</option>
          <option>定制剧本</option>
          <option>纯文字对话</option>
          <option>语音幻想描述</option>
        </select>
      </div>
      <div>
        <label className="block text-xs text-[#8b8793] mb-1.5">希望她的语气</label>
        <select
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          className="w-full bg-[#0a0a0c] border border-[#1c1c22] rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[#c9a87c]/50"
        >
          <option value="submissive">顺从依恋</option>
          <option value="tease">轻挑戏弄</option>
          <option value="gentle">温柔低语</option>
          <option value="cold">冷淡克制</option>
          <option value="dominant">强势主导</option>
        </select>
      </div>
      <div>
        <label className="block text-xs text-[#8b8793] mb-1.5">
          你的具体需求（越详细，她写得越下贱）
        </label>
        <textarea
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          rows={6}
          placeholder="例如：想让她跪在酒店门口等我，被我用鞋尖抬起下巴，然后自己把衣服一件件脱掉……边脱边说自己是什么。"
          className="w-full bg-[#0a0a0c] border border-[#1c1c22] rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[#c9a87c]/50 resize-y"
        />
      </div>
      {error && <p className="text-[#a85c5c] text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-[#c9a87c] text-[#070708] font-medium rounded-md hover:bg-[#d4b88a] disabled:opacity-50"
      >
        {loading ? "提交中..." : "点她 · 下单"}
      </button>
    </form>
  );
}

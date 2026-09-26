"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReviewForm({ orderId, girlId }: { orderId: string; girlId: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    await fetch("/api/reviews/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, girlId, rating, content }),
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            className={`text-xl ${n <= rating ? "text-[#c9a87c]" : "text-[#3a3a42]"}`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        placeholder="她这次服侍得怎么样？写得够下贱吗？够听话吗？"
        className="w-full bg-[#0a0a0c] border border-[#1c1c22] rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[#c9a87c]/50"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-[#c9a87c] text-[#070708] text-sm font-medium rounded-md hover:bg-[#d4b88a] disabled:opacity-50"
      >
        提交评价
      </button>
    </form>
  );
}

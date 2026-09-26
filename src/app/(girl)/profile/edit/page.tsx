"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EditProfilePage() {
  const router = useRouter();
  const [bio, setBio] = useState("");
  const [tags, setTags] = useState("");
  const [price, setPrice] = useState(200);
  const [emoji, setEmoji] = useState("🖤");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/girls/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.bio) setBio(d.bio);
        if (d.tags) setTags(JSON.parse(d.tags).join(", "));
        if (d.price) setPrice(d.price);
        if (d.avatarEmoji) setEmoji(d.avatarEmoji);
      });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    const res = await fetch("/api/girls/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bio,
        tags: tags.split(/[,，]/).map((t) => t.trim()).filter(Boolean),
        price: Number(price),
        avatarEmoji: emoji,
      }),
    });
    if (res.ok) {
      setMsg("已保存");
      router.refresh();
    } else {
      setMsg("保存失败");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-[#1c1c22] px-6 py-4">
        <Link href="/dashboard" className="text-xs text-[#8b8793] hover:text-[#c9a87c]">
          ← 返回接客面板
        </Link>
      </header>

      <main className="max-w-md mx-auto px-6 py-10">
        <h1 className="text-xl text-[#c9a87c] mb-6">编辑接客资料</h1>
        <form onSubmit={save} className="space-y-5">
          <div>
            <label className="block text-xs text-[#8b8793] mb-1.5">头像 emoji</label>
            <input
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              className="w-full bg-[#0a0a0c] border border-[#1c1c22] rounded-md px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-[#8b8793] mb-1.5">简介（用第一人称，写得下贱一点）</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="例如：会跪着等客人发指令。喜欢被当面羞辱。今晚随便玩。"
              className="w-full bg-[#0a0a0c] border border-[#1c1c22] rounded-md px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-[#8b8793] mb-1.5">标签（逗号分隔）</label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="听话, 可调教, 人妻, 重口可接"
              className="w-full bg-[#0a0a0c] border border-[#1c1c22] rounded-md px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-[#8b8793] mb-1.5">一次服务价格</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full bg-[#0a0a0c] border border-[#1c1c22] rounded-md px-3 py-2.5 text-sm"
            />
          </div>
          {msg && <p className="text-xs text-[#c9a87c]">{msg}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#c9a87c] text-[#070708] font-medium rounded-md hover:bg-[#d4b88a] disabled:opacity-50"
          >
            保存
          </button>
        </form>
      </main>
    </div>
  );
}

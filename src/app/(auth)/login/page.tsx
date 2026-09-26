"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "登录失败");
      setLoading(false);
      return;
    }
    if (data.role === "girl") router.push("/dashboard");
    else router.push("/browse");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <h1 className="text-2xl text-[#c9a87c] tracking-widest text-center mb-8">登录</h1>
        <form onSubmit={handleSubmit} className="bg-[#111114] border border-[#1c1c22] rounded-xl p-8 space-y-5">
          <div>
            <label className="block text-xs text-[#8b8793] mb-1.5">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#0a0a0c] border border-[#1c1c22] rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[#c9a87c]/50"
            />
          </div>
          <div>
            <label className="block text-xs text-[#8b8793] mb-1.5">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#0a0a0c] border border-[#1c1c22] rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[#c9a87c]/50"
            />
          </div>
          {error && <p className="text-[#a85c5c] text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#c9a87c] text-[#070708] font-medium rounded-md hover:bg-[#d4b88a] disabled:opacity-50"
          >
            {loading ? "登录中..." : "进入"}
          </button>
        </form>
        <p className="text-center text-sm text-[#8b8793] mt-6">
          还没有账号？{" "}
          <Link href="/register" className="text-[#c9a87c] hover:underline">
            注册
          </Link>
        </p>
      </div>
    </div>
  );
}

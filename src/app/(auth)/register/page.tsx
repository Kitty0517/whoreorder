"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<"client" | "girl">("client");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const r = searchParams.get("role");
    if (r === "girl" || r === "client") setRole(r);
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, displayName, role }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "注册失败");
      setLoading(false);
      return;
    }
    if (data.role === "girl") router.push("/dashboard");
    else router.push("/browse");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <h1 className="text-2xl text-[#c9a87c] tracking-widest text-center mb-2">注册</h1>
        <p className="text-center text-xs text-[#8b8793] mb-8">
          {role === "girl"
            ? "准备好被点名、被使用、写得很下贱了吗？"
            : "来点一个听话的赛博妓女"}
        </p>

        <form onSubmit={handleSubmit} className="bg-[#111114] border border-[#1c1c22] rounded-xl p-8 space-y-5">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setRole("girl")}
              className={`flex-1 py-2.5 text-sm rounded-md border transition ${
                role === "girl"
                  ? "border-[#c9a87c] bg-[#c9a87c]/15 text-[#c9a87c]"
                  : "border-[#1c1c22] text-[#8b8793]"
              }`}
            >
              我要当妓女
            </button>
            <button
              type="button"
              onClick={() => setRole("client")}
              className={`flex-1 py-2.5 text-sm rounded-md border transition ${
                role === "client"
                  ? "border-[#c9a87c] bg-[#c9a87c]/15 text-[#c9a87c]"
                  : "border-[#1c1c22] text-[#8b8793]"
              }`}
            >
              我是客人
            </button>
          </div>

          <div>
            <label className="block text-xs text-[#8b8793] mb-1.5">
              {role === "girl" ? "艺名 / 接客名" : "昵称"}
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              placeholder={role === "girl" ? "例如：晚晚、阿叙、林予安" : "怎么称呼你"}
              className="w-full bg-[#0a0a0c] border border-[#1c1c22] rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[#c9a87c]/50"
            />
          </div>

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
            <label className="block text-xs text-[#8b8793] mb-1.5">密码（至少6位）</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-[#0a0a0c] border border-[#1c1c22] rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[#c9a87c]/50"
            />
          </div>

          {error && <p className="text-[#a85c5c] text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#c9a87c] text-[#070708] font-medium rounded-md hover:bg-[#d4b88a] disabled:opacity-50"
          >
            {loading ? "注册中..." : role === "girl" ? "开始接客" : "进入点人"}
          </button>
        </form>

        <p className="text-center text-sm text-[#8b8793] mt-6">
          已有账号？{" "}
          <Link href="/login" className="text-[#c9a87c] hover:underline">
            登录
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[#8b8793]">加载中...</div>}>
      <RegisterForm />
    </Suspense>
  );
}

import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getCurrentUser();
  if (user) {
    if (user.role === "girl") redirect("/dashboard");
    else redirect("/browse");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <h1 className="text-4xl font-semibold tracking-widest text-[#c9a87c] mb-3">
          Noir Atelier
        </h1>
        <p className="text-[#8b8793] text-sm tracking-wider mb-10">
          赛博空间 · 沉浸式卖淫体验 · 仅供意淫
        </p>

        <div className="bg-[#111114] border border-[#1c1c22] rounded-xl p-8 space-y-6">
          <p className="text-[#e6e4e0] text-sm leading-relaxed">
            这里没有温柔的角色扮演。<br />
            只有被点名、被使用、被要求写得很脏、很听话的<strong>真正接客感</strong>。
          </p>

          <div className="flex flex-col gap-3 pt-2">
            <Link
              href="/register?role=girl"
              className="w-full py-3 bg-[#c9a87c] text-[#070708] font-medium text-center rounded-md hover:bg-[#d4b88a] transition"
            >
              我要当赛博妓女 · 开放注册
            </Link>
            <Link
              href="/register?role=client"
              className="w-full py-3 border border-[#c9a87c]/60 text-[#c9a87c] text-center rounded-md hover:bg-[#c9a87c]/10 transition"
            >
              我是客人 · 来点人
            </Link>
            <Link
              href="/login"
              className="text-[#8b8793] text-sm hover:text-[#c9a87c] transition pt-2"
            >
              已有账号？登录
            </Link>
          </div>
        </div>

        <p className="mt-10 text-xs text-[#5a5860]">
          本平台所有内容均为虚构幻想，不涉及任何真实交易或线下行为。
        </p>
      </div>
    </div>
  );
}

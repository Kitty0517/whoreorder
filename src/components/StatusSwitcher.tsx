"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function StatusSwitcher({ current }: { current: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function change(status: string) {
    setLoading(true);
    await fetch("/api/girls/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
    setLoading(false);
  }

  const options = [
    { value: "idle", label: "空闲可约" },
    { value: "busy", label: "接客中" },
    { value: "off", label: "今日已收工" },
  ];

  return (
    <div className="flex gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          disabled={loading}
          onClick={() => change(o.value)}
          className={`px-3 py-1.5 text-xs rounded-md border transition ${
            current === o.value
              ? "border-[#c9a87c] bg-[#c9a87c]/15 text-[#c9a87c]"
              : "border-[#1c1c22] text-[#8b8793] hover:border-[#3a3a42]"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

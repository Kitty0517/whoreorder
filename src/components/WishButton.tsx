"use client";
export function WishButton({ girlId }: { girlId: string }) {
  async function add() {
    await fetch("/api/wishlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ girlId }) });
    alert("已经把她放进今晚想点");
  }
  return <button onClick={add} className="text-xs border border-[#c9a87c]/40 text-[#c9a87c] px-3 py-1.5 rounded">放进今晚想点</button>;
}

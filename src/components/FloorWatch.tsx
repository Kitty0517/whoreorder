"use client";
import { useEffect } from "react";

export function FloorWatch({ girlIds }: { girlIds: string[] }) {
  useEffect(() => {
    if (!girlIds.length) return;
    const ping = () => {
      girlIds.slice(0, 12).forEach((id) => {
        fetch("/api/girls/watch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ girlId: id }),
        }).catch(() => {});
      });
    };
    ping();
    const t = setInterval(ping, 40000);
    return () => clearInterval(t);
  }, [girlIds.join(",")]);
  return null;
}

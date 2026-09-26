import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Noir Atelier · 高端幻想接客",
  description: "赛博空间里的沉浸式卖淫体验平台，仅供意淫",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600;700&family=Inter:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}

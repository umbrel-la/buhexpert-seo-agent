import type { Metadata } from "next";
import "./globals.css";
import "./redesign.css";
import "./article.css";
import "./article-fixes.css";
import "./personalized.css";

export const metadata: Metadata = {
  title: "БухЭксперт — ИИ-помощник по 1С",
  description: "Демонстрационный ИИ-помощник по материалам БухЭксперта",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}

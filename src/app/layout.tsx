import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin", "cyrillic"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "Мастер 39 | Услуги мастеров в Калининграде",
  description: "Быстрый вызов мастера на час в Калининграде. Сантехник, электрик, сборка мебели, мелкий ремонт. Master39.online",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50">
        <header className="bg-blue-600 text-white p-4">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <Link href="/" className="text-xl font-bold">🔧 Мастер 39</Link>
            <nav className="flex gap-4 text-sm">
              <Link href="/masters" className="hover:underline">Мастера</Link>
              <Link href="/register" className="hover:underline">Стать мастером</Link>
              <Link href="/order" className="hover:underline">Заказать</Link>
              <Link href="/dashboard" className="hover:underline">Кабинет</Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 max-w-5xl mx-auto w-full p-4">{children}</main>
        <footer className="bg-gray-800 text-gray-400 text-sm p-4 text-center">
          © {new Date().getFullYear()} Мастер 39 — Калининград | master39.online
        </footer>
      </body>
    </html>
  );
}

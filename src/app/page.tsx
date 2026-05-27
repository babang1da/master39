import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const SPECIALTIES = [
  { icon: "🔧", name: "Сантехник", cssClass: "card-plumber", color: "#0ea5e9", bg: "bg-sky-50" },
  { icon: "⚡", name: "Электрик", cssClass: "card-electrician", color: "#f59e0b", bg: "bg-amber-50" },
  { icon: "🪚", name: "Сборка мебели", cssClass: "card-furniture", color: "#a16207", bg: "bg-yellow-50" },
  { icon: "🔨", name: "Мелкий ремонт", cssClass: "card-repair", color: "#f97316", bg: "bg-orange-50" },
  { icon: "🪟", name: "Окна и жалюзи", cssClass: "card-windows", color: "#06b6d4", bg: "bg-cyan-50" },
  { icon: "📺", name: "Техника и ТВ", cssClass: "card-tech", color: "#10b981", bg: "bg-emerald-50" },
];

export default async function HomePage() {
  const topMasters = await prisma.master.findMany({
    where: { isActive: true },
    include: { user: true },
    orderBy: { rating: "desc" },
    take: 6,
  });

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="hero-gradient rounded-2xl p-8 md:p-12 text-center">
        <h1 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900">
          🔧 Мастер 39 — услуги в Калининграде
        </h1>
        <p className="text-lg text-gray-700 mb-8 max-w-xl mx-auto">
          Сантехник, электрик, сборка мебели, мелкий ремонт — быстро, честно, без посредников
        </p>
        <Link href="/order" className="btn-cta inline-block text-white px-10 py-4 rounded-xl text-lg font-bold">
          Заказать мастера
        </Link>
      </section>

      {/* Specialties */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">🛠 Услуги</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {SPECIALTIES.map((s) => (
            <Link
              key={s.name}
              href={`/masters?specialty=${encodeURIComponent(s.name)}`}
              className={`${s.cssClass} ${s.bg} rounded-xl p-6 text-center shadow-sm hover:shadow-lg border border-transparent hover:border-gray-200 transition-all duration-200`}
            >
              <div className="text-4xl mb-3">{s.icon}</div>
              <div className="font-semibold text-gray-800">{s.name}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Top masters */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">⭐ Лучшие мастера</h2>
          <Link href="/masters" className="text-orange-500 hover:underline font-medium">Все мастера →</Link>
        </div>
        {topMasters.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-500 border border-dashed border-gray-300">
            <p className="text-lg mb-1">😔 Пока нет зарегистрированных мастеров</p>
            <p className="text-sm mb-4 text-gray-400">Станьте первым!</p>
            <Link href="/register" className="btn-cta inline-block text-white px-6 py-2 rounded-lg text-sm font-semibold">
              Стать первым мастером →
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topMasters.map((m) => (
              <Link
                key={m.id}
                href={`/masters/${m.id}`}
                className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md border border-gray-100 transition-all duration-200"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-800">{m.user.name}</h3>
                  <span className="text-amber-500 font-bold">★ {m.rating.toFixed(1)}</span>
                </div>
                <p className="text-sm text-gray-500 mb-2">{m.specialties || "Универсал"}</p>
                <p className="font-bold text-orange-500 text-lg">{m.pricePerHour} ₽/час</p>
                <p className="text-xs text-gray-400 mt-2">{m.user.city}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
        <h2 className="text-2xl font-bold mb-8 text-center text-gray-800">🚀 Как это работает</h2>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="step-icon step-1">1</div>
            <h3 className="font-bold mb-1 text-gray-800">Оставьте заявку</h3>
            <p className="text-sm text-gray-500">Выберите услугу, опишите задачу, укажите адрес</p>
          </div>
          <div>
            <div className="step-icon step-2">2</div>
            <h3 className="font-bold mb-1 text-gray-800">Мастер назначен</h3>
            <p className="text-sm text-gray-500">Ближайший свободный мастер примет заказ</p>
          </div>
          <div>
            <div className="step-icon step-3">3</div>
            <h3 className="font-bold mb-1 text-gray-800">Работа выполнена</h3>
            <p className="text-sm text-gray-500">Оплата после выполнения. Оставьте отзыв</p>
          </div>
        </div>
      </section>
    </div>
  );
}

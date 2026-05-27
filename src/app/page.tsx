import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const SPECIALTIES = [
  { icon: "🔧", name: "Сантехник" },
  { icon: "⚡", name: "Электрик" },
  { icon: "🪚", name: "Сборка мебели" },
  { icon: "🔨", name: "Мелкий ремонт" },
  { icon: "🪟", name: "Окна и жалюзи" },
  { icon: "📺", name: "Техника и ТВ" },
];

export default async function HomePage() {
  const topMasters = await prisma.master.findMany({
    where: { isActive: true },
    include: { user: true },
    orderBy: { rating: "desc" },
    take: 6,
  });

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold mb-4">Мастер 39 — услуги в Калининграде</h1>
        <p className="text-lg text-gray-600 mb-6 max-w-xl mx-auto">
          Сантехник, электрик, сборка мебели, мелкий ремонт — быстро, честно, без посредников
        </p>
        <Link
          href="/order"
          className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700"
        >
          Заказать мастера
        </Link>
      </section>

      {/* Specialties */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Услуги</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {SPECIALTIES.map((s) => (
            <Link
              key={s.name}
              href={`/masters?specialty=${encodeURIComponent(s.name)}`}
              className="bg-white rounded-xl p-6 text-center shadow hover:shadow-md border"
            >
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="font-semibold">{s.name}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Top masters */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Лучшие мастера</h2>
          <Link href="/masters" className="text-blue-600 hover:underline">Все мастера →</Link>
        </div>
        {topMasters.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-500 border">
            <p className="text-lg mb-4">Пока нет зарегистрированных мастеров</p>
            <Link href="/register" className="text-blue-600 hover:underline">Стать первым мастером →</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topMasters.map((m) => (
              <Link
                key={m.id}
                href={`/masters/${m.id}`}
                className="bg-white rounded-xl p-5 shadow hover:shadow-md border"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{m.user.name}</h3>
                  <span className="text-yellow-500">★ {m.rating.toFixed(1)}</span>
                </div>
                <p className="text-sm text-gray-500 mb-2">{m.specialties || "Универсал"}</p>
                <p className="font-semibold text-blue-600">{m.pricePerHour} ₽/час</p>
                <p className="text-xs text-gray-400 mt-2">{m.user.city}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="bg-white rounded-xl p-8 border">
        <h2 className="text-2xl font-bold mb-6 text-center">Как это работает</h2>
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-4xl mb-2">1️⃣</div>
            <h3 className="font-bold mb-1">Оставьте заявку</h3>
            <p className="text-sm text-gray-600">Выберите услугу, опишите задачу, укажите адрес</p>
          </div>
          <div>
            <div className="text-4xl mb-2">2️⃣</div>
            <h3 className="font-bold mb-1">Мастер назначен</h3>
            <p className="text-sm text-gray-600">Ближайший свободный мастер примет заказ</p>
          </div>
          <div>
            <div className="text-4xl mb-2">3️⃣</div>
            <h3 className="font-bold mb-1">Работа выполнена</h3>
            <p className="text-sm text-gray-600">Оплата после выполнения. Оставьте отзыв</p>
          </div>
        </div>
      </section>
    </div>
  );
}

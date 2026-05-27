import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function MasterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const master = await prisma.master.findUnique({
    where: { id },
    include: { user: true, reviews: { orderBy: { createdAt: "desc" }, take: 10 } },
  });

  if (!master) notFound();

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Link href="/masters" className="text-blue-600 hover:underline text-sm mb-4 inline-block">← Все мастера</Link>
      <div className="bg-white rounded-xl p-6 border shadow">
        <h1 className="text-2xl font-bold mb-2">{master.user.name}</h1>
        <div className="flex gap-4 text-sm text-gray-500 mb-4">
          <span>{master.user.city}</span>
          <span>★ {master.rating.toFixed(1)} ({master.reviewCount} отзывов)</span>
          <span>Опыт {master.experience} лет</span>
        </div>
        <p className="mb-4">{master.description || "Нет описания"}</p>
        <p className="text-sm text-gray-500 mb-1">Специализация: {master.specialties || "Универсал"}</p>
        <p className="text-2xl font-bold text-blue-600 mb-4">{master.pricePerHour} ₽/час</p>
        <Link href={`/order?masterId=${master.id}`} className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700">Заказать</Link>
      </div>

      {master.reviews.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Отзывы</h2>
          <div className="space-y-3">
            {master.reviews.map((r) => (
              <div key={r.id} className="bg-white rounded-lg p-4 border">
                <div className="text-yellow-500 mb-1">{"★".repeat(r.rating)}</div>
                <p className="text-sm">{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

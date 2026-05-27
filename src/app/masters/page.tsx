import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function MastersPage({ searchParams }: { searchParams: Promise<{ specialty?: string }> }) {
  const { specialty } = await searchParams;
  const masters = await prisma.master.findMany({
    where: {
      isActive: true,
      ...(specialty ? { specialties: { contains: specialty } } : {}),
    },
    include: { user: true },
    orderBy: { rating: "desc" },
  });

  return (
    <div className="py-8">
      <h1 className="text-2xl font-bold mb-6">Мастера в Калининграде</h1>
      {masters.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center border">
          <p className="text-gray-500">Мастера не найдены</p>
          <Link href="/register" className="text-blue-600 hover:underline mt-2 block">Стать первым →</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {masters.map((m) => (
            <Link key={m.id} href={`/masters/${m.id}`} className="bg-white rounded-xl p-5 shadow hover:shadow-md border block">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg">{m.user.name}</h3>
                <span className="text-yellow-500">★ {m.rating.toFixed(1)} ({m.reviewCount})</span>
              </div>
              <p className="text-sm text-gray-500 mb-2">{m.specialties || "Универсал"}</p>
              <p className="text-sm text-gray-500 mb-3">{m.description?.slice(0, 100)}</p>
              <p className="font-semibold text-blue-600">{m.pricePerHour} ₽/час</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/dashboard?phone=... — stats + orders for master
export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get("phone");
  if (!phone) {
    return NextResponse.json({ error: "Укажите телефон" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { phone },
    include: { masterProfile: true },
  });

  if (!user || user.role !== "MASTER" || !user.masterProfile) {
    return NextResponse.json({ error: "Мастер не найден" }, { status: 404 });
  }

  const master = user.masterProfile;

  // Aggregate stats
  const [totalOrders, doneOrders, inProgressOrders, totalRevenue] = await Promise.all([
    prisma.order.count({ where: { masterId: master.id } }),
    prisma.order.count({ where: { masterId: master.id, status: "DONE" } }),
    prisma.order.count({ where: { masterId: master.id, status: { in: ["ASSIGNED", "IN_PROGRESS"] } } }),
    prisma.order.aggregate({
      where: { masterId: master.id, status: "DONE" },
      _sum: { price: true },
    }),
  ]);

  // Recent orders
  const orders = await prisma.order.findMany({
    where: { masterId: master.id },
    include: { client: { select: { name: true, phone: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({
    master: {
      id: master.id,
      name: user.name,
      phone: user.phone,
      city: user.city,
      specialties: master.specialties,
      pricePerHour: master.pricePerHour,
      experience: master.experience,
      description: master.description,
      rating: master.rating,
      reviewCount: master.reviewCount,
      isActive: master.isActive,
    },
    stats: {
      totalOrders,
      doneOrders,
      inProgress: inProgressOrders,
      revenue: totalRevenue._sum.price || 0,
    },
    orders,
  });
}

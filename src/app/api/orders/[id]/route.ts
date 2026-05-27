import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VALID_STATUSES = ["NEW", "ASSIGNED", "IN_PROGRESS", "DONE", "CANCELLED"];

// PATCH /api/orders/[id] — update order status and price
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { status, price, phone } = body;

  // Verify the master owns this order
  if (phone) {
    const user = await prisma.user.findUnique({
      where: { phone },
      include: { masterProfile: true },
    });
    if (!user?.masterProfile) {
      return NextResponse.json({ error: "Мастер не найден" }, { status: 403 });
    }
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order || order.masterId !== user.masterProfile.id) {
      return NextResponse.json({ error: "Заказ не найден или не ваш" }, { status: 403 });
    }
  }

  if (status && !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Недопустимый статус" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (status) data.status = status;
  if (price !== undefined) data.price = price;

  const updated = await prisma.order.update({
    where: { id },
    data,
    include: { client: { select: { name: true, phone: true } } },
  });

  return NextResponse.json(updated);
}

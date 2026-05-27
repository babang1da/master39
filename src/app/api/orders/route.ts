import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const { name, phone, service, description, city, address } = body;

  if (!phone || !service) {
    return NextResponse.json({ error: "Телефон и услуга обязательны" }, { status: 400 });
  }

  // Find or create client
  let client = await prisma.user.findUnique({ where: { phone } });
  if (!client && name) {
    client = await prisma.user.create({
      data: { name, phone, role: "CLIENT", city: city || "Калининград" },
    });
  }
  if (!client) {
    return NextResponse.json({ error: "Имя обязательно для нового клиента" }, { status: 400 });
  }

  // Find matching master
  const master = await prisma.master.findFirst({
    where: { isActive: true, specialties: { contains: service } },
    include: { user: true },
    orderBy: { rating: "desc" },
  });

  const order = await prisma.order.create({
    data: {
      clientId: client.id,
      masterId: master?.id,
      service,
      description: description || "",
      city: city || "Калининград",
      address: address || "",
      status: master ? "ASSIGNED" : "NEW",
    },
    include: { client: true, master: { include: { user: true } } },
  });

  return NextResponse.json(order);
}

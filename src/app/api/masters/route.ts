import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const { name, phone, city, specialties, pricePerHour, experience, description } = body;

  if (!name || !phone) {
    return NextResponse.json({ error: "Имя и телефон обязательны" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) {
    return NextResponse.json({ error: "Мастер с таким телефоном уже зарегистрирован" }, { status: 400 });
  }

  const user = await prisma.user.create({
    data: {
      name,
      phone,
      city: city || "Калининград",
      role: "MASTER",
      masterProfile: {
        create: {
          specialties: specialties || "Универсал",
          pricePerHour: pricePerHour || 500,
          experience: experience || 0,
          description: description || "",
        },
      },
    },
    include: { masterProfile: true },
  });

  return NextResponse.json(user);
}

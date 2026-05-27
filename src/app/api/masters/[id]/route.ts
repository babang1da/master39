import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/masters/[id] — update master profile
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { phone, specialties, pricePerHour, experience, description, isActive, name, city } = body;

  // Verify ownership
  if (!phone) {
    return NextResponse.json({ error: "Телефон обязателен для подтверждения" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { phone },
    include: { masterProfile: true },
  });

  if (!user?.masterProfile || user.masterProfile.id !== id) {
    return NextResponse.json({ error: "Нет доступа к этому профилю" }, { status: 403 });
  }

  // Update Master fields
  const masterData: Record<string, unknown> = {};
  if (specialties !== undefined) masterData.specialties = specialties;
  if (pricePerHour !== undefined) masterData.pricePerHour = pricePerHour;
  if (experience !== undefined) masterData.experience = experience;
  if (description !== undefined) masterData.description = description;
  if (isActive !== undefined) masterData.isActive = isActive;

  const [updatedMaster] = await Promise.all([
    prisma.master.update({
      where: { id },
      data: masterData,
      include: { user: { select: { name: true, phone: true, city: true } } },
    }),
    // Update User fields if provided
    name || city
      ? prisma.user.update({
          where: { phone },
          data: {
            ...(name ? { name } : {}),
            ...(city ? { city } : {}),
          },
        })
      : Promise.resolve(null),
  ]);

  return NextResponse.json(updatedMaster);
}

import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import "dotenv/config";

const prisma = new PrismaClient({
  adapter: new PrismaLibSql({ url: process.env.DATABASE_URL! }),
});

async function main() {
  const masters = [
    { name: "Александр Петров", phone: "+790****0001", specialties: "Сантехник,Электрик", price: 600, exp: 8, desc: "Опытный сантехник и электрик." },
    { name: "Дмитрий Иванов", phone: "+790****0002", specialties: "Сборка мебели,Мелкий ремонт", price: 500, exp: 3, desc: "Соберу любую мебель. Аккуратно и быстро." },
    { name: "Сергей Волков", phone: "+790****0003", specialties: "Окна и жалюзи,Мелкий ремонт", price: 550, exp: 5, desc: "Установка окон, жалюзи, герметизация." },
    { name: "Андрей Смирнов", phone: "+790****0004", specialties: "Техника и ТВ,Электрик", price: 700, exp: 10, desc: "Настройка ТВ, электрика, интернет." },
    { name: "Максим Козлов", phone: "+790****0005", specialties: "Сантехник,Сборка мебели", price: 500, exp: 4, desc: "Замена смесителей, сборка мебели, ремонт." },
  ];

  for (const m of masters) {
    const existing = await prisma.user.findUnique({ where: { phone: m.phone } });
    if (!existing) {
      await prisma.user.create({
        data: {
          name: m.name,
          phone: m.phone,
          role: "MASTER",
          city: "Калининград",
          masterProfile: {
            create: {
              specialties: m.specialties,
              pricePerHour: m.price,
              experience: m.exp,
              description: m.desc,
              rating: 4.5 + Math.random() * 0.5,
              reviewCount: Math.floor(Math.random() * 20) + 1,
            },
          },
        },
      });
    }
  }

  console.log("✓ 5 мастеров добавлено");
}

main().then(() => prisma.$disconnect());

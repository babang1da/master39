"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OrderPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", phone: "", service: "Сантехник", description: "", city: "Калининград", address: "" });
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);

  const submit = async () => {
    setLoading(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setOk(true);
    }
    setLoading(false);
  };

  if (ok) return (
    <div className="max-w-lg mx-auto py-16 text-center">
      <div className="text-5xl mb-4">✅</div>
      <h1 className="text-2xl font-bold mb-2">Заявка принята!</h1>
      <p className="text-gray-600 mb-4">Мастер свяжется с вами в ближайшее время.</p>
      <button onClick={() => router.push("/")} className="text-blue-600 hover:underline">На главную</button>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Заказать мастера</h1>
      <div className="space-y-4">
        <input className="w-full border p-3 rounded" placeholder="Ваше имя" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="w-full border p-3 rounded" placeholder="Телефон" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <select className="w-full border p-3 rounded" value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })}>
          {["Сантехник", "Электрик", "Сборка мебели", "Мелкий ремонт", "Окна и жалюзи", "Техника и ТВ", "Другое"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <input className="w-full border p-3 rounded" placeholder="Город" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        <input className="w-full border p-3 rounded" placeholder="Адрес" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        <textarea className="w-full border p-3 rounded" placeholder="Опишите задачу" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <button onClick={submit} disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded font-semibold hover:bg-blue-700 disabled:opacity-50">
          {loading ? "Отправка..." : "Отправить заявку"}
        </button>
      </div>
    </div>
  );
}

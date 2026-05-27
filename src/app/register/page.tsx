"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", phone: "", city: "Калининград", specialties: "", pricePerHour: "500", experience: "0", description: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setLoading(true);
    setError("");
    const res = await fetch("/api/masters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, pricePerHour: Number(form.pricePerHour), experience: Number(form.experience) }),
    });
    if (res.ok) {
      router.push("/masters");
    } else {
      const data = await res.json();
      setError(data.error || "Ошибка регистрации");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Стать мастером</h1>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      <div className="space-y-4">
        <input className="w-full border p-3 rounded" placeholder="Имя и фамилия" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="w-full border p-3 rounded" placeholder="Телефон +7..." value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input className="w-full border p-3 rounded" placeholder="Город" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        <input className="w-full border p-3 rounded" placeholder="Специальности через запятую" value={form.specialties} onChange={(e) => setForm({ ...form, specialties: e.target.value })} />
        <input className="w-full border p-3 rounded" type="number" placeholder="Цена за час (₽)" value={form.pricePerHour} onChange={(e) => setForm({ ...form, pricePerHour: e.target.value })} />
        <input className="w-full border p-3 rounded" type="number" placeholder="Опыт (лет)" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
        <textarea className="w-full border p-3 rounded" placeholder="О себе" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <button onClick={submit} disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded font-semibold hover:bg-blue-700 disabled:opacity-50">
          {loading ? "Регистрация..." : "Зарегистрироваться"}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";

interface Order {
  id: string;
  service: string;
  description: string;
  address: string;
  city: string;
  price: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  client: { name: string; phone: string };
}

interface Master {
  id: string;
  name: string;
  phone: string;
  city: string;
  specialties: string;
  pricePerHour: number;
  experience: number;
  description: string;
  rating: number;
  reviewCount: number;
  isActive: boolean;
}

interface Stats {
  totalOrders: number;
  doneOrders: number;
  inProgress: number;
  revenue: number;
}

interface DashboardData {
  master: Master;
  stats: Stats;
  orders: Order[];
}

const STATUS_NAMES: Record<string, string> = {
  NEW: "Новый",
  ASSIGNED: "Назначен",
  IN_PROGRESS: "В работе",
  DONE: "Выполнен",
  CANCELLED: "Отменён",
};

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-gray-100 text-gray-700",
  ASSIGNED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  DONE: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function DashboardPage() {
  const [phone, setPhone] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"orders" | "profile" | "stats">("orders");
  const [message, setMessage] = useState("");

  // Profile edit state
  const [profile, setProfile] = useState({
    name: "",
    city: "Калининград",
    specialties: "",
    pricePerHour: "500",
    experience: "0",
    description: "",
  });

  const fetchDashboard = useCallback(async (masterPhone: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/dashboard?phone=${encodeURIComponent(masterPhone)}`);
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Мастер не найден");
        return;
      }
      const json: DashboardData = await res.json();
      setData(json);
      setProfile({
        name: json.master.name,
        city: json.master.city,
        specialties: json.master.specialties,
        pricePerHour: String(json.master.pricePerHour),
        experience: String(json.master.experience),
        description: json.master.description,
      });
      setLoggedIn(true);
    } catch {
      setError("Ошибка соединения");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    fetchDashboard(phone.trim());
  };

  const updateOrderStatus = async (orderId: string, newStatus: string, newPrice?: number) => {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, price: newPrice, phone }),
    });
    if (res.ok && data) {
      const updated = await res.json();
      setData({
        ...data,
        orders: data.orders.map((o) => (o.id === orderId ? { ...o, status: updated.status, price: updated.price } : o)),
      });
      setMessage("Статус обновлён");
      setTimeout(() => setMessage(""), 2000);
    }
  };

  const saveProfile = async () => {
    if (!data) return;
    const res = await fetch(`/api/masters/${data.master.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone,
        name: profile.name,
        city: profile.city,
        specialties: profile.specialties,
        pricePerHour: Number(profile.pricePerHour),
        experience: Number(profile.experience),
        description: profile.description,
      }),
    });
    if (res.ok) {
      const updated = await res.json();
      setData({ ...data, master: { ...data.master, ...updated, name: profile.name, city: profile.city } });
      setMessage("Профиль сохранён");
      setTimeout(() => setMessage(""), 2000);
    }
  };

  const toggleActive = async () => {
    if (!data) return;
    const res = await fetch(`/api/masters/${data.master.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, isActive: !data.master.isActive }),
    });
    if (res.ok) {
      setData({ ...data, master: { ...data.master, isActive: !data.master.isActive } });
      setMessage(data.master.isActive ? "Профиль скрыт" : "Профиль активен");
      setTimeout(() => setMessage(""), 2000);
    }
  };

  if (!loggedIn) {
    return (
      <div className="max-w-sm mx-auto py-16">
        <h1 className="text-2xl font-bold mb-2">Личный кабинет мастера</h1>
        <p className="text-gray-500 mb-6">Войдите по номеру телефона</p>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            className="w-full border p-3 rounded text-lg"
            placeholder="+79111234567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Поиск..." : "Войти"}
          </button>
        </form>
      </div>
    );
  }

  if (!data) return null;

  const { master, stats, orders } = data;

  return (
    <div className="max-w-3xl mx-auto py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{master.name}</h1>
          <p className="text-gray-500">
            {master.city} • ★ {master.rating.toFixed(1)} ({master.reviewCount} отзывов)
          </p>
        </div>
        <button
          onClick={() => { setLoggedIn(false); setData(null); }}
          className="text-sm text-gray-500 hover:text-red-500"
        >
          Выйти
        </button>
      </div>

      {message && (
        <div className="bg-green-100 text-green-700 p-2 rounded mb-4 text-sm text-center">{message}</div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Заказов", value: stats.totalOrders },
          { label: "В работе", value: stats.inProgress },
          { label: "Выполнено", value: stats.doneOrders },
          { label: "Доход", value: `${stats.revenue.toLocaleString()} ₽` },
        ].map((s) => (
          <div key={s.label} className="bg-white border rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b">
        {[
          ["orders", "Заказы"],
          ["profile", "Профиль"],
          ["stats", "Статистика"],
        ].map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as typeof activeTab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <div className="space-y-3">
          {orders.length === 0 && <p className="text-gray-500 text-center py-8">Нет заказов</p>}
          {orders.map((order) => (
            <div key={order.id} className="bg-white border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="font-semibold">{order.service}</span>
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded ${STATUS_COLORS[order.status] || "bg-gray-100"}`}>
                    {STATUS_NAMES[order.status] || order.status}
                  </span>
                </div>
                <span className="font-bold text-blue-600">{order.price > 0 ? `${order.price} ₽` : "—"}</span>
              </div>
              {order.description && <p className="text-sm text-gray-600 mb-1">{order.description}</p>}
              <div className="text-xs text-gray-400 mb-2">
                {order.address && `${order.address} • `}
                {order.client.name} • {new Date(order.createdAt).toLocaleDateString("ru")}
              </div>
              {/* Actions */}
              <div className="flex gap-1 flex-wrap">
                {order.status === "ASSIGNED" && (
                  <>
                    <button
                      onClick={() => updateOrderStatus(order.id, "IN_PROGRESS")}
                      className="text-xs bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                    >
                      Начать работу
                    </button>
                    <button
                      onClick={() => updateOrderStatus(order.id, "CANCELLED")}
                      className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    >
                      Отказаться
                    </button>
                  </>
                )}
                {order.status === "IN_PROGRESS" && (
                  <button
                    onClick={() => {
                      const price = prompt("Стоимость работы (₽):", String(order.price || master.pricePerHour * 2));
                      if (price) updateOrderStatus(order.id, "DONE", Number(price));
                    }}
                    className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                  >
                    Завершить
                  </button>
                )}
                {order.status === "DONE" && (
                  <span className="text-xs text-green-600">✓ Выполнен {new Date(order.updatedAt || order.createdAt).toLocaleDateString("ru")}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="bg-white border rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">Редактирование профиля</h2>
            <button
              onClick={toggleActive}
              className={`text-sm px-3 py-1 rounded ${master.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
            >
              {master.isActive ? "Активен" : "Скрыт"}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Имя</label>
              <input className="w-full border p-2 rounded" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Город</label>
              <input className="w-full border p-2 rounded" value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Специализации</label>
              <input className="w-full border p-2 rounded" value={profile.specialties} onChange={(e) => setProfile({ ...profile, specialties: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Цена за час (₽)</label>
              <input className="w-full border p-2 rounded" type="number" value={profile.pricePerHour} onChange={(e) => setProfile({ ...profile, pricePerHour: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Опыт (лет)</label>
              <input className="w-full border p-2 rounded" type="number" value={profile.experience} onChange={(e) => setProfile({ ...profile, experience: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-1 block">О себе</label>
            <textarea className="w-full border p-2 rounded" rows={3} value={profile.description} onChange={(e) => setProfile({ ...profile, description: e.target.value })} />
          </div>
          <button onClick={saveProfile} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Сохранить</button>
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === "stats" && (
        <div className="bg-white border rounded-lg p-6">
          <h2 className="font-semibold text-lg mb-4">Детальная статистика</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm text-gray-500 mb-2">Заказы</h3>
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-gray-600">Всего</span><span className="font-bold">{stats.totalOrders}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Выполнено</span><span className="font-bold text-green-600">{stats.doneOrders}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">В работе</span><span className="font-bold text-yellow-600">{stats.inProgress}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Отменено</span><span className="font-bold text-red-600">{stats.totalOrders - stats.doneOrders - stats.inProgress}</span></div>
              </div>
            </div>
            <div>
              <h3 className="text-sm text-gray-500 mb-2">Показатели</h3>
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-gray-600">Доход</span><span className="font-bold text-blue-600">{stats.revenue.toLocaleString()} ₽</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Рейтинг</span><span className="font-bold">★ {master.rating.toFixed(1)}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Отзывов</span><span className="font-bold">{master.reviewCount}</span></div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Средний чек</span>
                  <span className="font-bold">
                    {stats.doneOrders > 0 ? `${Math.round(stats.revenue / stats.doneOrders).toLocaleString()} ₽` : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

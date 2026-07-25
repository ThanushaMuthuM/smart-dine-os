import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav } from "@/components/site-nav";
import { CheckCircle2, ChefHat, Utensils, Bell, ShieldCheck, Clock, ArrowRight, ShoppingBag } from "lucide-react";

type Order = {
  id: string;
  status: string;
  total: number;
  table_number: string | null;
  created_at: string;
  order_items: { id: string; name_snapshot: string; price_snapshot: number; quantity: number }[];
};

const STAGES = [
  { key: "received", label: "Received", icon: CheckCircle2 },
  { key: "assigned", label: "Chef assigned", icon: ChefHat },
  { key: "cooking", label: "Cooking", icon: ChefHat },
  { key: "quality_check", label: "Quality check", icon: ShieldCheck },
  { key: "ready", label: "Ready", icon: Bell },
  { key: "serving", label: "Serving", icon: Utensils },
  { key: "completed", label: "Completed", icon: CheckCircle2 },
];

export const Route = createFileRoute("/_authenticated/orders")({
  head: () => ({
    meta: [
      { title: "My Orders — RestaurantOS AI" },
      { name: "description", content: "Track your live orders in real time." },
      { property: "og:title", content: "My Orders — RestaurantOS AI" },
      { property: "og:description", content: "Live order tracking with realtime status updates." },
    ],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const { data } = await supabase
        .from("orders")
        .select("id, status, total, table_number, created_at, order_items(id, name_snapshot, price_snapshot, quantity)")
        .order("created_at", { ascending: false })
        .limit(20);
      if (mounted && data) setOrders(data as unknown as Order[]);
      setLoading(false);
    }
    load();

    const channel = supabase.channel("orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => load())
      .subscribe();

    return () => { mounted = false; supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="min-h-screen">
      <SiteNav />
      <section className="mx-auto max-w-5xl px-4 py-10 md:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary">Live</p>
            <h1 className="mt-2 font-display text-4xl italic tracking-tight md:text-5xl">Your orders</h1>
            <p className="mt-2 text-sm text-muted-foreground">Watch every stage from pass to plate in realtime.</p>
          </div>
          <Link to="/menu" className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:bg-accent">
            Order more <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 space-y-4">
          {loading ? (
            Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-48 animate-pulse rounded-3xl border border-border bg-card" />)
          ) : orders.length === 0 ? (
            <div className="grid place-items-center rounded-3xl border border-dashed border-border py-24 text-center">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">No orders yet</p>
              <p className="mt-1 text-xs text-muted-foreground">Place your first order from the menu.</p>
              <Link to="/menu" className="mt-4 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-glow">Browse menu</Link>
            </div>
          ) : (
            orders.map((o) => <OrderCard key={o.id} order={o} />)
          )}
        </div>
      </section>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const currentIdx = Math.max(0, STAGES.findIndex((s) => s.key === order.status));
  const isCancelled = order.status === "cancelled";
  const date = new Date(order.created_at);

  return (
    <article className="rounded-3xl border border-border bg-card p-6 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">Order #{order.id.slice(0, 8)} · Table {order.table_number ?? "—"}</p>
          <h3 className="mt-1 text-lg font-semibold">{isCancelled ? "Cancelled" : STAGES[currentIdx]?.label}</h3>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" /> {date.toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold">₹{Number(order.total).toFixed(0)}</p>
          <p className="text-xs text-muted-foreground">{order.order_items?.length ?? 0} items</p>
        </div>
      </div>

      {!isCancelled && (
        <ol className="mt-6 grid grid-cols-7 gap-1">
          {STAGES.map((s, i) => {
            const Icon = s.icon;
            const active = i <= currentIdx;
            return (
              <li key={s.key} className="flex flex-col items-center gap-2 text-center">
                <div className={`grid h-8 w-8 place-items-center rounded-full border transition ${active ? "border-primary bg-primary/20 text-primary" : "border-border text-muted-foreground"}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <span className={`text-[10px] leading-tight ${active ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
              </li>
            );
          })}
        </ol>
      )}

      <div className="mt-6 space-y-1.5 border-t border-border pt-4 text-sm">
        {order.order_items?.map((it) => (
          <div key={it.id} className="flex items-center justify-between text-muted-foreground">
            <span><span className="text-foreground">{it.quantity}×</span> {it.name_snapshot}</span>
            <span>₹{(Number(it.price_snapshot) * it.quantity).toFixed(0)}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

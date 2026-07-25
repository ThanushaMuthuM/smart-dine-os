import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { askAria } from "@/lib/ai-assistant.functions";
import { CartProvider, useCart, type CartItem } from "@/lib/cart";
import { SiteNav } from "@/components/site-nav";
import { toast } from "sonner";
import {
  Search, Filter, Flame, Leaf, Wheat, Clock, Sparkles, Star,
  Plus, Minus, ShoppingBag, X, Bot, Send, Loader2, Heart, ChevronRight,
} from "lucide-react";

type Category = { id: string; name: string; slug: string; sort_order: number };
type MenuItem = {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_veg: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  spice_level: number;
  calories: number | null;
  prep_time_min: number | null;
  is_chef_recommended: boolean;
  is_trending: boolean;
  rating: number | null;
  tags: string[] | null;
};

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Live Menu — RestaurantOS AI Demo" },
      { name: "description", content: "Browse the live demo menu, chat with Aria our AI concierge, and place an order — a taste of RestaurantOS AI." },
      { property: "og:title", content: "Live Menu — RestaurantOS AI" },
      { property: "og:description", content: "Scan-free QR menu with AI recommendations, dietary filters, and instant ordering." },
    ],
  }),
  component: () => (
    <CartProvider>
      <MenuPage />
    </CartProvider>
  ),
});

function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCat, setActiveCat] = useState<string>("all");
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState({ veg: false, vegan: false, gf: false, chef: false });
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [ariaOpen, setAriaOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const [cats, its] = await Promise.all([
        supabase.from("menu_categories").select("*").order("sort_order"),
        supabase.from("menu_items").select("*").order("is_chef_recommended", { ascending: false }),
      ]);
      if (cats.data) setCategories(cats.data as Category[]);
      if (its.data) setItems(its.data as unknown as MenuItem[]);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    return items.filter((it) => {
      if (activeCat !== "all" && it.category_id !== activeCat) return false;
      if (filters.veg && !it.is_veg) return false;
      if (filters.vegan && !it.is_vegan) return false;
      if (filters.gf && !it.is_gluten_free) return false;
      if (filters.chef && !it.is_chef_recommended) return false;
      if (q) {
        const s = q.toLowerCase();
        if (!it.name.toLowerCase().includes(s) && !(it.description ?? "").toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [items, activeCat, filters, q]);

  return (
    <div className="min-h-screen">
      <SiteNav />

      {/* Hero strip */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="pointer-events-none absolute inset-0 opacity-60" style={{ background: "var(--gradient-hero)" }} />
        <div className="relative mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary">Table · 12 · Demo restaurant</p>
              <h1 className="mt-2 font-display text-4xl italic tracking-tight md:text-5xl">Tonight's menu</h1>
              <p className="mt-2 max-w-lg text-sm text-muted-foreground">Curated by our chefs, guided by Aria. Tap any dish to add — or ask Aria for a recommendation.</p>
            </div>
            <button onClick={() => setAriaOpen(true)} className="group inline-flex items-center gap-2 rounded-full border border-primary/40 glass-strong px-4 py-2.5 text-sm font-medium shadow-glow transition hover:bg-primary/10">
              <div className="grid h-6 w-6 place-items-center rounded-full bg-primary/20"><Bot className="h-3.5 w-3.5 text-primary" /></div>
              Ask Aria — your AI concierge
              <ChevronRight className="h-4 w-4 opacity-60 transition group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* Search + filters */}
          <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search truffle, coffee, spicy…" className="w-full rounded-full border border-border bg-input py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Chip active={filters.veg} onClick={() => setFilters((f) => ({ ...f, veg: !f.veg }))}><Leaf className="h-3.5 w-3.5" /> Veg</Chip>
              <Chip active={filters.vegan} onClick={() => setFilters((f) => ({ ...f, vegan: !f.vegan }))}><Leaf className="h-3.5 w-3.5" /> Vegan</Chip>
              <Chip active={filters.gf} onClick={() => setFilters((f) => ({ ...f, gf: !f.gf }))}><Wheat className="h-3.5 w-3.5" /> Gluten-free</Chip>
              <Chip active={filters.chef} onClick={() => setFilters((f) => ({ ...f, chef: !f.chef }))}><Sparkles className="h-3.5 w-3.5" /> Chef's pick</Chip>
            </div>
          </div>
        </div>
      </section>

      {/* Category tabs */}
      <section className="sticky top-16 z-30 border-b border-border/60 glass-strong">
        <div className="mx-auto max-w-7xl overflow-x-auto px-4 md:px-6">
          <div className="flex gap-1 py-3">
            <CatTab active={activeCat === "all"} onClick={() => setActiveCat("all")}>All</CatTab>
            {categories.map((c) => (
              <CatTab key={c.id} active={activeCat === c.id} onClick={() => setActiveCat(c.id)}>{c.name}</CatTab>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl border border-border bg-card" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="grid place-items-center rounded-3xl border border-dashed border-border py-24 text-center">
            <Filter className="h-6 w-6 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium">Nothing matches those filters</p>
            <p className="mt-1 text-xs text-muted-foreground">Try clearing a filter or asking Aria for ideas.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((it) => <DishCard key={it.id} item={it} />)}
          </div>
        )}
      </section>

      {/* Floating cart button */}
      <FloatingCart onOpen={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Aria chat */}
      <AriaChat open={ariaOpen} onClose={() => setAriaOpen(false)} items={items} />
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${active ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>
      {children}
    </button>
  );
}

function CatTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition ${active ? "bg-primary text-primary-foreground shadow-glow" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}>
      {children}
    </button>
  );
}

function DishCard({ item }: { item: MenuItem }) {
  const { add } = useCart();
  const [fav, setFav] = useState(false);

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-card transition hover:border-primary/40 hover:shadow-elevated">
      <div className="relative aspect-[4/3] overflow-hidden">
        {item.image_url ? (
          <img loading="lazy" src={item.image_url} alt={item.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="h-full w-full bg-accent" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {item.is_chef_recommended && <Badge tone="primary"><Sparkles className="h-3 w-3" /> Chef</Badge>}
          {item.is_trending && <Badge tone="warning"><Flame className="h-3 w-3" /> Trending</Badge>}
        </div>
        <button onClick={() => setFav((f) => !f)} className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full glass-strong transition hover:bg-primary/20">
          <Heart className={`h-4 w-4 ${fav ? "fill-primary text-primary" : "text-foreground"}`} />
        </button>
        <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full glass-strong px-2 py-0.5 text-xs">
          <Star className="h-3 w-3 fill-primary text-primary" /> {item.rating?.toFixed(1) ?? "4.5"}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold tracking-tight">{item.name}</h3>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">₹{item.price.toFixed(0)}</p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          <span className={`inline-flex h-4 w-4 items-center justify-center rounded-sm border ${item.is_veg ? "border-success text-success" : "border-destructive text-destructive"}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${item.is_veg ? "bg-success" : "bg-destructive"}`} />
          </span>
          {item.spice_level > 0 && <span className="inline-flex items-center gap-0.5">{Array.from({ length: item.spice_level }).map((_, i) => <Flame key={i} className="h-3 w-3 text-primary" />)}</span>}
          {item.prep_time_min && <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{item.prep_time_min}m</span>}
          {item.calories && <span>{item.calories} kcal</span>}
        </div>

        <button
          onClick={() => { add({ id: item.id, name: item.name, price: item.price, image_url: item.image_url }); toast.success(`Added ${item.name}`); }}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-2 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Add to order
        </button>
      </div>
    </article>
  );
}

function Badge({ tone, children }: { tone: "primary" | "warning"; children: React.ReactNode }) {
  const cls = tone === "primary" ? "bg-primary/90 text-primary-foreground" : "bg-warning/90 text-background";
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${cls}`}>{children}</span>;
}

function FloatingCart({ onOpen }: { onOpen: () => void }) {
  const { count, subtotal } = useCart();
  if (count === 0) return null;
  return (
    <button onClick={onOpen} className="fixed bottom-6 right-6 z-40 flex items-center gap-3 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-elevated animate-pulse-glow">
      <ShoppingBag className="h-4 w-4" />
      {count} item{count > 1 ? "s" : ""} · ₹{subtotal.toFixed(0)}
    </button>
  );
}

function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, setQty, remove, subtotal, clear } = useCart();
  const [placing, setPlacing] = useState(false);
  const navigate = useNavigate();

  async function checkout() {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      toast.info("Sign in to place your order");
      navigate({ to: "/auth", search: { redirect: "/menu" } });
      return;
    }
    if (items.length === 0) return;
    setPlacing(true);
    try {
      const tax = +(subtotal * 0.05).toFixed(2);
      const total = +(subtotal + tax).toFixed(2);
      const { data: order, error } = await supabase.from("orders").insert({
        user_id: session.session.user.id,
        table_number: "12",
        status: "received",
        subtotal, tax, total,
      }).select().single();
      if (error) throw error;
      const orderItems = items.map((i) => ({
        order_id: order.id, menu_item_id: i.id, name_snapshot: i.name, price_snapshot: i.price, quantity: i.quantity,
      }));
      const { error: itemsErr } = await supabase.from("order_items").insert(orderItems);
      if (itemsErr) throw itemsErr;
      toast.success("Order placed — tracking live!");
      clear();
      onClose();
      navigate({ to: "/orders" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not place order");
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className={`fixed inset-0 z-50 transition ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
      <div className={`absolute inset-0 bg-background/70 backdrop-blur-sm transition-opacity ${open ? "opacity-100" : "opacity-0"}`} onClick={onClose} />
      <aside className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-border glass-strong transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
        <header className="flex items-center justify-between border-b border-border p-5">
          <div>
            <h2 className="text-lg font-semibold">Your order</h2>
            <p className="text-xs text-muted-foreground">Table 12</p>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full hover:bg-accent"><X className="h-4 w-4" /></button>
        </header>

        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="grid place-items-center py-20 text-center">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
              <p className="mt-3 text-sm">Your order is empty</p>
              <p className="mt-1 text-xs text-muted-foreground">Add dishes to get started.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((i: CartItem) => (
                <li key={i.id} className="flex gap-3 rounded-2xl border border-border bg-card p-3">
                  <div className="h-16 w-16 flex-none overflow-hidden rounded-xl bg-accent">
                    {i.image_url && <img loading="lazy" src={i.image_url} alt={i.name} className="h-full w-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium">{i.name}</p>
                      <button onClick={() => remove(i.id)} className="text-xs text-muted-foreground hover:text-destructive">Remove</button>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">₹{i.price.toFixed(0)} each</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button onClick={() => setQty(i.id, i.quantity - 1)} className="grid h-7 w-7 place-items-center rounded-full border border-border hover:bg-accent"><Minus className="h-3 w-3" /></button>
                      <span className="w-6 text-center text-sm font-medium">{i.quantity}</span>
                      <button onClick={() => setQty(i.id, i.quantity + 1)} className="grid h-7 w-7 place-items-center rounded-full border border-border hover:bg-accent"><Plus className="h-3 w-3" /></button>
                      <span className="ml-auto text-sm font-semibold">₹{(i.price * i.quantity).toFixed(0)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <footer className="border-t border-border p-5">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>₹{subtotal.toFixed(0)}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Taxes (5%)</span><span>₹{(subtotal * 0.05).toFixed(0)}</span></div>
              <div className="flex justify-between border-t border-border pt-2 text-base font-semibold"><span>Total</span><span>₹{(subtotal * 1.05).toFixed(0)}</span></div>
            </div>
            <button onClick={checkout} disabled={placing} className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60">
              {placing ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Place order · ₹{(subtotal * 1.05).toFixed(0)}</>}
            </button>
            <Link to="/orders" className="mt-2 block text-center text-xs text-muted-foreground hover:text-foreground">Track past orders →</Link>
          </footer>
        )}
      </aside>
    </div>
  );
}

type ChatMsg = { role: "user" | "assistant"; content: string };

function AriaChat({ open, onClose, items }: { open: boolean; onClose: () => void; items: MenuItem[] }) {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: "assistant", content: "Hi, I'm Aria ✨ Tell me your mood, diet, or budget and I'll recommend the perfect dishes tonight." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const call = useServerFn(askAria);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages, loading]);

  const menuContext = useMemo(() =>
    items.slice(0, 40).map((i) =>
      `- ${i.name} · ₹${i.price} · ${i.is_veg ? "veg" : "non-veg"}${i.is_vegan ? ", vegan" : ""}${i.is_gluten_free ? ", GF" : ""}${i.spice_level ? `, spice ${i.spice_level}/3` : ""}${i.calories ? `, ${i.calories} kcal` : ""} — ${i.description ?? ""}`
    ).join("\n"),
  [items]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const next: ChatMsg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setLoading(true);
    try {
      const res = await call({ data: { messages: next, menuContext } });
      setMessages((m) => [...m, { role: "assistant", content: res.reply }]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Aria couldn't respond");
    } finally {
      setLoading(false);
    }
  }

  const suggestions = ["Something spicy & vegetarian", "High-protein under ₹600", "Comfort food for a rainy night"];

  return (
    <div className={`fixed inset-0 z-50 transition ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
      <div className={`absolute inset-0 bg-background/70 backdrop-blur-sm transition-opacity ${open ? "opacity-100" : "opacity-0"}`} onClick={onClose} />
      <aside className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-border glass-strong transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
        <header className="flex items-center justify-between border-b border-border p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/20 animate-pulse-glow"><Bot className="h-4 w-4 text-primary" /></div>
            <div>
              <h2 className="text-sm font-semibold">Aria · AI concierge</h2>
              <p className="text-xs text-muted-foreground">Grounded in tonight's menu</p>
            </div>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full hover:bg-accent"><X className="h-4 w-4" /></button>
        </header>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-5">
          {messages.map((m, i) => (
            <div key={i} className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed ${m.role === "assistant" ? "bg-accent/70 rounded-tl-sm" : "ml-auto bg-primary/15 rounded-tr-sm"}`}>
              {m.content}
            </div>
          ))}
          {loading && (
            <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-accent/70 p-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border p-4">
          {messages.length <= 1 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button key={s} onClick={() => setInput(s)} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition">{s}</button>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2 rounded-full border border-border bg-input px-4 py-2 focus-within:border-primary transition">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask Aria anything…"
              className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
            />
            <button onClick={send} disabled={loading || !input.trim()} className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-40">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

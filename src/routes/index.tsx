import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles, ChefHat, Bot, LineChart, Bell, Boxes,
  Utensils, Zap, ShieldCheck, ArrowRight, Star, Check,
} from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import heroImg from "@/assets/hero-dish.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RestaurantOS AI — The Intelligent Restaurant Operating System" },
      { name: "description", content: "Run every seat, order, and ingredient with an AI copilot. QR menu, voice ordering, live kitchen, predictive inventory, and analytics — one elegant OS." },
      { property: "og:title", content: "RestaurantOS AI — Run your restaurant with AI" },
      { property: "og:description", content: "Premium dining for guests. Intelligent operations for your team. One elegant OS." },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: Utensils, title: "QR menu with AI concierge", desc: "Diners scan, chat with Aria, and order — with dietary, budget, and mood-aware recommendations." },
  { icon: ChefHat, title: "Smart kitchen priority", desc: "AI sequences the pass by prep time and delivery windows — faster tables, calmer chefs." },
  { icon: Boxes, title: "Predictive inventory", desc: "Forecast tomorrow's demand by weather, day, festival. Auto-generate purchase orders." },
  { icon: LineChart, title: "Manager copilot", desc: "Ask 'why were sales low today?' and get an answer with data, charts, and next actions." },
  { icon: Bell, title: "Realtime everything", desc: "Table calls, order status, kitchen delays, and inventory alerts stream instantly to every role." },
  { icon: ShieldCheck, title: "Enterprise ready", desc: "Role-based access for customer, waiter, chef, manager, owner, admin — with audit trails." },
];

const PLANS = [
  { name: "Bistro", price: "₹0", period: "/mo", tag: "Try it free", desc: "For pop-ups and small teams evaluating the platform.", features: ["QR menu + cart", "AI food concierge", "1 branch, 5 tables", "Community support"], cta: "Start free" },
  { name: "Restaurant", price: "₹4,999", period: "/mo", tag: "Most loved", desc: "Everything a full-service restaurant needs to run daily.", features: ["Unlimited menu + orders", "Kitchen + waiter dashboards", "Predictive inventory", "Analytics + reports", "Priority support"], cta: "Start 14-day trial", highlight: true },
  { name: "Group", price: "Talk to us", period: "", tag: "Enterprise", desc: "For chains, cloud kitchens, and hospitality groups.", features: ["Multi-branch console", "Custom AI copilot", "SSO + audit logs", "Dedicated success manager"], cta: "Book a call" },
];

const TESTIMONIALS = [
  { name: "Ananya Rao", role: "Owner, Saffron & Smoke", quote: "Waiting times dropped 32% in the first month. The kitchen dashboard alone is worth the subscription." },
  { name: "Marco Bianchi", role: "GM, Trattoria Nova", quote: "Aria writes better dish descriptions than my consultants. Guests actually finish the menu now." },
  { name: "Priya Menon", role: "Ops Head, Coastline Group", quote: "The copilot flagged a supplier issue before it hit the pass. That's the moment we knew." },
];

const FAQS = [
  { q: "How is this different from Zomato or a QR menu tool?", a: "Those handle discovery or the menu. RestaurantOS AI runs the whole restaurant — floor, kitchen, inventory, staff, and analytics — as one product." },
  { q: "Do I need to replace my POS?", a: "No. We integrate with the tools you use and can also be your single source of truth if you prefer." },
  { q: "Is the AI accurate for Indian and global cuisines?", a: "Yes. Aria is grounded in your live menu — it can only recommend dishes you actually serve." },
  { q: "Can guests use it without downloading an app?", a: "Yes. Everything is web-first — one scan, no install." },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <SiteNav />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 grid-pattern opacity-30" />
        <div className="pointer-events-none absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-24 pt-16 md:grid-cols-2 md:gap-8 md:px-6 md:pt-24 lg:pt-32">
          <div className="flex flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border glass px-3 py-1 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Powered by Gemini · Live in 47 restaurants
            </div>
            <h1 className="mt-6 font-display text-5xl italic leading-[1.05] tracking-tight md:text-7xl">
              The <span className="gradient-text not-italic font-sans font-semibold">operating system</span> for modern restaurants.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              One elegant platform for the floor, the kitchen, the pantry, and the pass —
              with an AI copilot that never sleeps.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/menu" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-90">
                Try the live guest demo <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/auth" className="inline-flex items-center gap-2 rounded-full border border-border glass px-6 py-3 text-sm font-semibold hover:bg-accent transition">
                Start free
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-xs text-muted-foreground">
              {["No credit card", "Deploy in one day", "SOC-ready", "Realtime"].map((f) => (
                <span key={f} className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> {f}</span>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-8 rounded-[2rem] blur-3xl opacity-40" style={{ background: "var(--gradient-mesh)" }} />
            <div className="relative overflow-hidden rounded-3xl border border-border shadow-elevated">
              <img src={heroImg} alt="Signature plated dish at a premium restaurant" width={1600} height={1200} className="h-full w-full object-cover" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl glass-strong p-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/20 grid place-items-center animate-pulse-glow">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Aria · AI concierge</p>
                    <p className="text-sm">Try the Truffle Risotto — it's tonight's most loved dish.</p>
                  </div>
                </div>
                <span className="hidden rounded-full bg-success/20 px-2 py-0.5 text-[10px] font-medium text-success md:inline-block">Live</span>
              </div>
            </div>
            <div className="animate-float absolute -bottom-4 -left-6 hidden rounded-2xl glass-strong p-3 shadow-elevated md:block">
              <p className="text-xs text-muted-foreground">Kitchen queue</p>
              <p className="text-sm font-semibold">3 orders · avg 8m 42s</p>
            </div>
            <div className="animate-float absolute -top-4 -right-4 hidden rounded-2xl glass-strong p-3 shadow-elevated md:block" style={{ animationDelay: "1.2s" }}>
              <p className="text-xs text-muted-foreground">Today's revenue</p>
              <p className="text-sm font-semibold">₹1,42,380 <span className="text-success">↑ 18%</span></p>
            </div>
          </div>
        </div>

        {/* Trust bar */}
        <div className="border-y border-border/50 glass">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 py-6 text-center text-xs uppercase tracking-widest text-muted-foreground md:grid-cols-4">
            {[
              ["47", "Restaurants live"],
              ["1.2M", "Orders processed"],
              ["32%", "Avg. wait-time cut"],
              ["4.9★", "Guest rating"],
            ].map(([n, l]) => (
              <div key={l as string}>
                <p className="font-display text-2xl italic text-foreground normal-case tracking-normal">{n}</p>
                <p className="mt-1">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-24 md:px-6">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-primary">The platform</p>
          <h2 className="mt-3 font-display text-4xl italic tracking-tight md:text-5xl">One OS. Every workflow.</h2>
          <p className="mt-4 text-muted-foreground">From the moment a guest scans, to the last dish plated, to tomorrow's inventory — RestaurantOS AI is the single surface your whole team lives in.</p>
        </div>
        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="group relative overflow-hidden rounded-2xl border border-border glass p-6 shadow-card transition hover:border-primary/40">
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl opacity-0 transition group-hover:opacity-100" />
              <div className="relative">
                <div className="mb-5 inline-grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Copilot showcase */}
      <section className="relative border-y border-border/50">
        <div className="pointer-events-none absolute inset-0 opacity-40" style={{ background: "var(--gradient-hero)" }} />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-24 md:grid-cols-2 md:px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary">Manager copilot</p>
            <h2 className="mt-3 font-display text-4xl italic tracking-tight md:text-5xl">Ask your restaurant anything.</h2>
            <p className="mt-4 max-w-md text-muted-foreground">Skip the spreadsheet safari. Query revenue, waste, staff performance, or menu health in plain English — get answers grounded in your live data.</p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                "Why were sales low on Tuesday?",
                "Predict tomorrow's covers and prep list.",
                "Which 3 dishes should we remove this quarter?",
                "Summarize this week's guest complaints.",
              ].map((q) => (
                <li key={q} className="flex items-start gap-3 rounded-xl border border-border glass p-3">
                  <Zap className="mt-0.5 h-4 w-4 flex-none text-primary" />
                  <span className="text-muted-foreground">{q}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-border glass-strong p-5 shadow-elevated">
            <div className="flex items-center gap-3 border-b border-border/60 pb-4">
              <div className="h-9 w-9 rounded-full bg-primary/20 grid place-items-center"><Bot className="h-4 w-4 text-primary" /></div>
              <div>
                <p className="text-sm font-medium">Aria · Copilot</p>
                <p className="text-xs text-muted-foreground">Grounded in tonight's data</p>
              </div>
              <span className="ml-auto rounded-full bg-success/20 px-2 py-0.5 text-[10px] font-medium text-success">Online</span>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-accent/60 p-3">Why is the pass 6 minutes slower than yesterday?</div>
              <div className="ml-auto max-w-[90%] rounded-2xl rounded-tr-sm bg-primary/15 p-3">
                Two things: pizza station is single-manned tonight (Anish is on leave), and Table 12 ordered 4 slow-cook mains together. I've re-sequenced the queue to reduce peak-hour drag by ~3 minutes. Suggest calling in Anish's backup after 8:30 PM.
              </div>
              <div className="max-w-[75%] rounded-2xl rounded-tl-sm bg-accent/60 p-3">Draft the shift note.</div>
              <div className="ml-auto max-w-[90%] rounded-2xl rounded-tr-sm bg-primary/15 p-3">
                Done. Shared to the manager channel and pinned to tomorrow's pre-shift.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="mx-auto max-w-7xl px-4 py-24 md:px-6">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Pricing</p>
          <h2 className="mt-3 font-display text-4xl italic tracking-tight md:text-5xl">Simple. Transparent. Fair.</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">Every plan includes the AI concierge, kitchen dashboard, and analytics. Scale as you grow.</p>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {PLANS.map((p) => (
            <div key={p.name} className={`relative overflow-hidden rounded-3xl border p-8 shadow-card transition ${p.highlight ? "border-primary/50 glass-strong shadow-glow" : "border-border glass"}`}>
              {p.highlight && <div className="absolute right-4 top-4 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold uppercase text-primary-foreground tracking-widest">{p.tag}</div>}
              {!p.highlight && <p className="text-xs uppercase tracking-widest text-muted-foreground">{p.tag}</p>}
              <h3 className="mt-3 text-2xl font-semibold">{p.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-5xl italic">{p.price}</span>
                <span className="text-sm text-muted-foreground">{p.period}</span>
              </div>
              <ul className="mt-6 space-y-2.5 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-primary" /><span>{f}</span></li>
                ))}
              </ul>
              <Link to="/auth" className={`mt-8 inline-flex w-full items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition ${p.highlight ? "bg-primary text-primary-foreground shadow-glow hover:opacity-90" : "border border-border hover:bg-accent"}`}>{p.cta}</Link>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="border-y border-border/50 glass">
        <div className="mx-auto max-w-7xl px-4 py-24 md:px-6">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.2em] text-primary">Loved by operators</p>
            <h2 className="mt-3 font-display text-4xl italic tracking-tight md:text-5xl">Words from the pass.</h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <div className="flex text-primary">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}</div>
                <blockquote className="mt-4 text-sm leading-relaxed">"{t.quote}"</blockquote>
                <figcaption className="mt-4 flex items-center gap-3 border-t border-border/60 pt-4">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/20 font-semibold text-primary">{t.name[0]}</div>
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-4xl px-4 py-24 md:px-6">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-primary">FAQ</p>
          <h2 className="mt-3 font-display text-4xl italic tracking-tight md:text-5xl">Answers, on the house.</h2>
        </div>
        <div className="mt-10 space-y-3">
          {FAQS.map((f) => (
            <details key={f.q} className="group rounded-2xl border border-border glass p-5 open:shadow-card">
              <summary className="flex cursor-pointer items-center justify-between text-sm font-medium">
                {f.q}
                <span className="text-primary transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-24 md:px-6">
        <div className="relative overflow-hidden rounded-[2rem] border border-primary/30 p-10 md:p-16 shadow-elevated">
          <div className="pointer-events-none absolute inset-0 opacity-70" style={{ background: "var(--gradient-mesh)" }} />
          <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-display text-3xl italic tracking-tight md:text-5xl">Ready to run your restaurant<br className="hidden md:block" /> like it's 2030?</h3>
              <p className="mt-3 max-w-xl text-muted-foreground">Deploy in a day. Delight guests tonight.</p>
            </div>
            <div className="flex gap-3">
              <Link to="/auth" className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-90 transition">Start free</Link>
              <Link to="/menu" className="rounded-full border border-border glass px-6 py-3 text-sm font-semibold hover:bg-accent transition">See the demo</Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-6">
          <div className="flex items-center gap-2">
            <div className="grid h-6 w-6 place-items-center rounded-md bg-primary text-primary-foreground"><Sparkles className="h-3 w-3" /></div>
            <span>© {new Date().getFullYear()} RestaurantOS AI</span>
          </div>
          <div className="flex gap-6">
            <a href="/#features" className="hover:text-foreground">Features</a>
            <a href="/#pricing" className="hover:text-foreground">Pricing</a>
            <Link to="/menu" className="hover:text-foreground">Live demo</Link>
            <Link to="/auth" className="hover:text-foreground">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

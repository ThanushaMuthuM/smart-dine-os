import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { Sparkles, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { z } from "zod";

type Search = { redirect?: string };

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — RestaurantOS AI" },
      { name: "description", content: "Sign in to RestaurantOS AI to manage orders, favorites, and your dining profile." },
      { property: "og:title", content: "Sign in — RestaurantOS AI" },
      { property: "og:description", content: "Access your RestaurantOS AI account." },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): Search => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  component: AuthPage,
});

const emailSchema = z.string().trim().email("Enter a valid email").max(255);
const passwordSchema = z.string().min(8, "At least 8 characters").max(72);

function AuthPage() {
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/auth" });
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: redirect && redirect.startsWith("/") ? redirect : "/menu" });
    });
  }, [navigate, redirect]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedEmail = emailSchema.safeParse(email);
    if (!parsedEmail.success) return toast.error(parsedEmail.error.issues[0].message);
    const parsedPw = passwordSchema.safeParse(password);
    if (!parsedPw.success) return toast.error(parsedPw.error.issues[0].message);

    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: parsedEmail.data,
          password: parsedPw.data,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: name || parsedEmail.data.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Welcome! Check your email if confirmation is required.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: parsedEmail.data, password: parsedPw.data });
        if (error) throw error;
        toast.success("Signed in");
      }
      navigate({ to: redirect && redirect.startsWith("/") ? redirect : "/menu" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setOauthLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
      if (result.error) throw result.error;
      if (result.redirected) return;
      navigate({ to: redirect && redirect.startsWith("/") ? redirect : "/menu" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setOauthLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-50" style={{ background: "var(--gradient-hero)" }} />
      <div className="pointer-events-none absolute inset-0 grid-pattern opacity-20" />

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 py-16">
        <Link to="/" className="mb-8 flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground shadow-glow"><Sparkles className="h-4 w-4" /></div>
          <span className="text-lg font-semibold tracking-tight">RestaurantOS <span className="text-primary">AI</span></span>
        </Link>

        <div className="w-full rounded-3xl border border-border glass-strong p-8 shadow-elevated">
          <h1 className="font-display text-3xl italic tracking-tight">{mode === "signin" ? "Welcome back" : "Create your account"}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{mode === "signin" ? "Sign in to continue your dining experience." : "Free forever for the guest experience."}</p>

          <button
            onClick={handleGoogle}
            disabled={oauthLoading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card py-2.5 text-sm font-medium transition hover:bg-accent disabled:opacity-60"
          >
            {oauthLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
            Continue with Google
          </button>

          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> or email <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "signup" && (
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" maxLength={80} className="w-full rounded-xl border border-border bg-input px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@restaurant.com" type="email" required className="w-full rounded-xl border border-border bg-input px-4 py-2.5 pl-10 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" required minLength={8} className="w-full rounded-xl border border-border bg-input px-4 py-2.5 pl-10 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
            </div>
            <button type="submit" disabled={loading} className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-90 disabled:opacity-60">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{mode === "signin" ? "Sign in" : "Create account"} <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
            <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="font-medium text-primary hover:underline">
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>

        <Link to="/" className="mt-6 text-xs text-muted-foreground hover:text-foreground">← Back to home</Link>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.68 4.1-5.5 4.1-3.31 0-6-2.74-6-6.1s2.69-6.1 6-6.1c1.88 0 3.14.8 3.86 1.49l2.63-2.53C16.83 3.4 14.65 2.5 12 2.5 6.76 2.5 2.5 6.76 2.5 12s4.26 9.5 9.5 9.5c5.48 0 9.11-3.85 9.11-9.27 0-.62-.07-1.1-.15-1.53H12z" />
    </svg>
  );
}

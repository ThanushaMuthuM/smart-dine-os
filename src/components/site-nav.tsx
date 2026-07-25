import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, LogOut } from "lucide-react";
import { toast } from "sonner";

export function SiteNav() {
  const [email, setEmail] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user.email ?? null));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setEmail(s?.user.email ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 glass-strong">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-glow">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-base font-semibold tracking-tight">RestaurantOS <span className="text-primary">AI</span></span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <a href="/#features" className="hover:text-foreground transition">Features</a>
          <a href="/#pricing" className="hover:text-foreground transition">Pricing</a>
          <a href="/#faq" className="hover:text-foreground transition">FAQ</a>
          <Link to="/menu" className="hover:text-foreground transition">Live menu</Link>
        </nav>
        <div className="flex items-center gap-2">
          {email ? (
            <>
              <Link to="/orders" className="hidden rounded-full border border-border px-4 py-1.5 text-sm sm:inline-flex hover:bg-accent transition">My orders</Link>
              <button onClick={signOut} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition">
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/auth" className="hidden rounded-full border border-border px-4 py-1.5 text-sm sm:inline-flex hover:bg-accent transition">Sign in</Link>
              <Link to="/menu" className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground shadow-glow hover:opacity-90 transition">Try demo</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

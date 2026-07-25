
-- Roles enum + user_roles table with has_role() SECURITY DEFINER
CREATE TYPE public.app_role AS ENUM ('customer','waiter','chef','manager','admin');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  loyalty_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_roles_select_own" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Auto-create profile + assign customer role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer');
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Menu
CREATE TABLE public.menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  icon TEXT
);
GRANT SELECT ON public.menu_categories TO anon, authenticated;
GRANT ALL ON public.menu_categories TO service_role;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "menu_categories_public_read" ON public.menu_categories FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.menu_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  image_url TEXT,
  is_veg BOOLEAN NOT NULL DEFAULT true,
  is_vegan BOOLEAN NOT NULL DEFAULT false,
  is_gluten_free BOOLEAN NOT NULL DEFAULT false,
  spice_level SMALLINT NOT NULL DEFAULT 0,
  calories INTEGER,
  protein_g INTEGER,
  carbs_g INTEGER,
  prep_time_min INTEGER,
  is_available BOOLEAN NOT NULL DEFAULT true,
  is_chef_recommended BOOLEAN NOT NULL DEFAULT false,
  is_trending BOOLEAN NOT NULL DEFAULT false,
  rating NUMERIC(2,1) DEFAULT 4.5,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.menu_items TO anon, authenticated;
GRANT ALL ON public.menu_items TO service_role;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "menu_items_public_read" ON public.menu_items FOR SELECT TO anon, authenticated USING (true);

-- Orders
CREATE TYPE public.order_status AS ENUM ('received','assigned','cooking','quality_check','ready','serving','completed','cancelled');

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  table_number TEXT,
  status public.order_status NOT NULL DEFAULT 'received',
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_select_own" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "orders_insert_own" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "orders_update_own" ON public.orders FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES public.menu_items(id),
  name_snapshot TEXT NOT NULL,
  price_snapshot NUMERIC(10,2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  notes TEXT
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order_items_select_own" ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));
CREATE POLICY "order_items_insert_own" ON public.order_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));

CREATE TABLE public.favorites (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, menu_item_id)
);
GRANT SELECT, INSERT, DELETE ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO service_role;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "favorites_all_own" ON public.favorites FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.tg_set_updated_at() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;

-- Seed menu (categories + items) in the SAME migration so first render has data
INSERT INTO public.menu_categories (name, slug, sort_order, icon) VALUES
 ('Chef''s Specials','specials',1,'Sparkles'),
 ('Starters','starters',2,'Soup'),
 ('Main Course','mains',3,'ChefHat'),
 ('Pizza & Pasta','pizza-pasta',4,'Pizza'),
 ('Desserts','desserts',5,'IceCream'),
 ('Beverages','beverages',6,'Coffee');

INSERT INTO public.menu_items (category_id, name, description, price, image_url, is_veg, is_vegan, is_gluten_free, spice_level, calories, protein_g, carbs_g, prep_time_min, is_chef_recommended, is_trending, rating, tags)
SELECT c.id, v.name, v.description, v.price, v.image_url, v.is_veg, v.is_vegan, v.is_gluten_free, v.spice_level, v.calories, v.protein_g, v.carbs_g, v.prep_time_min, v.chef_rec, v.trending, v.rating, v.tags
FROM (VALUES
 ('specials','Truffle Mushroom Risotto','Arborio rice slow-cooked with wild mushrooms, aged parmesan, and black truffle shavings.',680,'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800',true,false,true,1,540,14,62,22,true,true,4.8,ARRAY['creamy','umami','signature']),
 ('specials','Miso Glazed Salmon','Norwegian salmon fillet with sweet miso glaze, wasabi puree, and micro herbs.',920,'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800',false,false,true,2,610,42,18,18,true,true,4.9,ARRAY['premium','omega-3']),
 ('starters','Burrata & Heirloom Tomato','Creamy burrata over rainbow tomatoes with basil oil and aged balsamic.',480,'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=800',true,false,true,0,320,16,12,8,false,true,4.7,ARRAY['fresh','italian']),
 ('starters','Crispy Cauliflower Wings','Cauliflower florets tossed in gochujang glaze with sesame and scallions.',360,'https://images.unsplash.com/photo-1625944525533-473d1c1c8f5f?w=800',true,true,false,3,280,8,32,12,false,false,4.5,ARRAY['spicy','vegan','crispy']),
 ('starters','Tuna Tartare','Diced yellowfin tuna, avocado, yuzu ponzu, wonton crisps.',540,'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800',false,false,false,1,290,24,14,10,true,false,4.6,ARRAY['raw','japanese']),
 ('mains','Butter Chicken','Tandoor-roasted chicken in silky tomato-cashew gravy with fenugreek.',520,'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800',false,false,true,2,680,38,28,25,true,true,4.9,ARRAY['indian','classic','creamy']),
 ('mains','Wagyu Beef Burger','Wagyu patty, aged cheddar, caramelized onion, brioche bun, truffle aioli.',780,'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800',false,false,false,1,890,48,52,15,false,true,4.8,ARRAY['premium','burger']),
 ('mains','Palak Paneer','House-made paneer in silky spinach gravy with garlic tempering.',420,'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800',true,false,true,1,480,22,18,18,false,false,4.6,ARRAY['indian','iron-rich']),
 ('pizza-pasta','Margherita DOC','San Marzano tomato, fior di latte, basil, wood-fired 90 seconds.',540,'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=800',true,false,false,0,720,28,84,12,true,true,4.9,ARRAY['neapolitan','classic']),
 ('pizza-pasta','Truffle Carbonara','Guanciale, pecorino, egg yolk, black pepper, shaved truffle.',620,'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800',false,false,false,0,780,32,78,15,true,false,4.7,ARRAY['italian','indulgent']),
 ('pizza-pasta','Arrabbiata Penne','Al dente penne, spicy tomato sugo, chili flakes, garlic, basil.',380,'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=800',true,true,false,3,540,16,74,12,false,false,4.4,ARRAY['spicy','vegan']),
 ('desserts','Molten Chocolate Lava','Warm dark chocolate cake with vanilla bean gelato and gold leaf.',360,'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800',true,false,false,0,480,7,58,10,true,true,4.9,ARRAY['dessert','chocolate']),
 ('desserts','Tiramisu Classico','Espresso-soaked ladyfingers, mascarpone cream, cocoa dust.',320,'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800',true,false,false,0,420,8,44,8,false,false,4.7,ARRAY['italian','coffee']),
 ('desserts','Mango Sticky Rice','Alphonso mango, coconut sticky rice, toasted sesame.',280,'https://images.unsplash.com/photo-1711161060329-d4dc1e6ea8a1?w=800',true,true,true,0,380,6,72,6,false,false,4.5,ARRAY['thai','vegan','seasonal']),
 ('beverages','Cold Brew Coffee','24-hour slow-steeped single origin, served over ice.',220,'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=800',true,true,true,0,15,1,3,3,false,true,4.6,ARRAY['coffee','caffeine']),
 ('beverages','Fresh Watermelon Cooler','Cold-pressed watermelon, mint, lime, pink salt.',180,'https://images.unsplash.com/photo-1546171753-97d7676e4602?w=800',true,true,true,0,120,2,28,4,false,false,4.4,ARRAY['refreshing','summer']),
 ('beverages','Matcha Latte','Ceremonial grade matcha whisked with steamed oat milk.',260,'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=800',true,true,true,0,180,4,22,5,true,false,4.7,ARRAY['japanese','antioxidant'])
) AS v(cat_slug,name,description,price,image_url,is_veg,is_vegan,is_gluten_free,spice_level,calories,protein_g,carbs_g,prep_time_min,chef_rec,trending,rating,tags)
JOIN public.menu_categories c ON c.slug = v.cat_slug;

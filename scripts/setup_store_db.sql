-- Create store_products table
CREATE TABLE IF NOT EXISTS public.store_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(12, 2),
    image_url TEXT,
    shopee_url TEXT,
    tiktok_url TEXT,
    category TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.store_products ENABLE ROW LEVEL SECURITY;

-- Allow public to read active products
CREATE POLICY "Allow public read access for active products" ON public.store_products
    FOR SELECT USING (is_active = true);

-- Allow authenticated users (admin) to manage products
CREATE POLICY "Allow admin to manage products" ON public.store_products
    FOR ALL USING (auth.role() = 'service_role');

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_store_products_updated_at
    BEFORE UPDATE ON public.store_products
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

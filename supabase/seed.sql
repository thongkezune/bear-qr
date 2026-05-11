-- OMEMO DATABASE INITIALIZATION SCRIPT
-- Run this in your Supabase SQL Editor

-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS public.store_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price BIGINT NOT NULL,
    image_url TEXT,
    category TEXT DEFAULT 'Kỷ niệm',
    is_active BOOLEAN DEFAULT true,
    shopee_url TEXT,
    tiktok_url TEXT
);

-- 2. Create Orders Table
CREATE TABLE IF NOT EXISTS public.store_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    product_id UUID REFERENCES public.store_products(id),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    total_price BIGINT NOT NULL,
    status TEXT DEFAULT 'pending' -- pending, shipping, completed, cancelled
);

-- 3. Create Marketing Journey Table (Optional)
CREATE TABLE IF NOT EXISTS public.marketing_journey (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    year TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    order_index INTEGER DEFAULT 0
);

-- 4. Enable RLS (Row Level Security) - Optional but recommended
-- ALTER TABLE public.store_products ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow public read access" ON public.store_products FOR SELECT USING (true);

-- 5. Storage Bucket Setup (Instructions)
-- Note: You must create a bucket named 'store-assets' in the Supabase Storage UI and set it to Public.

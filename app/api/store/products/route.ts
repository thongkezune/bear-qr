import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const { data: products, error } = await supabaseAdmin
      .from('store_products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ products });
  } catch (err: any) {
    console.error('Public Store API Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

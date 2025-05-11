// src/app/api/delete-image/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse, NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { path } = await req.json();

    if (!path) {
      return NextResponse.json({ error: 'Missing path' }, { status: 400 });
    }

    const cleanedPath = path.replace(/^memorial-photos\//, '');
    console.log('🧹 Path to delete:', cleanedPath);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .storage
      .from('memorial-photos')
      .remove([cleanedPath]);

    if (error) {
      console.error('❌ Error deleting file:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, deleted: data }, { status: 200 });
  } catch (error: any) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
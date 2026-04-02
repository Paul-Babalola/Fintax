import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: snapshots, error } = await supabase
      .from('tax_snapshots')
      .select('*')
      .eq('user_id', user.id)
      .order('snapshot_month', { ascending: false })
      .limit(12); // Last 12 months

    if (error) {
      throw error;
    }

    return NextResponse.json({ snapshots });

  } catch (error) {
    console.error('Error fetching tax history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
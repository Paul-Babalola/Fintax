import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculateTax } from '@/lib/tax-engine/nta2025';

// This cron job runs daily to create tax snapshots for all users
export async function GET(request: NextRequest) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = await createClient();
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format

    // Get all users with completed onboarding
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('onboarding_complete', true);

    if (usersError) throw usersError;

    let processedUsers = 0;
    let errors = 0;

    for (const user of users || []) {
      try {
        // Check if snapshot already exists for this month
        const { data: existingSnapshot } = await supabase
          .from('tax_snapshots')
          .select('id')
          .eq('user_id', user.id)
          .eq('snapshot_month', currentMonth)
          .single();

        if (existingSnapshot) continue; // Skip if already exists

        // Get user profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!profile) continue;

        // Get income for current month
        const { data: income } = await supabase
          .from('income_entries')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', `${currentMonth}-01`)
          .lt('date', `${new Date(new Date(currentMonth + '-01').getFullYear(), new Date(currentMonth + '-01').getMonth() + 1).toISOString().slice(0, 7)}-01`);


        // Aggregate income by source
        const incomeBySource = (income ?? []).reduce<Record<string, number>>(
          (acc, r) => { acc[r.source] = (acc[r.source] ?? 0) + r.amount; return acc; },
          {}
        );

        // Calculate tax using the correct API
        const taxResult = calculateTax(
          {
            salary: incomeBySource.salary || 0,
            freelance: incomeBySource.freelance || 0,
            investment: incomeBySource.investment || 0,
            rental: incomeBySource.rental || 0,
            other: incomeBySource.other || 0,
          },
          {
            annual_rent: profile?.annual_rent || undefined,
            pension_contributions: profile?.monthly_pension_contribution
              ? profile.monthly_pension_contribution * 12
              : undefined,
            nhf_contributions: profile?.nhf_monthly_contribution
              ? profile.nhf_monthly_contribution * 12
              : undefined,
          }
        );

        // Create snapshot
        await supabase.from('tax_snapshots').insert({
          user_id: user.id,
          snapshot_month: currentMonth,
          gross_income: taxResult.gross_income,
          taxable_income: taxResult.taxable_income,
          total_deductions: taxResult.deductions.total,
          pit_before_wht: taxResult.pit_before_wht,
          wht_credit: taxResult.wht_credit,
          net_tax_liability: taxResult.net_tax_liability,
          effective_rate: taxResult.effective_rate,
          is_exempt: taxResult.is_exempt,
          engine_version: '2025-v1',
        });

        processedUsers++;
      } catch (error) {
        console.error(`Error processing user ${user.id}:`, error);
        errors++;
      }
    }

    return NextResponse.json({
      success: true,
      processedUsers,
      errors,
      message: `Processed ${processedUsers} users with ${errors} errors`,
    });

  } catch (error) {
    console.error('Error in daily snapshots cron:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
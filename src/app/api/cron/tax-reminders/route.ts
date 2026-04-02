import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// This cron job runs weekly to send tax deadline reminders
export async function GET(request: NextRequest) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = await createClient();
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // 1-12

    // Tax filing deadlines in Nigeria:
    // - March 31st for individual returns
    // - June 30th for companies
    
    let reminderType = '';
    let daysUntilDeadline = 0;

    // Check for tax filing deadlines
    if (currentMonth === 3) {
      const deadline = new Date(currentDate.getFullYear(), 2, 31); // March 31
      daysUntilDeadline = Math.ceil((deadline.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilDeadline <= 30 && daysUntilDeadline > 0) {
        reminderType = 'individual_filing_deadline';
      }
    }

    if (!reminderType) {
      return NextResponse.json({
        success: true,
        message: 'No reminders to send at this time',
      });
    }

    // Get all active users with subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('status', 'active');

    if (subError) throw subError;

    let remindersSent = 0;

    for (const subscription of subscriptions || []) {
      try {
        // Get user email from auth
        const { data: { user }, error: authError } = await supabase.auth.admin.getUserById(subscription.user_id);
        
        if (!authError && user?.email) {
          // In a real implementation, you'd send an email here using Resend or similar
          // For now, we'll just log it
          console.log(`Would send ${reminderType} reminder to ${user.email} - ${daysUntilDeadline} days until deadline`);
          remindersSent++;
        }
      } catch (error) {
        console.error(`Error sending reminder to user ${subscription.user_id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      remindersSent,
      reminderType,
      daysUntilDeadline,
    });

  } catch (error) {
    console.error('Error in tax reminders cron:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
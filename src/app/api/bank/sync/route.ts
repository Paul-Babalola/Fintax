import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { monoClient } from '@/lib/mono/client';

export async function POST(request: NextRequest) {
  try {
    const { connectionId } = await request.json();
    
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get bank connection
    const { data: connection, error: connectionError } = await supabase
      .from('bank_connections')
      .select('*')
      .eq('id', connectionId)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (connectionError || !connection) {
      return NextResponse.json({ error: 'Bank connection not found' }, { status: 404 });
    }

    // Get transactions from Mono (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const transactions = await monoClient.getTransactions(connection.mono_account_id, {
      start: thirtyDaysAgo.toISOString().split('T')[0],
      limit: 100,
    });

    let syncedCount = 0;
    let processedCount = 0;

    for (const transaction of transactions) {
      // Check if transaction already exists
      const { data: existingTransaction } = await supabase
        .from('synced_transactions')
        .select('id')
        .eq('mono_transaction_id', transaction.id)
        .single();

      if (existingTransaction) continue;

      // Store transaction
      const { error: txError } = await supabase
        .from('synced_transactions')
        .insert({
          user_id: user.id,
          bank_connection_id: connection.id,
          mono_transaction_id: transaction.id,
          amount: Math.abs(transaction.amount),
          description: transaction.description,
          transaction_date: transaction.date,
          transaction_type: transaction.type,
          category: transaction.category,
          balance_after: transaction.balance,
          is_processed: false,
        });

      if (!txError) {
        syncedCount++;

        // Auto-categorize and create entries for obvious transactions
        if (await autoProcessTransaction(supabase, transaction, user.id)) {
          processedCount++;
        }
      }
    }

    // Update last sync time
    await supabase
      .from('bank_connections')
      .update({ last_sync: new Date().toISOString() })
      .eq('id', connection.id);

    return NextResponse.json({
      success: true,
      syncedCount,
      processedCount,
      message: `Synced ${syncedCount} new transactions, auto-processed ${processedCount}`,
    });

  } catch (error) {
    console.error('Error syncing transactions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function autoProcessTransaction(supabase: any, transaction: any, userId: string): Promise<boolean> {
  const description = transaction.description.toLowerCase();
  
  // Auto-categorize salary payments
  if (description.includes('salary') || description.includes('payroll')) {
    const { error } = await supabase.from('income_entries').insert({
      user_id: userId,
      amount: Math.abs(transaction.amount),
      source: 'salary',
      date: transaction.date,
      notes: `Auto-imported: ${transaction.description}`,
    });
    return !error;
  }

  // Auto-categorize rent payments
  if (description.includes('rent') && transaction.type === 'debit') {
    const { error } = await supabase.from('expenses').insert({
      user_id: userId,
      amount: Math.abs(transaction.amount),
      category: 'rent',
      date: transaction.date,
      notes: `Auto-imported: ${transaction.description}`,
      is_deductible: true,
      deduction_type: 'rent_relief',
    });
    return !error;
  }

  return false;
}
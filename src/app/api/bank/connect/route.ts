import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { monoClient } from '@/lib/mono/client';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    
    if (!code) {
      return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      // Exchange code for account ID via Mono Connect
      // In a real implementation, you'd call Mono's auth endpoint
      // For now, we'll simulate the process
      const mockAccountId = `acc_${Date.now()}`;
      
      // Get account details from Mono
      const accountData = await monoClient.getAccount(mockAccountId);

      // Store bank connection in database
      const { error: dbError } = await supabase
        .from('bank_connections')
        .insert({
          user_id: user.id,
          mono_account_id: accountData.id,
          bank_name: accountData.bank.name,
          bank_code: accountData.bank.code,
          account_number: accountData.accountNumber,
          account_name: accountData.name,
          account_type: accountData.type,
          is_active: true,
        });

      if (dbError) {
        throw dbError;
      }

      return NextResponse.json({
        success: true,
        message: 'Bank account connected successfully',
        accountId: mockAccountId,
      });

    } catch (monoError) {
      console.error('Mono API error:', monoError);
      return NextResponse.json(
        { error: 'Failed to connect bank account' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error connecting bank account:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
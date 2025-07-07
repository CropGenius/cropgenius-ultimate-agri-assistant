import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/services/supabaseClient';
import { useReferralSystem } from '@/hooks/useReferralSystem';

export const CreditManagementPanel = () => {
  const [credits, setCredits] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const { referralCode, referralStats } = useReferralSystem();

  useEffect(() => {
    loadCredits();
    loadTransactions();
  }, []);

  const loadCredits = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase.from('user_credits').select('balance').eq('user_id', user.id).single();
    setCredits(data?.balance || 0);
  };

  const loadTransactions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase.from('credit_transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10);
    setTransactions(data || []);
  };

  const deductCredits = async (amount) => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.functions.invoke('deduct-credits', { body: { userId: user.id, amount, description: 'Manual deduction' } });
    loadCredits();
    loadTransactions();
  };

  const restoreCredits = async (amount) => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.functions.invoke('restore-credits', { body: { userId: user.id, amount, description: 'Manual restoration' } });
    loadCredits();
    loadTransactions();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>💳 Credit Management</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded">
              <div className="text-2xl font-bold">{credits}</div>
              <div className="text-sm">Credits</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded">
              <div className="text-2xl font-bold">{referralStats.count}</div>
              <div className="text-sm">Referrals</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded">
              <div className="text-lg font-mono">{referralCode}</div>
              <div className="text-sm">Code</div>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={() => deductCredits(10)} variant="destructive" size="sm">Deduct 10</Button>
            <Button onClick={() => restoreCredits(10)} size="sm">Restore 10</Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>📊 Transactions</CardTitle></CardHeader>
        <CardContent>
          {transactions.map((tx, i) => (
            <div key={i} className="flex justify-between p-2 border rounded mb-2">
              <span>{tx.description}</span>
              <Badge variant={tx.amount > 0 ? 'default' : 'destructive'}>{tx.amount > 0 ? '+' : ''}{tx.amount}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
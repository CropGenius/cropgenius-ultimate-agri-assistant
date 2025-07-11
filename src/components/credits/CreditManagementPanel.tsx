import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCredits } from '@/hooks/useCredits';
import { useCreditTransactions } from '@/hooks/useCreditTransactions';
import { useReferralSystem } from '@/hooks/useReferralSystem';

export const CreditManagementPanel = () => {
  const { balance } = useCredits();
  const { data: transactions = [], isLoading } = useCreditTransactions();
  const { referralCode, referralStats } = useReferralSystem();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>💳 Credit Management</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded">
              <div className="text-2xl font-bold">{new Intl.NumberFormat().format(balance)}</div>
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

        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>📊 Transactions</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? 'Loading...' : transactions.map(tx => (
            <div key={tx.id} className="flex justify-between p-2 border rounded mb-2 text-sm">
              <span>{tx.reason}</span>
              <div className="flex gap-2 items-center">
                <Badge variant={tx.amount > 0 ? 'default' : 'destructive'}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount}
                </Badge>
                <span className="text-gray-500">
                  {new Date(tx.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
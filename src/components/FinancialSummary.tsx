
import React, { useState, useMemo } from 'react';
import { Download, Calendar, TrendingUp, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Transaction } from './SalesTransaction';

interface FinancialSummaryProps {
  transactions: Transaction[];
}

const FinancialSummary = ({ transactions }: FinancialSummaryProps) => {
  const [period, setPeriod] = useState('daily');

  const getDateRange = (period: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (period) {
      case 'daily':
        return {
          start: today,
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        };
      case 'weekly':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return {
          start: weekStart,
          end: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
        };
      case 'monthly':
        return {
          start: new Date(now.getFullYear(), now.getMonth(), 1),
          end: new Date(now.getFullYear(), now.getMonth() + 1, 1)
        };
      case 'yearly':
        return {
          start: new Date(now.getFullYear(), 0, 1),
          end: new Date(now.getFullYear() + 1, 0, 1)
        };
      default:
        return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
    }
  };

  const filteredTransactions = useMemo(() => {
    const { start, end } = getDateRange(period);
    return transactions.filter(transaction => 
      transaction.date >= start && transaction.date < end
    );
  }, [transactions, period]);

  const summary = useMemo(() => {
    const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
    const totalTransactions = filteredTransactions.length;
    const totalItems = filteredTransactions.reduce((sum, t) => sum + t.items.length, 0);
    const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    // Calculate costs and profits
    const totalCost = filteredTransactions.reduce((sum, t) => 
      sum + t.items.reduce((itemSum, item) => 
        itemSum + (item.drug.basePrice * item.quantity), 0), 0);
    const totalProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    return {
      totalRevenue,
      totalTransactions,
      totalItems,
      averageTransaction,
      totalCost,
      totalProfit,
      profitMargin
    };
  }, [filteredTransactions]);

  const exportToExcel = () => {
    const headers = [
      'Transaction ID',
      'Date',
      'Customer',
      'Items',
      'Total Amount',
      'Cost',
      'Profit'
    ];

    const rows = filteredTransactions.map(transaction => {
      const cost = transaction.items.reduce((sum, item) => 
        sum + (item.drug.basePrice * item.quantity), 0);
      const profit = transaction.totalAmount - cost;

      return [
        transaction.id,
        transaction.date.toLocaleDateString(),
        transaction.customerName || 'Walk-in',
        transaction.items.map(item => `${item.drug.name} (${item.quantity})`).join('; '),
        transaction.totalAmount.toFixed(2),
        cost.toFixed(2),
        profit.toFixed(2)
      ];
    });

    // Create CSV content
    const csvContent = [headers, ...rows].map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `financial-report-${period}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Financial Summary</h2>
        <div className="flex space-x-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportToExcel} className="bg-green-600 hover:bg-green-700">
            <Download size={20} className="mr-2" />
            Export to Excel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">${summary.totalRevenue.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Profit</p>
                <p className="text-2xl font-bold text-blue-600">${summary.totalProfit.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Transactions</p>
                <p className="text-2xl font-bold text-purple-600">{summary.totalTransactions}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Transaction</p>
                <p className="text-2xl font-bold text-orange-600">${summary.averageTransaction.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Financial Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Revenue:</span>
                <span className="font-semibold">${summary.totalRevenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Cost:</span>
                <span className="font-semibold">${summary.totalCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-600">Total Profit:</span>
                <span className="font-bold text-green-600">${summary.totalProfit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Profit Margin:</span>
                <span className="font-semibold">{summary.profitMargin.toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Transactions:</span>
                <span className="font-semibold">{summary.totalTransactions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Items Sold:</span>
                <span className="font-semibold">{summary.totalItems}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average Transaction:</span>
                <span className="font-semibold">${summary.averageTransaction.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Period:</span>
                <span className="font-semibold capitalize">{period}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Transaction ID</th>
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Customer</th>
                  <th className="text-left py-2">Items</th>
                  <th className="text-right py-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.slice(-10).reverse().map(transaction => (
                  <tr key={transaction.id} className="border-b">
                    <td className="py-2">{transaction.id}</td>
                    <td className="py-2">{transaction.date.toLocaleDateString()}</td>
                    <td className="py-2">{transaction.customerName || 'Walk-in'}</td>
                    <td className="py-2">{transaction.items.length} items</td>
                    <td className="py-2 text-right">${transaction.totalAmount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialSummary;

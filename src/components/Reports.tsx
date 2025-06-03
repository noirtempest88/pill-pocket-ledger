import React, { useState } from 'react';
import { Download, FileText, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Transaction } from './SalesTransaction';
import { Drug } from './InventoryManagement';

interface ReportsProps {
  transactions: Transaction[];
  drugs: Drug[];
}

const Reports = ({ transactions, drugs }: ReportsProps) => {
  const [reportType, setReportType] = useState('sales');
  const [period, setPeriod] = useState('monthly');

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

  const exportSalesReport = () => {
    const { start, end } = getDateRange(period);
    const filteredTransactions = transactions.filter(t => t.date >= start && t.date < end);

    const headers = [
      'Date',
      'Transaction ID',
      'Customer',
      'Drug Name',
      'Batch Number',
      'Packaging Unit',
      'Quantity',
      'Unit Price',
      'Total Price',
      'Base Cost',
      'Profit'
    ];

    const rows: string[][] = [];
    filteredTransactions.forEach(transaction => {
      transaction.items.forEach(item => {
        const profit = item.totalPrice - (item.drug.basePrice * item.quantity);
        rows.push([
          transaction.date.toLocaleDateString(),
          transaction.id,
          transaction.customerName || 'Walk-in',
          item.drug.name,
          item.drug.batchNumber,
          item.drug.packagingUnit,
          item.quantity.toString(),
          item.drug.priceNetTax.toFixed(2),
          item.totalPrice.toFixed(2),
          (item.drug.basePrice * item.quantity).toFixed(2),
          profit.toFixed(2)
        ]);
      });
    });

    const csvContent = [headers, ...rows].map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    downloadCSV(csvContent, `sales-report-${period}-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportInventoryReport = () => {
    const headers = [
      'Drug Name',
      'Packaging Unit',
      'Batch Number',
      'Category',
      'Initial Stock',
      'Receipt',
      'Inventory',
      'Expired/Damaged',
      'Damaged Returns',
      'Current Stock',
      'Manufacturer',
      'Base Price',
      'Price + Net',
      'Price + Net + Tax',
      'Stock Status'
    ];

    const rows = drugs.map(drug => [
      drug.name,
      drug.packagingUnit,
      drug.batchNumber,
      drug.category,
      drug.initialStock.toString(),
      drug.receipt.toString(),
      drug.inventory.toString(),
      drug.expiredDamaged.toString(),
      drug.damagedReturns.toString(),
      drug.stockAmount.toString(),
      drug.factoryManufacturer,
      drug.basePrice.toFixed(2),
      drug.priceNet.toFixed(2),
      drug.priceNetTax.toFixed(2),
      drug.stockAmount < 10 ? 'Low Stock' : drug.stockAmount < 5 ? 'Critical' : 'In Stock'
    ]);

    const csvContent = [headers, ...rows].map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    downloadCSV(csvContent, `inventory-report-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportFinancialReport = () => {
    const { start, end } = getDateRange(period);
    const filteredTransactions = transactions.filter(t => t.date >= start && t.date < end);

    const summary = {
      totalRevenue: filteredTransactions.reduce((sum, t) => sum + t.totalAmount, 0),
      totalCost: filteredTransactions.reduce((sum, t) => 
        sum + t.items.reduce((itemSum, item) => 
          itemSum + (item.drug.basePrice * item.quantity), 0), 0),
      totalTransactions: filteredTransactions.length,
      totalItems: filteredTransactions.reduce((sum, t) => sum + t.items.length, 0)
    };

    const profit = summary.totalRevenue - summary.totalCost;
    const profitMargin = summary.totalRevenue > 0 ? (profit / summary.totalRevenue) * 100 : 0;

    const headers = ['Metric', 'Value'];
    const rows = [
      ['Period', `${period.charAt(0).toUpperCase() + period.slice(1)}`],
      ['Date Range', `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`],
      ['Total Revenue', `$${summary.totalRevenue.toFixed(2)}`],
      ['Total Cost', `$${summary.totalCost.toFixed(2)}`],
      ['Total Profit', `$${profit.toFixed(2)}`],
      ['Profit Margin', `${profitMargin.toFixed(2)}%`],
      ['Total Transactions', summary.totalTransactions.toString()],
      ['Total Items Sold', summary.totalItems.toString()],
      ['Average Transaction', `$${(summary.totalRevenue / Math.max(summary.totalTransactions, 1)).toFixed(2)}`]
    ];

    const csvContent = [headers, ...rows].map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    downloadCSV(csvContent, `financial-summary-${period}-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getReportDescription = () => {
    switch (reportType) {
      case 'sales':
        return 'Detailed sales transactions with item-level breakdown, including profits and customer information.';
      case 'inventory':
        return 'Complete inventory listing with pricing tiers, stock levels, and stock status alerts.';
      case 'financial':
        return 'Financial summary with revenue, costs, profits, and key performance metrics.';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Reports & Export</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={exportSalesReport}>
          <CardContent className="p-6 text-center">
            <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sales Report</h3>
            <p className="text-gray-600 text-sm mb-4">Export detailed sales transactions</p>
            <Button className="w-full">
              <Download size={16} className="mr-2" />
              Export Sales
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={exportInventoryReport}>
          <CardContent className="p-6 text-center">
            <FileText className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Inventory Report</h3>
            <p className="text-gray-600 text-sm mb-4">Export current inventory status</p>
            <Button className="w-full bg-green-600 hover:bg-green-700">
              <Download size={16} className="mr-2" />
              Export Inventory
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={exportFinancialReport}>
          <CardContent className="p-6 text-center">
            <FileText className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Financial Report</h3>
            <p className="text-gray-600 text-sm mb-4">Export financial summary</p>
            <Button className="w-full bg-purple-600 hover:bg-purple-700">
              <Download size={16} className="mr-2" />
              Export Financial
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Custom Report Generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Sales Report</SelectItem>
                  <SelectItem value="inventory">Inventory Report</SelectItem>
                  <SelectItem value="financial">Financial Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {reportType !== 'inventory' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">{getReportDescription()}</p>
          </div>

          <Button 
            className="w-full" 
            onClick={() => {
              switch (reportType) {
                case 'sales':
                  exportSalesReport();
                  break;
                case 'inventory':
                  exportInventoryReport();
                  break;
                case 'financial':
                  exportFinancialReport();
                  break;
              }
            }}
          >
            <Download size={20} className="mr-2" />
            Generate & Download Report
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Report Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{transactions.length}</p>
              <p className="text-sm text-gray-600">Total Transactions</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{drugs.length}</p>
              <p className="text-sm text-gray-600">Total Drugs in Inventory</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                {drugs.filter(drug => drug.stockAmount < 10).length}
              </p>
              <p className="text-sm text-gray-600">Low Stock Alerts</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;

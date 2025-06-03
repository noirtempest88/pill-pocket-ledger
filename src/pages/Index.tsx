import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import InventoryManagement, { Drug } from '@/components/InventoryManagement';
import SalesTransaction, { Transaction } from '@/components/SalesTransaction';
import FinancialSummary from '@/components/FinancialSummary';
import Reports from '@/components/Reports';

const Index = () => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [drugs, setDrugs] = useState<Drug[]>([
    {
      id: '1',
      name: 'Paracetamol',
      packagingUnit: 'Blister Pack',
      batchNumber: 'PCM-2024-001',
      initialStock: 200,
      receipt: 50,
      inventory: 100,
      expiredDamaged: 10,
      stockAmount: 125,
      factoryManufacturer: 'PharmaCorp Ltd',
      damagedReturns: 15,
      basePrice: 5.00,
      priceNet: 6.00,
      priceNetTax: 6.60,
      category: 'Pain Relief'
    },
    {
      id: '2',
      name: 'Amoxicillin',
      packagingUnit: 'Capsule Strip',
      batchNumber: 'AMX-2024-002',
      initialStock: 150,
      receipt: 30,
      inventory: 50,
      expiredDamaged: 5,
      stockAmount: 115,
      factoryManufacturer: 'MediCure Industries',
      damagedReturns: 10,
      basePrice: 12.00,
      priceNet: 14.40,
      priceNetTax: 15.84,
      category: 'Antibiotics'
    },
    {
      id: '3',
      name: 'Vitamin C',
      packagingUnit: 'Tablet Bottle',
      batchNumber: 'VTC-2024-003',
      initialStock: 100,
      receipt: 25,
      inventory: 75,
      expiredDamaged: 2,
      stockAmount: 43,
      factoryManufacturer: 'HealthMax Pharma',
      damagedReturns: 5,
      basePrice: 8.00,
      priceNet: 9.60,
      priceNetTax: 10.56,
      category: 'Vitamins'
    }
  ]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'inventory':
        return <InventoryManagement drugs={drugs} setDrugs={setDrugs} />;
      case 'sales':
        return (
          <SalesTransaction 
            drugs={drugs} 
            transactions={transactions} 
            setTransactions={setTransactions}
            setDrugs={setDrugs}
          />
        );
      case 'financial':
        return <FinancialSummary transactions={transactions} />;
      case 'reports':
        return <Reports transactions={transactions} drugs={drugs} />;
      default:
        return <InventoryManagement drugs={drugs} setDrugs={setDrugs} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-2 rounded-lg">
              <span className="text-blue-600 text-2xl font-bold">Rx</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold">Selokgondang Pharmacy</h1>
              <p className="text-blue-100">Complete pharmacy management solution</p>
            </div>
          </div>
        </div>
      </header>

      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {renderActiveTab()}
      </main>

      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2024 Selokgondang Pharmacy. All rights reserved.</p>
          <p className="text-gray-400 mt-2">Professional pharmacy management made simple</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

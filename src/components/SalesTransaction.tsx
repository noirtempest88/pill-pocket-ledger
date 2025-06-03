
import React, { useState } from 'react';
import { ShoppingCart, Printer, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Drug } from './InventoryManagement';

export interface Transaction {
  id: string;
  date: Date;
  items: {
    drug: Drug;
    quantity: number;
    totalPrice: number;
  }[];
  totalAmount: number;
  customerName?: string;
}

interface SalesTransactionProps {
  drugs: Drug[];
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  setDrugs: React.Dispatch<React.SetStateAction<Drug[]>>;
}

const SalesTransaction = ({ drugs, transactions, setTransactions, setDrugs }: SalesTransactionProps) => {
  const [cart, setCart] = useState<{ drug: Drug; quantity: number }[]>([]);
  const [selectedDrugId, setSelectedDrugId] = useState('');
  const [customerName, setCustomerName] = useState('');

  const addToCart = () => {
    const drug = drugs.find(d => d.id === selectedDrugId);
    if (!drug) return;

    const existingItem = cart.find(item => item.drug.id === drug.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.drug.id === drug.id 
          ? { ...item, quantity: Math.min(item.quantity + 1, drug.stock) }
          : item
      ));
    } else {
      setCart([...cart, { drug, quantity: 1 }]);
    }
    setSelectedDrugId('');
  };

  const updateQuantity = (drugId: string, newQuantity: number) => {
    const drug = drugs.find(d => d.id === drugId);
    if (!drug) return;

    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.drug.id !== drugId));
    } else if (newQuantity <= drug.stock) {
      setCart(cart.map(item => 
        item.drug.id === drugId 
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const removeFromCart = (drugId: string) => {
    setCart(cart.filter(item => item.drug.id !== drugId));
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.drug.finalPrice * item.quantity), 0);
  };

  const processTransaction = () => {
    if (cart.length === 0) return;

    const transaction: Transaction = {
      id: Date.now().toString(),
      date: new Date(),
      items: cart.map(item => ({
        drug: item.drug,
        quantity: item.quantity,
        totalPrice: item.drug.finalPrice * item.quantity
      })),
      totalAmount: getTotalAmount(),
      customerName: customerName || undefined
    };

    // Update stock
    const updatedDrugs = drugs.map(drug => {
      const cartItem = cart.find(item => item.drug.id === drug.id);
      if (cartItem) {
        return { ...drug, stock: drug.stock - cartItem.quantity };
      }
      return drug;
    });

    setDrugs(updatedDrugs);
    setTransactions([...transactions, transaction]);
    setCart([]);
    setCustomerName('');

    // Generate receipt
    printReceipt(transaction);
  };

  const printReceipt = (transaction: Transaction) => {
    const receiptWindow = window.open('', '_blank');
    if (!receiptWindow) return;

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${transaction.id}</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
            .item { display: flex; justify-content: space-between; margin-bottom: 10px; }
            .total { border-top: 2px solid #000; padding-top: 10px; margin-top: 20px; font-weight: bold; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>PharmaCare Pharmacy</h2>
            <p>Receipt #${transaction.id}</p>
            <p>${transaction.date.toLocaleString()}</p>
            ${transaction.customerName ? `<p>Customer: ${transaction.customerName}</p>` : ''}
          </div>
          
          <div class="items">
            ${transaction.items.map(item => `
              <div class="item">
                <span>${item.drug.name}</span>
                <span>${item.quantity} x $${item.drug.finalPrice.toFixed(2)} = $${item.totalPrice.toFixed(2)}</span>
              </div>
            `).join('')}
          </div>
          
          <div class="total">
            <div class="item">
              <span>Total Amount:</span>
              <span>$${transaction.totalAmount.toFixed(2)}</span>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; font-size: 12px;">
            <p>Thank you for your purchase!</p>
            <p>Have a great day!</p>
          </div>
        </body>
      </html>
    `;

    receiptWindow.document.write(receiptHTML);
    receiptWindow.document.close();
    receiptWindow.print();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShoppingCart size={24} />
            <span>New Sale</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Customer Name (Optional)"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
          
          <div className="flex space-x-2">
            <Select value={selectedDrugId} onValueChange={setSelectedDrugId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select Drug" />
              </SelectTrigger>
              <SelectContent>
                {drugs.filter(drug => drug.stock > 0).map(drug => (
                  <SelectItem key={drug.id} value={drug.id}>
                    {drug.name} - ${drug.finalPrice.toFixed(2)} (Stock: {drug.stock})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={addToCart} disabled={!selectedDrugId}>
              <Plus size={20} />
            </Button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {cart.map(item => (
              <div key={item.drug.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{item.drug.name}</p>
                  <p className="text-sm text-gray-600">${item.drug.finalPrice.toFixed(2)} each</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => updateQuantity(item.drug.id, item.quantity - 1)}
                  >
                    <Minus size={16} />
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => updateQuantity(item.drug.id, item.quantity + 1)}
                    disabled={item.quantity >= item.drug.stock}
                  >
                    <Plus size={16} />
                  </Button>
                  <span className="w-20 text-right">${(item.drug.finalPrice * item.quantity).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-xl font-bold">
              <span>Total:</span>
              <span>${getTotalAmount().toFixed(2)}</span>
            </div>
          </div>

          <Button 
            className="w-full bg-green-600 hover:bg-green-700" 
            onClick={processTransaction}
            disabled={cart.length === 0}
          >
            <Printer size={20} className="mr-2" />
            Complete Sale & Print Receipt
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {transactions.slice(-10).reverse().map(transaction => (
              <div key={transaction.id} className="p-3 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Receipt #{transaction.id}</p>
                    <p className="text-sm text-gray-600">{transaction.date.toLocaleString()}</p>
                    {transaction.customerName && (
                      <p className="text-sm text-gray-600">Customer: {transaction.customerName}</p>
                    )}
                    <p className="text-sm text-gray-600">{transaction.items.length} items</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${transaction.totalAmount.toFixed(2)}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => printReceipt(transaction)}
                      className="mt-1"
                    >
                      <Printer size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesTransaction;

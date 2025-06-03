import React, { useState } from 'react';
import { ShoppingCart, Printer, Plus, Minus, Edit, Trash2 } from 'lucide-react';
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
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const addToCart = () => {
    const drug = drugs.find(d => d.id === selectedDrugId);
    if (!drug) return;

    const existingItem = cart.find(item => item.drug.id === drug.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.drug.id === drug.id 
          ? { ...item, quantity: Math.min(item.quantity + 1, drug.stockAmount) }
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
    } else if (newQuantity <= drug.stockAmount) {
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

    // Update stock amounts and inventory
    const updatedDrugs = drugs.map(drug => {
      const cartItem = cart.find(item => item.drug.id === drug.id);
      if (cartItem) {
        const newInventory = drug.inventory + cartItem.quantity;
        const newStockAmount = drug.initialStock + drug.receipt - newInventory - drug.expiredDamaged;
        return { 
          ...drug, 
          inventory: newInventory,
          stockAmount: newStockAmount
        };
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

  const editTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    // Restore stock when editing
    const updatedDrugs = drugs.map(drug => {
      const transactionItem = transaction.items.find(item => item.drug.id === drug.id);
      if (transactionItem) {
        const newInventory = drug.inventory - transactionItem.quantity;
        const newStockAmount = drug.initialStock + drug.receipt - newInventory - drug.expiredDamaged;
        return { 
          ...drug, 
          inventory: newInventory,
          stockAmount: newStockAmount
        };
      }
      return drug;
    });
    setDrugs(updatedDrugs);
    setCart(transaction.items.map(item => ({ drug: item.drug, quantity: item.quantity })));
    setCustomerName(transaction.customerName || '');
  };

  const updateTransaction = () => {
    if (!editingTransaction || cart.length === 0) return;

    const updatedTransaction: Transaction = {
      ...editingTransaction,
      items: cart.map(item => ({
        drug: item.drug,
        quantity: item.quantity,
        totalPrice: item.drug.finalPrice * item.quantity
      })),
      totalAmount: getTotalAmount(),
      customerName: customerName || undefined
    };

    // Update stock amounts
    const updatedDrugs = drugs.map(drug => {
      const cartItem = cart.find(item => item.drug.id === drug.id);
      if (cartItem) {
        const newInventory = drug.inventory + cartItem.quantity;
        const newStockAmount = drug.initialStock + drug.receipt - newInventory - drug.expiredDamaged;
        return { 
          ...drug, 
          inventory: newInventory,
          stockAmount: newStockAmount
        };
      }
      return drug;
    });

    setDrugs(updatedDrugs);
    setTransactions(transactions.map(t => t.id === editingTransaction.id ? updatedTransaction : t));
    setCart([]);
    setCustomerName('');
    setEditingTransaction(null);
  };

  const deleteTransaction = (transactionId: string) => {
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) return;

    // Restore stock when deleting
    const updatedDrugs = drugs.map(drug => {
      const transactionItem = transaction.items.find(item => item.drug.id === drug.id);
      if (transactionItem) {
        const newInventory = drug.inventory - transactionItem.quantity;
        const newStockAmount = drug.initialStock + drug.receipt - newInventory - drug.expiredDamaged;
        return { 
          ...drug, 
          inventory: newInventory,
          stockAmount: newStockAmount
        };
      }
      return drug;
    });

    setDrugs(updatedDrugs);
    setTransactions(transactions.filter(t => t.id !== transactionId));
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
            @page { 
              size: 58mm 80mm; 
              margin: 2mm; 
            }
            body { 
              font-family: monospace; 
              font-size: 8px; 
              width: 54mm; 
              margin: 0; 
              padding: 2mm;
              background: white;
            }
            .header { 
              text-align: center; 
              border-bottom: 1px dashed #000; 
              padding-bottom: 3px; 
              margin-bottom: 5px; 
            }
            .item { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 2px;
              font-size: 7px;
            }
            .total { 
              border-top: 1px dashed #000; 
              padding-top: 3px; 
              margin-top: 5px; 
              font-weight: bold; 
            }
            .footer {
              text-align: center; 
              margin-top: 5px; 
              font-size: 6px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div style="font-weight: bold;">Selokgondang Pharmacy</div>
            <div>Receipt #${transaction.id}</div>
            <div>${transaction.date.toLocaleString()}</div>
            ${transaction.customerName ? `<div>Customer: ${transaction.customerName}</div>` : ''}
          </div>
          
          <div class="items">
            ${transaction.items.map(item => `
              <div class="item">
                <div style="flex: 1;">${item.drug.name}</div>
              </div>
              <div class="item">
                <span>${item.quantity} x $${item.drug.finalPrice.toFixed(2)}</span>
                <span>$${item.totalPrice.toFixed(2)}</span>
              </div>
            `).join('')}
          </div>
          
          <div class="total">
            <div class="item">
              <span>TOTAL:</span>
              <span>$${transaction.totalAmount.toFixed(2)}</span>
            </div>
          </div>
          
          <div class="footer">
            <div>Thank you!</div>
            <div>Have a great day!</div>
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
            <span>{editingTransaction ? 'Edit Sale' : 'New Sale'}</span>
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
                {drugs.filter(drug => drug.stockAmount > 0).map(drug => (
                  <SelectItem key={drug.id} value={drug.id}>
                    {drug.name} - ${drug.finalPrice.toFixed(2)} (Stock: {drug.stockAmount})
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
                    disabled={item.quantity >= item.drug.stockAmount}
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

          <div className="flex space-x-2">
            <Button 
              className="flex-1 bg-green-600 hover:bg-green-700" 
              onClick={editingTransaction ? updateTransaction : processTransaction}
              disabled={cart.length === 0}
            >
              <Printer size={20} className="mr-2" />
              {editingTransaction ? 'Update Sale' : 'Complete Sale'} & Print Receipt
            </Button>
            {editingTransaction && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setEditingTransaction(null);
                  setCart([]);
                  setCustomerName('');
                }}
              >
                Cancel
              </Button>
            )}
          </div>
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
                    <div className="flex space-x-1 mt-1">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => printReceipt(transaction)}
                      >
                        <Printer size={16} />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => editTransaction(transaction)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => deleteTransaction(transaction.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
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

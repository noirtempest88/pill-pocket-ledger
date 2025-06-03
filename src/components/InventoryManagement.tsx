
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface Drug {
  id: string;
  name: string;
  packagingUnit: string;
  initialStock: number;
  receipt: number;
  inventory: number;
  expiredDamaged: number;
  stockAmount: number;
  factoryManufacturer: string;
  basePrice: number;
  netPrice: number;
  finalPrice: number;
  category: string;
}

interface InventoryManagementProps {
  drugs: Drug[];
  setDrugs: React.Dispatch<React.SetStateAction<Drug[]>>;
}

const InventoryManagement = ({ drugs, setDrugs }: InventoryManagementProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDrug, setEditingDrug] = useState<Drug | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    packagingUnit: '',
    initialStock: '',
    receipt: '',
    inventory: '',
    expiredDamaged: '',
    factoryManufacturer: '',
    basePrice: '',
    category: ''
  });

  const TAX_RATE = 0.1; // 10% tax

  const calculatePrices = (basePrice: number) => {
    const netPrice = basePrice * 1.2; // 20% markup
    const finalPrice = netPrice * (1 + TAX_RATE);
    return { netPrice, finalPrice };
  };

  const calculateStockAmount = (initialStock: number, receipt: number, inventory: number, expiredDamaged: number) => {
    return initialStock + receipt - inventory - expiredDamaged;
  };

  const filteredDrugs = drugs.filter(drug =>
    drug.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    drug.packagingUnit.toLowerCase().includes(searchTerm.toLowerCase()) ||
    drug.factoryManufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    drug.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const basePrice = parseFloat(formData.basePrice);
    const { netPrice, finalPrice } = calculatePrices(basePrice);
    const initialStock = parseInt(formData.initialStock);
    const receipt = parseInt(formData.receipt);
    const inventory = parseInt(formData.inventory);
    const expiredDamaged = parseInt(formData.expiredDamaged);
    const stockAmount = calculateStockAmount(initialStock, receipt, inventory, expiredDamaged);
    
    const drugData = {
      id: editingDrug?.id || Date.now().toString(),
      name: formData.name,
      packagingUnit: formData.packagingUnit,
      initialStock,
      receipt,
      inventory,
      expiredDamaged,
      stockAmount,
      factoryManufacturer: formData.factoryManufacturer,
      basePrice,
      netPrice,
      finalPrice,
      category: formData.category
    };

    if (editingDrug) {
      setDrugs(drugs.map(drug => drug.id === editingDrug.id ? drugData : drug));
      setEditingDrug(null);
    } else {
      setDrugs([...drugs, drugData]);
    }

    setFormData({ 
      name: '', 
      packagingUnit: '', 
      initialStock: '', 
      receipt: '', 
      inventory: '', 
      expiredDamaged: '', 
      factoryManufacturer: '', 
      basePrice: '', 
      category: '' 
    });
    setShowAddForm(false);
  };

  const handleEdit = (drug: Drug) => {
    setEditingDrug(drug);
    setFormData({
      name: drug.name,
      packagingUnit: drug.packagingUnit,
      initialStock: drug.initialStock.toString(),
      receipt: drug.receipt.toString(),
      inventory: drug.inventory.toString(),
      expiredDamaged: drug.expiredDamaged.toString(),
      factoryManufacturer: drug.factoryManufacturer,
      basePrice: drug.basePrice.toString(),
      category: drug.category
    });
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    setDrugs(drugs.filter(drug => drug.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Inventory Management</h2>
        <Button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus size={20} className="mr-2" />
          Add Drug
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search drugs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingDrug ? 'Edit Drug' : 'Add New Drug'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Drug Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                placeholder="Packaging Unit"
                value={formData.packagingUnit}
                onChange={(e) => setFormData({ ...formData, packagingUnit: e.target.value })}
                required
              />
              <Input
                placeholder="Initial Stock"
                type="number"
                value={formData.initialStock}
                onChange={(e) => setFormData({ ...formData, initialStock: e.target.value })}
                required
              />
              <Input
                placeholder="Receipt"
                type="number"
                value={formData.receipt}
                onChange={(e) => setFormData({ ...formData, receipt: e.target.value })}
                required
              />
              <Input
                placeholder="Inventory"
                type="number"
                value={formData.inventory}
                onChange={(e) => setFormData({ ...formData, inventory: e.target.value })}
                required
              />
              <Input
                placeholder="Expired/Damaged"
                type="number"
                value={formData.expiredDamaged}
                onChange={(e) => setFormData({ ...formData, expiredDamaged: e.target.value })}
                required
              />
              <Input
                placeholder="Factory Manufacturer"
                value={formData.factoryManufacturer}
                onChange={(e) => setFormData({ ...formData, factoryManufacturer: e.target.value })}
                required
              />
              <Input
                placeholder="Base Price"
                type="number"
                step="0.01"
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                required
              />
              <Input
                placeholder="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              />
              <div className="flex space-x-2 col-span-full">
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {editingDrug ? 'Update' : 'Add'} Drug
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingDrug(null);
                    setFormData({ 
                      name: '', 
                      packagingUnit: '', 
                      initialStock: '', 
                      receipt: '', 
                      inventory: '', 
                      expiredDamaged: '', 
                      factoryManufacturer: '', 
                      basePrice: '', 
                      category: '' 
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Drug Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Packaging Unit</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Initial Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inventory</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expired/Damaged</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manufacturer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net + Tax</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDrugs.map((drug) => (
                  <tr key={drug.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{drug.name}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{drug.packagingUnit}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{drug.initialStock}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{drug.receipt}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{drug.inventory}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{drug.expiredDamaged}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{drug.stockAmount}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{drug.factoryManufacturer}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">${drug.basePrice.toFixed(2)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">${drug.netPrice.toFixed(2)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">${drug.finalPrice.toFixed(2)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(drug)}>
                          <Edit size={16} />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(drug.id)} className="text-red-600 hover:text-red-700">
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
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

export default InventoryManagement;

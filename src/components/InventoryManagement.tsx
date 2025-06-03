
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface Drug {
  id: string;
  name: string;
  product: string;
  basePrice: number;
  netPrice: number;
  finalPrice: number;
  stock: number;
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
    product: '',
    basePrice: '',
    stock: '',
    category: ''
  });

  const TAX_RATE = 0.1; // 10% tax

  const calculatePrices = (basePrice: number) => {
    const netPrice = basePrice * 1.2; // 20% markup
    const finalPrice = netPrice * (1 + TAX_RATE);
    return { netPrice, finalPrice };
  };

  const filteredDrugs = drugs.filter(drug =>
    drug.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    drug.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
    drug.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const basePrice = parseFloat(formData.basePrice);
    const { netPrice, finalPrice } = calculatePrices(basePrice);
    
    const drugData = {
      id: editingDrug?.id || Date.now().toString(),
      name: formData.name,
      product: formData.product,
      basePrice,
      netPrice,
      finalPrice,
      stock: parseInt(formData.stock),
      category: formData.category
    };

    if (editingDrug) {
      setDrugs(drugs.map(drug => drug.id === editingDrug.id ? drugData : drug));
      setEditingDrug(null);
    } else {
      setDrugs([...drugs, drugData]);
    }

    setFormData({ name: '', product: '', basePrice: '', stock: '', category: '' });
    setShowAddForm(false);
  };

  const handleEdit = (drug: Drug) => {
    setEditingDrug(drug);
    setFormData({
      name: drug.name,
      product: drug.product,
      basePrice: drug.basePrice.toString(),
      stock: drug.stock.toString(),
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
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Drug Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                placeholder="Product"
                value={formData.product}
                onChange={(e) => setFormData({ ...formData, product: e.target.value })}
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
                placeholder="Stock Quantity"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
              />
              <Input
                placeholder="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              />
              <div className="flex space-x-2">
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {editingDrug ? 'Update' : 'Add'} Drug
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingDrug(null);
                    setFormData({ name: '', product: '', basePrice: '', stock: '', category: '' });
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
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Drug Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price + Net</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price + Net + Tax</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDrugs.map((drug) => (
                  <tr key={drug.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{drug.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{drug.product}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${drug.basePrice.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${drug.netPrice.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${drug.finalPrice.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{drug.stock}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{drug.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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

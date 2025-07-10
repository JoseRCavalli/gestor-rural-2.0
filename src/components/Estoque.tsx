
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Plus, Edit2, Trash2, AlertTriangle, Search, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useStock } from '@/hooks/useStock';
import StockImporter from '@/components/StockImporter';
import StockAlerts from '@/components/StockAlerts';
import StockControl from '@/components/StockControl';

const Estoque = () => {
  const { 
    stockItems, 
    createStockItem, 
    updateStockItem, 
    deleteStockItem, 
    loading,
    calculateReservedValue,
    calculateAvailableValue,
    calculateTotalStockValue,
    formatCurrency
  } = useStock();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todas');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    quantity: 0,
    unit: 'kg',
    category: 'Geral',
    min_stock: 0,
    average_cost: 0,
    selling_price: 0,
    reserved_stock: 0,
    available_stock: 0
  });

  const filteredItems = stockItems.filter(item => {
    const searchRegex = new RegExp(searchTerm, 'i');
    const categoryMatch = selectedCategory === 'todas' || item.category === selectedCategory;
    return (searchRegex.test(item.name) || searchRegex.test(item.code || '')) && categoryMatch;
  });

  const categories = ['todas', ...new Set(stockItems.map(item => item.category))];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOpenDialog = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        code: item.code || '',
        quantity: item.quantity,
        unit: item.unit,
        category: item.category,
        min_stock: item.min_stock,
        average_cost: item.average_cost || 0,
        selling_price: item.selling_price || 0,
        reserved_stock: item.reserved_stock || 0,
        available_stock: item.available_stock || 0
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        code: '',
        quantity: 0,
        unit: 'kg',
        category: 'Geral',
        min_stock: 0,
        average_cost: 0,
        selling_price: 0,
        reserved_stock: 0,
        available_stock: 0
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async () => {
    if (editingItem) {
      await updateStockItem(editingItem.id, formData);
    } else {
      await createStockItem(formData);
    }
    handleCloseDialog();
  };

  const handleDelete = async (id: string) => {
    await deleteStockItem(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">📦 Controle de Estoque</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-lg border">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Valor Total: {formatCurrency(calculateTotalStockValue())}
            </span>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Adicionar Item</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Editar Item' : 'Adicionar Item'}</DialogTitle>
                <DialogDescription>
                  Preencha os campos abaixo para {editingItem ? 'editar' : 'adicionar'} um item ao estoque.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="code">Código</Label>
                    <Input
                      type="text"
                      id="code"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      placeholder="Ex: 605"
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Nome do Item</Label>
                    <Input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Ex: Ração Bovinos"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="unit">Unidade de Medida</Label>
                    <Input
                      type="text"
                      id="unit"
                      name="unit"
                      value={formData.unit}
                      onChange={handleInputChange}
                      placeholder="Ex: kg, litros, UN, MT, SC"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Categoria</Label>
                    <Input
                      type="text"
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      placeholder="Ex: Matéria-prima, Uso e Consumo"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="average_cost">Custo Médio (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      id="average_cost"
                      name="average_cost"
                      value={formData.average_cost}
                      onChange={(e) => handleInputChange({ target: { name: 'average_cost', value: parseFloat(e.target.value) || 0 } } as any)}
                      placeholder="Ex: 1,92"
                    />
                  </div>
                  <div>
                    <Label htmlFor="selling_price">Valor de Venda (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      id="selling_price"
                      name="selling_price"
                      value={formData.selling_price}
                      onChange={(e) => handleInputChange({ target: { name: 'selling_price', value: parseFloat(e.target.value) || 0 } } as any)}
                      placeholder="Ex: 2,50"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reserved_stock">Estoque Reservado</Label>
                    <Input
                      type="number"
                      id="reserved_stock"
                      name="reserved_stock"
                      value={formData.reserved_stock}
                      onChange={(e) => handleInputChange({ target: { name: 'reserved_stock', value: parseInt(e.target.value) || 0 } } as any)}
                      placeholder="Ex: 349495"
                    />
                  </div>
                  <div>
                    <Label htmlFor="available_stock">Estoque Disponível</Label>
                    <Input
                      type="number"
                      id="available_stock"
                      name="available_stock"
                      value={formData.available_stock}
                      onChange={(e) => handleInputChange({ target: { name: 'available_stock', value: parseInt(e.target.value) || 0 } } as any)}
                      placeholder="Ex: 52"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="min_stock">Estoque Mínimo</Label>
                  <Input
                    type="number"
                    id="min_stock"
                    name="min_stock"
                    value={formData.min_stock}
                    onChange={(e) => handleInputChange({ target: { name: 'min_stock', value: parseInt(e.target.value) || 0 } } as any)}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="secondary" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button type="submit" onClick={handleSubmit}>
                  {editingItem ? 'Salvar' : 'Adicionar'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stock Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <StockAlerts />
      </motion.div>

      {/* Stock Importer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <StockImporter onImportComplete={() => window.location.reload()} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-gray-500" />
            <Input
              type="text"
              placeholder="Buscar item por nome ou código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-50 border-none focus:ring-0 shadow-none"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="category-filter" className="text-sm text-gray-600">
              Filtrar por Categoria:
            </Label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-4">Carregando estoque...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.length === 0 ? (
              <div className="text-center py-4 text-gray-500">Nenhum item encontrado.</div>
            ) : (
              filteredItems.map(item => (
                <motion.div
                  key={item.id}
                  className="bg-gray-50 rounded-lg p-4 border hover:shadow-md transition-shadow"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-800">{item.name}</h3>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(item)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(item.id)}
                            className="text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Informações básicas */}
                      <div className="space-y-1 text-sm text-gray-600 mb-3">
                        {item.code && <p><strong>Código:</strong> {item.code}</p>}
                        <p><strong>Categoria:</strong> {item.category}</p>
                        <p><strong>Unidade:</strong> {item.unit}</p>
                      </div>

                      {/* Custos e valores */}
                      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                        {item.average_cost > 0 && (
                          <div className="bg-blue-50 p-2 rounded">
                            <p className="text-blue-700 font-medium">Custo Médio</p>
                            <p className="text-blue-800">{formatCurrency(item.average_cost)}</p>
                          </div>
                        )}
                        {item.selling_price > 0 && (
                          <div className="bg-green-50 p-2 rounded">
                            <p className="text-green-700 font-medium">Vl. Venda</p>
                            <p className="text-green-800">{formatCurrency(item.selling_price)}</p>
                          </div>
                        )}
                      </div>

                      {/* Estoques */}
                      <div className="space-y-2 text-xs">
                        {item.reserved_stock > 0 && (
                          <div className="bg-yellow-50 p-2 rounded border-l-2 border-yellow-400">
                            <p className="text-yellow-700 font-medium">
                              Estoque Reservado: {item.reserved_stock} {item.unit}
                            </p>
                            {item.average_cost > 0 && (
                              <p className="text-yellow-800 font-bold">
                                Valor: {formatCurrency(calculateReservedValue(item))}
                              </p>
                            )}
                          </div>
                        )}
                        
                        {item.available_stock > 0 && (
                          <div className="bg-green-50 p-2 rounded border-l-2 border-green-400">
                            <p className="text-green-700 font-medium">
                              Estoque Disponível: {item.available_stock} {item.unit}
                            </p>
                            {item.average_cost > 0 && (
                              <p className="text-green-800 font-bold">
                                Valor: {formatCurrency(calculateAvailableValue(item))}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Alerta de estoque baixo */}
                      {(item.available_stock + item.reserved_stock) <= item.min_stock && (
                        <div className="flex items-center text-red-500 text-xs mt-2 bg-red-50 p-2 rounded">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          Estoque abaixo do mínimo ({item.min_stock} {item.unit})!
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Controles de ajuste rápido */}
                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Controle Rápido:</span>
                      <StockControl item={item} />
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Estoque;

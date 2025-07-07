
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Minus, AlertTriangle, Trash2 } from 'lucide-react';
import { useStock } from '@/hooks/useStock';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Estoque = () => {
  const { stockItems, createStockItem, updateStockItem, deleteStockItem } = useStock();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    quantity: 0,
    unit: 'kg',
    min_stock: 0,
    category: 'Fertilizantes'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) return;

    if (editingItem) {
      await updateStockItem(editingItem, formData);
      setEditingItem(null);
    } else {
      await createStockItem(formData);
    }

    setFormData({
      name: '',
      quantity: 0,
      unit: 'kg',
      min_stock: 0,
      category: 'Fertilizantes'
    });
    setShowAddForm(false);
  };

  const handleEdit = (item: any) => {
    setFormData({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      min_stock: item.min_stock,
      category: item.category
    });
    setEditingItem(item.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja deletar este item?')) {
      await deleteStockItem(id);
    }
  };

  const handleQuantityChange = async (id: string, newQuantity: number) => {
    if (newQuantity < 0) return;
    await updateStockItem(id, { quantity: newQuantity });
  };

  const getStockStatus = (quantity: number, minStock: number) => {
    if (quantity <= minStock * 0.5) return 'Crítico';
    if (quantity <= minStock) return 'Baixo';
    return 'OK';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OK': return 'text-green-700 bg-green-100';
      case 'Baixo': return 'text-yellow-700 bg-yellow-100';
      case 'Crítico': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OK': return '✅';
      case 'Baixo': return '⚠️';
      case 'Crítico': return '🚨';
      default: return '❓';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Fertilizantes': return 'bg-green-50 text-green-700';
      case 'Sementes': return 'bg-blue-50 text-blue-700';
      case 'Defensivos': return 'bg-red-50 text-red-700';
      case 'Ração': return 'bg-yellow-50 text-yellow-700';
      case 'Veterinário': return 'bg-purple-50 text-purple-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  const criticalItems = stockItems.filter(item => getStockStatus(item.quantity, item.min_stock) === 'Crítico');
  const lowItems = stockItems.filter(item => getStockStatus(item.quantity, item.min_stock) === 'Baixo');

  const resetForm = () => {
    setFormData({
      name: '',
      quantity: 0,
      unit: 'kg',
      min_stock: 0,
      category: 'Fertilizantes'
    });
    setEditingItem(null);
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">📦 Controle de Estoque</h2>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-green-600 text-white hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Item
        </Button>
      </div>

      {/* Alert Cards */}
      {(criticalItems.length > 0 || lowItems.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {criticalItems.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-50 border border-red-200 rounded-xl p-4"
            >
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-red-800">Estoque Crítico</h3>
              </div>
              <p className="text-sm text-red-700 mb-2">{criticalItems.length} item(s) em nível crítico</p>
              <div className="space-y-1">
                {criticalItems.map(item => (
                  <p key={item.id} className="text-xs text-red-600">• {item.name}</p>
                ))}
              </div>
            </motion.div>
          )}

          {lowItems.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-yellow-50 border border-yellow-200 rounded-xl p-4"
            >
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <h3 className="font-semibold text-yellow-800">Estoque Baixo</h3>
              </div>
              <p className="text-sm text-yellow-700 mb-2">{lowItems.length} item(s) com estoque baixo</p>
              <div className="space-y-1">
                {lowItems.map(item => (
                  <p key={item.id} className="text-xs text-yellow-600">• {item.name}</p>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {editingItem ? 'Editar Item' : 'Adicionar Novo Item'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Item</label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: Fertilizante NPK"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantidade</label>
              <Input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                placeholder="0"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unidade</label>
              <select 
                value={formData.unit}
                onChange={(e) => setFormData({...formData, unit: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="kg">kg</option>
                <option value="L">L</option>
                <option value="unidades">unidades</option>
                <option value="doses">doses</option>
                <option value="sacas">sacas</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estoque Mínimo</label>
              <Input
                type="number"
                value={formData.min_stock}
                onChange={(e) => setFormData({...formData, min_stock: parseInt(e.target.value) || 0})}
                placeholder="0"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="Fertilizantes">Fertilizantes</option>
                <option value="Sementes">Sementes</option>
                <option value="Defensivos">Defensivos</option>
                <option value="Ração">Ração</option>
                <option value="Veterinário">Veterinário</option>
              </select>
            </div>
            <div className="flex items-end space-x-2">
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700"
              >
                {editingItem ? 'Atualizar' : 'Salvar'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Stock Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última Atualização</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stockItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Nenhum item no estoque. Clique em "Novo Item" para começar.
                  </td>
                </tr>
              ) : (
                stockItems.map((item) => {
                  const status = getStockStatus(item.quantity, item.min_stock);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">Min: {item.min_stock} {item.unit}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(item.category)}`}>
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-sm font-medium text-gray-900 min-w-[60px] text-center">
                            {item.quantity} {item.unit}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="p-1 text-green-600 hover:bg-green-100 rounded"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getStatusIcon(status)}</span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
                            {status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(item.updated_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleEdit(item)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Estoque;

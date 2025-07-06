
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Minus, AlertTriangle } from 'lucide-react';

const Estoque = () => {
  const [stockItems, setStockItems] = useState([
    { id: 1, name: 'Fertilizante NPK 20-05-20', quantity: 450, unit: 'kg', minStock: 200, lastUpdate: '2024-01-10', category: 'Fertilizantes' },
    { id: 2, name: 'Sementes de Soja Transgênica', quantity: 25, unit: 'kg', minStock: 50, lastUpdate: '2024-01-12', category: 'Sementes' },
    { id: 3, name: 'Defensivo Glifosato', quantity: 5, unit: 'L', minStock: 15, lastUpdate: '2024-01-14', category: 'Defensivos' },
    { id: 4, name: 'Ração Bovina Premium', quantity: 800, unit: 'kg', minStock: 300, lastUpdate: '2024-01-11', category: 'Ração' },
    { id: 5, name: 'Adubo Orgânico', quantity: 150, unit: 'kg', minStock: 100, lastUpdate: '2024-01-13', category: 'Fertilizantes' },
    { id: 6, name: 'Vacina Antiaftosa', quantity: 8, unit: 'doses', minStock: 20, lastUpdate: '2024-01-09', category: 'Veterinário' }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);

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

  const criticalItems = stockItems.filter(item => getStockStatus(item.quantity, item.minStock) === 'Crítico');
  const lowItems = stockItems.filter(item => getStockStatus(item.quantity, item.minStock) === 'Baixo');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">📦 Controle de Estoque</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Item</span>
        </button>
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
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Adicionar Novo Item</h3>
          <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Item</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ex: Fertilizante NPK"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantidade</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unidade</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option>kg</option>
                <option>L</option>
                <option>unidades</option>
                <option>doses</option>
                <option>sacas</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estoque Mínimo</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option>Fertilizantes</option>
                <option>Sementes</option>
                <option>Defensivos</option>
                <option>Ração</option>
                <option>Veterinário</option>
              </select>
            </div>
            <div className="flex items-end space-x-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
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
              {stockItems.map((item) => {
                const status = getStockStatus(item.quantity, item.minStock);
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-500">Min: {item.minStock} {item.unit}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(item.category)}`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.quantity} {item.unit}
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
                      {new Date(item.lastUpdate).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <Plus className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Minus className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Estoque;

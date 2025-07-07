
import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Filter, RefreshCw } from 'lucide-react';
import { useCommodities } from '@/hooks/useCommodities';
import { Button } from '@/components/ui/button';

const Commodities = () => {
  const [selectedProduct, setSelectedProduct] = useState('todos');
  const { commodities, history, loading, refetch } = useCommodities();

  const filteredCommodities = selectedProduct === 'todos' 
    ? commodities 
    : commodities.filter(c => c.name.toLowerCase().includes(selectedProduct.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">📈 Preços de Commodities</h2>
        <div className="flex items-center space-x-4">
          <Button
            onClick={refetch}
            disabled={loading}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </Button>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="todos">Todos os Produtos</option>
              <option value="soja">Soja</option>
              <option value="milho">Milho</option>
              <option value="leite">Leite</option>
              <option value="boi gordo">Boi Gordo</option>
              <option value="dólar">Dólar</option>
            </select>
          </div>
          <div className="text-sm text-gray-600">
            {loading ? 'Atualizando...' : `Atualizado: ${new Date().toLocaleTimeString('pt-BR')}`}
          </div>
        </div>
      </div>

      {/* Commodities Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCommodities.map((commodity, index) => (
          <motion.div
            key={commodity.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{commodity.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-800">{commodity.name}</h3>
                  <p className="text-sm text-gray-600">{commodity.unit}</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`flex items-center space-x-1 ${commodity.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {commodity.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span className="font-medium">{Math.abs(commodity.change).toFixed(2)}%</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {commodity.price.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">Preço atual</p>
              </div>

              <div className="text-sm text-gray-500">
                <p>Última atualização: {new Date(commodity.lastUpdate).toLocaleString('pt-BR')}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Price History Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Evolução dos Preços (Últimos 7 dias)</h3>
        
        <div className="space-y-4">
          {/* Simple Chart Visualization */}
          <div className="grid grid-cols-7 gap-4">
            {history.map((day, index) => (
              <div key={day.date} className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">
                  {new Date(day.date).toLocaleDateString('pt-BR', { weekday: 'short' })}
                </p>
                
                {/* Chart bars */}
                <div className="space-y-2">
                  <div className="bg-green-100 rounded-lg p-2">
                    <div 
                      className="bg-green-500 rounded-sm mx-auto"
                      style={{ 
                        height: `${Math.max(20, (day.soja / 160) * 60)}px`,
                        width: '8px'
                      }}
                    ></div>
                    <p className="text-xs text-green-700 mt-1">{day.soja.toFixed(0)}</p>
                  </div>
                  
                  <div className="bg-yellow-100 rounded-lg p-2">
                    <div 
                      className="bg-yellow-500 rounded-sm mx-auto"
                      style={{ 
                        height: `${Math.max(20, (day.milho / 95) * 60)}px`,
                        width: '8px'
                      }}
                    ></div>
                    <p className="text-xs text-yellow-700 mt-1">{day.milho.toFixed(0)}</p>
                  </div>
                  
                  <div className="bg-blue-100 rounded-lg p-2">
                    <div 
                      className="bg-blue-500 rounded-sm mx-auto"
                      style={{ 
                        height: `${Math.max(20, (day.leite / 2.5) * 60)}px`,
                        width: '8px'
                      }}
                    ></div>
                    <p className="text-xs text-blue-700 mt-1">{day.leite.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Legend */}
          <div className="flex justify-center space-x-6 pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
              <span className="text-sm text-gray-600">Soja</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-sm"></div>
              <span className="text-sm text-gray-600">Milho</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
              <span className="text-sm text-gray-600">Leite</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Market Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Análise do Mercado</h3>
          <div className="space-y-4">
            {commodities.slice(0, 3).map((commodity, index) => (
              <div 
                key={commodity.name}
                className={`p-4 rounded-lg border-l-4 ${
                  commodity.trend === 'up' 
                    ? 'bg-green-50 border-green-400' 
                    : 'bg-red-50 border-red-400'
                }`}
              >
                <p className={`font-medium ${
                  commodity.trend === 'up' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {commodity.name} {commodity.trend === 'up' ? 'em Alta' : 'em Queda'}
                </p>
                <p className={`text-sm ${
                  commodity.trend === 'up' ? 'text-green-700' : 'text-red-700'
                }`}>
                  Variação de {commodity.change > 0 ? '+' : ''}{commodity.change.toFixed(2)}% hoje
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🎯 Recomendações</h3>
          <div className="space-y-4">
            {commodities.slice(0, 3).map((commodity, index) => (
              <div key={commodity.name} className="flex items-start space-x-3">
                <span className={`font-bold ${
                  commodity.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {commodity.trend === 'up' ? '✓' : '⚠'}
                </span>
                <div>
                  <p className="font-medium text-gray-800">
                    {commodity.trend === 'up' ? 'Momento favorável' : 'Aguardar melhoria'} - {commodity.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {commodity.trend === 'up' 
                      ? 'Considere venda ou negociação' 
                      : 'Acompanhar evolução dos preços'
                    }
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Commodities;

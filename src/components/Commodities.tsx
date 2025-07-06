
import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Filter } from 'lucide-react';

const Commodities = () => {
  const [selectedProduct, setSelectedProduct] = useState('todos');

  const commodities = [
    {
      name: 'Soja',
      price: 157.80,
      unit: 'saca 60kg',
      change: 2.3,
      trend: 'up',
      icon: '🌱',
      volume: '125,450 sacas',
      high: 159.20,
      low: 155.10
    },
    {
      name: 'Milho',
      price: 89.50,
      unit: 'saca 60kg',
      change: -1.2,
      trend: 'down',
      icon: '🌽',
      volume: '98,320 sacas',
      high: 91.00,
      low: 88.75
    },
    {
      name: 'Leite',
      price: 2.45,
      unit: 'litro',
      change: 0.8,
      trend: 'up',
      icon: '🥛',
      volume: '45,280 L',
      high: 2.48,
      low: 2.42
    },
    {
      name: 'Boi Gordo',
      price: 312.00,
      unit: '@',
      change: 1.5,
      trend: 'up',
      icon: '🐂',
      volume: '1,250 @',
      high: 315.50,
      low: 308.20
    },
    {
      name: 'Café Arábica',
      price: 1285.00,
      unit: 'saca 60kg',
      change: -0.5,
      trend: 'down',
      icon: '☕',
      volume: '8,950 sacas',
      high: 1290.00,
      low: 1280.00
    },
    {
      name: 'Açúcar',
      price: 22.45,
      unit: 'kg',
      change: 3.2,
      trend: 'up',
      icon: '🍯',
      volume: '15,680 kg',
      high: 22.80,
      low: 21.90
    }
  ];

  // Mock data for price history chart
  const priceHistory = [
    { day: 'Seg', soja: 155, milho: 90, leite: 2.40 },
    { day: 'Ter', soja: 156, milho: 89, leite: 2.42 },
    { day: 'Qua', soja: 154, milho: 91, leite: 2.41 },
    { day: 'Qui', soja: 156, milho: 90, leite: 2.43 },
    { day: 'Sex', soja: 158, milho: 90, leite: 2.45 },
  ];

  const filteredCommodities = selectedProduct === 'todos' 
    ? commodities 
    : commodities.filter(c => c.name.toLowerCase() === selectedProduct);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">📈 Preços de Commodities</h2>
        <div className="flex items-center space-x-4">
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
              <option value="café arábica">Café Arábica</option>
              <option value="açúcar">Açúcar</option>
            </select>
          </div>
          <div className="text-sm text-gray-600">
            Atualizado: {new Date().toLocaleTimeString('pt-BR')}
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
                  <span className="font-medium">{Math.abs(commodity.change)}%</span>
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

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Volume</p>
                  <p className="font-medium">{commodity.volume}</p>
                </div>
                <div>
                  <p className="text-gray-600">Máxima</p>
                  <p className="font-medium text-green-600">R$ {commodity.high.toFixed(2)}</p>
                </div>
              </div>

              <div className="text-sm">
                <p className="text-gray-600">Mínima</p>
                <p className="font-medium text-red-600">R$ {commodity.low.toFixed(2)}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Price Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Evolução dos Preços (Últimos 5 dias)</h3>
        
        <div className="space-y-4">
          {/* Simple Chart Visualization */}
          <div className="grid grid-cols-5 gap-4">
            {priceHistory.map((day, index) => (
              <div key={day.day} className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">{day.day}</p>
                
                {/* Soja Bar */}
                <div className="space-y-2">
                  <div className="bg-green-100 rounded-lg p-2">
                    <div 
                      className="bg-green-500 rounded-sm mx-auto"
                      style={{ 
                        height: `${(day.soja / 160) * 60}px`,
                        width: '8px'
                      }}
                    ></div>
                    <p className="text-xs text-green-700 mt-1">{day.soja}</p>
                  </div>
                  
                  {/* Milho Bar */}
                  <div className="bg-yellow-100 rounded-lg p-2">
                    <div 
                      className="bg-yellow-500 rounded-sm mx-auto"
                      style={{ 
                        height: `${(day.milho / 95) * 60}px`,
                        width: '8px'
                      }}
                    ></div>
                    <p className="text-xs text-yellow-700 mt-1">{day.milho}</p>
                  </div>
                  
                  {/* Leite Bar */}
                  <div className="bg-blue-100 rounded-lg p-2">
                    <div 
                      className="bg-blue-500 rounded-sm mx-auto"
                      style={{ 
                        height: `${(day.leite / 2.5) * 60}px`,
                        width: '8px'
                      }}
                    ></div>
                    <p className="text-xs text-blue-700 mt-1">{day.leite}</p>
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
            <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
              <p className="font-medium text-green-800">Soja em Alta</p>
              <p className="text-sm text-green-700">Demanda internacional crescente impulsiona preços</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-400">
              <p className="font-medium text-red-800">Milho em Queda</p>
              <p className="text-sm text-red-700">Safra recorde pressiona cotações</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
              <p className="font-medium text-blue-800">Leite Estável</p>
              <p className="text-sm text-blue-700">Consumo interno mantém preços equilibrados</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🎯 Recomendações</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <span className="text-green-600 font-bold">✓</span>
              <div>
                <p className="font-medium text-gray-800">Venda de Soja</p>
                <p className="text-sm text-gray-600">Momento favorável para comercialização</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-yellow-600 font-bold">⚠</span>
              <div>
                <p className="font-medium text-gray-800">Aguardar Milho</p>
                <p className="text-sm text-gray-600">Preços podem se recuperar em breve</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-blue-600 font-bold">ℹ</span>
              <div>
                <p className="font-medium text-gray-800">Diversificar Leite</p>
                <p className="text-sm text-gray-600">Explorar produtos derivados de maior valor</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Commodities;

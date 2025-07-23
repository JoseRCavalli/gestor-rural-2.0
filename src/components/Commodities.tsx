
import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Filter, RefreshCw } from 'lucide-react';
import { useCommodities } from '@/hooks/useCommodities';
import { Button } from '@/components/ui/button';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

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
                {commodity.source && (
                  <p className="text-xs mt-1">{commodity.source}</p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Interactive Price History Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Evolução dos Preços (Últimos 30 dias)</h3>
        
        {history.length > 0 ? (
          <div className="w-full h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#666"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                  }}
                />
                <YAxis stroke="#666" tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #ddd', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString('pt-BR', { 
                      day: '2-digit', 
                      month: '2-digit', 
                      year: 'numeric' 
                    });
                  }}
                  formatter={(value: number, name: string) => {
                    const formatters = {
                      soja: (val: number) => [`R$ ${val.toFixed(2)}`, 'Soja (saca 60kg)'],
                      milho: (val: number) => [`R$ ${val.toFixed(2)}`, 'Milho (saca 60kg)'],
                      leite: (val: number) => [`R$ ${val.toFixed(4)}`, 'Leite (litro)'],
                      boiGordo: (val: number) => [`R$ ${val.toFixed(2)}`, 'Boi Gordo (@)'],
                      dolar: (val: number) => [`R$ ${val.toFixed(2)}`, 'Dólar (USD/BRL)']
                    };
                    return formatters[name as keyof typeof formatters]?.(value) || [`${value}`, name];
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  iconType="line"
                  wrapperStyle={{ paddingTop: '20px' }}
                />
                
                <Line 
                  type="monotone" 
                  dataKey="soja" 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#22c55e' }}
                  name="soja"
                />
                <Line 
                  type="monotone" 
                  dataKey="milho" 
                  stroke="#eab308" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#eab308' }}
                  name="milho"
                />
                <Line 
                  type="monotone" 
                  dataKey="leite" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#3b82f6' }}
                  name="leite"
                />
                <Line 
                  type="monotone" 
                  dataKey="boiGordo" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#8b5cf6' }}
                  name="boiGordo"
                />
                <Line 
                  type="monotone" 
                  dataKey="dolar" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#f59e0b' }}
                  name="dolar"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando dados históricos...</p>
            </div>
          </div>
        )}
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

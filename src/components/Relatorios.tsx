
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Calendar, Package } from 'lucide-react';

const Relatorios = () => {
  const kpis = [
    {
      title: 'Consumo Mensal',
      value: '2.450 kg',
      change: '+12%',
      trend: 'up',
      icon: Package,
      color: 'bg-blue-50 text-blue-700',
      description: 'Fertilizantes e insumos'
    },
    {
      title: 'Tarefas Concluídas',
      value: '87%',
      change: '+5%',
      trend: 'up',
      icon: Calendar,
      color: 'bg-green-50 text-green-700',
      description: 'Taxa de conclusão mensal'
    },
    {
      title: 'Eventos do Mês',
      value: '42',
      change: '-3',
      trend: 'down',
      icon: Calendar,
      color: 'bg-purple-50 text-purple-700',
      description: 'Atividades programadas'
    },
    {
      title: 'Valor Investido',
      value: 'R$ 18.450',
      change: '+8%',
      trend: 'up',
      icon: TrendingUp,
      color: 'bg-orange-50 text-orange-700',
      description: 'Investimento em insumos'
    }
  ];

  // Mock data for charts
  const monthlyConsumption = [
    { month: 'Jan', fertilizante: 400, sementes: 150, defensivo: 80 },
    { month: 'Fev', fertilizante: 350, sementes: 200, defensivo: 90 },
    { month: 'Mar', fertilizante: 500, sementes: 180, defensivo: 120 },
    { month: 'Abr', fertilizante: 450, sementes: 220, defensivo: 100 },
    { month: 'Mai', fertilizante: 600, sementes: 250, defensivo: 150 },
    { month: 'Jun', fertilizante: 550, sementes: 190, defensivo: 110 }
  ];

  const productivityData = [
    { area: 'Setor A', hectares: 25, producao: 150, produtividade: 6.0 },
    { area: 'Setor B', hectares: 30, producao: 195, produtividade: 6.5 },
    { area: 'Setor C', hectares: 20, producao: 110, produtividade: 5.5 },
    { area: 'Setor D', hectares: 35, producao: 210, produtividade: 6.0 },
    { area: 'Setor E', hectares: 28, producao: 182, produtividade: 6.5 }
  ];

  const expenseCategories = [
    { category: 'Fertilizantes', value: 6500, percentage: 35 },
    { category: 'Sementes', value: 4200, percentage: 23 },
    { category: 'Defensivos', value: 3800, percentage: 21 },
    { category: 'Combustível', value: 2450, percentage: 13 },
    { category: 'Manutenção', value: 1500, percentage: 8 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">📊 Relatórios e KPIs</h2>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Exportar PDF
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Gerar Excel
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${kpi.color}`}>
                <kpi.icon className="w-6 h-6" />
              </div>
              <div className={`text-sm font-medium ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {kpi.change}
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{kpi.value}</h3>
            <p className="text-sm font-medium text-gray-700 mb-1">{kpi.title}</p>
            <p className="text-xs text-gray-500">{kpi.description}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Consumption Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Consumo Mensal por Categoria</h3>
          <div className="space-y-4">
            {monthlyConsumption.map((month, index) => (
              <div key={month.month} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{month.month}</span>
                  <span className="text-sm text-gray-600">
                    {month.fertilizante + month.sementes + month.defensivo} kg
                  </span>
                </div>
                <div className="flex space-x-1 h-6 bg-gray-100 rounded-lg overflow-hidden">
                  <div 
                    className="bg-green-500" 
                    style={{ width: `${(month.fertilizante / 800) * 100}%` }}
                  ></div>
                  <div 
                    className="bg-blue-500" 
                    style={{ width: `${(month.sementes / 800) * 100}%` }}
                  ></div>
                  <div 
                    className="bg-red-500" 
                    style={{ width: `${(month.defensivo / 800) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
            
            {/* Legend */}
            <div className="flex justify-center space-x-4 pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                <span className="text-sm text-gray-600">Fertilizante</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                <span className="text-sm text-gray-600">Sementes</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                <span className="text-sm text-gray-600">Defensivo</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Productivity by Sector */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Produtividade por Setor</h3>
          <div className="space-y-4">
            {productivityData.map((sector, index) => (
              <div key={sector.area} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{sector.area}</span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-900">{sector.produtividade} t/ha</span>
                    <p className="text-xs text-gray-600">{sector.hectares} ha</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${(sector.produtividade / 7) * 100}%` }}
                  >
                    <span className="text-xs font-medium text-white">{sector.producao}t</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Expense Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Distribuição de Gastos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Pie Chart Representation */}
          <div className="space-y-4">
            <div className="relative w-48 h-48 mx-auto">
              <div className="w-full h-full rounded-full bg-gray-200 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-blue-400 via-yellow-400 via-red-400 to-purple-400 rounded-full"></div>
              </div>
              <div className="absolute inset-6 bg-white rounded-full flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">R$ 18,45k</p>
                  <p className="text-sm text-gray-600">Total</p>
                </div>
              </div>
            </div>
          </div>

          {/* Expense List */}
          <div className="space-y-3">
            {expenseCategories.map((expense, index) => (
              <div key={expense.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div 
                    className={`w-4 h-4 rounded-full ${
                      index === 0 ? 'bg-green-400' :
                      index === 1 ? 'bg-blue-400' :
                      index === 2 ? 'bg-yellow-400' :
                      index === 3 ? 'bg-red-400' : 'bg-purple-400'
                    }`}
                  ></div>
                  <span className="font-medium text-gray-800">{expense.category}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">R$ {expense.value.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">{expense.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Summary Report */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white"
      >
        <h3 className="text-xl font-bold mb-4">📋 Resumo Executivo</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-semibold mb-2">Destaques Positivos</h4>
            <ul className="text-sm text-green-100 space-y-1">
              <li>• Produtividade média de 6,1 t/ha</li>
              <li>• Taxa de conclusão de tarefas: 87%</li>
              <li>• Consumo otimizado de defensivos</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Pontos de Atenção</h4>
            <ul className="text-sm text-green-100 space-y-1">
              <li>• Setor C com produtividade baixa</li>
              <li>• Aumento no consumo de fertilizantes</li>
              <li>• 3 eventos não executados</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Próximos Passos</h4>
            <ul className="text-sm text-green-100 space-y-1">
              <li>• Análise de solo no Setor C</li>
              <li>• Otimizar aplicação de fertilizantes</li>
              <li>• Revisão do cronograma de atividades</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Relatorios;

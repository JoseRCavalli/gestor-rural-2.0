import { motion } from 'framer-motion';
import { Calendar, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Dashboard = () => {
  const { profile } = useAuth();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getUserName = () => {
    return profile?.name || 'Usuário';
  };

  const stockItems = [
    { name: 'Fertilizante NPK', quantity: 450, unit: 'kg', status: 'OK' },
    { name: 'Sementes de Soja', quantity: 25, unit: 'kg', status: 'Baixo' },
    { name: 'Defensivo Agrícola', quantity: 5, unit: 'L', status: 'Crítico' },
    { name: 'Ração Bovina', quantity: 800, unit: 'kg', status: 'OK' }
  ];

  const todayTasks = [
    { task: 'Irrigação Setor A', time: '06:00', icon: '💧', done: true },
    { task: 'Aplicação de Defensivo', time: '14:30', icon: '🚿', done: false },
    { task: 'Coleta de Amostras', time: '16:00', icon: '🧪', done: false },
    { task: 'Alimentação do Gado', time: '18:00', icon: '🐄', done: false }
  ];

  const commodityPrices = [
    { name: 'Soja', price: 'R$ 157,80', unit: 'saca 60kg', change: '+2.3%', trend: 'up' },
    { name: 'Milho', price: 'R$ 89,50', unit: 'saca 60kg', change: '-1.2%', trend: 'down' },
    { name: 'Leite', price: 'R$ 2,45', unit: 'litro', change: '+0.8%', trend: 'up' },
    { name: 'Boi Gordo', price: 'R$ 312,00', unit: '@', change: '+1.5%', trend: 'up' }
  ];

  const alerts = [
    { message: 'Sementes de Soja em baixo estoque', type: 'warning', icon: '⚠️' },
    { message: 'Chuva prevista para amanhã', type: 'info', icon: '🌧️' },
    { message: 'Defensivo crítico - reabastecer', type: 'danger', icon: '🚨' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OK': return 'text-green-600 bg-green-100';
      case 'Baixo': return 'text-yellow-600 bg-yellow-100';
      case 'Crítico': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'info': return 'border-blue-200 bg-blue-50';
      case 'danger': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white"
      >
        <h2 className="text-2xl font-bold mb-2">{getGreeting()}, {getUserName()}!</h2>
        <p className="text-green-100">Bem-vindo ao seu painel de gestão rural</p>
        
        {/* Weather Info */}
        <div className="mt-4 flex items-center space-x-6 text-green-100">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">☀️</span>
            <span>28°C</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg">💨</span>
            <span>65% umidade</span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Summary */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <span className="text-xl mr-2">📦</span>
            Resumo do Estoque
          </h3>
          <div className="space-y-3">
            {stockItems.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{item.name}</p>
                  <p className="text-sm text-gray-600">{item.quantity} {item.unit}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Today's Tasks */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Agenda de Hoje
          </h3>
          <div className="space-y-3">
            {todayTasks.map((task, index) => (
              <div key={index} className={`flex items-center space-x-3 p-3 rounded-lg ${task.done ? 'bg-green-50' : 'bg-gray-50'}`}>
                <span className="text-xl">{task.icon}</span>
                <div className="flex-1">
                  <p className={`font-medium ${task.done ? 'text-green-700 line-through' : 'text-gray-800'}`}>
                    {task.task}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {task.time}
                  </p>
                </div>
                {task.done && <span className="text-green-600">✓</span>}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Commodities */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Preços de Commodities
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {commodityPrices.map((commodity, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-800">{commodity.name}</p>
                <p className="text-lg font-bold text-green-600">{commodity.price}</p>
                <p className="text-xs text-gray-600">{commodity.unit}</p>
                <p className={`text-sm font-medium ${commodity.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {commodity.change}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Alerts */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Alertas
          </h3>
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div key={index} className={`p-4 rounded-lg border-l-4 ${getAlertColor(alert.type)}`}>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{alert.icon}</span>
                  <p className="text-sm font-medium text-gray-800">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;

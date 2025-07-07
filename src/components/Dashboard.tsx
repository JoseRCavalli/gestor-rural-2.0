
import { motion } from 'framer-motion';
import { Calendar, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useEvents } from '@/hooks/useEvents';
import { useStock } from '@/hooks/useStock';

const Dashboard = () => {
  const { profile } = useAuth();
  const { events } = useEvents();
  const { stockItems } = useStock();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getUserName = () => {
    return profile?.name || 'Usuário';
  };

  const getStockStatus = (quantity: number, minStock: number) => {
    if (quantity <= minStock * 0.5) return 'Crítico';
    if (quantity <= minStock) return 'Baixo';
    return 'OK';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OK': return 'text-green-600 bg-green-100';
      case 'Baixo': return 'text-yellow-600 bg-yellow-100';
      case 'Crítico': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Get today's events
  const today = new Date().toISOString().split('T')[0];
  const todayEvents = events.filter(event => event.date === today);

  // Get upcoming events (next 4)
  const upcomingEvents = events
    .filter(event => new Date(event.date) >= new Date())
    .slice(0, 4);

  const commodityPrices = [
    { name: 'Soja', price: 'R$ 157,80', unit: 'saca 60kg', change: '+2.3%', trend: 'up' },
    { name: 'Milho', price: 'R$ 89,50', unit: 'saca 60kg', change: '-1.2%', trend: 'down' },
    { name: 'Leite', price: 'R$ 2,45', unit: 'litro', change: '+0.8%', trend: 'up' },
    { name: 'Boi Gordo', price: 'R$ 312,00', unit: '@', change: '+1.5%', trend: 'up' }
  ];

  // Generate alerts based on stock levels
  const stockAlerts = stockItems
    .filter(item => {
      const status = getStockStatus(item.quantity, item.min_stock);
      return status === 'Crítico' || status === 'Baixo';
    })
    .map(item => ({
      message: `${item.name} em ${getStockStatus(item.quantity, item.min_stock).toLowerCase()} estoque`,
      type: getStockStatus(item.quantity, item.min_stock) === 'Crítico' ? 'danger' : 'warning',
      icon: getStockStatus(item.quantity, item.min_stock) === 'Crítico' ? '🚨' : '⚠️'
    }));

  const weatherAlert = { message: 'Chuva prevista para amanhã', type: 'info', icon: '🌧️' };
  const alerts = [...stockAlerts, weatherAlert];

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
            {stockItems.length === 0 ? (
              <p className="text-gray-500 text-sm">Nenhum item no estoque. Adicione itens na aba Estoque.</p>
            ) : (
              stockItems.slice(0, 4).map((item) => {
                const status = getStockStatus(item.quantity, item.min_stock);
                return (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <p className="text-sm text-gray-600">{item.quantity} {item.unit}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                      {status}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>

        {/* Today's Events */}
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
            {todayEvents.length === 0 ? (
              <p className="text-gray-500 text-sm">Nenhum evento para hoje. Adicione eventos na aba Agenda.</p>
            ) : (
              todayEvents.map((event) => (
                <div key={event.id} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                  <span className="text-xl">{event.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{event.title}</p>
                    <p className="text-sm text-gray-600 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {event.time}
                    </p>
                  </div>
                </div>
              ))
            )}
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
            {alerts.length === 0 ? (
              <p className="text-gray-500 text-sm">Nenhum alerta no momento.</p>
            ) : (
              alerts.map((alert, index) => (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${getAlertColor(alert.type)}`}>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{alert.icon}</span>
                    <p className="text-sm font-medium text-gray-800">{alert.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;


import { motion } from 'framer-motion';
import { Calendar, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useEvents } from '@/hooks/useEvents';
import { useStock } from '@/hooks/useStock';
import { useWeather } from '@/hooks/useWeather';
import { useCommodities } from '@/hooks/useCommodities';
import { useState } from 'react';

const Dashboard = () => {
  const { profile } = useAuth();
  const { events } = useEvents();
  const { stockItems } = useStock();
  const { weather, loading: weatherLoading } = useWeather();
  const { commodities, loading: commoditiesLoading } = useCommodities();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { greeting: 'Bom dia', emoji: '👋' };
    if (hour < 18) return { greeting: 'Boa tarde', emoji: '👋' };
    return { greeting: 'Boa noite', emoji: '😴' };
  };

  const getUserFirstName = () => {
    const fullName = profile?.name || 'Usuário';
    return fullName.split(' ')[0];
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

  // Get events for selected date
  const selectedDateEvents = selectedDate 
    ? events.filter(event => event.date === selectedDate)
    : [];

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

  const alerts = [...stockAlerts];

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'info': return 'border-blue-200 bg-blue-50';
      case 'danger': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getDaysInMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const hasEvents = events.some(event => event.date === dateStr);
      days.push({ day, dateStr, hasEvents });
    }
    
    return days;
  };

  const greetingInfo = getGreeting();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white"
      >
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          {greetingInfo.greeting}, {getUserFirstName()}! {greetingInfo.emoji}
        </h2>
        <p className="text-green-100">Bem-vindo ao seu painel de gestão rural</p>
      </motion.div>

      {/* Weather Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="text-xl mr-2">🌤️</span>
          Clima em Tempo Real
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {weatherLoading ? (
              <div className="flex items-center space-x-2">
                <span className="text-xl">⏳</span>
                <span className="text-gray-600">Carregando clima...</span>
              </div>
            ) : weather ? (
              <>
                <div className="flex items-center space-x-2">
                  <span className="text-3xl">{weather.icon}</span>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{weather.temperature}°C</p>
                    <p className="text-sm text-gray-600">{weather.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">💨</span>
                  <span className="text-gray-600">{weather.humidity}% umidade</span>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-xl">❌</span>
                <span className="text-gray-600">Clima indisponível</span>
              </div>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-800">{weather?.location}</p>
            <p className="text-xs text-gray-500">Atualizado agora</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Summary */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
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

        {/* Interactive Calendar */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Calendário Interativo
          </h3>
          
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} className="text-center font-medium text-gray-600 py-2 text-sm">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 mb-4">
            {getDaysInMonth().map((dayData, index) => (
              <div
                key={index}
                className={`h-10 flex items-center justify-center rounded-lg cursor-pointer transition-colors text-sm relative ${
                  dayData
                    ? `hover:bg-gray-100 text-gray-800 ${
                        dayData.hasEvents ? 'bg-green-100 border border-green-300' : ''
                      } ${
                        dayData.dateStr === today ? 'bg-green-600 text-white' : ''
                      } ${
                        dayData.dateStr === selectedDate ? 'ring-2 ring-blue-500' : ''
                      }`
                    : ''
                }`}
                onClick={() => dayData && setSelectedDate(dayData.dateStr)}
              >
                {dayData?.day}
                {dayData?.hasEvents && dayData.dateStr !== today && (
                  <span className="absolute bottom-1 w-1 h-1 bg-green-500 rounded-full"></span>
                )}
              </div>
            ))}
          </div>

          {selectedDate && (
            <div className="border-t pt-3">
              <p className="font-medium text-gray-800 mb-2">
                Eventos em {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR')}:
              </p>
              <div className="space-y-2">
                {selectedDateEvents.length === 0 ? (
                  <p className="text-gray-500 text-sm">Nenhum evento nesta data.</p>
                ) : (
                  selectedDateEvents.map((event) => (
                    <div key={event.id} className="flex items-center space-x-2 text-sm p-2 bg-gray-50 rounded">
                      <span>{event.icon}</span>
                      <span className="font-medium">{event.title}</span>
                      <span className="text-gray-500">{event.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Commodities */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Preços de Commodities
            {commoditiesLoading && <span className="text-xs text-gray-500 ml-2">(Atualizando...)</span>}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {commodities.slice(0, 4).map((commodity, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-lg">{commodity.icon}</span>
                  <p className="font-medium text-gray-800">{commodity.name}</p>
                </div>
                <p className="text-lg font-bold text-green-600">R$ {commodity.price.toFixed(2)}</p>
                <p className="text-xs text-gray-600">{commodity.unit}</p>
                <p className={`text-sm font-medium ${commodity.change < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {commodity.change > 0 ? '+' : ''}{commodity.change.toFixed(2)}%
                </p>
                {commodity.source && (
                  <p className="text-xs text-gray-500 mt-1">{commodity.source}</p>
                )}
              </div>
            ))}
          </div>
          {commodities.length > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              Última atualização: {new Date().toLocaleTimeString('pt-BR')}
            </p>
          )}
        </motion.div>

        {/* Alerts */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
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

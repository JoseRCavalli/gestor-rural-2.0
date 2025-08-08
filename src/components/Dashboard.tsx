
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  PawPrint, 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Thermometer,
  Droplets,
  Clock,
  Shield,
  Bell
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAnimals } from '@/hooks/useAnimals';
import { useEvents } from '@/hooks/useEvents';
import { useVaccinations } from '@/hooks/useVaccinations';
import { useWeather } from '@/hooks/useWeather';
import { useCommodities } from '@/hooks/useCommodities';
import { useStock } from '@/hooks/useStock';
import { useAuth } from '@/hooks/useAuth';
import StockAlerts from './StockAlerts';
import { useNotifications } from '@/hooks/useNotifications';

const Dashboard = () => {
  const { animals } = useAnimals();
  const { events } = useEvents();
  const { vaccinations, vaccineTypes } = useVaccinations();
  const { weather, loading: weatherLoading } = useWeather();
  const { commodities, loading: commoditiesLoading } = useCommodities();
  const { stockItems } = useStock();
  const { profile } = useAuth();

  const today = new Date().toISOString().split('T')[0];
  const currentHour = new Date().getHours();
  const currentMinutes = new Date().getMinutes();

  // Saudação baseada no horário
  const getGreeting = () => {
    if (currentHour >= 4 && (currentHour < 12 || (currentHour === 12 && currentMinutes <= 30))) {
      return "🌅 Bom dia";
    }
    if (currentHour >= 13 && (currentHour < 18 || (currentHour === 18 && currentMinutes <= 30))) {
      return "☀️ Boa tarde";
    }
    return "🌙 Boa noite";
  };

  // Mensagem personalizada baseada no horário
  const getGreetingMessage = () => {
    if (currentHour >= 4 && (currentHour < 12 || (currentHour === 12 && currentMinutes <= 30))) {
      return "Vamos começar o dia produtivo.";
    }
    if (currentHour >= 13 && (currentHour < 18 || (currentHour === 18 && currentMinutes <= 30))) {
      return "Vamos seguir com foco.";
    }
    return "Tenha um bom descanso.";
  };

  // Pegar primeiro nome do usuário
  const getFirstName = () => {
    if (!profile?.name) return 'Usuário';
    return profile.name.split(' ')[0];
  };

  // Estatísticas dos animais (normalizando fases)
  const phaseOf = (a: any) => (a.phase || '').toUpperCase().replace(/\s+/g, '_');
  const animalStats = {
    total: animals.length,
    bezerra: animals.filter(a => phaseOf(a) === 'BEZERRA').length,
    novilha: animals.filter(a => phaseOf(a) === 'NOVILHA').length,
    vaca_lactante: animals.filter(a => phaseOf(a) === 'LACTACAO' || phaseOf(a) === 'VACA_LACTANTE').length,
    vaca_seca: animals.filter(a => phaseOf(a) === 'VACA_SECA').length,
  };

  // Eventos próximos (próximos 7 dias) - Integração completa com agenda
  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.date + 'T00:00:00');
    const todayDate = new Date(today + 'T00:00:00');
    const diffTime = eventDate.getTime() - todayDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7 && !event.completed;
  });

  // Adicionar eventos de vacinação próximas à agenda
  const upcomingVaccinations = vaccinations
    .filter(vacc => vacc.next_dose_date)
    .filter(vacc => {
      const vaccDate = new Date(vacc.next_dose_date! + 'T00:00:00');
      const todayDate = new Date(today + 'T00:00:00');
      const diffTime = vaccDate.getTime() - todayDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    })
    .map(vacc => {
      const animal = animals.find(a => a.id === vacc.animal_id);
      const vaccineType = vaccineTypes.find(vt => vt.id === vacc.vaccine_type_id);
      return {
        id: `vacc-${vacc.id}`,
        title: `Vacinação - ${animal?.name || `Brinco ${animal?.tag}`}`,
        date: vacc.next_dose_date!,
        icon: '💉',
        type: 'vacina',
        description: `Vacina: ${vaccineType?.name}`
      };
    });

  const allUpcomingEvents = [...upcomingEvents, ...upcomingVaccinations]
    .sort((a, b) => a.date.localeCompare(b.date));

  // Vacinações em atraso
  const overdueVaccinations = vaccinations.filter(vaccination => {
    if (!vaccination.next_dose_date) return false;
    return vaccination.next_dose_date < today;
  });

  // Vacinações recentes (últimos 30 dias) - considerando também eventos concluídos de vacinação
  const recentVaccinations = vaccinations.filter(vaccination => {
    const vaccinationDate = new Date(vaccination.application_date + 'T00:00:00');
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return vaccinationDate >= thirtyDaysAgo;
  });

  // Adicionar eventos de vacinação concluídos nos últimos 30 dias
  const recentVaccinationEvents = events.filter(event => {
    if (event.type !== 'vaccination' || !event.completed) return false;
    const eventDate = new Date(event.date + 'T00:00:00');
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return eventDate >= thirtyDaysAgo;
  });

  const totalRecentVaccinations = recentVaccinations.length + recentVaccinationEvents.length;

  // Alertas de estoque baixo
  const lowStockItems = stockItems.filter(item => item.quantity <= item.min_stock);

  // Condições climáticas detectadas
  const desc = (weather?.description || '').toLowerCase();
  const isRainyWeather = desc.includes('chuva') || desc.includes('chuvoso') || desc.includes('precipitação') || desc.includes('tempestade') || weather?.icon === '🌧️' || weather?.icon === '⛈️';
  const isFrostWeather = desc.includes('geada') || desc.includes('neve') || weather?.icon === '❄️' || weather?.icon === '🌨️';
  const isStormyWeather = desc.includes('tempestade') || desc.includes('trovoada') || desc.includes('toró') || weather?.icon === '⛈️';
  const isWindyWeather = desc.includes('vento') || weather?.icon === '💨' || weather?.icon === '🌬️';
  const isFoggyWeather = desc.includes('neblina') || desc.includes('nevoeiro') || weather?.icon === '🌫️';
  const isHeatAlert = (weather?.temperature || 0) >= 35 || desc.includes('onda de calor') || desc.includes('calor') || desc.includes('quente');
  const isColdAlert = (weather?.temperature || 99) <= 3 || desc.includes('frio');

  // Todos os alertas do sistema
  const weatherAlerts = [
    ...(isRainyWeather && weather ? [{
      id: 'weather-rain',
      type: 'weather',
      level: 'warning',
      title: 'Previsão de Chuva',
      message: `${weather.description} - Considere proteger os animais e verificar as instalações`,
      icon: '🌧️'
    }] : []),
    ...(isFrostWeather && weather ? [{
      id: 'weather-frost',
      type: 'weather',
      level: 'critical',
      title: 'Risco de Geada',
      message: `${weather.description} - Proteja bezerros e verifique a água e pastagens`,
      icon: '❄️'
    }] : []),
    ...(isStormyWeather && weather ? [{
      id: 'weather-storm',
      type: 'weather',
      level: 'warning',
      title: 'Tempestade',
      message: `${weather.description} - Reforce instalações e abrigos`,
      icon: '⛈️'
    }] : []),
    ...(isWindyWeather && weather ? [{
      id: 'weather-wind',
      type: 'weather',
      level: 'warning',
      title: 'Ventos Fortes',
      message: `${weather.description} - Verifique cercas e telhados`,
      icon: '💨'
    }] : []),
    ...(isFoggyWeather && weather ? [{
      id: 'weather-fog',
      type: 'weather',
      level: 'warning',
      title: 'Neblina',
      message: `${weather.description} - Atenção no deslocamento e manejo`,
      icon: '🌫️'
    }] : []),
    ...(isHeatAlert && weather ? [{
      id: 'weather-heat',
      type: 'weather',
      level: 'warning',
      title: 'Calor Intenso',
      message: `Temperatura ${weather.temperature}°C - Garanta sombra e água fresca`,
      icon: '🔥'
    }] : []),
    ...(isColdAlert && weather ? [{
      id: 'weather-cold',
      type: 'weather',
      level: 'warning',
      title: 'Frio Intenso',
      message: `Temperatura ${weather.temperature}°C - Reforce abrigos e manejo`,
      icon: '🥶'
    }] : [])
  ];

  const allAlerts = [
    ...overdueVaccinations.map(vacc => {
      const animal = animals.find(a => a.id === vacc.animal_id);
      const vaccineType = vaccineTypes.find(vt => vt.id === vacc.vaccine_type_id);
      return {
        id: `vacc-${vacc.id}`,
        type: 'vaccination',
        level: 'critical',
        title: `Vacinação atrasada - ${animal?.name || `Brinco ${animal?.tag}`}`,
        message: `${vaccineType?.name} - Venceu em ${new Date(vacc.next_dose_date!).toLocaleDateString('pt-BR')}`,
        icon: '⚠️'
      };
    }),
    ...lowStockItems.map(item => ({
      id: `stock-${item.id}`,
      type: 'stock',
      level: item.quantity === 0 ? 'critical' : 'warning',
      title: `Estoque baixo - ${item.name}`,
      message: `${item.quantity} ${item.unit} restante(s)`,
      icon: item.quantity === 0 ? '🚨' : '⚠️'
    })),
    ...weatherAlerts
  ];

  // Envie notificações para clima e estoque (sem duplicar)
  const { createNotificationOnce } = useNotifications();

  useEffect(() => {
    if (!weather) return;
    weatherAlerts.forEach(alert => {
      createNotificationOnce({
        title: alert.title,
        message: alert.message,
        type: alert.level === 'critical' ? 'error' : 'warning',
      });
    });
  }, [weather?.description, weather?.temperature]);

  useEffect(() => {
    lowStockItems.forEach(item => {
      createNotificationOnce({
        title: `Estoque baixo - ${item.name}`,
        message: `${item.quantity} ${item.unit} restante(s)`,
        type: item.quantity === 0 ? 'error' : 'warning',
      });
    });
  }, [stockItems]);

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-green-50 to-blue-50 min-h-screen">
      {/* Header com saudação */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">🏡 Dashboard Rural</h1>
        <p className="text-gray-600 text-lg">
          {getGreeting()}, {getFirstName()}! {getGreetingMessage()}
        </p>
      </div>

      {/* LINHA 1 - Prioridade Alta */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total de Animais com Detalhamento do Rebanho */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Rebanho Cadastrado</CardTitle>
              <PawPrint className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-2">{animalStats.total}</div>
              <div className="space-y-1 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>🐄 Vacas Lactantes:</span>
                  <span className="font-medium">{animalStats.vaca_lactante}</span>
                </div>
                <div className="flex justify-between">
                  <span>🐮 Vacas Secas:</span>
                  <span className="font-medium">{animalStats.vaca_seca}</span>
                </div>
                <div className="flex justify-between">
                  <span>🐂 Novilhas:</span>
                  <span className="font-medium">{animalStats.novilha}</span>
                </div>
                <div className="flex justify-between">
                  <span>🐃 Bezerras:</span>
                  <span className="font-medium">{animalStats.bezerra}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Vacinas Pendentes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Vacinas Pendentes</CardTitle>
              <Shield className={`h-5 w-5 ${overdueVaccinations.length > 0 ? 'text-red-500' : 'text-green-500'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${overdueVaccinations.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {overdueVaccinations.length}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {overdueVaccinations.length > 0 ? 'Necessitam atenção' : 'Tudo em dia'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Próximos Eventos - Integrado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Próximos Eventos</CardTitle>
              <Calendar className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{allUpcomingEvents.length}</div>
              <p className="text-xs text-gray-500 mt-1">Próximos 7 dias</p>
              {allUpcomingEvents.length > 0 && (
                <div className="mt-2 space-y-1">
                  {allUpcomingEvents.slice(0, 2).map((event) => (
                    <div key={event.id} className="flex items-center text-xs text-gray-600">
                      <span className="mr-1">{event.icon}</span>
                      <span className="truncate">{event.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Clima Atual */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Clima Atual</CardTitle>
              {weatherLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
              ) : (
                <span className="text-xl">{weather?.icon || '☀️'}</span>
              )}
            </CardHeader>
            <CardContent>
              {weatherLoading ? (
                <div className="text-sm text-gray-500">Carregando...</div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Thermometer className="w-4 h-4 text-red-500" />
                      <span className="text-xl font-bold">{weather?.temperature}°C</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">{weather?.humidity}%</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 capitalize">{weather?.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* LINHA 2 - Commodities (Reduzida) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-white shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-gray-800">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span>Commodities Hoje</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {commoditiesLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                <span className="ml-2 text-sm text-gray-600">Atualizando preços...</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {commodities.slice(0, 5).map((commodity, index) => (
                  <div key={index} className="text-center p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="text-lg mb-1">{commodity.icon}</div>
                    <div className="text-xs font-medium text-gray-700 mb-1">{commodity.name}</div>
                    <div className="text-sm font-bold text-gray-900">
                      R$ {commodity.price.toFixed(2)}
                    </div>
                    <div className={`text-xs flex items-center justify-center space-x-1 mt-1 ${
                      commodity.change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <span>{commodity.change >= 0 ? '📈' : '📉'}</span>
                      <span>{Math.abs(commodity.change).toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* LINHA 3 - Alertas do Sistema */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="bg-white shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-800">
              <Bell className="w-5 h-5 text-orange-600" />
              <span>Alertas do Sistema</span>
              {allAlerts.length > 0 && (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  {allAlerts.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {allAlerts.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <p className="text-green-600 font-medium">Tudo em ordem!</p>
                <p className="text-sm text-gray-500">Nenhum alerta no momento</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {allAlerts.map((alert) => (
                  <div 
                    key={alert.id} 
                    className={`p-3 rounded-lg border ${
                      alert.level === 'critical' 
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-yellow-50 border-yellow-200'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-lg">{alert.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{alert.title}</h4>
                        <p className="text-sm text-gray-600">{alert.message}</p>
                      </div>
                      <Badge 
                        variant={alert.level === 'critical' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {alert.level === 'critical' ? 'Crítico' : 'Atenção'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* LINHA 4 - Informações Adicionais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vacinas Aplicadas Recentemente */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-800">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm">Vacinas Aplicadas</span>
              </CardTitle>
              <CardDescription>Últimos 30 dias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 mb-2">{totalRecentVaccinations}</div>
              <p className="text-xs text-gray-500">Vacinações realizadas</p>
              {totalRecentVaccinations > 0 && (
                <div className="mt-2 text-xs text-gray-600">
                  <div>Aplicadas: {recentVaccinations.length}</div>
                  <div>Agendadas concluídas: {recentVaccinationEvents.length}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Próximos Eventos Detalhados */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-800">
                <Clock className="w-5 h-5 text-green-600" />
                <span className="text-sm">Agenda Integrada</span>
              </CardTitle>
              <CardDescription>Eventos e vacinações próximas</CardDescription>
            </CardHeader>
            <CardContent>
              {allUpcomingEvents.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">Nenhum evento próximo</p>
                  <p className="text-xs text-gray-400">Agenda em dia!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {allUpcomingEvents.slice(0, 4).map((event) => (
                    <div key={event.id} className="flex items-center space-x-2 p-2 rounded bg-green-50">
                      <span className="text-sm">{event.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(event.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                  {allUpcomingEvents.length > 4 && (
                    <p className="text-xs text-gray-500 text-center">
                      +{allUpcomingEvents.length - 4} eventos
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;


import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Users, 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Thermometer,
  Droplets,
  Clock,
  Shield
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

const Dashboard = () => {
  const { animals } = useAnimals();
  const { events } = useEvents();
  const { vaccinations } = useVaccinations();
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

  // Estatísticas dos animais
  const animalStats = {
    total: animals.length,
    bezerra: animals.filter(a => a.phase === 'bezerra').length,
    novilha: animals.filter(a => a.phase === 'novilha').length,
    vaca_lactante: animals.filter(a => a.phase === 'vaca_lactante').length,
    vaca_seca: animals.filter(a => a.phase === 'vaca_seca').length,
  };

  // Eventos próximos (próximos 7 dias)
  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    const todayDate = new Date(today);
    const diffTime = eventDate.getTime() - todayDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7 && !event.completed;
  });

  // Vacinações em atraso
  const overdueVaccinations = vaccinations.filter(vaccination => {
    if (!vaccination.next_dose_date) return false;
    return vaccination.next_dose_date < today;
  });

  // Vacinações recentes (últimos 30 dias)
  const recentVaccinations = vaccinations.filter(vaccination => {
    const vaccinationDate = new Date(vaccination.application_date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return vaccinationDate >= thirtyDaysAgo;
  });

  // Alertas de estoque baixo
  const lowStockItems = stockItems.filter(item => item.quantity <= item.min_stock);

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
        {/* Total de Animais */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total de Animais</CardTitle>
              <Users className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{animalStats.total}</div>
              <p className="text-xs text-gray-500 mt-1">Rebanho cadastrado</p>
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

        {/* Próximos Eventos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Próximos Eventos</CardTitle>
              <Calendar className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{upcomingEvents.length}</div>
              <p className="text-xs text-gray-500 mt-1">Próximos 7 dias</p>
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
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
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

      {/* LINHA 2 - Commodities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-white shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-800">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span>Commodities Hoje</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {commoditiesLoading ? (
              <div className="flex items-center justify-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                <span className="ml-2 text-sm text-gray-600">Atualizando preços...</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {commodities.slice(0, 5).map((commodity, index) => (
                  <div key={index} className="text-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="text-2xl mb-2">{commodity.icon}</div>
                    <div className="text-sm font-medium text-gray-700 mb-1">{commodity.name}</div>
                    <div className="text-lg font-bold text-gray-900">
                      R$ {commodity.price.toFixed(2)}
                    </div>
                    <div className={`text-xs flex items-center justify-center space-x-1 mt-1 ${
                      commodity.change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <span>{commodity.change >= 0 ? '📈' : '📉'}</span>
                      <span>{Math.abs(commodity.change).toFixed(2)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* LINHA 3 - Informações Adicionais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vacinas Aplicadas Recentemente */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
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
              <div className="text-2xl font-bold text-green-600 mb-2">{recentVaccinations.length}</div>
              <p className="text-xs text-gray-500">Vacinações realizadas</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Status do Estoque */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-800">
                <Package className={`w-5 h-5 ${lowStockItems.length > 0 ? 'text-red-500' : 'text-green-500'}`} />
                <span className="text-sm">Status do Estoque</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lowStockItems.length === 0 ? (
                <div>
                  <div className="text-2xl font-bold text-green-600 mb-2">✓</div>
                  <p className="text-sm text-green-600 font-medium">Estoque em dia</p>
                  <p className="text-xs text-gray-500">Todos os itens em níveis adequados</p>
                </div>
              ) : (
                <div>
                  <div className="text-2xl font-bold text-red-600 mb-2">{lowStockItems.length}</div>
                  <p className="text-sm text-red-600 font-medium">Itens com estoque baixo</p>
                  <p className="text-xs text-gray-500">Necessitam reposição</p>
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
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-sm">Agenda</span>
              </CardTitle>
              <CardDescription>Próximos eventos</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">Nenhum evento próximo</p>
                  <p className="text-xs text-gray-400">Agenda em dia!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {upcomingEvents.slice(0, 3).map((event) => (
                    <div key={event.id} className="flex items-center space-x-2 p-2 rounded bg-gray-50">
                      <span className="text-sm">{event.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(event.date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                  {upcomingEvents.length > 3 && (
                    <p className="text-xs text-gray-500 text-center">
                      +{upcomingEvents.length - 3} eventos
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Alertas de Estoque */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <StockAlerts />
      </motion.div>

      {/* Alerta de Vacinações em Atraso */}
      {overdueVaccinations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <Card className="border-red-200 bg-red-50 shadow-md">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5" />
                <span>Vacinações em Atraso - Ação Necessária</span>
              </CardTitle>
              <CardDescription className="text-red-600">
                {overdueVaccinations.length} vacinações precisam de atenção imediata
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {overdueVaccinations.slice(0, 3).map((vaccination) => {
                  const animal = animals.find(a => a.id === vaccination.animal_id);
                  const daysOverdue = Math.abs(Math.ceil((new Date(today).getTime() - new Date(vaccination.next_dose_date!).getTime()) / (1000 * 60 * 60 * 24)));
                  
                  return (
                    <div key={vaccination.id} className="flex items-center justify-between p-3 bg-white rounded border border-red-200">
                      <div>
                        <p className="font-medium text-sm text-gray-900">{animal?.name || `Brinco ${animal?.tag}`}</p>
                        <p className="text-xs text-gray-600">Venceu em: {new Date(vaccination.next_dose_date!).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <Badge variant="destructive" className="text-xs">
                        {daysOverdue} dias
                      </Badge>
                    </div>
                  );
                })}
                {overdueVaccinations.length > 3 && (
                  <p className="text-sm text-red-600 text-center mt-2">
                    ... e mais {overdueVaccinations.length - 3} vacinações em atraso
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;

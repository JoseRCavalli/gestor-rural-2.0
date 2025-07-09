
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Users, 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAnimals } from '@/hooks/useAnimals';
import { useEvents } from '@/hooks/useEvents';
import { useVaccinations } from '@/hooks/useVaccinations';

const Dashboard = () => {
  const { animals } = useAnimals();
  const { events } = useEvents();
  const { vaccinations } = useVaccinations();

  const today = new Date().toISOString().split('T')[0];

  // Estatísticas dos animais por fase
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">🏡 Dashboard Rural</h1>
      </div>

      {/* Cards de Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Animais</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{animalStats.total}</div>
              <p className="text-xs text-muted-foreground">
                Rebanho cadastrado
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eventos Próximos</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingEvents.length}</div>
              <p className="text-xs text-muted-foreground">
                Próximos 7 dias
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vacinações Atrasadas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{overdueVaccinations.length}</div>
              <p className="text-xs text-muted-foreground">
                Necessitam atenção
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vacinações Aplicadas</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{vaccinations.length}</div>
              <p className="text-xs text-muted-foreground">
                Total registrado
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição do Rebanho */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Distribuição do Rebanho</CardTitle>
              <CardDescription>Animais por fase de vida</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-pink-400 rounded-full"></div>
                  <span className="text-sm">Bezerra</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{animalStats.bezerra}</span>
                  <Badge variant="secondary">{animalStats.total > 0 ? Math.round((animalStats.bezerra / animalStats.total) * 100) : 0}%</Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  <span className="text-sm">Novilha</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{animalStats.novilha}</span>
                  <Badge variant="secondary">{animalStats.total > 0 ? Math.round((animalStats.novilha / animalStats.total) * 100) : 0}%</Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-sm">Vaca Lactante</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{animalStats.vaca_lactante}</span>
                  <Badge variant="secondary">{animalStats.total > 0 ? Math.round((animalStats.vaca_lactante / animalStats.total) * 100) : 0}%</Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <span className="text-sm">Vaca Seca</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{animalStats.vaca_seca}</span>
                  <Badge variant="secondary">{animalStats.total > 0 ? Math.round((animalStats.vaca_seca / animalStats.total) * 100) : 0}%</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Próximos Eventos */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Próximos Eventos</CardTitle>
              <CardDescription>Agenda dos próximos 7 dias</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-6">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum evento próximo</p>
                  <p className="text-sm text-gray-400">Você está em dia com a agenda!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.slice(0, 5).map((event) => (
                    <div key={event.id} className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50">
                      <span className="text-lg">{event.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{event.title}</h4>
                        <p className="text-xs text-gray-600">
                          {new Date(event.date).toLocaleDateString('pt-BR')} às {event.time}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {event.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Alertas e Notificações */}
      {overdueVaccinations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5" />
                <span>Vacinações em Atraso</span>
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
                    <div key={vaccination.id} className="flex items-center justify-between p-2 bg-white rounded border border-red-200">
                      <div>
                        <p className="font-medium text-sm">{animal?.name || `Brinco ${animal?.tag}`}</p>
                        <p className="text-xs text-gray-600">Próxima dose: {new Date(vaccination.next_dose_date!).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <Badge variant="destructive" className="text-xs">
                        {daysOverdue} dias
                      </Badge>
                    </div>
                  );
                })}
                {overdueVaccinations.length > 3 && (
                  <p className="text-sm text-red-600 text-center">
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

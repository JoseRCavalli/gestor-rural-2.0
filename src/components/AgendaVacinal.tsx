
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, AlertTriangle, CheckCircle, Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useVaccinations } from '@/hooks/useVaccinations';
import { useAnimals } from '@/hooks/useAnimals';
import { useEvents } from '@/hooks/useEvents';
import ImportVaccinations from './ImportVaccinations';
import VaccinationForm from './VaccinationForm';
import ScheduleVaccination from './ScheduleVaccination';

const AgendaVacinal = () => {
  const { vaccinations, vaccineTypes, loading } = useVaccinations();
  const { animals } = useAnimals();
  const { events } = useEvents();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'overdue' | 'upcoming' | 'completed'>('all');

  const today = new Date().toISOString().split('T')[0];

  // Processar eventos de vacinação agendados
  const scheduledVaccinations = events
    .filter(event => event.type === 'vaccination' && !event.completed)
    .map(event => {
      const eventDate = new Date(event.date + 'T00:00:00');
      const todayDate = new Date(today + 'T00:00:00');
      const daysUntilEvent = Math.ceil((eventDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
      
      let status: 'scheduled' | 'overdue' | 'upcoming' = 'scheduled';
      if (daysUntilEvent < 0) {
        status = 'overdue';
      } else if (daysUntilEvent <= 30) {
        status = 'upcoming';
      }

      return {
        id: event.id,
        type: 'scheduled' as const,
        title: event.title,
        description: event.description,
        date: event.date,
        status,
        daysUntilEvent,
        isScheduled: true
      };
    });

  // Processar vacinações com informações dos animais
  const processedVaccinations = vaccinations.map(vaccination => {
    const animal = animals.find(a => a.id === vaccination.animal_id);
    const vaccineType = vaccineTypes.find(vt => vt.id === vaccination.vaccine_type_id);
    
    let status: 'completed' | 'overdue' | 'upcoming' = 'completed';
    let daysUntilNext = 0;
    
    if (vaccination.next_dose_date) {
      const nextDate = new Date(vaccination.next_dose_date + 'T00:00:00');
      const todayDate = new Date(today + 'T00:00:00');
      daysUntilNext = Math.ceil((nextDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilNext < 0) {
        status = 'overdue';
      } else if (daysUntilNext <= 30) {
        status = 'upcoming';
      }
    }

    return {
      ...vaccination,
      animal,
      vaccineType,
      status,
      daysUntilNext,
      type: 'completed' as const,
      isScheduled: false
    };
  });

  // Combinar vacinações aplicadas e agendadas
  const allVaccinations = [...processedVaccinations, ...scheduledVaccinations];

  // Filtrar vacinações
  const filteredVaccinations = allVaccinations.filter(vaccination => {
    switch (selectedFilter) {
      case 'overdue':
        return vaccination.status === 'overdue';
      case 'upcoming':
        return vaccination.status === 'upcoming';
      case 'completed':
        return vaccination.status === 'completed' || vaccination.status === 'scheduled';
      default:
        return true;
    }
  });

  // Estatísticas
  const stats = {
    total: allVaccinations.length,
    overdue: allVaccinations.filter(v => v.status === 'overdue').length,
    upcoming: allVaccinations.filter(v => v.status === 'upcoming').length,
    completed: processedVaccinations.filter(v => v.status === 'completed').length + scheduledVaccinations.filter(v => v.status === 'scheduled').length
  };

  const getStatusBadge = (vaccination: any) => {
    if (vaccination.isScheduled) {
      if (vaccination.status === 'overdue') {
        return <Badge variant="destructive">Agendada (Atrasada {Math.abs(vaccination.daysUntilEvent)} dias)</Badge>;
      } else if (vaccination.status === 'upcoming') {
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Agendada ({vaccination.daysUntilEvent} dias)</Badge>;
      } else {
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Agendada</Badge>;
      }
    } else {
      switch (vaccination.status) {
        case 'overdue':
          return <Badge variant="destructive">Atrasada ({Math.abs(vaccination.daysUntilNext)} dias)</Badge>;
        case 'upcoming':
          return <Badge variant="secondary" className="bg-green-100 text-green-800">Próxima ({vaccination.daysUntilNext} dias)</Badge>;
        default:
          return <Badge variant="default" className="bg-green-100 text-green-800">Aplicada</Badge>;
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">💉 Agenda Vacinal</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <VaccinationForm />
          <ScheduleVaccination />
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2">
                <Upload className="w-4 h-4" />
                <span>Importar Vacinações</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Importar Vacinações</DialogTitle>
                <DialogDescription>
                  Importe vacinações em lote usando arquivo CSV ou Excel
                </DialogDescription>
              </DialogHeader>
              <ImportVaccinations />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedFilter('all')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-full">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedFilter('overdue')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Atrasadas</p>
                  <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
                </div>
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedFilter('upcoming')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Próximas (30 dias)</p>
                  <p className="text-2xl font-bold text-green-600">{stats.upcoming}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-full">
                  <Clock className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedFilter('completed')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Aplicadas</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-full">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Lista de Vacinações */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Histórico de Vacinações</span>
              <Badge variant="outline">{filteredVaccinations.length} registros</Badge>
            </CardTitle>
            <CardDescription>
              {selectedFilter === 'all' && 'Todas as vacinações registradas'}
              {selectedFilter === 'overdue' && 'Vacinações com doses em atraso'}
              {selectedFilter === 'upcoming' && 'Próximas vacinações (30 dias)'}
              {selectedFilter === 'completed' && 'Vacinações aplicadas sem próxima dose'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Carregando vacinações...</p>
              </div>
            ) : filteredVaccinations.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhuma vacinação encontrada</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredVaccinations.map((vaccination) => (
                  <div
                    key={vaccination.id}
                    className={`p-4 rounded-lg border ${
                      vaccination.status === 'overdue' 
                        ? 'border-red-200 bg-red-50' 
                        : vaccination.status === 'upcoming'
                        ? vaccination.isScheduled ? 'border-blue-200 bg-blue-50' : 'border-green-200 bg-green-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {vaccination.isScheduled 
                              ? (vaccination as any).title 
                              : ((vaccination as any).animal?.name || `Brinco ${(vaccination as any).animal?.tag}`)
                            }
                          </h3>
                          {getStatusBadge(vaccination)}
                        </div>
                        
                        {vaccination.isScheduled ? (
                          // Renderização para vacinações agendadas
                          <div className="text-sm text-gray-600">
                            <p><strong>Data Agendada:</strong> {formatDate((vaccination as any).date)}</p>
                            {(vaccination as any).description && (
                              <div className="mt-2 p-2 bg-gray-100 rounded text-sm text-gray-700">
                                <strong>Detalhes:</strong> {(vaccination as any).description}
                              </div>
                            )}
                          </div>
                        ) : (
                          // Renderização para vacinações aplicadas
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                              <div>
                                <p><strong>Vacina:</strong> {(vaccination as any).vaccineType?.name}</p>
                                <p><strong>Data de Aplicação:</strong> {formatDate((vaccination as any).application_date)}</p>
                                {(vaccination as any).next_dose_date && (
                                  <p><strong>Próxima Dose:</strong> {formatDate((vaccination as any).next_dose_date)}</p>
                                )}
                              </div>
                              
                              <div>
                                {(vaccination as any).batch_number && (
                                  <p><strong>Lote:</strong> {(vaccination as any).batch_number}</p>
                                )}
                                {(vaccination as any).manufacturer && (
                                  <p><strong>Fabricante:</strong> {(vaccination as any).manufacturer}</p>
                                )}
                                {(vaccination as any).responsible && (
                                  <p><strong>Responsável:</strong> {(vaccination as any).responsible}</p>
                                )}
                              </div>
                            </div>
                            
                            {(vaccination as any).notes && (
                              <div className="mt-2 p-2 bg-gray-100 rounded text-sm text-gray-700">
                                <strong>Observações:</strong> {(vaccination as any).notes}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AgendaVacinal;

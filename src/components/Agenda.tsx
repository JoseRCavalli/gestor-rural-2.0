
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Plus, Clock, CheckCircle, AlertTriangle, Syringe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEvents } from '@/hooks/useEvents';
import { useVaccinations } from '@/hooks/useVaccinations';
import { useAnimals } from '@/hooks/useAnimals';
import { toast } from 'sonner';
import ScheduledVaccinations from './ScheduledVaccinations';

const Agenda = () => {
  const { events, createEvent, updateEvent, deleteEvent, loading } = useEvents();
  const { vaccinations, vaccineTypes } = useVaccinations();
  const { animals } = useAnimals();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '08:00',
    type: 'task',
    icon: '📅'
  });

  // Combine events and vaccinations for display
  const allEvents = [
    ...events,
    ...vaccinations
      .filter(vacc => vacc.next_dose_date)
      .map(vacc => {
        const animal = animals.find(a => a.id === vacc.animal_id);
        const vaccineType = vaccineTypes.find(vt => vt.id === vacc.vaccine_type_id);
        return {
          id: `vacc-${vacc.id}`,
          title: `Vacinação - ${animal?.name || `Brinco ${animal?.tag}`}`,
          description: `Vacina: ${vaccineType?.name}`,
          date: vacc.next_dose_date!,
          time: '08:00',
          type: 'vaccination',
          icon: '💉',
          completed: false,
          user_id: vacc.user_id,
          created_at: vacc.created_at,
          updated_at: vacc.updated_at
        };
      })
  ];

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateForDisplay = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
  };

  // Get events for selected date
  const selectedDateEvents = allEvents.filter(event => {
    if (!selectedDate) return false;
    const eventDate = new Date(event.date + 'T00:00:00');
    const selectedDateNormalized = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    const eventDateNormalized = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
    return selectedDateNormalized.getTime() === eventDateNormalized.getTime();
  });

  // Get upcoming events (next 7 days) - including today
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const upcomingEvents = allEvents.filter(event => {
    const eventDate = new Date(event.date + 'T00:00:00');
    const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const nextWeekNormalized = new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate());
    return eventDate >= todayNormalized && eventDate <= nextWeekNormalized && !event.completed;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Past events (last 30 days) - including completed events
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  const pastEvents = allEvents.filter(event => {
    const eventDate = new Date(event.date + 'T00:00:00');
    const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const thirtyDaysAgoNormalized = new Date(thirtyDaysAgo.getFullYear(), thirtyDaysAgo.getMonth(), thirtyDaysAgo.getDate());
    // Include completed events or events from past dates
    return (eventDate < todayNormalized && eventDate >= thirtyDaysAgoNormalized) || event.completed;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Overdue events
  const overdueEvents = allEvents.filter(event => {
    const eventDate = new Date(event.date + 'T00:00:00');
    const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return eventDate < todayNormalized && !event.completed;
  });

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!eventForm.title || !eventForm.date) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    try {
      await createEvent({
        title: eventForm.title,
        description: eventForm.description,
        date: eventForm.date,
        type: eventForm.type,
        icon: eventForm.icon,
        completed: false
      });
      
      setEventForm({
        title: '',
        description: '',
        date: '',
        time: '08:00',
        type: 'task',
        icon: '📅'
      });
      setIsDialogOpen(false);
      toast.success('Evento criado com sucesso!');
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Erro ao criar evento');
    }
  };

  const toggleEventCompletion = async (event: any) => {
    // Only toggle completion for regular events, not vaccinations
    if (event.type === 'vaccination') {
      toast.info('Para marcar vacinação como concluída, vá para a aba Vacinas');
      return;
    }

    try {
      await updateEvent(event.id, { completed: !event.completed });
      toast.success(event.completed ? 'Evento reaberto' : 'Evento concluído!');
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Erro ao atualizar evento');
    }
  };

  useEffect(() => {
    if (selectedDate) {
      setEventForm(prev => ({ ...prev, date: formatDateForInput(selectedDate) }));
    }
  }, [selectedDate]);

  // Get dates that have events for calendar highlighting
  const eventDates = allEvents.map(event => new Date(event.date + 'T00:00:00'));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">📅 Agenda Rural</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2 bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4" />
              <span>Novo Evento</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Evento</DialogTitle>
              <DialogDescription>
                Adicione um evento à sua agenda rural
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={eventForm.title}
                  onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Aplicar vacina, Ordenha especial..."
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={eventForm.description}
                  onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detalhes do evento..."
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Data *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={eventForm.date}
                    onChange={(e) => setEventForm(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="time">Horário</Label>
                  <Input
                    id="time"
                    type="time"
                    value={eventForm.time}
                    onChange={(e) => setEventForm(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select value={eventForm.type} onValueChange={(value) => setEventForm(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="task">Tarefa</SelectItem>
                      <SelectItem value="appointment">Compromisso</SelectItem>
                      <SelectItem value="maintenance">Manutenção</SelectItem>
                      <SelectItem value="health">Saúde Animal</SelectItem>
                      <SelectItem value="feeding">Alimentação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="icon">Ícone</Label>
                  <Select value={eventForm.icon} onValueChange={(value) => setEventForm(prev => ({ ...prev, icon: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="📅">📅 Padrão</SelectItem>
                      <SelectItem value="🐄">🐄 Gado</SelectItem>
                      <SelectItem value="💉">💉 Vacinação</SelectItem>
                      <SelectItem value="🚜">🚜 Equipamento</SelectItem>
                      <SelectItem value="🌱">🌱 Plantio</SelectItem>
                      <SelectItem value="⚡">⚡ Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  Criar Evento
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Próximos 7 dias</p>
                  <p className="text-2xl font-bold text-green-600">{upcomingEvents.length}</p>
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
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Em Atraso</p>
                  <p className="text-2xl font-bold text-red-600">{overdueEvents.length}</p>
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
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Eventos Passados</p>
                  <p className="text-2xl font-bold text-gray-600">{pastEvents.length}</p>
                </div>
                <div className="p-2 bg-gray-100 rounded-full">
                  <CheckCircle className="w-5 h-5 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Eventos</p>
                  <p className="text-2xl font-bold text-green-600">{allEvents.length}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-full">
                  <CalendarIcon className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Calendário</CardTitle>
              <CardDescription>Selecione uma data para ver os eventos</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border w-full"
                modifiers={{
                  hasEvent: eventDates
                }}
                modifiersStyles={{
                  hasEvent: {
                    backgroundColor: '#dcfce7',
                    color: '#166534',
                    fontWeight: 'bold'
                  }
                }}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Events for Selected Date */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CalendarIcon className="w-5 h-5" />
                <span>
                  {selectedDate ? formatDateForDisplay(selectedDate.toISOString().split('T')[0]) : 'Selecione uma data'}
                </span>
              </CardTitle>
              <CardDescription>
                {selectedDateEvents.length} evento(s) nesta data
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedDateEvents.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhum evento nesta data</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDateEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        event.completed 
                          ? 'bg-green-50 border-green-200' 
                          : event.type === 'vaccination'
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => toggleEventCompletion(event)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <span className="text-lg">{event.icon}</span>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className={`font-medium ${event.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                {event.title}
                              </h4>
                              {event.type === 'vaccination' && (
                                <Badge variant="outline" className="text-xs">
                                  <Syringe className="w-3 h-3 mr-1" />
                                  Vacina
                                </Badge>
                              )}
                            </div>
                            {event.description && (
                              <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                            )}
                          </div>
                        </div>
                        {event.completed && (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Upcoming Events */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-green-600" />
              <span>Próximos Eventos</span>
            </CardTitle>
            <CardDescription>
              Eventos dos próximos 7 dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-green-600 font-medium">Agenda em dia!</p>
                <p className="text-sm text-gray-500">Nenhum evento próximo</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.slice(0, 5).map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center space-x-3 p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors cursor-pointer"
                    onClick={() => toggleEventCompletion(event)}
                  >
                    <span className="text-lg">{event.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900">{event.title}</h4>
                        {event.type === 'vaccination' && (
                          <Badge variant="outline" className="text-xs">
                            <Syringe className="w-3 h-3 mr-1" />
                            Vacina
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {Math.ceil((new Date(event.date + 'T00:00:00').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} dia(s)
                    </Badge>
                  </div>
                ))}
                {upcomingEvents.length > 5 && (
                  <p className="text-xs text-gray-500 text-center">
                    +{upcomingEvents.length - 5} eventos adicionais
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Scheduled Vaccinations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Syringe className="w-5 h-5 text-blue-600" />
              <span>Vacinações Agendadas</span>
            </CardTitle>
            <CardDescription>
              Gerencie vacinações programadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScheduledVaccinations variant="full" />
          </CardContent>
        </Card>
      </motion.div>

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-gray-600" />
                <span>Eventos Passados</span>
              </CardTitle>
              <CardDescription>
                Últimos 30 dias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {pastEvents.slice(0, 10).map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 transition-colors"
                  >
                    <span className="text-lg opacity-70">{event.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-700">{event.title}</h4>
                        {event.type === 'vaccination' && (
                          <Badge variant="outline" className="text-xs opacity-70">
                            <Syringe className="w-3 h-3 mr-1" />
                            Vacina
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs opacity-70">
                      Concluído
                    </Badge>
                  </div>
                ))}
                {pastEvents.length > 10 && (
                  <p className="text-xs text-gray-500 text-center">
                    +{pastEvents.length - 10} eventos passados
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

export default Agenda;

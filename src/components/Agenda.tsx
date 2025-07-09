
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, Clock, MapPin, User, Edit2, Trash2, Filter, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useEvents } from '@/hooks/useEvents';
import { useVaccinations } from '@/hooks/useVaccinations';
import { useAnimals } from '@/hooks/useAnimals';

interface ExtendedEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  type: string;
  icon: string;
  isVaccination?: boolean;
  completed?: boolean;
}

const Agenda = () => {
  const { events, createEvent, updateEvent, deleteEvent, loading } = useEvents();
  const { vaccinations } = useVaccinations();
  const { animals } = useAnimals();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    type: 'tarefa',
    icon: '📅',
    completed: false
  });

  const today = new Date().toISOString().split('T')[0];
  
  // Filtrar eventos passados e futuros
  const futureEvents = events.filter(event => event.date >= today);
  const pastEvents = events.filter(event => event.date < today);
  
  // Gerar eventos de vacinação pendentes
  const vaccinationEvents: ExtendedEvent[] = vaccinations
    .filter(vacc => vacc.next_dose_date && vacc.next_dose_date >= today)
    .map(vacc => {
      const animal = animals.find(a => a.id === vacc.animal_id);
      return {
        id: `vacc-${vacc.id}`,
        title: `Vacinação - ${animal?.name || `Brinco ${animal?.tag}`}`,
        description: `Próxima dose de vacina`,
        date: vacc.next_dose_date!,
        time: '08:00',
        type: 'vacina',
        icon: '💉',
        isVaccination: true,
        completed: false
      };
    });

  const displayEvents = showPastEvents ? pastEvents : futureEvents;
  const allEvents: ExtendedEvent[] = showPastEvents 
    ? displayEvents.map(e => ({ ...e, isVaccination: false }))
    : [...displayEvents.map(e => ({ ...e, isVaccination: false })), ...vaccinationEvents]
      .sort((a, b) => a.date.localeCompare(b.date));

  const typeIcons = {
    'tarefa': '📋',
    'vacina': '💉',
    'reunião': '👥',
    'manutenção': '🔧',
    'manejo': '🐄'
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTypeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      type: value,
      icon: typeIcons[value as keyof typeof typeIcons] || '📅'
    }));
  };

  const handleOpenDialog = (event?: any) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        description: event.description || '',
        date: event.date,
        time: event.time,
        type: event.type || 'tarefa',
        icon: event.icon,
        completed: event.completed || false
      });
    } else {
      setEditingEvent(null);
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        type: 'tarefa',
        icon: '📋',
        completed: false
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingEvent(null);
  };

  const handleSubmit = async () => {
    if (editingEvent && !editingEvent.isVaccination) {
      await updateEvent(editingEvent.id, formData);
    } else if (!editingEvent) {
      await createEvent(formData);
    }
    handleCloseDialog();
  };

  const handleDelete = async (event: ExtendedEvent) => {
    if (!event.isVaccination) {
      await deleteEvent(event.id);
    }
  };

  const toggleEventCompleted = async (event: ExtendedEvent) => {
    if (!event.isVaccination) {
      await updateEvent(event.id, { completed: !event.completed });
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
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = allEvents.filter(event => event.date === dateStr);
      days.push({ day, dateStr, events: dayEvents });
    }
    
    return days;
  };

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr);
  };

  const getEventsForSelectedDate = () => {
    if (!selectedDate) return [];
    return allEvents.filter(event => event.date === selectedDate);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">📅 Agenda Rural</h2>
        <div className="flex items-center space-x-4">
          <Button
            variant={showPastEvents ? "default" : "outline"}
            onClick={() => setShowPastEvents(!showPastEvents)}
            className="flex items-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>{showPastEvents ? 'Ver Futuros' : 'Ver Passados'}</span>
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Novo Evento</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingEvent ? 'Editar Evento' : 'Novo Evento'}</DialogTitle>
                <DialogDescription>
                  Preencha os campos abaixo para {editingEvent ? 'editar' : 'criar'} um evento.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Título do evento"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select value={formData.type} onValueChange={handleTypeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tarefa">📋 Tarefa</SelectItem>
                      <SelectItem value="vacina">💉 Vacina</SelectItem>
                      <SelectItem value="reunião">👥 Reunião</SelectItem>
                      <SelectItem value="manutenção">🔧 Manutenção</SelectItem>
                      <SelectItem value="manejo">🐄 Manejo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Data</Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Hora</Label>
                    <Input
                      id="time"
                      name="time"
                      type="time"
                      value={formData.time}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Descrição do evento (opcional)"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit}>
                  {editingEvent ? 'Salvar' : 'Criar'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendário Interativo */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Calendário {showPastEvents ? 'de Eventos Passados' : 'de Próximos Eventos'}
          </h3>
          
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} className="text-center font-medium text-gray-600 py-2 text-sm">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth().map((dayData, index) => (
              <div
                key={index}
                className={`h-10 flex items-center justify-center rounded-lg text-sm relative cursor-pointer transition-colors ${
                  dayData
                    ? `text-gray-800 hover:bg-gray-100 ${
                        dayData.events.length > 0 ? 'bg-green-100 border border-green-300' : ''
                      } ${
                        dayData.dateStr === today ? 'bg-green-600 text-white' : ''
                      } ${
                        selectedDate === dayData.dateStr ? 'ring-2 ring-green-500' : ''
                      }`
                    : ''
                }`}
                onClick={() => dayData && handleDateClick(dayData.dateStr)}
              >
                {dayData?.day}
                {dayData && dayData.events.length > 0 && dayData.dateStr !== today && (
                  <span className="absolute bottom-1 w-1 h-1 bg-green-500 rounded-full"></span>
                )}
              </div>
            ))}
          </div>

          {selectedDate && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">
                Eventos para {new Date(selectedDate).toLocaleDateString('pt-BR')}:
              </h4>
              {getEventsForSelectedDate().length === 0 ? (
                <p className="text-sm text-gray-500">Nenhum evento neste dia.</p>
              ) : (
                <div className="space-y-2">
                  {getEventsForSelectedDate().map((event) => (
                    <div key={event.id} className="flex items-center space-x-2 text-sm">
                      <span>{event.icon}</span>
                      <span className="font-medium">{event.title}</span>
                      <span className="text-gray-500">{event.time}</span>
                      {event.isVaccination && (
                        <Badge variant="secondary" className="text-xs">Vacinação</Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Lista de Eventos */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            {showPastEvents ? 'Eventos Passados' : 'Próximos Eventos'}
          </h3>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center py-4">Carregando eventos...</div>
            ) : allEvents.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                {showPastEvents ? 'Nenhum evento passado encontrado.' : 'Nenhum evento futuro encontrado.'}
              </div>
            ) : (
              allEvents.map((event) => (
                <div key={event.id} className={`flex items-center justify-between p-3 rounded-lg ${event.completed ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{event.icon}</span>
                    <div>
                      <h4 className={`font-medium ${event.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                        {event.title}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(event.date).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {event.time}
                        </span>
                      </div>
                      {event.description && (
                        <p className="text-xs text-gray-500 mt-1">{event.description}</p>
                      )}
                      {event.isVaccination && (
                        <Badge variant="secondary" className="mt-1">Vacinação</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!event.isVaccination && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleEventCompleted(event)}
                          className={event.completed ? "text-green-600" : "text-gray-400"}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(event)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(event)}
                          className="text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
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

export default Agenda;

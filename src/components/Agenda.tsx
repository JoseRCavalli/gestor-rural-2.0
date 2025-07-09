
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, Clock, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useEvents } from '@/hooks/useEvents';

const Agenda = () => {
  const { events, addEvent, updateEvent, deleteEvent } = useEvents();
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '08:00',
    type: 'tarefa',
    icon: '📅'
  });

  const eventTypes = [
    { value: 'tarefa', label: 'Tarefa', icon: '📋' },
    { value: 'vacina', label: 'Vacina', icon: '💉' },
    { value: 'reuniao', label: 'Reunião', icon: '👥' },
    { value: 'manutencao', label: 'Manutenção', icon: '🔧' },
    { value: 'manejo', label: 'Manejo', icon: '🐄' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingEvent) {
      await updateEvent(editingEvent.id, eventForm);
      setEditingEvent(null);
    } else {
      await addEvent(eventForm);
    }
    
    setEventForm({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      time: '08:00',
      type: 'tarefa',
      icon: '📅'
    });
    setShowEventDialog(false);
  };

  const handleEdit = (event: any) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      description: event.description || '',
      date: event.date,
      time: event.time,
      type: event.type || 'tarefa',
      icon: event.icon || '📅'
    });
    setShowEventDialog(true);
  };

  const handleDelete = async (eventId: string) => {
    if (confirm('Tem certeza que deseja excluir este evento?')) {
      await deleteEvent(eventId);
    }
  };

  const handleTypeChange = (type: string) => {
    const eventType = eventTypes.find(et => et.value === type);
    setEventForm(prev => ({
      ...prev,
      type,
      icon: eventType?.icon || '📅'
    }));
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

  const today = new Date().toISOString().split('T')[0];
  const todayEvents = events.filter(event => event.date === today);
  const selectedDateEvents = selectedDate 
    ? events.filter(event => event.date === selectedDate)
    : [];

  const upcomingEvents = events
    .filter(event => event.date >= today)
    .sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h2 className="text-3xl font-bold text-gray-800">📅 Agenda Rural</h2>
          <p className="text-gray-600 mt-1">Organize suas atividades e compromissos</p>
        </div>
        <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Novo Evento</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingEvent ? 'Editar Evento' : 'Novo Evento'}</DialogTitle>
              <DialogDescription>
                {editingEvent ? 'Edite as informações do evento' : 'Adicione um novo evento à sua agenda'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={eventForm.title}
                  onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="type">Tipo de Evento *</Label>
                <Select value={eventForm.type} onValueChange={handleTypeChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center space-x-2">
                          <span>{type.icon}</span>
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Data *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={eventForm.date}
                    onChange={(e) => setEventForm(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="time">Horário *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={eventForm.time}
                    onChange={(e) => setEventForm(prev => ({ ...prev, time: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={eventForm.description}
                  onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => {
                  setShowEventDialog(false);
                  setEditingEvent(null);
                  setEventForm({
                    title: '',
                    description: '',
                    date: new Date().toISOString().split('T')[0],
                    time: '08:00',
                    type: 'tarefa',
                    icon: '📅'
                  });
                }}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingEvent ? 'Salvar' : 'Criar Evento'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interactive Calendar */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Calendário</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
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
                        <div key={event.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-2">
                            <span>{event.icon}</span>
                            <span className="font-medium">{event.title}</span>
                            <span className="text-gray-500">{event.time}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEdit(event)}
                              className="h-6 w-6 p-0"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDelete(event.id)}
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Today's Events */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Eventos de Hoje</span>
              </CardTitle>
              <CardDescription>
                {new Date().toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todayEvents.length === 0 ? (
                  <p className="text-gray-500 text-sm">Nenhum evento programado para hoje.</p>
                ) : (
                  todayEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{event.icon}</span>
                        <div>
                          <p className="font-medium text-gray-800">{event.title}</p>
                          <p className="text-sm text-gray-600">{event.time}</p>
                          {event.description && (
                            <p className="text-xs text-gray-500 mt-1">{event.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Badge variant="secondary" className="text-xs">
                          {eventTypes.find(t => t.value === event.type)?.label || 'Evento'}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit(event)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(event.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Upcoming Events */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Próximos Eventos</CardTitle>
            <CardDescription>
              Seus próximos compromissos e atividades programadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingEvents.length === 0 ? (
                <p className="text-gray-500 text-sm">Nenhum evento programado.</p>
              ) : (
                upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <span className="text-2xl">{event.icon}</span>
                      <div>
                        <p className="font-medium text-gray-800">{event.title}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(event.date).toLocaleDateString('pt-BR')} às {event.time}
                        </p>
                        {event.description && (
                          <p className="text-xs text-gray-500 mt-1">{event.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {eventTypes.find(t => t.value === event.type)?.label || 'Evento'}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEdit(event)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(event.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Agenda;

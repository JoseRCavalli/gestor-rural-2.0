
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Clock, Calendar as CalendarIcon, Edit, Trash2 } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const Agenda = () => {
  const { events, createEvent, updateEvent, deleteEvent } = useEvents();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDateString, setSelectedDateString] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    type: 'task',
    icon: '📅'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.date || !formData.time) {
      return;
    }

    if (editingEvent) {
      await updateEvent(editingEvent, formData);
      setEditingEvent(null);
    } else {
      await createEvent(formData);
    }

    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      type: 'task',
      icon: '📅'
    });
    setShowAddForm(false);
  };

  const handleEdit = (event: any) => {
    setFormData({
      title: event.title,
      description: event.description || '',
      date: event.date,
      time: event.time,
      type: event.type,
      icon: event.icon
    });
    setEditingEvent(event.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja deletar este evento?')) {
      await deleteEvent(id);
    }
  };

  const getCurrentMonth = () => {
    const month = selectedDate.toLocaleString('pt-BR', { month: 'long' });
    const year = selectedDate.getFullYear();
    return `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
  };

  const getDaysInMonth = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month - CORRIGIDO para evitar problemas de timezone
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const hasEvents = events.some(event => event.date === dateStr);
      days.push({ day, dateStr, hasEvents });
    }
    
    return days;
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'task': return 'bg-blue-100 text-blue-800';
      case 'meeting': return 'bg-purple-100 text-purple-800';
      case 'harvest': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const upcomingEvents = events.filter(event => new Date(event.date) >= new Date());
  const pastEvents = events.filter(event => new Date(event.date) < new Date());

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      type: 'task',
      icon: '📅'
    });
    setEditingEvent(null);
    setShowAddForm(false);
  };

  // Get events for selected date
  const selectedDateEvents = selectedDateString 
    ? events.filter(event => event.date === selectedDateString)
    : [];

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">📅 Agenda Rural</h2>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-green-600 text-white hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Evento
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar - CORRIGIDO E TORNADO INTERATIVO */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800">{getCurrentMonth()}</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1))}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ←
              </button>
              <button
                onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1))}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                →
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} className="text-center font-medium text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 mb-4">
            {getDaysInMonth().map((dayData, index) => (
              <div
                key={index}
                className={`h-12 flex items-center justify-center rounded-lg cursor-pointer transition-colors relative ${
                  dayData
                    ? `hover:bg-gray-100 text-gray-800 ${
                        dayData.hasEvents ? 'bg-green-100 border border-green-300' : ''
                      } ${
                        dayData.dateStr === today ? 'bg-green-600 text-white' : ''
                      } ${
                        dayData.dateStr === selectedDateString ? 'ring-2 ring-blue-500' : ''
                      }`
                    : ''
                }`}
                onClick={() => dayData && setSelectedDateString(dayData.dateStr)}
              >
                {dayData?.day}
                {dayData?.hasEvents && dayData.dateStr !== today && (
                  <span className="absolute bottom-1 w-1 h-1 bg-green-500 rounded-full"></span>
                )}
              </div>
            ))}
          </div>

          {/* Eventos do dia selecionado */}
          {selectedDateString && (
            <div className="border-t pt-4">
              <p className="font-medium text-gray-800 mb-3">
                Eventos em {new Date(selectedDateString + 'T00:00:00').toLocaleDateString('pt-BR')}:
              </p>
              <div className="space-y-2">
                {selectedDateEvents.length === 0 ? (
                  <p className="text-gray-500 text-sm">Nenhum evento nesta data.</p>
                ) : (
                  selectedDateEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{event.icon}</span>
                        <div>
                          <span className="font-medium text-gray-800">{event.title}</span>
                          <div className="text-sm text-gray-600">{event.time}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleEdit(event)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Add/Edit Event Form */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          {showAddForm ? (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {editingEvent ? 'Editar Evento' : 'Novo Evento'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                  <Input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Nome do evento"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Descrição do evento"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Horário</label>
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="task">Tarefa</option>
                    <option value="meeting">Reunião</option>
                    <option value="harvest">Colheita</option>
                    <option value="maintenance">Manutenção</option>
                  </select>
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                    {editingEvent ? 'Atualizar' : 'Salvar'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Próximos Eventos</h3>
              <div className="space-y-3">
                {upcomingEvents.slice(0, 4).map(event => (
                  <div key={event.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-lg">{event.icon}</span>
                      <span className="font-medium text-gray-800">{event.title}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CalendarIcon className="w-3 h-3" />
                      <span>{new Date(event.date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                      <Clock className="w-3 h-3 ml-2" />
                      <span>{event.time}</span>
                    </div>
                  </div>
                ))}
                {upcomingEvents.length === 0 && (
                  <p className="text-gray-500 text-sm">Nenhum evento próximo.</p>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Eventos Futuros</h3>
          <div className="space-y-3">
            {upcomingEvents.map(event => (
              <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{event.icon}</span>
                  <div>
                    <p className="font-medium text-gray-800">{event.title}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{new Date(event.date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                      <span>{event.time}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.type)}`}>
                    {event.type}
                  </span>
                  <button
                    onClick={() => handleEdit(event)}
                    className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {upcomingEvents.length === 0 && (
              <p className="text-gray-500 text-sm">Nenhum evento futuro.</p>
            )}
          </div>
        </motion.div>

        {/* Past Events */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Eventos Passados</h3>
          <div className="space-y-3">
            {pastEvents.map(event => (
              <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg opacity-75">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{event.icon}</span>
                  <div>
                    <p className="font-medium text-gray-800 line-through">{event.title}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{new Date(event.date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                      <span>{event.time}</span>
                    </div>
                  </div>
                </div>
                <span className="text-green-600">✓</span>
              </div>
            ))}
            {pastEvents.length === 0 && (
              <p className="text-gray-500 text-sm">Nenhum evento passado.</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Agenda;

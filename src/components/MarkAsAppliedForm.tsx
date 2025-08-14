
import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useVaccinations } from '@/hooks/useVaccinations';
import { useEvents } from '@/hooks/useEvents';
import { useAnimals } from '@/hooks/useAnimals';
import { toast } from 'sonner';

interface MarkAsAppliedFormProps {
  vaccination?: any;
  eventId?: string;
  isScheduled?: boolean;
  size?: 'sm' | 'default';
}

const MarkAsAppliedForm = ({ vaccination, eventId, isScheduled = false, size = 'default' }: MarkAsAppliedFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    application_date: new Date().toISOString().split('T')[0],
    batch_number: '',
    manufacturer: '',
    responsible: '',
    notes: ''
  });
  const [scheduleNextDose, setScheduleNextDose] = useState(true);
  const [manualNextDoseDate, setManualNextDoseDate] = useState('');

  const { markAsApplied, refetch: refetchVaccinations, vaccineTypes } = useVaccinations();
  const { updateEvent, refetch: refetchEvents, createEvent } = useEvents();
  const { animals } = useAnimals();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.application_date) {
      toast.error('Data de aplicação é obrigatória');
      return;
    }

    try {
      let vaccinationData = null;

      if (isScheduled && eventId) {
        // Marcar evento agendado como concluído
        await updateEvent(eventId, { completed: true });
        await refetchEvents();
        toast.success('Vacinação agendada marcada como aplicada!');
      } else if (vaccination) {
        // Marcar vacinação como aplicada
        vaccinationData = await markAsApplied(vaccination.id, formData);
        await refetchVaccinations();
      }

      // Agendar próxima dose se necessário
      if (scheduleNextDose && vaccination) {
        const vaccineType = vaccineTypes.find(vt => vt.id === vaccination.vaccine_type_id);
        const animal = animals.find(a => a.id === vaccination.animal_id);
        
        if (vaccineType?.interval_months && animal) {
          let nextDoseDate;
          
          if (manualNextDoseDate) {
            nextDoseDate = manualNextDoseDate;
          } else {
            const applicationDate = new Date(formData.application_date);
            const nextDate = new Date(applicationDate);
            nextDate.setMonth(nextDate.getMonth() + vaccineType.interval_months);
            nextDoseDate = nextDate.toISOString().split('T')[0];
          }

          // Criar evento para próxima dose - removido campo 'time' que não existe
          await createEvent({
            title: `Vacinação: ${vaccineType.name}`,
            description: `Segunda dose de ${vaccineType.name} para ${animal.name || animal.tag}`,
            date: nextDoseDate,
            type: 'vaccination',
            icon: '💉'
          });

          await refetchEvents();
          toast.success('Próxima dose agendada no calendário!');
        }
      }
      
      // Resetar formulário
      setFormData({
        application_date: new Date().toISOString().split('T')[0],
        batch_number: '',
        manufacturer: '',
        responsible: '',
        notes: ''
      });
      setScheduleNextDose(true);
      setManualNextDoseDate('');
      
      setIsOpen(false);
    } catch (error) {
      console.error('Erro ao marcar como aplicada:', error);
      toast.error('Erro ao marcar vacinação como aplicada');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          size={size} 
          className="flex items-center space-x-1"
          variant="outline"
        >
          <CheckCircle className="w-3 h-3" />
          <span>Marcar como Aplicada</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span>Marcar Vacinação como Aplicada</span>
          </DialogTitle>
          <DialogDescription>
            Registre os dados da aplicação da vacina
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="application_date">Data de Aplicação*</Label>
              <Input
                id="application_date"
                type="date"
                value={formData.application_date}
                onChange={(e) => handleInputChange('application_date', e.target.value)}
                className="w-full"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="batch_number">Lote</Label>
              <Input
                id="batch_number"
                value={formData.batch_number}
                onChange={(e) => handleInputChange('batch_number', e.target.value)}
                placeholder="Número do lote"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="manufacturer">Fabricante</Label>
              <Input
                id="manufacturer"
                value={formData.manufacturer}
                onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                placeholder="Nome do fabricante"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsible">Responsável</Label>
              <Input
                id="responsible"
                value={formData.responsible}
                onChange={(e) => handleInputChange('responsible', e.target.value)}
                placeholder="Nome do responsável"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Observações sobre a aplicação"
              rows={3}
            />
          </div>

          {vaccination && (() => {
            const vaccineType = vaccineTypes.find(vt => vt.id === vaccination.vaccine_type_id);
            return vaccineType?.interval_months ? (
              <div className="border-t pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="schedule_next">Agendar próxima dose?</Label>
                  <Switch
                    id="schedule_next"
                    checked={scheduleNextDose}
                    onCheckedChange={setScheduleNextDose}
                  />
                </div>
                
                {scheduleNextDose && (
                  <div className="space-y-2">
                    <Label htmlFor="next_dose_date">Data da próxima dose</Label>
                    <Input
                      id="next_dose_date"
                      type="date"
                      value={manualNextDoseDate}
                      onChange={(e) => setManualNextDoseDate(e.target.value)}
                      placeholder={`Deixe vazio para calcular automaticamente (${vaccineType.interval_months} meses)`}
                    />
                    <p className="text-sm text-muted-foreground">
                      {manualNextDoseDate 
                        ? 'Data escolhida manualmente' 
                        : `Será calculada automaticamente: ${vaccineType.interval_months} meses após a aplicação`
                      }
                    </p>
                  </div>
                )}
              </div>
            ) : null;
          })()}

          <div className="flex space-x-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Marcar como Aplicada
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MarkAsAppliedForm;

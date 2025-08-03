import { useEffect } from 'react';
import { useVaccinations } from '@/hooks/useVaccinations';
import { useAnimals } from '@/hooks/useAnimals';
import { useEvents } from '@/hooks/useEvents';
import { useNotifications } from '@/hooks/useNotifications';

export const useVaccinationNotifications = () => {
  const { vaccinations, vaccineTypes } = useVaccinations();
  const { animals } = useAnimals();
  const { events } = useEvents();
  const { createNotification } = useNotifications();

  useEffect(() => {
    const checkOverdueVaccinations = async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Verificar vacinações aplicadas com próxima dose em atraso
      const overdueVaccinations = vaccinations.filter(vaccination => {
        if (!vaccination.next_dose_date) return false;
        
        const nextDate = new Date(vaccination.next_dose_date + 'T00:00:00');
        const todayDate = new Date(today + 'T00:00:00');
        const daysOverdue = Math.ceil((todayDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24));
        
        return daysOverdue > 0;
      });

      // Verificar vacinações agendadas em atraso
      const overdueScheduled = events.filter(event => {
        if (event.type !== 'vaccination' || event.completed) return false;
        
        const eventDate = new Date(event.date + 'T00:00:00');
        const todayDate = new Date(today + 'T00:00:00');
        const daysOverdue = Math.ceil((todayDate.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24));
        
        return daysOverdue > 0;
      });

      // Enviar notificações para vacinações aplicadas em atraso
      for (const vaccination of overdueVaccinations) {
        const animal = animals.find(a => a.id === vaccination.animal_id);
        const vaccineType = vaccineTypes.find(vt => vt.id === vaccination.vaccine_type_id);
        
        if (animal && vaccineType) {
          const nextDate = new Date(vaccination.next_dose_date + 'T00:00:00');
          const todayDate = new Date(today + 'T00:00:00');
          const daysOverdue = Math.ceil((todayDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24));
          
          await createNotification({
            title: '⚠️ Vacinação em Atraso',
            message: `A próxima dose de ${vaccineType.name} para ${animal.name || `Brinco ${animal.tag}`} está ${daysOverdue} dia(s) em atraso.`,
            type: 'warning',
            channel: 'app'
          });
        }
      }

      // Enviar notificações para vacinações agendadas em atraso
      for (const event of overdueScheduled) {
        const eventDate = new Date(event.date + 'T00:00:00');
        const todayDate = new Date(today + 'T00:00:00');
        const daysOverdue = Math.ceil((todayDate.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24));
        
        await createNotification({
          title: '⚠️ Vacinação Agendada em Atraso',
          message: `${event.title} estava agendada para ${new Date(event.date).toLocaleDateString('pt-BR')} e está ${daysOverdue} dia(s) em atraso.`,
          type: 'warning',
          channel: 'app'
        });
      }
    };

    // Verificar a cada 1 hora
    const interval = setInterval(checkOverdueVaccinations, 60 * 60 * 1000);
    
    // Verificar imediatamente
    checkOverdueVaccinations();

    return () => clearInterval(interval);
  }, [vaccinations, animals, events, vaccineTypes, createNotification]);
};

export default function VaccinationNotifications() {
  useVaccinationNotifications();
  return null;
}
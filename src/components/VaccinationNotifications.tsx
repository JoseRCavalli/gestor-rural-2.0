import { useEffect, useRef } from 'react';
import { useVaccinations } from '@/hooks/useVaccinations';
import { useAnimals } from '@/hooks/useAnimals';
import { useEvents } from '@/hooks/useEvents';
import { useNotifications } from '@/hooks/useNotifications';

export const useVaccinationNotifications = () => {
  const { vaccinations, vaccineTypes } = useVaccinations();
  const { animals } = useAnimals();
  const { events } = useEvents();
  const { createNotification, notifications } = useNotifications();
  const lastCheckRef = useRef<string>('');

  useEffect(() => {
    const checkOverdueVaccinations = async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Criar uma chave única baseada na data e nos IDs únicos das vacinações e eventos em atraso
      const overdueVaccinationIds = vaccinations
        .filter(vaccination => vaccination.next_dose_date && vaccination.next_dose_date < today)
        .map(v => v.id)
        .sort();
      
      const overdueEventIds = events
        .filter(event => {
          if (event.type !== 'vaccination' || event.completed) return false;
          return event.date < today;
        })
        .map(e => e.id)
        .sort();
      
      const currentDataKey = `${today}-${overdueVaccinationIds.join(',')}-${overdueEventIds.join(',')}`;
      
      // Se os dados não mudaram desde a última verificação, não fazer nada
      if (lastCheckRef.current === currentDataKey) {
        return;
      }
      
      lastCheckRef.current = currentDataKey;
      
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

      // Verificar se já existe notificação similar antes de criar uma nova
      const checkExistingNotification = (title: string, message: string) => {
        return notifications.some(notification => 
          notification.title === title && 
          notification.message === message &&
          !notification.read
        );
      };

      // Enviar notificações para vacinações aplicadas em atraso
      for (const vaccination of overdueVaccinations) {
        const animal = animals.find(a => a.id === vaccination.animal_id);
        const vaccineType = vaccineTypes.find(vt => vt.id === vaccination.vaccine_type_id);
        
        if (animal && vaccineType) {
          const nextDate = new Date(vaccination.next_dose_date + 'T00:00:00');
          const todayDate = new Date(today + 'T00:00:00');
          const daysOverdue = Math.ceil((todayDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24));
          
          const title = '⚠️ Vacinação em Atraso';
          const message = `A próxima dose de ${vaccineType.name} para ${animal.name || `Brinco ${animal.tag}`} está ${daysOverdue} dia(s) em atraso.`;
          
          if (!checkExistingNotification(title, message)) {
            await createNotification({
              title,
              message,
              type: 'warning',
              channel: 'app'
            });
          }
        }
      }

      // Enviar notificações para vacinações agendadas em atraso
      for (const event of overdueScheduled) {
        const eventDate = new Date(event.date + 'T00:00:00');
        const todayDate = new Date(today + 'T00:00:00');
        const daysOverdue = Math.ceil((todayDate.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24));
        
        const title = '⚠️ Vacinação Agendada em Atraso';
        const message = `${event.title} estava agendada para ${new Date(event.date).toLocaleDateString('pt-BR')} e está ${daysOverdue} dia(s) em atraso.`;
        
        if (!checkExistingNotification(title, message)) {
          await createNotification({
            title,
            message,
            type: 'warning',
            channel: 'app'
          });
        }
      }
    };

    // Verificar apenas uma vez ao montar o componente e quando os dados mudarem
    checkOverdueVaccinations();

  }, [vaccinations, animals, events, vaccineTypes, createNotification, notifications]);
};

export default function VaccinationNotifications() {
  useVaccinationNotifications();
  return null;
}
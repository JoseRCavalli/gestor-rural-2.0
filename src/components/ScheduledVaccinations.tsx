
import { useEvents } from '@/hooks/useEvents';
import { useAnimals } from '@/hooks/useAnimals';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Check, X, Syringe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MarkAsAppliedForm from './MarkAsAppliedForm';
import UnmarkAppliedForm from './UnmarkAppliedForm';

interface ScheduledVaccinationsProps {
  variant?: 'compact' | 'full';
}

const ScheduledVaccinations = ({ variant = 'compact' }: ScheduledVaccinationsProps) => {
  const { events } = useEvents();
  const { animals } = useAnimals();

  // Filtrar apenas eventos de vacinação
  const vaccinationEvents = events.filter(event => event.type === 'vaccination');

  if (vaccinationEvents.length === 0) {
    return (
      <div className="text-center py-4">
        <Syringe className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-gray-500 text-sm">Nenhuma vacinação agendada</p>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="space-y-2">
        <div className="space-y-2">
          {vaccinationEvents.slice(0, 3).map((event) => (
            <div
              key={event.id}
              className={`p-2 rounded-lg border-l-2 ${
                event.completed
                  ? 'border-l-green-500 bg-green-50'
                  : new Date(event.date) < new Date()
                  ? 'border-l-red-500 bg-red-50'
                  : 'border-l-blue-500 bg-blue-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1 mb-1">
                    <span className="text-sm">{event.icon || '💉'}</span>
                    <h4 className="font-medium text-gray-900 text-sm truncate">{event.title}</h4>
                    {event.completed && (
                      <span className="inline-flex items-center px-1 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 ml-1">
                        <Check className="w-2 h-2 mr-0.5" />
                        OK
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center text-xs text-gray-500">
                    <span>
                      📅 {format(new Date(event.date), 'dd/MM', { locale: ptBR })}
                    </span>
                    {new Date(event.date) < new Date() && !event.completed && (
                      <span className="text-red-600 font-medium ml-2">Atrasada</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center ml-2">
                  {!event.completed ? (
                    <MarkAsAppliedForm
                      eventId={event.id}
                      isScheduled={true}
                      size="sm"
                    />
                  ) : (
                    <UnmarkAppliedForm
                      eventId={event.id}
                      size="sm"
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {vaccinationEvents.length > 3 && (
          <p className="text-xs text-gray-500 text-center">
            +{vaccinationEvents.length - 3} vacinações
          </p>
        )}
      </div>
    );
  }

  // Full variant for Agenda
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {vaccinationEvents.map((event) => (
          <div
            key={event.id}
            className={`p-4 rounded-lg border-l-4 ${
              event.completed
                ? 'border-l-green-500 bg-green-50'
                : new Date(event.date) < new Date()
                ? 'border-l-red-500 bg-red-50'
                : 'border-l-blue-500 bg-blue-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg">{event.icon || '💉'}</span>
                  <h4 className="font-medium text-gray-900">{event.title}</h4>
                  {event.completed && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <Check className="w-3 h-3 mr-1" />
                      Concluída
                    </span>
                  )}
                </div>
                
                {event.description && (
                  <p className="text-gray-600 text-sm mb-2">{event.description}</p>
                )}
                
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>
                    📅 {format(new Date(event.date), 'dd/MM/yyyy', { locale: ptBR })}
                  </span>
                  {new Date(event.date) < new Date() && !event.completed && (
                    <span className="text-red-600 font-medium">Em atraso</span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {!event.completed ? (
                  <MarkAsAppliedForm
                    eventId={event.id}
                    isScheduled={true}
                    size="sm"
                  />
                ) : (
                  <UnmarkAppliedForm
                    eventId={event.id}
                    size="sm"
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScheduledVaccinations;

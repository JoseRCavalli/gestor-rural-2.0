import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useEvents } from '@/hooks/useEvents';
import { toast } from 'sonner';

interface UnmarkAppliedFormProps {
  eventId: string;
  size?: 'sm' | 'default';
}

const UnmarkAppliedForm = ({ eventId, size = 'default' }: UnmarkAppliedFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { updateEvent } = useEvents();

  const handleUnmark = async () => {
    try {
      await updateEvent(eventId, { completed: false });
      toast.success('Vacinação desmarcada com sucesso!');
      setIsOpen(false);
    } catch (error) {
      console.error('Erro ao desmarcar vacinação:', error);
      toast.error('Erro ao desmarcar vacinação');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          size={size} 
          className="flex items-center space-x-1"
          variant="outline"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Desmarcar</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <RotateCcw className="w-5 h-5 text-orange-600" />
            <span>Desmarcar Vacinação</span>
          </DialogTitle>
          <DialogDescription>
            Tem certeza que deseja desmarcar esta vacinação? Ela voltará a ser um evento agendado.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex space-x-2">
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
            Cancelar
          </Button>
          <Button type="button" onClick={handleUnmark} className="flex-1" variant="destructive">
            Desmarcar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UnmarkAppliedForm;
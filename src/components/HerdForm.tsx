
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useHerd, HerdAnimal } from '@/hooks/useHerd';
import { toast } from 'sonner';

interface HerdFormProps {
  animal?: HerdAnimal | null;
  onClose: () => void;
}

const HerdForm = ({ animal, onClose }: HerdFormProps) => {
  const { addAnimal, updateAnimal } = useHerd();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    reproductive_status: '',
    observations: '',
    last_calving_date: '',
    days_in_lactation: '',
    milk_control: '',
    expected_calving_interval: '',
    del_average: ''
  });

  useEffect(() => {
    if (animal) {
      setFormData({
        code: animal.code || '',
        name: animal.name || '',
        reproductive_status: animal.reproductive_status || '',
        observations: animal.observations || '',
        last_calving_date: animal.last_calving_date || '',
        days_in_lactation: animal.days_in_lactation?.toString() || '',
        milk_control: animal.milk_control?.toString() || '',
        expected_calving_interval: animal.expected_calving_interval?.toString() || '',
        del_average: animal.del_average?.toString() || ''
      });
    }
  }, [animal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const animalData = {
        code: formData.code,
        name: formData.name,
        reproductive_status: formData.reproductive_status,
        observations: formData.observations || undefined,
        last_calving_date: formData.last_calving_date || undefined,
        days_in_lactation: formData.days_in_lactation ? parseInt(formData.days_in_lactation) : undefined,
        milk_control: formData.milk_control ? parseFloat(formData.milk_control) : undefined,
        expected_calving_interval: formData.expected_calving_interval ? parseInt(formData.expected_calving_interval) : undefined,
        del_average: formData.del_average ? parseFloat(formData.del_average) : undefined
      };

      if (animal) {
        await updateAnimal(animal.id, animalData);
      } else {
        await addAnimal(animalData);
      }

      onClose();
    } catch (error) {
      console.error('Error saving animal:', error);
      toast.error('Erro ao salvar animal');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {animal ? 'Editar Animal' : 'Cadastrar Novo Animal'}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados do animal do rebanho
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="code">Código do Animal *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value)}
                placeholder="Ex: 001, A001, etc."
                required
              />
            </div>

            <div>
              <Label htmlFor="name">Nome do Animal *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Nome ou identificação"
                required
              />
            </div>

            <div>
              <Label htmlFor="reproductive_status">Estado Reprodutivo *</Label>
              <Select 
                value={formData.reproductive_status} 
                onValueChange={(value) => handleChange('reproductive_status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aberta">Aberta</SelectItem>
                  <SelectItem value="ciclando">Ciclando</SelectItem>
                  <SelectItem value="gestante">Gestante</SelectItem>
                  <SelectItem value="dg+">DG+</SelectItem>
                  <SelectItem value="dg-">DG-</SelectItem>
                  <SelectItem value="seca">Seca</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="last_calving_date">Data do Último Parto</Label>
              <Input
                id="last_calving_date"
                type="date"
                value={formData.last_calving_date}
                onChange={(e) => handleChange('last_calving_date', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="days_in_lactation">Dias em Lactação (DEL)</Label>
              <Input
                id="days_in_lactation"
                type="number"
                value={formData.days_in_lactation}
                onChange={(e) => handleChange('days_in_lactation', e.target.value)}
                placeholder="Ex: 120"
              />
            </div>

            <div>
              <Label htmlFor="milk_control">Controle Leiteiro (PPS)</Label>
              <Input
                id="milk_control"
                type="number"
                step="0.1"
                value={formData.milk_control}
                onChange={(e) => handleChange('milk_control', e.target.value)}
                placeholder="Ex: 25.5"
              />
            </div>

            <div>
              <Label htmlFor="expected_calving_interval">Intervalo de Parto Esperado (dias)</Label>
              <Input
                id="expected_calving_interval"
                type="number"
                value={formData.expected_calving_interval}
                onChange={(e) => handleChange('expected_calving_interval', e.target.value)}
                placeholder="Ex: 365"
              />
            </div>

            <div>
              <Label htmlFor="del_average">Média de DEL</Label>
              <Input
                id="del_average"
                type="number"
                step="0.1"
                value={formData.del_average}
                onChange={(e) => handleChange('del_average', e.target.value)}
                placeholder="Ex: 150.5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="observations">Observações</Label>
            <Textarea
              id="observations"
              value={formData.observations}
              onChange={(e) => handleChange('observations', e.target.value)}
              placeholder="Observações adicionais sobre o animal..."
              rows={3}
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Salvando...' : (animal ? 'Atualizar' : 'Cadastrar')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default HerdForm;

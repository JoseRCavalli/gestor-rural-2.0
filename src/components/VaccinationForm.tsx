
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Syringe, User, FileText, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useVaccinations } from '@/hooks/useVaccinations';
import { useAnimals } from '@/hooks/useAnimals';
import { toast } from 'sonner';

const VaccinationForm = () => {
  const { addVaccination, vaccineTypes } = useVaccinations();
  const { animals } = useAnimals();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    animal_id: '',
    vaccine_type_id: '',
    application_date: '',
    batch_number: '',
    manufacturer: '',
    responsible: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.animal_id || !formData.vaccine_type_id || !formData.application_date) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    try {
      await addVaccination(formData);
      setFormData({
        animal_id: '',
        vaccine_type_id: '',
        application_date: '',
        batch_number: '',
        manufacturer: '',
        responsible: '',
        notes: ''
      });
      setIsOpen(false);
      toast.success('Vacinação cadastrada com sucesso!');
    } catch (error) {
      console.error('Error adding vaccination:', error);
      toast.error('Erro ao cadastrar vacinação');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center space-x-2 bg-green-600 hover:bg-green-700">
          <Syringe className="w-4 h-4" />
          <span>Cadastrar Vacinação</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Syringe className="w-5 h-5 text-green-600" />
            <span>Cadastrar Nova Vacinação</span>
          </DialogTitle>
          <DialogDescription>
            Registre uma nova vacinação aplicada no rebanho
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Animal */}
            <div className="space-y-2">
              <Label htmlFor="animal" className="flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>Animal *</span>
              </Label>
              <Select value={formData.animal_id} onValueChange={(value) => handleInputChange('animal_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o animal" />
                </SelectTrigger>
                <SelectContent>
                  {animals.map((animal) => (
                    <SelectItem key={animal.id} value={animal.id}>
                      {animal.name || `Brinco ${animal.tag}`} - {animal.phase}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tipo de Vacina */}
            <div className="space-y-2">
              <Label htmlFor="vaccine_type" className="flex items-center space-x-1">
                <Syringe className="w-4 h-4" />
                <span>Tipo de Vacina *</span>
              </Label>
              <Select value={formData.vaccine_type_id} onValueChange={(value) => handleInputChange('vaccine_type_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a vacina" />
                </SelectTrigger>
                <SelectContent>
                  {vaccineTypes.map((vaccine) => (
                    <SelectItem key={vaccine.id} value={vaccine.id}>
                      {vaccine.name}
                      {vaccine.description && ` - ${vaccine.description}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Data de Aplicação */}
            <div className="space-y-2">
              <Label htmlFor="application_date" className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Data de Aplicação *</span>
              </Label>
              <Input
                id="application_date"
                type="date"
                value={formData.application_date}
                onChange={(e) => handleInputChange('application_date', e.target.value)}
                required
              />
            </div>

            {/* Lote */}
            <div className="space-y-2">
              <Label htmlFor="batch_number">Número do Lote</Label>
              <Input
                id="batch_number"
                type="text"
                placeholder="Ex: ABC123"
                value={formData.batch_number}
                onChange={(e) => handleInputChange('batch_number', e.target.value)}
              />
            </div>

            {/* Fabricante */}
            <div className="space-y-2">
              <Label htmlFor="manufacturer">Fabricante</Label>
              <Input
                id="manufacturer"
                type="text"
                placeholder="Ex: Zoetis, MSD"
                value={formData.manufacturer}
                onChange={(e) => handleInputChange('manufacturer', e.target.value)}
              />
            </div>

            {/* Responsável */}
            <div className="space-y-2">
              <Label htmlFor="responsible">Responsável pela Aplicação</Label>
              <Input
                id="responsible"
                type="text"
                placeholder="Nome do veterinário/aplicador"
                value={formData.responsible}
                onChange={(e) => handleInputChange('responsible', e.target.value)}
              />
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center space-x-1">
              <FileText className="w-4 h-4" />
              <span>Observações</span>
            </Label>
            <Textarea
              id="notes"
              placeholder="Observações adicionais sobre a vacinação..."
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
            />
          </div>

          {/* Alerta sobre próxima dose */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Próxima dose automática</p>
                <p>Se a vacina selecionada tiver intervalo definido, a próxima dose será calculada automaticamente e aparecerá nos alertas.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              Cadastrar Vacinação
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VaccinationForm;

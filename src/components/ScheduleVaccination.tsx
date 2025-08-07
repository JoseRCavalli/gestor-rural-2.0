import {useState} from 'react';
import {Calendar, Search, Syringe} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {useVaccinations} from '@/hooks/useVaccinations';
import {useAnimals} from '@/hooks/useAnimals';
import {useEvents} from '@/hooks/useEvents';
import {toast} from 'sonner';
import {VaccinationScheduleFormType} from "@/lib/types/vaccination-schedule-form-type.ts";

const ScheduleVaccination = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        animal_id: '',
        vaccine_type_id: '',
        scheduled_date: '',
        batch_number: '',
        manufacturer: '',
        responsible: '',
        notes: ''
    });

    const [vaccinationScheduleFormType, setVaccinationScheduleFormType]
        = useState<VaccinationScheduleFormType>(VaccinationScheduleFormType.BATCH);

    const {vaccineTypes} = useVaccinations();
    const {animals} = useAnimals();
    const {createEvent} = useEvents();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.animal_id || !formData.vaccine_type_id || !formData.scheduled_date) {
            toast.error('Por favor, preencha todos os campos obrigatórios');
            return;
        }

        try {
            const animal = animals.find(a => a.id === formData.animal_id);
            const vaccineType = vaccineTypes.find(vt => vt.id === formData.vaccine_type_id);

            if (!animal || !vaccineType) {
                toast.error('Animal ou tipo de vacina não encontrado');
                return;
            }

            // Criar evento na agenda
            const eventData = {
                title: `Vacinar: ${vaccineType.name}`,
                description: `Aplicar vacina ${vaccineType.name} no animal ${animal.name || `Brinco ${animal.tag}`}${formData.notes ? `\n\nObservações: ${formData.notes}` : ''}${formData.batch_number ? `\nLote: ${formData.batch_number}` : ''}${formData.manufacturer ? `\nFabricante: ${formData.manufacturer}` : ''}${formData.responsible ? `\nResponsável: ${formData.responsible}` : ''}`,
                date: formData.scheduled_date,
                time: '08:00',
                type: 'vaccination',
                icon: '💉',
                completed: false
            };

            await createEvent(eventData);

            // Resetar formulário
            setFormData({
                animal_id: '',
                vaccine_type_id: '',
                scheduled_date: '',
                batch_number: '',
                manufacturer: '',
                responsible: '',
                notes: ''
            });

            setIsOpen(false);
            toast.success('Vacinação agendada com sucesso!');
        } catch (error) {
            console.error('Erro ao agendar vacinação:', error);
            toast.error('Erro ao agendar vacinação');
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({...prev, [field]: value}));
    };

    const handleChangeFormType = (value) => {
        setVaccinationScheduleFormType(value);
    }

    const handleSearchBatch = (value) => {
        console.log(value);
    }


    // Data mínima é hoje
    const today = new Date().toISOString().split('T')[0];

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4"/>
                    <span>Agendar Vacina</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl h-[80vh] overflow-y-scroll">
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                        <Syringe className="w-5 h-5"/>
                        <span>Agendar Vacinação</span>
                    </DialogTitle>
                    <DialogDescription>
                        Agende uma vacinação futura para ser lembrado na data adequada
                    </DialogDescription>
                </DialogHeader>


                <Label htmlFor="form_type">Tipo *</Label>
                <Select
                    value={vaccinationScheduleFormType ?? ''}
                    onValueChange={(value) => handleChangeFormType(value)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione o escopo de vacinação"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={VaccinationScheduleFormType.BATCH}>
                            Lote - Destinado à vacinação do grupo de animais que formam o lote
                        </SelectItem>
                        <SelectItem value={VaccinationScheduleFormType.ANIMAL}>
                            Individual - Destinado à vacinação de um animal específico
                        </SelectItem>
                    </SelectContent>
                </Select>

                {(vaccinationScheduleFormType == VaccinationScheduleFormType.ANIMAL &&
                    <form onSubmit={handleSubmit} className="space-y-4 h-full flex flex-col">
                        <div
                            className="overflow-y-auto pr-4 flex-1 scrollbar-thin scrollbar-thumb-muted-foreground/50 scrollbar-track-muted/20">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="animal">Animal *</Label>
                                    <Select value={formData.animal_id}
                                            onValueChange={(value) => handleInputChange('animal_id', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o animal"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {animals.map((animal) => (
                                                <SelectItem key={animal.id} value={animal.id}>
                                                    {animal.name ? `${animal.name} (${animal.tag})` : `Brinco ${animal.tag}`}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="vaccine">Tipo de Vacina*</Label>
                                    <Select value={formData.vaccine_type_id}
                                            onValueChange={(value) => handleInputChange('vaccine_type_id', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione a vacina"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {vaccineTypes.map((vaccine) => (
                                                <SelectItem key={vaccine.id} value={vaccine.id}>
                                                    {vaccine.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="scheduled_date">Data Agendada*</Label>
                                    <Input
                                        id="scheduled_date"
                                        type="date"
                                        min={today}
                                        value={formData.scheduled_date}
                                        onChange={(e) => handleInputChange('scheduled_date', e.target.value)}
                                        className="w-full"
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

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="notes">Observações</Label>
                                    <Textarea
                                        id="notes"
                                        value={formData.notes}
                                        onChange={(e) => handleInputChange('notes', e.target.value)}
                                        placeholder="Observações adicionais"
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <div className="mt-4">
                                <Alert>
                                    <Calendar className="h-4 w-4"/>
                                    <AlertDescription>
                                        O agendamento criará um lembrete na sua agenda rural. Você será notificado na
                                        data
                                        agendada.
                                    </AlertDescription>
                                </Alert>
                            </div>
                        </div>

                        <div className="flex space-x-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
                                Cancelar
                            </Button>
                            <Button type="submit" className="flex-1">
                                Agendar Vacinação
                            </Button>
                        </div>
                    </form>)}

                {(vaccinationScheduleFormType == VaccinationScheduleFormType.BATCH &&
                    <form onSubmit={handleSubmit} className="space-y-4 h-full flex flex-col">
                        <div
                            className="overflow-y-auto pr-4 flex-1 scrollbar-thin scrollbar-thumb-muted-foreground/50 scrollbar-track-muted/20">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                <div className="space-y-2">
                                    <Label htmlFor="batch_number">Lote</Label>
                                    <div
                                        className="flex items-center border border-input bg-background rounded-md pr-3 w-full focus-within:ring-2 focus-within:ring-ring">
                                        <Input
                                            id="batch_number"
                                            value={formData.batch_number}
                                            onChange={(e) =>
                                                handleInputChange('batch_number', e.target.value)
                                            }
                                            placeholder="Número do lote"
                                            className="border-none focus-visible:ring-0 focus-visible:ring-offset-0 flex-1"
                                        />
                                        <button onClick={() => handleSearchBatch(formData.batch_number)} type="button">
                                            <Search className="h-4 w-4 text-muted-foreground"/>
                                        </button>
                                    </div>
                                </div>


                                <div className="space-y-2">
                                    <Label htmlFor="vaccine">Tipo de Vacina*</Label>
                                    <Select value={formData.vaccine_type_id}
                                            onValueChange={(value) => handleInputChange('vaccine_type_id', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione a vacina"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {vaccineTypes.map((vaccine) => (
                                                <SelectItem key={vaccine.id} value={vaccine.id}>
                                                    {vaccine.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="scheduled_date">Data Agendada*</Label>
                                    <Input
                                        id="scheduled_date"
                                        type="date"
                                        min={today}
                                        value={formData.scheduled_date}
                                        onChange={(e) => handleInputChange('scheduled_date', e.target.value)}
                                        className="w-full"
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

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="notes">Observações</Label>
                                    <Textarea
                                        id="notes"
                                        value={formData.notes}
                                        onChange={(e) => handleInputChange('notes', e.target.value)}
                                        placeholder="Observações adicionais"
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <div className="mt-4">
                                <Alert>
                                    <Calendar className="h-4 w-4"/>
                                    <AlertDescription>
                                        O agendamento criará um lembrete na sua agenda rural. Você será notificado na
                                        data
                                        agendada.
                                    </AlertDescription>
                                </Alert>
                            </div>
                        </div>

                        <div className="flex space-x-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
                                Cancelar
                            </Button>
                            <Button type="submit" className="flex-1">
                                Agendar Vacinação
                            </Button>
                        </div>
                    </form>)}
            </DialogContent>
        </Dialog>
    );
};

export default ScheduleVaccination;
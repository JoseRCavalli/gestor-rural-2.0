import {useState} from 'react';
import {Calendar, Search, Syringe} from 'lucide-react';
import {Checkbox} from '@/components/ui/checkbox';
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
import {parseFormScope, VaccinationScheduleFormScope} from "@/lib/types/vaccination-schedule-form-scope.ts";
import {VaccinationEvent} from "@/lib/types/vaccination-event.ts";
import {VaccineType} from "@/types/database.ts";

const ScheduleVaccination = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scheduleSecondDose, setScheduleSecondDose] = useState(false);
    const [manualSecondDoseDate, setManualSecondDoseDate] = useState('');
    const [scope, setScope] = useState<VaccinationScheduleFormScope>(VaccinationScheduleFormScope.ANIMAL);
    const [formData, setFormData] = useState({
        animal_id: '',
        vaccine_type_id: '',
        scheduled_date: '',
        batch_number: '',
        manufacturer: '',
        responsible: '',
        notes: ''
    });

    const {vaccineTypes} = useVaccinations();
    const {animals, fetchAnimalsByBatch} = useAnimals();
    const {createEvent} = useEvents();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!scope) {
            toast.error('Por favor, insira o escopo da aplicação!');
        }

        if (!formData.animal_id && !formData.batch_number || !formData.vaccine_type_id || !formData.scheduled_date) {
            toast.error('Por favor, preencha todos os campos obrigatórios');
            return;
        }

        try {
            if (scope === VaccinationScheduleFormScope.BATCH) {
                await submitScheduleVaccinationByBatch();
                const vaccineType = vaccineTypes.find(vt => vt.id === formData.vaccine_type_id);
                const eventData = await createEventInScheduleByBatch(vaccineType, formData.batch_number);
            }

            const animal = animals.find(a => a.id === formData.animal_id);


            // Agendar segunda dose se solicitado
            if (scheduleSecondDose) {
                const selectedVaccineType = vaccineTypes.find(vt => vt.id === formData.vaccine_type_id);

                if (selectedVaccineType) {
                    let secondDoseDate = manualSecondDoseDate;

                    // Se não foi definida data manual, calcular automaticamente
                    if (!secondDoseDate && selectedVaccineType.interval_months) {
                        const scheduledDate = new Date(formData.scheduled_date);
                        const nextDate = new Date(scheduledDate);
                        nextDate.setMonth(nextDate.getMonth() + selectedVaccineType.interval_months);
                        secondDoseDate = nextDate.toISOString().split('T')[0];
                    }

                    if (secondDoseDate) {
                        const secondDoseEventData: VaccinationEvent = {
                            title: `Segunda Dose: ${selectedVaccineType.name}`,
                            description: `Aplicar segunda dose da vacina ${selectedVaccineType.name} no animal ${animal.name || `Brinco ${animal.tag}`}`,
                            date: new Date(secondDoseDate),
                            type: 'vaccination',
                            icon: '💉',
                            completed: false
                        };

                        await createEvent(secondDoseEventData);
                        toast.success('Segunda dose agendada automaticamente!');
                    }
                }
            }

            resetFormData()
            setScheduleSecondDose(false);
            setManualSecondDoseDate('');

            setIsOpen(false);
            toast.success('Vacinação agendada com sucesso!');
        } catch (error) {
            console.error('Erro ao agendar vacinação:', error);
            toast.error('Erro ao agendar vacinação');
        }
    };

    const submitScheduleVaccinationByBatch = async () => {
        const animals = await fetchAnimalsByBatch(formData.batch_number);

    }

    const createEventInScheduleByBatch = async (vaccineType: VaccineType, batch: string) => {
        const eventData: VaccinationEvent = {
            title: `Vacinar: ${vaccineType.name}`,
            description: `Aplicar vacina ${vaccineType.name} no lote ${batch} 
                          ${formData.notes ? `\n\nObservações: ${formData.notes}` : ''} 
                          ${formData.manufacturer ? `\nFabricante: ${formData.manufacturer}` : ''}
                          ${formData.responsible ? `\nResponsável: ${formData.responsible}` : ''}`,
            date: new Date(formData.scheduled_date).toISOString(),
            type: 'vaccination',
            icon: '💉',
            completed: false
        };

        const createdEvent = await createEvent(eventData);
        console.log(createdEvent);
    }

    const resetFormData = () => {
        setFormData({
            animal_id: '',
            vaccine_type_id: '',
            scheduled_date: '',
            batch_number: '',
            manufacturer: '',
            responsible: '',
            notes: ''
        });
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({...prev, [field]: value}));
    };

    // Data mínima é hoje
    const today = new Date().toISOString().split('T')[0];

    const selectedVaccineType = vaccineTypes.find(vt => vt.id === formData.vaccine_type_id);
    const hasInterval = selectedVaccineType?.interval_months;

    // Calcular data automática da segunda dose
    const getAutomaticSecondDoseDate = () => {
        if (!hasInterval || !formData.scheduled_date) return '';
        const scheduledDate = new Date(formData.scheduled_date);
        const nextDate = new Date(scheduledDate);
        nextDate.setMonth(nextDate.getMonth() + hasInterval);
        return nextDate.toISOString().split('T')[0];
    };

    const handleChangeFormScope = (value: string) => {
        try {
            resetFormData();
            setScope(parseFormScope(value));
        } catch (e) {
            toast.error('Ocorreu um problema!');
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4"/>
                    <span>Agendar Vacina</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                        <Syringe className="w-5 h-5"/>
                        <span>Agendar Vacinação</span>
                    </DialogTitle>
                    <DialogDescription>
                        Agende uma vacinação futura para ser lembrado na data adequada
                    </DialogDescription>
                </DialogHeader>

                {/* Tipo */}
                <div className="space-y-2">
                    <Label htmlFor="scope">Escopo de Aplicação</Label>
                    <Select value={scope} onValueChange={(value) => handleChangeFormScope(value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione o escopo"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={VaccinationScheduleFormScope.BATCH}>Lote - Destinada à um grupo de
                                animais que formam um determinado lote</SelectItem>
                            <SelectItem value={VaccinationScheduleFormScope.ANIMAL}>Individual - Destinada à um animal
                                específico presente na fazenda</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {scope == VaccinationScheduleFormScope.ANIMAL && (
                            <div className="space-y-2">
                                <Label htmlFor="animal" className="flex items-center space-x-1">
                                    <span>Animal *</span>
                                </Label>
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
                        )}

                        {scope == VaccinationScheduleFormScope.BATCH && (
                            <div className="space-y-2 relative">
                                <Label htmlFor="batch_number" className="flex items-center space-x-1">
                                    <span>Lote *</span>
                                </Label>
                                <Input
                                    id="batch_number"
                                    value={formData.batch_number}
                                    onChange={(e) => handleInputChange('batch_number', e.target.value)}
                                    placeholder="Número do lote"
                                    className="pr-10" // espaço à direita para o ícone
                                />
                                <Search
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black w-5 h-5 hover:cursor-pointer transition-colors duration-300 ease-in-out"
                                    onClick={() => console.log('teste')}
                                />
                            </div>
                        )}

                        {/* Tipo de Vacina */}
                        <div className="space-y-2">
                            <Label htmlFor="vaccine" className="flex items-center space-x-1">
                                <Syringe className="w-4 h-4"/>
                                <span>Tipo de Vacina *</span>
                            </Label>
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

                        {/* Data Agendada */}
                        <div className="space-y-2">
                            <Label htmlFor="scheduled_date" className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4"/>
                                <span>Data Agendada *</span>
                            </Label>
                            <Input
                                id="scheduled_date"
                                type="date"
                                min={today}
                                value={formData.scheduled_date}
                                onChange={(e) => handleInputChange('scheduled_date', e.target.value)}
                                className="w-full"
                            />
                        </div>

                        {/* Fabricante */}
                        <div className="space-y-2">
                            <Label htmlFor="manufacturer">Fabricante</Label>
                            <Input
                                id="manufacturer"
                                value={formData.manufacturer}
                                onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                                placeholder="Nome do fabricante"
                            />
                        </div>

                        {/* Responsável */}
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

                    {/* Observações */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Observações</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => handleInputChange('notes', e.target.value)}
                            placeholder="Observações adicionais"
                            rows={3}
                        />
                    </div>

                    {/* Agendamento da Segunda Dose */}
                    {hasInterval && (
                        <div className="space-y-4 border-t pt-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="schedule-second-dose"
                                    checked={scheduleSecondDose}
                                    onCheckedChange={(checked) => setScheduleSecondDose(checked === true)}
                                />
                                <Label htmlFor="schedule-second-dose" className="text-sm font-medium">
                                    Agendar segunda dose automaticamente
                                </Label>
                            </div>

                            {scheduleSecondDose && (
                                <div className="ml-6 space-y-3">
                                    <div className="text-sm text-muted-foreground">
                                        Data
                                        automática: {getAutomaticSecondDoseDate() && new Date(getAutomaticSecondDoseDate()).toLocaleDateString('pt-BR')}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="manual-second-dose">Ou escolha uma data personalizada:</Label>
                                        <Input
                                            id="manual-second-dose"
                                            type="date"
                                            min={formData.scheduled_date}
                                            value={manualSecondDoseDate}
                                            onChange={(e) => setManualSecondDoseDate(e.target.value)}
                                            placeholder="Data personalizada para segunda dose"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <Alert>
                        <Calendar className="h-4 w-4"/>
                        <AlertDescription>
                            O agendamento criará um lembrete na sua agenda rural. Você será notificado na data agendada.
                        </AlertDescription>
                    </Alert>

                    <div className="flex justify-end space-x-3">
                        <Button type="button"
                                variant="outline"
                                onClick={() => {
                                    resetFormData();
                                    setIsOpen(false)
                                }}>
                            Cancelar
                        </Button>
                        <Button type="submit">
                            Agendar Vacinação
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ScheduleVaccination;
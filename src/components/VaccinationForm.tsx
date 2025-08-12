import {useState} from 'react';
import {AlertTriangle, Calendar, Check, Edit3, FileText, Search, Syringe, User} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Textarea} from '@/components/ui/textarea';
import {Checkbox} from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import {useVaccinations} from '@/hooks/useVaccinations';
import {useAnimals} from '@/hooks/useAnimals';
import {useEvents} from '@/hooks/useEvents';
import {toast} from 'sonner';
import {Vaccination} from '@/types/database';
import {parseFormScope, VaccinationScheduleFormScope} from "@/lib/types/vaccination-schedule-form-scope.ts";

interface VaccinationFormProps {
    vaccination?: Vaccination;
    isEdit?: boolean;
}

const VaccinationForm = ({vaccination, isEdit = false}: VaccinationFormProps) => {
    const {addVaccination, updateVaccination, vaccineTypes, addVaccinationsToBatchAnimals} = useVaccinations();
    const {animals, fetchAnimalsByBatch} = useAnimals();
    const {createEvent} = useEvents();

    const [scope, setScope] = useState<VaccinationScheduleFormScope>(VaccinationScheduleFormScope.BATCH);
    const [isOpen, setIsOpen] = useState(false);
    const [scheduleSecondDose, setScheduleSecondDose] = useState(false);
    const [manualSecondDoseDate, setManualSecondDoseDate] = useState('');
    const [validBatch, setValidBatch] = useState<boolean>(false);
    const [formData, setFormData] = useState({
        animal_id: vaccination?.animal_id || '',
        vaccine_type_id: vaccination?.vaccine_type_id || '',
        application_date: vaccination?.application_date || '',
        manufacturer: vaccination?.manufacturer || '',
        responsible: vaccination?.responsible || '',
        notes: vaccination?.notes || '',
        batch: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.animal_id && !formData.batch || !formData.vaccine_type_id || !formData.application_date) {
            toast.error('Preencha os campos obrigatórios');
            return;
        }

        try {
            if (scope === VaccinationScheduleFormScope.BATCH) {
                const animalsBatch = await fetchAnimalsByBatch(formData.batch);

                if (animalsBatch.length <= 0 || !animalsBatch) {
                    toast.error('O lote não foi encontrado ou não existem animais registrados nesse lote!');
                    return;
                }

                const vaccinatedAnimal = await addVaccinationsToBatchAnimals(formData, animalsBatch);

                if (vaccinatedAnimal.length <= 0 || !vaccinatedAnimal) {
                    toast.error('Ocorreu um erro ao vacinar o lote!');
                    return;
                }

                toast.success(`Vacinação inserida ao lote: '${formData.batch}'`);
                return;
            }

            if (scope === VaccinationScheduleFormScope.ANIMAL) {

                if (!formData.animal_id) {
                    toast.error('O campo \'Animal\' não pode estar vazio!');
                    return;
                }

                const vaccination = {
                    animal_id: formData.animal_id,
                    application_date: formData.application_date,
                    manufacturer: formData.manufacturer,
                    responsible: formData.responsible,
                    notes: formData.notes,
                    vaccine_type_id: formData.vaccine_type_id,
                }
                
                const savedVaccination = await addVaccination(vaccination);

                if (!savedVaccination) {
                    toast.error('Não foi possível inserir a vacina nesse animal!');
                    return
                }

                toast.success('Vacina salva com sucesso!');
                return;
            }
        } catch (error) {
            console.error('Error saving vaccination:', error);
            toast.error(isEdit ? 'Erro ao atualizar vacinação' : 'Erro ao cadastrar vacinação');
        } finally {
            setIsOpen(false);
            resetFormData();
            setScheduleSecondDose(false);
            setManualSecondDoseDate('');
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({...prev, [field]: value}));
        if (field === 'batch') setValidBatch(false);
    };

    const resetFormData = () => {
        setFormData({
            animal_id: '',
            vaccine_type_id: '',
            application_date: '',
            manufacturer: '',
            responsible: '',
            notes: '',
            batch: '',
        });
        setScope(VaccinationScheduleFormScope.BATCH);
        invalidateBatch();
    }

    const selectedVaccineType = vaccineTypes.find(vt => vt.id === formData.vaccine_type_id);
    const hasInterval = selectedVaccineType?.interval_months;

    // Calcular data automática da segunda dose
    const getAutomaticSecondDoseDate = () => {
        if (!hasInterval || !formData.application_date) return '';
        const applicationDate = new Date(formData.application_date);
        const nextDate = new Date(applicationDate);
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

    const searchExistBatch = () => {
        const value = formData.batch;
        if (!value) {
            toast.error('O Lote não pode estar vazio!');
            return;
        }

        const animalsByBatch = animals.filter(a => a.batch === value);

        if (animalsByBatch.length <= 0) {
            toast.error('Desculpe, esse lote não existe ou não há animais cadastrados!');
            return;
        }

        setValidBatch(true);
        toast.success(`O Lote '${value}' foi encontrado com sucesso, prossiga com a inserção!`);
    }

    const invalidateBatch = () => {
        if (validBatch) setValidBatch(false);
    }

    const handleOpenDialog = (open: boolean) => {
        setIsOpen(open);
        if (!open) resetFormData();
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenDialog}>
            <DialogTrigger asChild>
                <Button
                    className={`flex items-center space-x-2 ${isEdit ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}>
                    {isEdit ? <Edit3 className="w-4 h-4"/> : <Syringe className="w-4 h-4"/>}
                    <span>{isEdit ? 'Editar' : 'Cadastrar Vacinação'}</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                        {isEdit ? <Edit3 className="w-5 h-5 text-blue-600"/> :
                            <Syringe className="w-5 h-5 text-green-600"/>}
                        <span>{isEdit ? 'Editar Vacinação' : 'Cadastrar Nova Vacinação'}</span>
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit ? 'Atualize os dados da vacinação' : 'Registre uma nova vacinação aplicada no rebanho'}
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
                        {scope === VaccinationScheduleFormScope.ANIMAL && (<div className="space-y-2">
                            <Label htmlFor="animal" className="flex items-center space-x-1">
                                <User className="w-4 h-4"/>
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
                                            {animal.name || `Brinco ${animal.tag}`} - {animal.phase}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>)}

                        {scope == VaccinationScheduleFormScope.BATCH && (
                            <div className="space-y-2 relative">
                                <Label htmlFor="batch" className="flex items-center space-x-1">
                                    <span>Lote *</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="batch"
                                        value={formData.batch}
                                        onChange={(e) => {
                                            handleInputChange('batch', e.target.value);
                                            invalidateBatch();
                                        }}
                                        placeholder="Número do lote"
                                        className="pr-10"
                                    />

                                    <div className="absolute inset-y-0 right-3 flex items-center">
                                        {!validBatch && (
                                            <Search
                                                className="text-gray-400 hover:text-black w-5 h-5 hover:cursor-pointer transition-colors duration-300 ease-in-out"
                                                onClick={() => searchExistBatch()}
                                            />
                                        )}
                                        {validBatch && (
                                            <Check
                                                className="text-green-500 w-5 h-5"
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tipo de Vacina */}
                        <div className="space-y-2">
                            <Label htmlFor="vaccine_type" className="flex items-center space-x-1">
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
                                            {vaccine.description && ` - ${vaccine.description}`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Data de Aplicação */}
                        <div className="space-y-2">
                            <Label htmlFor="application_date" className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4"/>
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
                            <FileText className="w-4 h-4"/>
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

                    {/* Agendamento da Segunda Dose */}
                    {!isEdit && hasInterval && (
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
                                            min={formData.application_date}
                                            value={manualSecondDoseDate}
                                            onChange={(e) => setManualSecondDoseDate(e.target.value)}
                                            placeholder="Data personalizada para segunda dose"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Alerta sobre próxima dose */}
                    {!scheduleSecondDose && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-start space-x-2">
                                <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5"/>
                                <div className="text-sm text-blue-800">
                                    <p className="font-medium">Próxima dose automática</p>
                                    <p>Se a vacina selecionada tiver intervalo definido, a próxima dose será calculada
                                        automaticamente e aparecerá nos alertas.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end space-x-3">
                        <Button type="button" variant="outline" onClick={() => {
                            resetFormData();
                            setIsOpen(false);
                        }}>
                            Cancelar
                        </Button>
                        <Button type="submit"
                                className={isEdit ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}>
                            {isEdit ? 'Atualizar Vacinação' : 'Cadastrar Vacinação'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default VaccinationForm;

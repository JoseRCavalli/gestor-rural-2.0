import {useState, useEffect} from 'react';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Textarea} from '@/components/ui/textarea';
import {useHerd, HerdAnimal} from '@/hooks/useHerd';
import {toast} from 'sonner';
import {AnimalPhase} from "@/lib/types/animal-phase.ts";
import {ReproductiveStatus} from "@/lib/types/animal-reproductive-status.ts";

interface HerdFormProps {
    animal?: HerdAnimal | null;
    onClose: () => void;
}

const HerdForm = ({animal, onClose}: HerdFormProps) => {
    const {addAnimal, updateAnimal} = useHerd();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        tag: '',
        name: '',
        phase: '',
        birth_date: '',
        reproductive_status: '',
        observations: '',
        last_calving_date: '',
        days_in_lactation: '',
        milk_control: '',
        expected_calving_interval: '',
        del_average: '',
        batch: ''
    });

    useEffect(() => {
        if (animal) {
            setFormData({
                tag: animal.tag || '',
                name: animal.name || '',
                phase: animal.phase || '',
                birth_date: animal.birth_date || '',
                reproductive_status: animal.reproductive_status || '',
                observations: animal.observations || '',
                last_calving_date: animal.last_calving_date || '',
                days_in_lactation: animal.days_in_lactation?.toString() || '',
                milk_control: animal.milk_control?.toString() || '',
                expected_calving_interval: animal.expected_calving_interval?.toString() || '',
                del_average: animal.del_average?.toString() || '',
                batch: animal.batch?.toString() || '',
            });
        }
    }, [animal]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const animalData = {
                tag: formData.tag.trim(),
                name: formData.name || null,
                phase: formData.phase.trim(),
                birth_date: formData.birth_date,
                reproductive_status: formData.reproductive_status,
                observations: formData.observations || undefined,
                last_calving_date: formData.last_calving_date || undefined,
                days_in_lactation: formData.days_in_lactation ? parseInt(formData.days_in_lactation) : undefined,
                milk_control: formData.milk_control ? parseFloat(formData.milk_control) : undefined,
                expected_calving_interval: formData.expected_calving_interval ? parseInt(formData.expected_calving_interval) : undefined,
                del_average: formData.del_average ? parseFloat(formData.del_average) : undefined,
                batch: formData.batch ? formData.batch : '',
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
                            <Label htmlFor="tag">Código/Tag do Animal *</Label>
                            <Input
                                id="tag"
                                value={formData.tag}
                                onChange={(e) => handleChange('tag', e.target.value)}
                                placeholder="Ex: 001, A001, etc."
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="name">Nome do Animal</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                placeholder="Nome ou identificação"
                            />
                        </div>

                        <div>
                            <Label htmlFor="phase">Categoria/Fase *</Label>
                            <Select
                                value={formData.phase}
                                onValueChange={(value) => handleChange('phase', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecionar categoria"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={AnimalPhase.BEZERRA}>Bezerra</SelectItem>
                                    <SelectItem value={AnimalPhase.NOVILHA}>Novilha</SelectItem>
                                    <SelectItem value={AnimalPhase.LACTACAO}>Vaca Lactante</SelectItem>
                                    <SelectItem value={AnimalPhase.VACA_SECA}>Vaca Seca</SelectItem>
                                    <SelectItem value={AnimalPhase.PRE_PARTO}>Pré Parto</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="phase">Status Reprodutivo *</Label>
                            <Select
                                value={formData.reproductive_status}
                                onValueChange={(value) => handleChange('reproductive_status', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecionar status"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ReproductiveStatus.ABERTA}>Aberta</SelectItem>
                                    <SelectItem value={ReproductiveStatus.DESCARTE}>Descarte</SelectItem>
                                    <SelectItem value={ReproductiveStatus.SECA}>Seca</SelectItem>
                                    <SelectItem value={ReproductiveStatus.VAZIA}>Vazia</SelectItem>
                                    <SelectItem value={ReproductiveStatus.GESTANTE}>Gestante</SelectItem>
                                    <SelectItem value={ReproductiveStatus.INSEMINADA}>Inseminada</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="birth_date">Data de Nascimento *</Label>
                            <Input
                                id="birth_date"
                                type="date"
                                value={formData.birth_date}
                                onChange={(e) => handleChange('birth_date', e.target.value)}
                                required
                            />
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

                        <div>
                            <Label htmlFor="batch">Lote</Label>
                            <Input
                                id="batch"
                                type="text"
                                value={formData.batch}
                                onChange={(e) => handleChange('batch', e.target.value)}
                                placeholder="Ex: Lote A"
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

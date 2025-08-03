import {useState} from 'react';
import {motion} from 'framer-motion';
import {Beef, Plus, Edit2, Search} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import {useHerd, HerdAnimal} from '@/hooks/useHerd';
import HerdForm from '@/components/HerdForm';
import HerdImporter from '@/components/HerdImporter';
import HerdStats from '@/components/HerdStats';
import {maskValueAnimalPhase} from "@/lib/types/animal-phase.ts";

const Rebanho = () => {
    const {herd, loading} = useHerd();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPhase, setSelectedPhase] = useState('todas');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
    const [editingAnimal, setEditingAnimal] = useState<HerdAnimal | null>(null);

    const filteredAnimals = herd.filter((animal: HerdAnimal) => {
        const searchRegex = new RegExp(searchTerm, 'i');
        const phaseMatch = selectedPhase === 'todas' || animal.phase === selectedPhase;
        return (searchRegex.test(animal.name || '') || searchRegex.test(animal.tag)) && phaseMatch;
    });

    const phases = ['todas', ...new Set(herd.map((animal: HerdAnimal) => animal.phase))];

    const handleOpenDialog = (animal?: HerdAnimal) => {
        setEditingAnimal(animal || null);
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingAnimal(null);
    };

    const handleCloseImportDialog = () => {
        setIsImportDialogOpen(false);
    };

    // Função para formatar data no formato brasileiro
    const formatDateBR = (dateString: string) => {
        if (!dateString) return 'Não informado';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">🐄 Controle de Rebanho</h2>
                <div className="flex items-center space-x-4">
                    <Button
                        variant="outline"
                        onClick={() => setIsImportDialogOpen(true)}
                        className="flex items-center space-x-2"
                    >
                        <span>Importar Rebanho</span>
                    </Button>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="flex items-center space-x-2">
                                <Plus className="w-4 h-4"/>
                                <span>Adicionar Animal</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingAnimal ? 'Editar Animal' : 'Adicionar Animal'}</DialogTitle>
                                <DialogDescription>
                                    Preencha os campos abaixo para {editingAnimal ? 'editar' : 'adicionar'} um animal ao
                                    rebanho.
                                </DialogDescription>
                            </DialogHeader>
                            <HerdForm animal={editingAnimal} onClose={handleCloseDialog}/>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Estatísticas do Rebanho */}
            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                className="mb-6"
            >
                <HerdStats/>
            </motion.div>

            {/* Importador de Rebanho */}
            {isImportDialogOpen && (
                <HerdImporter onClose={handleCloseImportDialog}/>
            )}

            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <Search className="w-5 h-5 text-gray-500"/>
                        <Input
                            type="text"
                            placeholder="Buscar animal..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-gray-50 border-none focus:ring-0 shadow-none"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Label htmlFor="phase-filter" className="text-sm text-gray-600">
                            Filtrar por Fase:
                        </Label>
                        <select
                            id="phase-filter"
                            value={selectedPhase}
                            onChange={(e) => setSelectedPhase(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        >
                            {phases.map((phase: string) => (
                                <option key={phase} value={phase}>
                                    {maskValueAnimalPhase(phase)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-4">Carregando rebanho...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredAnimals.length === 0 ? (
                            <div className="text-center py-4 text-gray-500">Nenhum animal encontrado.</div>
                        ) : (
                            filteredAnimals.map((animal: HerdAnimal) => (
                                <motion.div
                                    key={animal.id}
                                    className="bg-gray-50 rounded-lg p-4"
                                    whileHover={{scale: 1.02}}
                                    whileTap={{scale: 0.98}}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-800">{animal.name}</h3>
                                            <p className="text-sm text-gray-600">Código: {animal.tag}</p>
                                            <p className="text-sm text-gray-600">Fase: {maskValueAnimalPhase(animal.phase)}</p>
                                            <p className="text-sm text-gray-600">
                                                Nascimento: {formatDateBR(animal.birth_date)}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleOpenDialog(animal)}
                                            >
                                                <Edit2 className="w-4 h-4"/>
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default Rebanho;

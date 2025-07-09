
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Calendar, FileText, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAnimals, Animal } from '@/hooks/useAnimals';
import { useVaccinations, Vaccination, VaccineType } from '@/hooks/useVaccinations';

const AgendaVacinal = () => {
  const { animals, addAnimal } = useAnimals();
  const { vaccinations, vaccineTypes, addVaccination } = useVaccinations();
  const [activeTab, setActiveTab] = useState('animals');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPhase, setFilterPhase] = useState('all');
  const [showAddAnimal, setShowAddAnimal] = useState(false);
  const [showAddVaccination, setShowAddVaccination] = useState(false);

  // Animal form state
  const [animalForm, setAnimalForm] = useState({
    tag: '',
    name: '',
    birth_date: '',
    phase: 'bezerra' as Animal['phase']
  });

  // Vaccination form state
  const [vaccinationForm, setVaccinationForm] = useState({
    animal_id: '',
    vaccine_type_id: '',
    application_date: new Date().toISOString().split('T')[0],
    batch_number: '',
    manufacturer: '',
    responsible: '',
    notes: ''
  });

  const handleAddAnimal = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await addAnimal(animalForm);
    if (result) {
      setAnimalForm({ tag: '', name: '', birth_date: '', phase: 'bezerra' });
      setShowAddAnimal(false);
    }
  };

  const handleAddVaccination = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await addVaccination(vaccinationForm);
    if (result) {
      setVaccinationForm({
        animal_id: '',
        vaccine_type_id: '',
        application_date: new Date().toISOString().split('T')[0],
        batch_number: '',
        manufacturer: '',
        responsible: '',
        notes: ''
      });
      setShowAddVaccination(false);
    }
  };

  const filteredAnimals = animals.filter(animal => {
    const matchesSearch = animal.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (animal.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesPhase = filterPhase === 'all' || animal.phase === filterPhase;
    return matchesSearch && matchesPhase;
  });

  const getPhaseLabel = (phase: string) => {
    const labels = {
      bezerra: 'Bezerra',
      novilha: 'Novilha',
      vaca_lactante: 'Vaca Lactante',
      vaca_seca: 'Vaca Seca'
    };
    return labels[phase as keyof typeof labels] || phase;
  };

  const getPhaseColor = (phase: string) => {
    const colors = {
      bezerra: 'bg-blue-100 text-blue-800',
      novilha: 'bg-green-100 text-green-800',
      vaca_lactante: 'bg-purple-100 text-purple-800',
      vaca_seca: 'bg-yellow-100 text-yellow-800'
    };
    return colors[phase as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getAnimalAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - birth.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const months = Math.floor(diffDays / 30);
    return months;
  };

  // Get upcoming vaccinations (next 30 days)
  const upcomingVaccinations = vaccinations.filter(vacc => {
    if (!vacc.next_dose_date) return false;
    const nextDate = new Date(vacc.next_dose_date);
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);
    return nextDate >= now && nextDate <= thirtyDaysFromNow;
  });

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h2 className="text-3xl font-bold text-gray-800">🐄 Agenda Vacinal</h2>
          <p className="text-gray-600 mt-1">Controle sanitário completo do rebanho</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Total de animais: {animals.length}</p>
          <p className="text-xs text-gray-500">Próximas vacinações: {upcomingVaccinations.length}</p>
        </div>
      </motion.div>

      {/* Alerts for upcoming vaccinations */}
      {upcomingVaccinations.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
        >
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-yellow-800">Vacinações Pendentes</h3>
          </div>
          <p className="text-yellow-700 text-sm">
            Você tem {upcomingVaccinations.length} vacinação(ões) programada(s) para os próximos 30 dias.
          </p>
        </motion.div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full mb-6">
          <TabsTrigger value="animals" className="flex items-center space-x-2">
            <span>🐄</span>
            <span>Animais</span>
          </TabsTrigger>
          <TabsTrigger value="vaccinations" className="flex items-center space-x-2">
            <span>💉</span>
            <span>Vacinações</span>
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Agenda</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Relatórios</span>
          </TabsTrigger>
        </TabsList>

        {/* Animals Tab */}
        <TabsContent value="animals" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por brinco ou nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterPhase} onValueChange={setFilterPhase}>
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as fases</SelectItem>
                  <SelectItem value="bezerra">Bezerra</SelectItem>
                  <SelectItem value="novilha">Novilha</SelectItem>
                  <SelectItem value="vaca_lactante">Vaca Lactante</SelectItem>
                  <SelectItem value="vaca_seca">Vaca Seca</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Dialog open={showAddAnimal} onOpenChange={setShowAddAnimal}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Novo Animal</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cadastrar Novo Animal</DialogTitle>
                  <DialogDescription>
                    Adicione um novo animal ao sistema de controle vacinal
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddAnimal} className="space-y-4">
                  <div>
                    <Label htmlFor="tag">Número do Brinco *</Label>
                    <Input
                      id="tag"
                      value={animalForm.tag}
                      onChange={(e) => setAnimalForm(prev => ({ ...prev, tag: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Nome do Animal</Label>
                    <Input
                      id="name"
                      value={animalForm.name}
                      onChange={(e) => setAnimalForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="birth_date">Data de Nascimento *</Label>
                    <Input
                      id="birth_date"
                      type="date"
                      value={animalForm.birth_date}
                      onChange={(e) => setAnimalForm(prev => ({ ...prev, birth_date: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phase">Fase *</Label>
                    <Select value={animalForm.phase} onValueChange={(value) => setAnimalForm(prev => ({ ...prev, phase: value as Animal['phase'] }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bezerra">Bezerra</SelectItem>
                        <SelectItem value="novilha">Novilha</SelectItem>
                        <SelectItem value="vaca_lactante">Vaca Lactante</SelectItem>
                        <SelectItem value="vaca_seca">Vaca Seca</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowAddAnimal(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">Cadastrar</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAnimals.map((animal) => (
              <motion.div
                key={animal.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">Brinco: {animal.tag}</CardTitle>
                        {animal.name && (
                          <CardDescription className="font-medium">{animal.name}</CardDescription>
                        )}
                      </div>
                      <Badge className={getPhaseColor(animal.phase)}>
                        {getPhaseLabel(animal.phase)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p><strong>Nascimento:</strong> {new Date(animal.birth_date).toLocaleDateString('pt-BR')}</p>
                      <p><strong>Idade:</strong> {getAnimalAge(animal.birth_date)} meses</p>
                      <p><strong>Cadastro:</strong> {new Date(animal.created_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredAnimals.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🐄</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Nenhum animal encontrado</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterPhase !== 'all' 
                  ? 'Tente ajustar os filtros de busca' 
                  : 'Comece cadastrando seu primeiro animal'
                }
              </p>
              {!searchTerm && filterPhase === 'all' && (
                <Button onClick={() => setShowAddAnimal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Cadastar Primeiro Animal
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        {/* Vaccinations Tab */}
        <TabsContent value="vaccinations" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Registro de Vacinações</h3>
            <Dialog open={showAddVaccination} onOpenChange={setShowAddVaccination}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Nova Vacinação</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Registrar Vacinação</DialogTitle>
                  <DialogDescription>
                    Registre uma nova aplicação de vacina
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddVaccination} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="animal_id">Animal *</Label>
                      <Select value={vaccinationForm.animal_id} onValueChange={(value) => setVaccinationForm(prev => ({ ...prev, animal_id: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o animal" />
                        </SelectTrigger>
                        <SelectContent>
                          {animals.map(animal => (
                            <SelectItem key={animal.id} value={animal.id}>
                              Brinco {animal.tag} {animal.name ? `- ${animal.name}` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="vaccine_type_id">Tipo de Vacina *</Label>
                      <Select value={vaccinationForm.vaccine_type_id} onValueChange={(value) => setVaccinationForm(prev => ({ ...prev, vaccine_type_id: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a vacina" />
                        </SelectTrigger>
                        <SelectContent>
                          {vaccineTypes.map(vaccine => (
                            <SelectItem key={vaccine.id} value={vaccine.id}>
                              {vaccine.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="application_date">Data de Aplicação *</Label>
                      <Input
                        id="application_date"
                        type="date"
                        value={vaccinationForm.application_date}
                        onChange={(e) => setVaccinationForm(prev => ({ ...prev, application_date: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="responsible">Responsável</Label>
                      <Input
                        id="responsible"
                        value={vaccinationForm.responsible}
                        onChange={(e) => setVaccinationForm(prev => ({ ...prev, responsible: e.target.value }))}
                        placeholder="Veterinário/Técnico"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="batch_number">Número do Lote</Label>
                      <Input
                        id="batch_number"
                        value={vaccinationForm.batch_number}
                        onChange={(e) => setVaccinationForm(prev => ({ ...prev, batch_number: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="manufacturer">Fabricante</Label>
                      <Input
                        id="manufacturer"
                        value={vaccinationForm.manufacturer}
                        onChange={(e) => setVaccinationForm(prev => ({ ...prev, manufacturer: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea
                      id="notes"
                      value={vaccinationForm.notes}
                      onChange={(e) => setVaccinationForm(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowAddVaccination(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">Registrar</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {vaccinations.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💉</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Nenhuma vacinação registrada</h3>
                <p className="text-gray-600 mb-4">Comece registrando a primeira vacinação do rebanho</p>
                <Button onClick={() => setShowAddVaccination(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Registrar Primeira Vacinação
                </Button>
              </div>
            ) : (
              vaccinations.map((vaccination) => {
                const animal = animals.find(a => a.id === vaccination.animal_id);
                const vaccine = vaccineTypes.find(v => v.id === vaccination.vaccine_type_id);
                
                return (
                  <Card key={vaccination.id}>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="font-semibold text-gray-800">Animal</p>
                          <p className="text-sm text-gray-600">
                            Brinco {animal?.tag} {animal?.name ? `- ${animal.name}` : ''}
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">Vacina</p>
                          <p className="text-sm text-gray-600">{vaccine?.name}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">Data Aplicação</p>
                          <p className="text-sm text-gray-600">
                            {new Date(vaccination.application_date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">Próxima Dose</p>
                          <p className="text-sm text-gray-600">
                            {vaccination.next_dose_date 
                              ? new Date(vaccination.next_dose_date).toLocaleDateString('pt-BR')
                              : 'Dose única'
                            }
                          </p>
                        </div>
                      </div>
                      {vaccination.responsible && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm text-gray-600">
                            <strong>Responsável:</strong> {vaccination.responsible}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">Agenda de Vacinações</h3>
            {upcomingVaccinations.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Nenhuma vacinação agendada</h3>
                  <p className="text-gray-600">Todas as vacinações estão em dia!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {upcomingVaccinations.map((vaccination) => {
                  const animal = animals.find(a => a.id === vaccination.animal_id);
                  const vaccine = vaccineTypes.find(v => v.id === vaccination.vaccine_type_id);
                  const daysUntil = Math.ceil((new Date(vaccination.next_dose_date!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <Card key={vaccination.id} className="border-l-4 border-l-yellow-500">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-gray-800">
                              {vaccine?.name} - Brinco {animal?.tag}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              Agendado para: {new Date(vaccination.next_dose_date!).toLocaleDateString('pt-BR')}
                            </p>
                            {animal?.name && (
                              <p className="text-sm text-gray-500">{animal.name}</p>
                            )}
                          </div>
                          <Badge variant={daysUntil <= 7 ? "destructive" : "secondary"}>
                            {daysUntil === 0 ? 'Hoje' : `${daysUntil} dias`}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">Relatórios</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Resumo do Rebanho</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p><strong>Total de animais:</strong> {animals.length}</p>
                    <p><strong>Bezerras:</strong> {animals.filter(a => a.phase === 'bezerra').length}</p>
                    <p><strong>Novilhas:</strong> {animals.filter(a => a.phase === 'novilha').length}</p>
                    <p><strong>Vacas lactantes:</strong> {animals.filter(a => a.phase === 'vaca_lactante').length}</p>
                    <p><strong>Vacas secas:</strong> {animals.filter(a => a.phase === 'vaca_seca').length}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Situação Vacinal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p><strong>Total de vacinações:</strong> {vaccinations.length}</p>
                    <p><strong>Pendentes (30 dias):</strong> {upcomingVaccinations.length}</p>
                    <p><strong>Último registro:</strong> {
                      vaccinations.length > 0 
                        ? new Date(vaccinations[0].application_date).toLocaleDateString('pt-BR')
                        : 'Nenhum registro'
                    }</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Vacinas Mais Aplicadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {vaccineTypes.slice(0, 5).map(vaccine => {
                      const count = vaccinations.filter(v => v.vaccine_type_id === vaccine.id).length;
                      return (
                        <div key={vaccine.id} className="flex justify-between">
                          <span className="text-sm">{vaccine.name}:</span>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgendaVacinal;

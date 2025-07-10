
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Upload, 
  Search, 
  Filter, 
  Edit, 
  Trash2,
  Beef,
  Calendar,
  Heart,
  Activity
} from 'lucide-react';
import { useHerd } from '@/hooks/useHerd';
import HerdForm from '@/components/HerdForm';
import HerdImporter from '@/components/HerdImporter';
import HerdStats from '@/components/HerdStats';

const Rebanho = () => {
  const [activeTab, setActiveTab] = useState('listagem');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [showForm, setShowForm] = useState(false);
  const [showImporter, setShowImporter] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState(null);

  const { herd, loading } = useHerd();

  // Filtrar animais
  const filteredHerd = herd.filter(animal => {
    const matchesSearch = (animal.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         animal.tag.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'todos' || (animal.reproductive_status || animal.phase) === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    const statusColors = {
      'aberta': 'bg-red-100 text-red-800',
      'ciclando': 'bg-yellow-100 text-yellow-800', 
      'gestante': 'bg-green-100 text-green-800',
      'dg+': 'bg-green-100 text-green-800',
      'dg-': 'bg-red-100 text-red-800',
      'seca': 'bg-gray-100 text-gray-800',
      'bezerra': 'bg-blue-100 text-blue-800',
      'novilha': 'bg-purple-100 text-purple-800',
      'vaca lactante': 'bg-green-100 text-green-800',
      'vaca seca': 'bg-gray-100 text-gray-800'
    };
    return statusColors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const handleEdit = (animal: any) => {
    setEditingAnimal(animal);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingAnimal(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-2 text-gray-600">Carregando rebanho...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
            <Beef className="w-6 h-6 text-green-600" />
            <span>Gestão do Rebanho</span>
          </h2>
          <p className="text-gray-600 mt-1">Controle completo do seu rebanho bovino</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={() => setShowImporter(true)}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Importar</span>
          </Button>
          <Button 
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Animal</span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="listagem">Listagem</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="reproducao">Reprodução</TabsTrigger>
        </TabsList>

        <TabsContent value="listagem" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="search">Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Nome ou código do animal..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="status">Status/Fase</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="bezerra">Bezerra</SelectItem>
                      <SelectItem value="novilha">Novilha</SelectItem>
                      <SelectItem value="vaca lactante">Vaca Lactante</SelectItem>
                      <SelectItem value="vaca seca">Vaca Seca</SelectItem>
                      <SelectItem value="aberta">Aberta</SelectItem>
                      <SelectItem value="ciclando">Ciclando</SelectItem>
                      <SelectItem value="gestante">Gestante</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('');
                      setFilterStatus('todos');
                    }}
                    className="w-full"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Limpar Filtros
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Animais */}
          <Card>
            <CardHeader>
              <CardTitle>Animais Cadastrados ({filteredHerd.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredHerd.length === 0 ? (
                <div className="text-center py-8">
                  <Beef className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum animal encontrado</p>
                  <p className="text-sm text-gray-400">Cadastre ou importe animais para começar</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredHerd.map((animal) => (
                    <div 
                      key={animal.id} 
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                            <Beef className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{animal.name || 'Sem nome'}</h3>
                            <p className="text-sm text-gray-500">Código: {animal.tag}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <Badge className={getStatusColor(animal.reproductive_status || animal.phase)}>
                          {animal.reproductive_status || animal.phase}
                        </Badge>
                        
                        {animal.days_in_lactation && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">{animal.days_in_lactation}</span> DEL
                          </div>
                        )}
                        
                        {animal.milk_control && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">{animal.milk_control}</span> PPS
                          </div>
                        )}
                        
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(animal)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dashboard">
          <HerdStats />
        </TabsContent>

        <TabsContent value="reproducao">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-pink-600" />
                <span>Controle Reprodutivo</span>
              </CardTitle>
              <CardDescription>
                Acompanhe o ciclo reprodutivo do rebanho
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Estatísticas reprodutivas serão implementadas aqui */}
                <div className="text-center p-4 bg-pink-50 rounded-lg">
                  <Activity className="w-8 h-8 text-pink-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">Em breve</h3>
                  <p className="text-sm text-gray-600">Controle reprodutivo detalhado</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {showForm && (
        <HerdForm
          animal={editingAnimal}
          onClose={handleCloseForm}
        />
      )}

      {showImporter && (
        <HerdImporter
          onClose={() => setShowImporter(false)}
        />
      )}
    </div>
  );
};

export default Rebanho;

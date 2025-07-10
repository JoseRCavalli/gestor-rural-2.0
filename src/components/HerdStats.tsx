
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Beef, 
  Heart, 
  Calendar, 
  TrendingUp, 
  Activity,
  Milk,
  Baby,
  Timer
} from 'lucide-react';
import { useHerd } from '@/hooks/useHerd';

const HerdStats = () => {
  const { herd } = useHerd();

  // Estatísticas básicas
  const totalAnimals = herd.length;
  
  // Estatísticas por fase/status
  const phaseStats = herd.reduce((acc, animal) => {
    const status = (animal.reproductive_status || animal.phase).toLowerCase();
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Estatísticas de lactação (simulado)
  const lactatingAnimals = herd.filter(animal => 
    (animal.reproductive_status || animal.phase).toLowerCase().includes('lactante') || 
    animal.days_in_lactation && animal.days_in_lactation > 0
  );
  
  const averageDEL = lactatingAnimals.length > 0 
    ? Math.round(lactatingAnimals.reduce((sum, animal) => sum + (animal.days_in_lactation || 150), 0) / lactatingAnimals.length)
    : 0;

  // Controle leiteiro (simulado)
  const milkControlAnimals = herd.filter(animal => animal.milk_control && animal.milk_control > 0);
  const averageMilkProduction = milkControlAnimals.length > 0
    ? (milkControlAnimals.reduce((sum, animal) => sum + (animal.milk_control || 0), 0) / milkControlAnimals.length).toFixed(1)
    : '0';

  // Animais com parto recente (simulado - últimos 60 dias)
  const recentCalvings = herd.filter(animal => {
    if (!animal.last_calving_date) return false;
    const calvingDate = new Date(animal.last_calving_date);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    return calvingDate >= sixtyDaysAgo;
  }).length;

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
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'aberta': 'Aberta',
      'ciclando': 'Ciclando',
      'gestante': 'Gestante',
      'dg+': 'DG+',
      'dg-': 'DG-',
      'seca': 'Seca',
      'bezerra': 'Bezerra',
      'novilha': 'Novilha',
      'vaca lactante': 'Vaca Lactante',
      'vaca seca': 'Vaca Seca'
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Animais</CardTitle>
            <Beef className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAnimals}</div>
            <p className="text-xs text-muted-foreground">
              Animais cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Lactação</CardTitle>
            <Milk className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lactatingAnimals.length}</div>
            <p className="text-xs text-muted-foreground">
              DEL médio: {averageDEL} dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produção Média</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageMilkProduction}</div>
            <p className="text-xs text-muted-foreground">
              Litros/dia (PPS)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partos Recentes</CardTitle>
            <Baby className="h-4 w-4 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentCalvings}</div>
            <p className="text-xs text-muted-foreground">
              Últimos 60 dias
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status/Fase dos Animais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-pink-600" />
            <span>Categorias do Rebanho</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(phaseStats).map(([status, count]) => (
              <div key={status} className="text-center p-4 rounded-lg border">
                <Badge className={`mb-2 ${getStatusColor(status)}`}>
                  {getStatusLabel(status)}
                </Badge>
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <div className="text-xs text-gray-500">
                  {totalAnimals > 0 ? ((count / totalAnimals) * 100).toFixed(1) : 0}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Controle Produtivo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <span>Controle Leiteiro</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Animais em controle:</span>
                <span className="font-semibold">{milkControlAnimals.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Produção média:</span>
                <span className="font-semibold">{averageMilkProduction} L/dia</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Maior produção:</span>
                <span className="font-semibold">
                  {milkControlAnimals.length > 0 
                    ? Math.max(...milkControlAnimals.map(a => a.milk_control || 0)).toFixed(1)
                    : 0
                  } L/dia
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Timer className="w-5 h-5 text-orange-600" />
              <span>Controle Reprodutivo</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Gestantes:</span>
                <span className="font-semibold text-green-600">
                  {(phaseStats['gestante'] || 0) + (phaseStats['dg+'] || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Abertas:</span>
                <span className="font-semibold text-red-600">
                  {(phaseStats['aberta'] || 0) + (phaseStats['dg-'] || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Em observação:</span>
                <span className="font-semibold text-yellow-600">
                  {phaseStats['ciclando'] || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Animais por Categoria */}
      {totalAnimals === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Beef className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Rebanho Vazio</h3>
            <p className="text-gray-600 mb-4">
              Você ainda não cadastrou nenhum animal no sistema.
            </p>
            <p className="text-sm text-gray-500">
              Use o botão "Novo Animal" ou "Importar" para começar.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HerdStats;

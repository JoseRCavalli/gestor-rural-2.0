
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Calendar, 
  Package, 
  TrendingUp, 
  BarChart3, 
  Settings,
  Bell,
  FileText,
  LogOut
} from 'lucide-react';
import Dashboard from '@/components/Dashboard';
import Agenda from '@/components/Agenda';
import Estoque from '@/components/Estoque';
import Commodities from '@/components/Commodities';
import Relatorios from '@/components/Relatorios';
import Configuracoes from '@/components/Configuracoes';
import NotificationCenter from '@/components/NotificationCenter';
import ReportsManager from '@/components/ReportsManager';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { unreadCount } = useNotifications();
  const { profile } = useAuth();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        toast.error('Erro ao sair');
      } else {
        toast.success('Logout realizado com sucesso!');
      }
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Erro ao sair');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto p-6">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">🐄 Granja Cavalli</h1>
              <p className="text-gray-600 mt-2">Sistema de Gestão Rural Inteligente</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Bem-vindo, {profile?.name || 'Usuário'}</p>
                <p className="text-xs text-gray-500">Sistema seguro e privado</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </Button>
            </div>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-8 w-full mb-8 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <Home className="w-4 h-4" />
              <span className="hidden md:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="agenda" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden md:inline">Agenda</span>
            </TabsTrigger>
            <TabsTrigger value="estoque" className="flex items-center space-x-2">
              <Package className="w-4 h-4" />
              <span className="hidden md:inline">Estoque</span>
            </TabsTrigger>
            <TabsTrigger value="commodities" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden md:inline">Commodities</span>
            </TabsTrigger>
            <TabsTrigger value="relatorios" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden md:inline">Relatórios</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2 relative">
              <Bell className="w-4 h-4" />
              <span className="hidden md:inline">Notificações</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="reportmanager" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span className="hidden md:inline">Relatórios+</span>
            </TabsTrigger>
            <TabsTrigger value="configuracoes" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span className="hidden md:inline">Config</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>

          <TabsContent value="agenda">
            <Agenda />
          </TabsContent>

          <TabsContent value="estoque">
            <Estoque />
          </TabsContent>

          <TabsContent value="commodities">
            <Commodities />
          </TabsContent>

          <TabsContent value="relatorios">
            <Relatorios />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationCenter />
          </TabsContent>

          <TabsContent value="reportmanager">
            <ReportsManager />
          </TabsContent>

          <TabsContent value="configuracoes">
            <Configuracoes />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;

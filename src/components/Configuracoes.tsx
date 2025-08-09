
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Clock, Bell, Smartphone, Save } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Configuracoes = () => {
  const { profile, user } = useAuth();
  const { settings, updateSettings } = useNotifications();
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [propertyName, setPropertyName] = useState('');
  const [defaultTime, setDefaultTime] = useState('06:00');
  const [whatsappNotifications, setWhatsappNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [weatherAlerts, setWeatherAlerts] = useState(true);
  const [stockAlerts, setStockAlerts] = useState(true);
  const [alertAdvanceMinutes, setAlertAdvanceMinutes] = useState(30);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setUserName(profile.name || '');
      setUserEmail(profile.email || '');
      setUserPhone(profile.phone || '');
      setPropertyName(profile.property_name || '');
    }
  }, [profile]);

  useEffect(() => {
    if (settings) {
      setDefaultTime(settings.default_reminder_time);
      setWhatsappNotifications(settings.whatsapp_notifications);
      setEmailNotifications(settings.email_notifications);
      setWeatherAlerts(settings.weather_alerts);
      setStockAlerts(settings.stock_alerts);
      setAlertAdvanceMinutes(settings.alert_advance_minutes);
    }
  }, [settings]);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: userName,
          email: userEmail,
          phone: userPhone,
          property_name: propertyName,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        toast.error('Erro ao salvar perfil');
      } else {
        toast.success('Perfil salvo com sucesso!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erro ao salvar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotificationSettings = async () => {
    if (!settings) return;

    await updateSettings({
      default_reminder_time: defaultTime,
      whatsapp_notifications: whatsappNotifications,
      email_notifications: emailNotifications,
      weather_alerts: weatherAlerts,
      stock_alerts: stockAlerts,
      alert_advance_minutes: alertAdvanceMinutes
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">⚙️ Configurações</h2>
        <div className="flex space-x-2">
          <button
            onClick={handleSaveProfile}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Salvando...' : 'Salvar Perfil'}</span>
          </button>
          <button
            onClick={handleSaveNotificationSettings}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700 transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span>Salvar Notificações</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Profile */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Perfil do Usuário
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Usuário
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone
              </label>
              <input
                type="tel"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Propriedade
              </label>
              <input
                type="text"
                value={propertyName}
                onChange={(e) => setPropertyName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </motion.div>

        {/* Time Settings */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Configurações de Horário
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horário Padrão para Lembretes
              </label>
              <input
                type="time"
                value={defaultTime}
                onChange={(e) => setDefaultTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Antecedência dos Alertas (minutos)
              </label>
              <select 
                value={alertAdvanceMinutes}
                onChange={(e) => setAlertAdvanceMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value={15}>15 minutos</option>
                <option value={30}>30 minutos</option>
                <option value={60}>1 hora</option>
                <option value={120}>2 horas</option>
                <option value={1440}>1 dia</option>
              </select>
            </div>

            {/* Fuso horário e formato de data são fixos para Brasil */}
            <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
              Fuso horário: Brasília (UTC-3) • Formato de data: DD/MM/AAAA
            </div>
          </div>
        </motion.div>
      </div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
          <Bell className="w-5 h-5 mr-2" />
          Notificações
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">Canais de Notificação</h4>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Smartphone className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-800">WhatsApp</p>
                  <p className="text-sm text-gray-600">Receber alertas pelo WhatsApp</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={whatsappNotifications}
                  onChange={(e) => setWhatsappNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-xl">📧</span>
                <div>
                  <p className="font-medium text-gray-800">Email</p>
                  <p className="text-sm text-gray-600">Receber relatórios por email</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">Tipos de Alerta</h4>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-xl">🌧️</span>
                <div>
                  <p className="font-medium text-gray-800">Alertas Climáticos</p>
                  <p className="text-sm text-gray-600">Previsão de chuva e geada</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={weatherAlerts}
                  onChange={(e) => setWeatherAlerts(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-xl">📦</span>
                <div>
                  <p className="font-medium text-gray-800">Alertas de Estoque</p>
                  <p className="text-sm text-gray-600">Produtos em baixo estoque</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={stockAlerts}
                  onChange={(e) => setStockAlerts(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
          </div>
        </div>
      </motion.div>

      {/* System Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white"
      >
        <h3 className="text-lg font-semibold mb-4">ℹ️ Informações do Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-green-100 text-sm">Versão do App</p>
            <p className="font-semibold">v2.1.0</p>
          </div>
          <div>
            <p className="text-green-100 text-sm">Última Sincronização</p>
            <p className="font-semibold">{new Date().toLocaleString('pt-BR')}</p>
          </div>
          <div>
            <p className="text-green-100 text-sm">Plano</p>
            <p className="font-semibold">Premium Rural</p>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-green-500">
          <p className="text-sm text-green-100 mb-2">
            <strong>Granja Cavalli</strong> - Data privada por usuário
          </p>
          <p className="text-xs text-green-200">
            Todos os seus dados são protegidos e privados. Apenas você tem acesso às suas informações.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Configuracoes;

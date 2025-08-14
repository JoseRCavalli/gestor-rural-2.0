import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, Trash2, Filter, CheckCircle2 } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';

const NotificationCenter = () => {
  const { notifications, markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications, unreadCount, loading } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'info' | 'warning' | 'error' | 'success'>('all');

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread' && notification.read) return false;
    if (filter === 'read' && !notification.read) return false;
    if (typeFilter !== 'all' && notification.type !== typeFilter) return false;
    return true;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'success': return '✅';
      case 'weather': return '🌦️';
      case 'stock': return '📦';
      default: return 'ℹ️';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'error': return 'border-red-200 bg-red-50';
      case 'success': return 'border-green-200 bg-green-50';
      case 'weather': return 'border-blue-200 bg-blue-50';
      case 'stock': return 'border-purple-200 bg-purple-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando notificações...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Bell className="w-6 h-6 text-gray-700" />
          <h2 className="text-2xl font-bold text-gray-800">Central de Notificações</h2>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              {unreadCount}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">Todas</option>
              <option value="unread">Não lidas</option>
              <option value="read">Lidas</option>
            </select>
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">Todos os tipos</option>
            <option value="info">Informação</option>
            <option value="warning">Aviso</option>
            <option value="error">Erro</option>
            <option value="success">Sucesso</option>
          </select>

          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors flex items-center space-x-1"
              title="Marcar todas como lidas"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Marcar Todas</span>
            </Button>
          )}

          {notifications.length > 0 && (
            <Button
              onClick={() => {
                if (window.confirm('Tem certeza que deseja excluir todas as notificações?')) {
                  deleteAllNotifications();
                }
              }}
              className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors flex items-center space-x-1"
              title="Excluir todas as notificações"
            >
              <Trash2 className="w-4 h-4" />
              <span>Limpar Tudo</span>
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Nenhuma notificação encontrada</p>
            <p className="text-gray-400 text-sm">Suas notificações aparecerão aqui</p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredNotifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className={`p-4 rounded-lg border-l-4 ${getNotificationColor(notification.type)} ${
                  !notification.read ? 'border-l-blue-500' : 'border-l-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>
                          {format(new Date(notification.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </span>
                        <span className="capitalize">{notification.channel}</span>
                        <span className="capitalize">{notification.type}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                        title="Marcar como lida"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                      title="Excluir notificação"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {filteredNotifications.length > 0 && (
        <div className="text-center text-sm text-gray-500">
          Mostrando {filteredNotifications.length} de {notifications.length} notificações
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;

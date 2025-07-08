
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface NotificationSettings {
  id: string;
  user_id: string;
  whatsapp_notifications: boolean;
  email_notifications: boolean;
  weather_alerts: boolean;
  stock_alerts: boolean;
  alert_advance_minutes: number;
  default_reminder_time: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  channel: 'app' | 'email' | 'whatsapp';
  read: boolean;
  sent_at: string | null;
  created_at: string;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      // Type assertion to ensure proper typing
      const typedNotifications = (data || []).map(notification => ({
        ...notification,
        type: notification.type as 'info' | 'warning' | 'error' | 'success',
        channel: notification.channel as 'app' | 'email' | 'whatsapp'
      }));

      setNotifications(typedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchSettings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching notification settings:', error);
        return;
      }

      if (data) {
        setSettings(data);
      } else {
        await createDefaultSettings();
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error);
    }
  };

  const createDefaultSettings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .insert({
          user_id: user.id,
          whatsapp_notifications: true,
          email_notifications: false,
          weather_alerts: true,
          stock_alerts: true,
          alert_advance_minutes: 30,
          default_reminder_time: '06:00'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating default settings:', error);
        return;
      }

      setSettings(data);
    } catch (error) {
      console.error('Error creating default settings:', error);
    }
  };

  const updateSettings = async (updates: Partial<NotificationSettings>) => {
    if (!user || !settings) return;

    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating settings:', error);
        toast.error('Erro ao atualizar configurações');
        return;
      }

      setSettings(data);
      toast.success('Configurações atualizadas com sucesso!');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Erro ao atualizar configurações');
    }
  };

  const createNotification = async (notification: {
    title: string;
    message: string;
    type?: 'info' | 'warning' | 'error' | 'success';
    channel?: 'app' | 'email' | 'whatsapp';
  }) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: notification.title,
          message: notification.message,
          type: notification.type || 'info',
          channel: notification.channel || 'app'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating notification:', error);
        return;
      }

      const typedNotification = {
        ...data,
        type: data.type as 'info' | 'warning' | 'error' | 'success',
        channel: data.channel as 'app' | 'email' | 'whatsapp'
      };

      setNotifications(prev => [typedNotification, ...prev]);
      return typedNotification;
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error deleting notification:', error);
        return;
      }

      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      toast.success('Notificação excluída');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Erro ao excluir notificação');
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchSettings();
    }
    setLoading(false);
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    settings,
    loading,
    unreadCount,
    fetchNotifications,
    updateSettings,
    createNotification,
    markAsRead,
    deleteNotification,
    refetch: () => {
      fetchNotifications();
      fetchSettings();
    }
  };
};

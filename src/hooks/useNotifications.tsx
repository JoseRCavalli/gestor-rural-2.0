
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { NotificationSettings, Notification } from '@/types/database';

// Global caches and pub-sub to keep notifications/settings in sync across hook instances
let notificationsCache: Notification[] = [];
let settingsCache: NotificationSettings | null = null;
const subscribers = new Set<() => void>();
const emit = () => subscribers.forEach((cb) => cb());

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotificationsState] = useState<Notification[]>(notificationsCache);
  const [settings, setSettingsState] = useState<NotificationSettings | null>(settingsCache);
  const [loading, setLoading] = useState(true);

  // Local setters that also update global cache and notify subscribers
  const setNotifications = (next: Notification[]) => {
    notificationsCache = next;
    setNotificationsState(next);
    emit();
  };
  const setSettings = (next: NotificationSettings | null) => {
    settingsCache = next;
    setSettingsState(next);
    emit();
  };

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

      const typedNotifications = data || [];

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

      const typedNotification = data;

      setNotifications([typedNotification, ...notificationsCache]);
      return typedNotification;
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  // Garante que não haja notificações duplicadas no mesmo dia com mesmo título e mensagem
  const createNotificationOnce = async (notification: {
    title: string;
    message: string;
    type?: 'info' | 'warning' | 'error' | 'success';
    channel?: 'app' | 'email' | 'whatsapp';
  }) => {
    const todayStr = new Date().toDateString();
    const exists = notifications.some(n =>
      n.title === notification.title &&
      n.message === notification.message &&
      new Date(n.created_at).toDateString() === todayStr
    );
    if (exists) return;
    return await createNotification(notification);
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

      setNotifications(notificationsCache.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      ));
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

      setNotifications(notificationsCache.filter(notif => notif.id !== notificationId));
      toast.success('Notificação excluída');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Erro ao excluir notificação');
    }
  };

  const deleteAllNotifications = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting all notifications:', error);
        toast.error('Erro ao excluir todas as notificações');
        return;
      }

      setNotifications([]);
      toast.success('Todas as notificações foram excluídas');
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      toast.error('Erro ao excluir todas as notificações');
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchSettings();
    }
    setLoading(false);

    // Subscribe to realtime changes for notifications and settings (per user)
    if (!user) return;
    const channel = supabase
      .channel(`notifications-realtime-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, (payload) => {
        try {
          if (payload.eventType === 'INSERT') {
            const newNotif = payload.new as Notification;
            setNotifications([newNotif, ...notificationsCache.filter(n => n.id !== newNotif.id)]);
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Notification;
            setNotifications(notificationsCache.map(n => n.id === updated.id ? updated : n));
          } else if (payload.eventType === 'DELETE') {
            const oldId = (payload.old as any)?.id;
            if (oldId) setNotifications(notificationsCache.filter(n => n.id !== oldId));
          }
        } catch (e) {
          console.error('Realtime notifications handler error:', e);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notification_settings', filter: `user_id=eq.${user.id}` }, (payload) => {
        try {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setSettings(payload.new as NotificationSettings);
          } else if (payload.eventType === 'DELETE') {
            setSettings(null);
          }
        } catch (e) {
          console.error('Realtime settings handler error:', e);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Keep local state in sync with global cache
  useEffect(() => {
    const listener = () => {
      setNotificationsState(notificationsCache);
      setSettingsState(settingsCache);
    };
    subscribers.add(listener);
    // Initialize immediately
    listener();
    return () => {
      subscribers.delete(listener);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    settings,
    loading,
    unreadCount,
    fetchNotifications,
    updateSettings,
    createNotification,
    createNotificationOnce,
    markAsRead,
    deleteNotification,
    deleteAllNotifications,
    refetch: () => {
      fetchNotifications();
      fetchSettings();
    }
  };
};


-- Criar tabela para configurações de notificações
CREATE TABLE public.notification_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  whatsapp_notifications BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT false,
  weather_alerts BOOLEAN DEFAULT true,
  stock_alerts BOOLEAN DEFAULT true,
  alert_advance_minutes INTEGER DEFAULT 30,
  default_reminder_time TIME DEFAULT '06:00',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Criar tabela para notificações
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- info, warning, error, success
  channel TEXT NOT NULL DEFAULT 'app', -- app, email, whatsapp
  read BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para histórico de relatórios
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL, -- stock, events, financial, etc.
  title TEXT NOT NULL,
  data JSONB NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies para notification_settings
CREATE POLICY "Users can view their own notification settings" 
  ON public.notification_settings 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notification settings" 
  ON public.notification_settings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification settings" 
  ON public.notification_settings 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS Policies para notifications
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notifications" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" 
  ON public.notifications 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies para reports
CREATE POLICY "Users can view their own reports" 
  ON public.reports 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reports" 
  ON public.reports 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reports" 
  ON public.reports 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Função para criar configurações padrão de notificações para novos usuários
CREATE OR REPLACE FUNCTION public.handle_new_user_notifications()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.notification_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger para criar configurações padrão quando um usuário é criado
CREATE OR REPLACE TRIGGER on_auth_user_created_notifications
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_notifications();

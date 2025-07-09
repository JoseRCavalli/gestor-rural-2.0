
-- Adicionar campo completed na tabela events
ALTER TABLE public.events ADD COLUMN completed boolean DEFAULT false;

-- Criar tabela para controle de importações
CREATE TABLE public.import_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  import_type TEXT NOT NULL, -- 'animals' ou 'vaccinations'
  file_name TEXT,
  records_processed INTEGER DEFAULT 0,
  records_success INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  errors JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS para import_logs
ALTER TABLE public.import_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own import logs" 
  ON public.import_logs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own import logs" 
  ON public.import_logs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

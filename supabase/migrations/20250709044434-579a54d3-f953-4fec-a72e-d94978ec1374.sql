
-- Criar tabela para cadastro de animais
CREATE TABLE public.animals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tag TEXT NOT NULL, -- número do brinco
  name TEXT,
  birth_date DATE NOT NULL,
  phase TEXT NOT NULL CHECK (phase IN ('bezerra', 'novilha', 'vaca_lactante', 'vaca_seca')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, tag)
);

-- Criar tabela para tipos de vacinas
CREATE TABLE public.vaccine_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  interval_months INTEGER, -- intervalo em meses para reforço
  min_age_months INTEGER, -- idade mínima em meses
  max_age_months INTEGER, -- idade máxima em meses (NULL se não houver)
  phases TEXT[], -- fases que podem receber esta vacina
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para registros de vacinação
CREATE TABLE public.vaccinations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  animal_id UUID NOT NULL REFERENCES public.animals(id) ON DELETE CASCADE,
  vaccine_type_id UUID NOT NULL REFERENCES public.vaccine_types(id),
  application_date DATE NOT NULL,
  next_dose_date DATE, -- data calculada para próxima dose
  batch_number TEXT,
  manufacturer TEXT,
  responsible TEXT, -- veterinário/técnico responsável
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccine_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccinations ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para animals
CREATE POLICY "Users can view their own animals" 
  ON public.animals 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own animals" 
  ON public.animals 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own animals" 
  ON public.animals 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own animals" 
  ON public.animals 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas RLS para vaccine_types (público para leitura)
CREATE POLICY "Anyone can view vaccine types" 
  ON public.vaccine_types 
  FOR SELECT 
  USING (true);

-- Políticas RLS para vaccinations
CREATE POLICY "Users can view their own vaccinations" 
  ON public.vaccinations 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own vaccinations" 
  ON public.vaccinations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vaccinations" 
  ON public.vaccinations 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vaccinations" 
  ON public.vaccinations 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Inserir tipos de vacinas padrão
INSERT INTO public.vaccine_types (name, description, interval_months, min_age_months, max_age_months, phases) VALUES
('Brucelose', 'Vacina contra brucelose bovina', NULL, 3, 8, ARRAY['bezerra']),
('Clostridioses', 'Vacina polivalente contra clostridioses', 12, 2, NULL, ARRAY['bezerra', 'novilha', 'vaca_lactante', 'vaca_seca']),
('Leptospirose', 'Vacina contra leptospirose bovina', 6, 3, NULL, ARRAY['bezerra', 'novilha', 'vaca_lactante', 'vaca_seca']),
('IBR/BVD', 'Vacina contra rinotraqueíte e diarreia viral bovina', 12, 6, NULL, ARRAY['novilha', 'vaca_lactante', 'vaca_seca']),
('Raiva', 'Vacina antirrábica', 12, 3, NULL, ARRAY['bezerra', 'novilha', 'vaca_lactante', 'vaca_seca']),
('Mastite Ambiental', 'Vacina contra mastite (Staph aureus, E. coli)', 6, 12, NULL, ARRAY['novilha', 'vaca_lactante']),
('Diarreia Neonatal', 'Vacina contra rotavírus, coronavírus, E. coli', 12, 18, NULL, ARRAY['vaca_lactante', 'vaca_seca']);

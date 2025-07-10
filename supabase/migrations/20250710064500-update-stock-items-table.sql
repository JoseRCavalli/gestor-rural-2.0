
-- Adicionar novas colunas à tabela stock_items
ALTER TABLE public.stock_items 
ADD COLUMN IF NOT EXISTS code TEXT,
ADD COLUMN IF NOT EXISTS average_cost DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS selling_price DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS reserved_stock INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS available_stock INTEGER DEFAULT 0;

-- Atualizar available_stock com o valor atual de quantity para itens existentes
UPDATE public.stock_items 
SET available_stock = quantity 
WHERE available_stock = 0;

-- Criar índice para o código do item para melhor performance
CREATE INDEX IF NOT EXISTS idx_stock_items_code ON public.stock_items(user_id, code);
CREATE INDEX IF NOT EXISTS idx_stock_items_category ON public.stock_items(user_id, category);

-- Comentários para documentar as colunas
COMMENT ON COLUMN public.stock_items.code IS 'Código identificador do item';
COMMENT ON COLUMN public.stock_items.average_cost IS 'Custo médio do item em reais';
COMMENT ON COLUMN public.stock_items.selling_price IS 'Preço de venda do item em reais';
COMMENT ON COLUMN public.stock_items.reserved_stock IS 'Quantidade de estoque reservado';
COMMENT ON COLUMN public.stock_items.available_stock IS 'Quantidade de estoque disponível';

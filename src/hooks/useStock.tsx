import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { StockItem } from '@/types/database';

export const useStock = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: stockItems = [],
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: ['stock_items', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
          .from('stock_items')
          .select('*')
          .eq('user_id', user.id)
          .order('name', { ascending: true });

      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (
        itemData: Omit<StockItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>
    ) => {
      if (!user) return;

      const completeItemData = {
        ...itemData,
        user_id: user.id,
      };

      const { data, error } = await supabase
          .from('stock_items')
          .insert([completeItemData])
          .select()
          .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: async (data) => {
      toast.success('Item adicionado ao estoque!');
      await queryClient.invalidateQueries({ queryKey: ['stock_items', user?.id] });
    },
    onError: () => {
      toast.error('Erro ao criar item do estoque');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<StockItem> }) => {
      const { data, error } = await supabase
          .from('stock_items')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: async () => {
      toast.success('Item atualizado com sucesso!');
      await queryClient.invalidateQueries({ queryKey: ['stock_items', user?.id] });
    },
    onError: () => {
      toast.error('Erro ao atualizar item do estoque');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('stock_items').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      toast.success('Item removido do estoque!');
      await queryClient.invalidateQueries({ queryKey: ['stock_items', user?.id] });
    },
    onError: () => {
      toast.error('Erro ao deletar item do estoque');
    },
  });

  const calculateReservedValue = (item: StockItem) =>
      (item.reserved_stock || 0) * (item.average_cost || 0);

  const calculateAvailableValue = (item: StockItem) =>
      (item.available_stock || 0) * (item.average_cost || 0);

  const calculateTotalStockValue = () =>
      stockItems.reduce((total, item) => {
        return total + calculateReservedValue(item) + calculateAvailableValue(item);
      }, 0);

  const formatCurrency = (value: number) =>
      new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(value);

  return {
    stockItems,
    loading,
    refetch,
    createStockItem: createMutation.mutateAsync,
    updateStockItem: (id: string, updates: Partial<StockItem>) =>
        updateMutation.mutateAsync({ id, updates }),
    deleteStockItem: deleteMutation.mutateAsync,
    calculateReservedValue,
    calculateAvailableValue,
    calculateTotalStockValue,
    formatCurrency,
  };
};

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface StockItem {
  id: string;
  name: string;
  code?: string;
  quantity: number;
  unit: string;
  min_stock: number;
  category: string;
  average_cost?: number;
  selling_price?: number;
  reserved_stock?: number;
  available_stock?: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const useStock = () => {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchStock = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('stock_items')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching stock:', error);
        return;
      }

      setStockItems(data || []);
    } catch (error) {
      console.error('Error fetching stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const createStockItem = async (itemData: Omit<StockItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('stock_items')
        .insert([{
          ...itemData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating stock item:', error);
        toast.error('Erro ao criar item do estoque');
        return;
      }

      setStockItems(prev => [...prev, data]);
      toast.success('Item adicionado ao estoque!');
      return data;
    } catch (error) {
      console.error('Error creating stock item:', error);
      toast.error('Erro ao criar item do estoque');
    }
  };

  const updateStockItem = async (id: string, updates: Partial<StockItem>) => {
    try {
      const { data, error } = await supabase
        .from('stock_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating stock item:', error);
        toast.error('Erro ao atualizar item do estoque');
        return;
      }

      setStockItems(prev => prev.map(item => item.id === id ? data : item));
      toast.success('Item atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating stock item:', error);
      toast.error('Erro ao atualizar item do estoque');
    }
  };

  const deleteStockItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('stock_items')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting stock item:', error);
        toast.error('Erro ao deletar item do estoque');
        return;
      }

      setStockItems(prev => prev.filter(item => item.id !== id));
      toast.success('Item removido do estoque!');
    } catch (error) {
      console.error('Error deleting stock item:', error);
      toast.error('Erro ao deletar item do estoque');
    }
  };

  useEffect(() => {
    fetchStock();
  }, [user]);

  return {
    stockItems,
    loading,
    createStockItem,
    updateStockItem,
    deleteStockItem,
    refetch: fetchStock
  };
};

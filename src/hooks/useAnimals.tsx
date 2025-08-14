import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { Animal } from '@/types/database';

export const useAnimals = () => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchAnimals = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('animals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching animals:', error);
        toast.error('Erro ao carregar rebanho');
        return;
      }

      setAnimals(data || []);
    } catch (error) {
      console.error('Error fetching animals:', error);
      toast.error('Erro ao carregar rebanho');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnimalsByBatch = async (batch: string): Promise<Animal[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('animals')
        .select('*')
        .eq('user_id', user.id)
        .eq('batch', batch);

      if (error) {
        console.error('Error fetching animals by batch:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching animals by batch:', error);
      return [];
    }
  };

  const addAnimalsInBatch = async (animalsData: Omit<Animal, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]) => {
    if (!user) return null;

    try {
      // Adicionar user_id e reproductive_status padrão para cada animal
      const animalsWithUserId = animalsData.map(animal => ({
        ...animal,
        user_id: user.id,
        reproductive_status: 'empty' // valor padrão obrigatório
      }));

      const { data, error } = await supabase
        .from('animals')
        .insert(animalsWithUserId)
        .select();

      if (error) {
        console.error('Error adding animals in batch:', error);
        toast.error('Erro ao adicionar animais em lote');
        return null;
      }

      setAnimals(prev => [...(data || []), ...prev]);
      toast.success(`${data?.length || 0} animais adicionados com sucesso!`);
      return data;
    } catch (error) {
      console.error('Error adding animals in batch:', error);
      toast.error('Erro ao adicionar animais em lote');
      return null;
    }
  };

  const addAnimal = async (animalData: Omit<Animal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('animals')
        .insert([{ ...animalData, user_id: user.id, reproductive_status: 'empty' }])
        .select()
        .single();

      if (error) {
        console.error('Error adding animal:', error);
        toast.error('Erro ao adicionar animal');
        return;
      }

      setAnimals(prev => [data, ...prev]);
      toast.success('Animal adicionado com sucesso!');
    } catch (error) {
      console.error('Error adding animal:', error);
      toast.error('Erro ao adicionar animal');
    }
  };

  const updateAnimal = async (id: string, updates: Partial<Animal>) => {
    try {
      const { data, error } = await supabase
        .from('animals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating animal:', error);
        toast.error('Erro ao atualizar animal');
        return;
      }

      setAnimals(prev => prev.map(animal => animal.id === id ? data : animal));
      toast.success('Animal atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating animal:', error);
      toast.error('Erro ao atualizar animal');
    }
  };

  const deleteAnimal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('animals')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting animal:', error);
        toast.error('Erro ao excluir animal');
        return;
      }

      setAnimals(prev => prev.filter(animal => animal.id !== id));
      toast.success('Animal excluído com sucesso!');
    } catch (error) {
      console.error('Error deleting animal:', error);
      toast.error('Erro ao excluir animal');
    }
  };

  useEffect(() => {
    fetchAnimals();
  }, [user]);

  return {
    animals,
    loading,
    fetchAnimals,
    fetchAnimalsByBatch,
    addAnimalsInBatch,
    addAnimal,
    updateAnimal,
    deleteAnimal,
    refetch: fetchAnimals
  };
};

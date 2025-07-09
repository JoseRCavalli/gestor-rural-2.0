
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Animal {
  id: string;
  user_id: string;
  tag: string;
  name?: string;
  birth_date: string;
  phase: 'bezerra' | 'novilha' | 'vaca_lactante' | 'vaca_seca';
  created_at: string;
  updated_at: string;
}

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
        .order('tag');

      if (error) {
        console.error('Error fetching animals:', error);
        toast.error('Erro ao carregar animais');
        return;
      }

      // Type cast the data to ensure proper typing
      const typedData = (data || []).map(animal => ({
        ...animal,
        phase: animal.phase as 'bezerra' | 'novilha' | 'vaca_lactante' | 'vaca_seca'
      }));

      setAnimals(typedData);
    } catch (error) {
      console.error('Error fetching animals:', error);
      toast.error('Erro ao carregar animais');
    } finally {
      setLoading(false);
    }
  };

  const addAnimal = async (animalData: Omit<Animal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('animals')
        .insert([{ ...animalData, user_id: user.id }])
        .select()
        .single();

      if (error) {
        console.error('Error adding animal:', error);
        toast.error('Erro ao adicionar animal: ' + error.message);
        return;
      }

      // Type cast the returned data
      const typedData = {
        ...data,
        phase: data.phase as 'bezerra' | 'novilha' | 'vaca_lactante' | 'vaca_seca'
      };

      setAnimals(prev => [...prev, typedData]);
      toast.success('Animal adicionado com sucesso!');
      return typedData;
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

      // Type cast the returned data
      const typedData = {
        ...data,
        phase: data.phase as 'bezerra' | 'novilha' | 'vaca_lactante' | 'vaca_seca'
      };

      setAnimals(prev => prev.map(animal => animal.id === id ? typedData : animal));
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
    addAnimal,
    updateAnimal,
    deleteAnimal,
    refetch: fetchAnimals
  };
};

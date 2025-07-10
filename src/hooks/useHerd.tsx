
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface HerdAnimal {
  id: string;
  code: string;
  name: string;
  reproductive_status: string;
  observations?: string;
  last_calving_date?: string;
  days_in_lactation?: number;
  milk_control?: number;
  expected_calving_interval?: number;
  del_average?: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const useHerd = () => {
  const [herd, setHerd] = useState<HerdAnimal[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchHerd = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('herd')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching herd:', error);
        toast.error('Erro ao carregar rebanho');
        return;
      }

      setHerd(data || []);
    } catch (error) {
      console.error('Error fetching herd:', error);
      toast.error('Erro ao carregar rebanho');
    } finally {
      setLoading(false);
    }
  };

  const addAnimal = async (animalData: Omit<HerdAnimal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('herd')
        .insert([{
          ...animalData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding animal:', error);
        toast.error('Erro ao cadastrar animal');
        return;
      }

      setHerd(prev => [data, ...prev]);
      toast.success('Animal cadastrado com sucesso!');
      return data;
    } catch (error) {
      console.error('Error adding animal:', error);
      toast.error('Erro ao cadastrar animal');
    }
  };

  const updateAnimal = async (id: string, animalData: Partial<HerdAnimal>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('herd')
        .update(animalData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating animal:', error);
        toast.error('Erro ao atualizar animal');
        return;
      }

      setHerd(prev => prev.map(animal => 
        animal.id === id ? data : animal
      ));
      toast.success('Animal atualizado com sucesso!');
      return data;
    } catch (error) {
      console.error('Error updating animal:', error);
      toast.error('Erro ao atualizar animal');
    }
  };

  const deleteAnimal = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('herd')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting animal:', error);
        toast.error('Erro ao excluir animal');
        return;
      }

      setHerd(prev => prev.filter(animal => animal.id !== id));
      toast.success('Animal excluído com sucesso!');
    } catch (error) {
      console.error('Error deleting animal:', error);
      toast.error('Erro ao excluir animal');
    }
  };

  const importAnimals = async (animals: Omit<HerdAnimal, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]) => {
    if (!user) return;

    try {
      const animalsWithUserId = animals.map(animal => ({
        ...animal,
        user_id: user.id
      }));

      const { data, error } = await supabase
        .from('herd')
        .insert(animalsWithUserId)
        .select();

      if (error) {
        console.error('Error importing animals:', error);
        toast.error('Erro ao importar animais');
        return;
      }

      setHerd(prev => [...(data || []), ...prev]);
      toast.success(`${data?.length || 0} animais importados com sucesso!`);
      return data;
    } catch (error) {
      console.error('Error importing animals:', error);
      toast.error('Erro ao importar animais');
    }
  };

  useEffect(() => {
    fetchHerd();
  }, [user]);

  return {
    herd,
    loading,
    addAnimal,
    updateAnimal,
    deleteAnimal,
    importAnimals,
    refetch: fetchHerd
  };
};

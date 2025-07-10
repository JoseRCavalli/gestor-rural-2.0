
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface HerdAnimal {
  id: string;
  tag: string;
  name: string | null;
  phase: string;
  birth_date: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  // Additional fields we'll store in a JSON column or separate table later
  reproductive_status?: string;
  observations?: string;
  last_calving_date?: string;
  days_in_lactation?: number;
  milk_control?: number;
  expected_calving_interval?: number;
  del_average?: number;
}

export const useHerd = () => {
  const [herd, setHerd] = useState<HerdAnimal[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchHerd = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('animals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching herd:', error);
        toast.error('Erro ao carregar rebanho');
        return;
      }

      // Transform the animals data to match our herd interface
      const herdData = (data || []).map(animal => ({
        ...animal,
        reproductive_status: animal.phase, // Use phase as reproductive status for now
      }));

      setHerd(herdData);
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
        .from('animals')
        .insert([{
          tag: animalData.tag,
          name: animalData.name || null,
          phase: animalData.reproductive_status || animalData.phase,
          birth_date: animalData.birth_date,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding animal:', error);
        toast.error('Erro ao cadastrar animal');
        return;
      }

      const newAnimal = {
        ...data,
        reproductive_status: data.phase,
      };

      setHerd(prev => [newAnimal, ...prev]);
      toast.success('Animal cadastrado com sucesso!');
      return newAnimal;
    } catch (error) {
      console.error('Error adding animal:', error);
      toast.error('Erro ao cadastrar animal');
    }
  };

  const updateAnimal = async (id: string, animalData: Partial<HerdAnimal>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('animals')
        .update({
          tag: animalData.tag,
          name: animalData.name,
          phase: animalData.reproductive_status || animalData.phase,
          birth_date: animalData.birth_date,
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating animal:', error);
        toast.error('Erro ao atualizar animal');
        return;
      }

      const updatedAnimal = {
        ...data,
        reproductive_status: data.phase,
      };

      setHerd(prev => prev.map(animal => 
        animal.id === id ? updatedAnimal : animal
      ));
      toast.success('Animal atualizado com sucesso!');
      return updatedAnimal;
    } catch (error) {
      console.error('Error updating animal:', error);
      toast.error('Erro ao atualizar animal');
    }
  };

  const deleteAnimal = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('animals')
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
        tag: animal.tag,
        name: animal.name || null,
        phase: animal.reproductive_status || animal.phase,
        birth_date: animal.birth_date,
        user_id: user.id
      }));

      const { data, error } = await supabase
        .from('animals')
        .insert(animalsWithUserId)
        .select();

      if (error) {
        console.error('Error importing animals:', error);
        toast.error('Erro ao importar animais');
        return;
      }

      const newAnimals = (data || []).map(animal => ({
        ...animal,
        reproductive_status: animal.phase,
      }));

      setHerd(prev => [...newAnimals, ...prev]);
      toast.success(`${data?.length || 0} animais importados com sucesso!`);
      return newAnimals;
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

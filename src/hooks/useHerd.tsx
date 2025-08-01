import {useState, useEffect} from 'react';
import {supabase} from '@/integrations/supabase/client';
import {useAuth} from './useAuth';
import {toast} from 'sonner';

export interface HerdAnimal {
  id: string;
  tag: string;
  name: string | null;
  phase: string;
  birth_date: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  reproductive_status: string;
  observations?: string;
  last_calving_date?: string;
  days_in_lactation?: number;
  milk_control?: number;
  expected_calving_interval?: number;
  del_average?: number;
  batch: string;
}

export const useHerd = () => {
  const [herd, setHerd] = useState<HerdAnimal[]>([]);
  const [loading, setLoading] = useState(true);
  const {user} = useAuth();

  const fetchHerd = async () => {
    if (!user) return;

    try {
      const {data, error} = await supabase
          .from('animals')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', {ascending: false});

      if (error) {
        console.error('Error fetching herd:', error);
        toast.error('Erro ao carregar rebanho');
        return;
      }

      // Transform the animals data to match our herd interface
      const herdData = (data || []).map((animal: any) => ({
        ...animal,
        reproductive_status: animal.reproductive_status || animal.phase,
        batch: animal.batch || 'Lote A',
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
      console.log('Adding animal with data:', animalData);

      const {data, error} = await supabase
          .from('animals')
          .insert([{
            tag: animalData.tag,
            name: animalData.name || null,
            phase: animalData.phase,
            birth_date: animalData.birth_date,
            user_id: user.id,
            reproductive_status: animalData.reproductive_status,
            observations: animalData.observations,
            last_calving_date: animalData.last_calving_date,
            days_in_lactation: animalData.days_in_lactation,
            milk_control: animalData.milk_control,
            expected_calving_interval: animalData.expected_calving_interval,
            del_average: animalData.del_average,
            batch: animalData.batch,
          }])
          .select()
          .single();

      if (error) {
        console.error('Error adding animal:', error);
        toast.error('Erro ao cadastrar animal: ' + error.message);
        return;
      }

      const newAnimal = {
        ...data,
        reproductive_status: (data as any).reproductive_status || (data as any).phase,
        batch: (data as any).batch || 'Lote A',
      } as HerdAnimal;

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
      const {data, error} = await supabase
          .from('animals')
          .update({
            tag: animalData.tag,
            name: animalData.name || null,
            phase: animalData.phase,
            birth_date: animalData.birth_date,
            user_id: user.id,
            reproductive_status: animalData.reproductive_status,
            observations: animalData.observations,
            last_calving_date: animalData.last_calving_date,
            days_in_lactation: animalData.days_in_lactation,
            milk_control: animalData.milk_control,
            expected_calving_interval: animalData.expected_calving_interval,
            del_average: animalData.del_average,
            batch: animalData.batch,
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
        reproductive_status: (data as any).reproductive_status || (data as any).phase,
        batch: (data as any).batch || 'Lote A',
      } as HerdAnimal;

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
      const {error} = await supabase
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
      console.log('Importing animals:', animals);

      const animalsWithUserId = animals.map(animal => ({
        tag: animal.tag,
        name: animal.name || null,
        phase: animal.phase,
        birth_date: animal.birth_date,
        reproductive_status: animal.reproductive_status || animal.phase,
        batch: animal.batch || 'Lote A',
        user_id: user.id
      }));

      console.log('Animals to insert:', animalsWithUserId);

      const {data, error} = await supabase
          .from('animals')
          .insert(animalsWithUserId)
          .select();

      if (error) {
        console.error('Error importing animals:', error);
        toast.error('Erro ao importar animais: ' + error.message);
        return;
      }

      const newAnimals = (data || []).map(animal => ({
        ...animal,
        reproductive_status: animal.phase,
        batch: 'Lote A',
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

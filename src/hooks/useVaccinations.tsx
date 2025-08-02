
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { VaccineType, Vaccination } from '@/types/database';

export const useVaccinations = () => {
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [vaccineTypes, setVaccineTypes] = useState<VaccineType[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchVaccineTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('vaccine_types')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching vaccine types:', error);
        return;
      }

      setVaccineTypes(data || []);
    } catch (error) {
      console.error('Error fetching vaccine types:', error);
    }
  };

  const fetchVaccinations = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vaccinations')
        .select('*')
        .eq('user_id', user.id)
        .order('application_date', { ascending: false });

      if (error) {
        console.error('Error fetching vaccinations:', error);
        toast.error('Erro ao carregar vacinações');
        return;
      }

      setVaccinations(data || []);
    } catch (error) {
      console.error('Error fetching vaccinations:', error);
      toast.error('Erro ao carregar vacinações');
    } finally {
      setLoading(false);
    }
  };

  const addVaccination = async (vaccinationData: Omit<Vaccination, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      // Calculate next dose date if vaccine has interval
      const vaccineType = vaccineTypes.find(vt => vt.id === vaccinationData.vaccine_type_id);
      let nextDoseDate = null;
      
      if (vaccineType?.interval_months) {
        const applicationDate = new Date(vaccinationData.application_date);
        const nextDate = new Date(applicationDate);
        nextDate.setMonth(nextDate.getMonth() + vaccineType.interval_months);
        nextDoseDate = nextDate.toISOString().split('T')[0];
      }

      const { data, error } = await supabase
        .from('vaccinations')
        .insert([{ 
          ...vaccinationData, 
          user_id: user.id,
          next_dose_date: nextDoseDate
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding vaccination:', error);
        toast.error('Erro ao adicionar vacinação: ' + error.message);
        return;
      }

      setVaccinations(prev => [data, ...prev]);
      toast.success('Vacinação registrada com sucesso!');
      return data;
    } catch (error) {
      console.error('Error adding vaccination:', error);
      toast.error('Erro ao adicionar vacinação');
    }
  };

  const updateVaccination = async (id: string, updates: Partial<Vaccination>) => {
    try {
      const { data, error } = await supabase
        .from('vaccinations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating vaccination:', error);
        toast.error('Erro ao atualizar vacinação');
        return;
      }

      setVaccinations(prev => prev.map(vacc => vacc.id === id ? data : vacc));
      toast.success('Vacinação atualizada com sucesso!');
    } catch (error) {
      console.error('Error updating vaccination:', error);
      toast.error('Erro ao atualizar vacinação');
    }
  };

  const deleteVaccination = async (id: string) => {
    try {
      const { error } = await supabase
        .from('vaccinations')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting vaccination:', error);
        toast.error('Erro ao excluir vacinação');
        return;
      }

      setVaccinations(prev => prev.filter(vacc => vacc.id !== id));
      toast.success('Vacinação excluída com sucesso!');
    } catch (error) {
      console.error('Error deleting vaccination:', error);
      toast.error('Erro ao excluir vacinação');
    }
  };

  useEffect(() => {
    fetchVaccineTypes();
    fetchVaccinations();
  }, [user]);

  return {
    vaccinations,
    vaccineTypes,
    loading,
    addVaccination,
    updateVaccination,
    deleteVaccination,
    refetch: fetchVaccinations
  };
};

import {useState, useEffect} from 'react';
import {supabase} from '@/integrations/supabase/client';
import {useAuth} from './useAuth';
import {toast} from 'sonner';
import {VaccineType, Vaccination, Animal} from '@/types/database';
import {VaccinationByBatch} from "@/lib/types/vaccination-by-batch.ts";

export const useVaccinations = () => {
    const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
    const [vaccineTypes, setVaccineTypes] = useState<VaccineType[]>([]);
    const [loading, setLoading] = useState(true);
    const {user} = useAuth();

    const fetchVaccineTypes = async () => {
        try {
            const {data, error} = await supabase
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

    const addVaccinationsToBatchAnimals = async (vaccinationData: VaccinationByBatch, animals: Animal[]) => {
        if (!user) return;

        try {
            const { batch, ...vaccinationDataWithoutBatch } = vaccinationData;

            const vaccinationsAnimalsData = animals.map((animal: Animal) => {
                    return {
                        ...vaccinationDataWithoutBatch,
                        animal_id: animal.id,
                        user_id: user.id,
                    }
                }
            );

            const { data, error } = await supabase
                .from('vaccinations')
                .insert(vaccinationsAnimalsData)
                .select()

            if (error) {
                return null;
            }

            return data;
        } catch (e) {
            toast.error('Ocorreu um erro ao inserir a vacinação no lote de animais!');
        }
    }

    const fetchVaccinations = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const {data, error} = await supabase
                .from('vaccinations')
                .select('*')
                .eq('user_id', user.id)
                .order('application_date', {ascending: false});

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

            const {data, error} = await supabase
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
            return data;
        } catch (error) {
            console.error('Error adding vaccination:', error);
            toast.error('Erro ao adicionar vacinação');
        }
    };

    const updateVaccination = async (id: string, updates: Partial<Vaccination>) => {
        try {
            const {data, error} = await supabase
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
            const {error} = await supabase
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

    const markAsApplied = async (vaccinationId: string, applicationData: {
        application_date: string;
        batch_number?: string;
        manufacturer?: string;
        responsible?: string;
        notes?: string;
    }) => {
        try {
            // Buscar a vacinação atual
            const existingVaccination = vaccinations.find(v => v.id === vaccinationId);
            if (!existingVaccination) {
                toast.error('Vacinação não encontrada');
                return;
            }

            // Calcular próxima dose se a vacina tem intervalo
            const vaccineType = vaccineTypes.find(vt => vt.id === existingVaccination.vaccine_type_id);
            let nextDoseDate = null;

            if (vaccineType?.interval_months) {
                const applicationDate = new Date(applicationData.application_date);
                const nextDate = new Date(applicationDate);
                nextDate.setMonth(nextDate.getMonth() + vaccineType.interval_months);
                nextDoseDate = nextDate.toISOString().split('T')[0];
            }

            const {data, error} = await supabase
                .from('vaccinations')
                .update({
                    application_date: applicationData.application_date,
                    next_dose_date: nextDoseDate,
                    batch_number: applicationData.batch_number,
                    manufacturer: applicationData.manufacturer,
                    responsible: applicationData.responsible,
                    notes: applicationData.notes
                })
                .eq('id', vaccinationId)
                .select()
                .single();

            if (error) {
                console.error('Error marking vaccination as applied:', error);
                toast.error('Erro ao marcar vacinação como aplicada');
                return;
            }

            setVaccinations(prev => prev.map(vacc => vacc.id === vaccinationId ? data : vacc));
            toast.success('Vacinação marcada como aplicada!');
            return data;
        } catch (error) {
            console.error('Error marking vaccination as applied:', error);
            toast.error('Erro ao marcar vacinação como aplicada');
        }
    };

    useEffect(() => {
        fetchVaccineTypes();
        fetchVaccinations();
    }, [user]);

    return {
        vaccinations,
        addVaccinationsToBatchAnimals,
        vaccineTypes,
        loading,
        addVaccination,
        updateVaccination,
        deleteVaccination,
        markAsApplied,
        refetch: () => {
            fetchVaccinations();
            fetchVaccineTypes();
        }
    };
};

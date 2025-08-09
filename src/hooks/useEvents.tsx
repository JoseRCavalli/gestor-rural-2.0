import {useState, useEffect} from 'react';
import {useAuth} from './useAuth';
import {toast} from 'sonner';
import {Event} from '@/types/database';
import {supabase} from "@/integrations/supabase/client.ts";

export const useEvents = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const {user} = useAuth();

    const fetchEvents = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const {data, error} = await supabase
                .from('events')
                .select('*')
                .eq('user_id', user.id)
                .order('date', {ascending: true});

            if (error) {
                console.error('Error fetching events:', error);
                toast.error('Erro ao carregar eventos');
                return;
            }

            setEvents(data || []);
        } catch (error) {
            console.error('Error fetching events:', error);
            toast.error('Erro ao carregar eventos');
        } finally {
            setLoading(false);
        }
    };

    const createEvent = async (eventData: Omit<Event, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
        if (!user) return;

        try {
            const eventToInsert = {
                ...eventData,
                user_id: user.id,
                date: eventData.date,
            }

            const {data, error} = await supabase
                .from('events')
                .insert([eventToInsert])
                .select()
                .single();

            if (error) {
                console.error('Error creating event:', error);
                toast.error('Erro ao criar evento: ' + error.message);
                return;
            }

            setEvents(prev => [...prev, data]);
            toast.success('Evento criado com sucesso!');
            return data;
        } catch (error) {
            console.error('Error creating event:', error);
            toast.error('Erro ao criar evento');
        }
    };

    const updateEvent = async (id: string, updates: Partial<Event>) => {
        try {
            const {data, error} = await supabase
                .from('events')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('Error updating event:', error);
                toast.error('Erro ao atualizar evento');
                return;
            }

            setEvents(prev => prev.map(event => event.id === id ? data : event));
            toast.success('Evento atualizado com sucesso!');
        } catch (error) {
            console.error('Error updating event:', error);
            toast.error('Erro ao atualizar evento');
        }
    };

    const deleteEvent = async (id: string) => {
        try {
            const {error} = await supabase
                .from('events')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error deleting event:', error);
                toast.error('Erro ao excluir evento');
                return;
            }

            setEvents(prev => prev.filter(event => event.id !== id));
            toast.success('Evento excluído com sucesso!');
        } catch (error) {
            console.error('Error deleting event:', error);
            toast.error('Erro ao excluir evento');
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [user]);

    return {
        events,
        loading,
        createEvent,
        updateEvent,
        deleteEvent,
        refetch: fetchEvents
    };
};

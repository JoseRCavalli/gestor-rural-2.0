
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Report {
  id: string;
  user_id: string;
  report_type: string;
  title: string;
  data: any;
  generated_at: string;
  created_at: string;
}

export const useReports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', user.id)
        .order('generated_at', { ascending: false });

      if (error) {
        console.error('Error fetching reports:', error);
        return;
      }

      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (reportType: string, title: string, data: any) => {
    if (!user) return;

    try {
      const { data: reportData, error } = await supabase
        .from('reports')
        .insert({
          user_id: user.id,
          report_type: reportType,
          title,
          data
        })
        .select()
        .single();

      if (error) {
        console.error('Error generating report:', error);
        toast.error('Erro ao gerar relatório');
        return;
      }

      setReports(prev => [reportData, ...prev]);
      toast.success('Relatório gerado com sucesso!');
      return reportData;
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Erro ao gerar relatório');
    }
  };

  const deleteReport = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error deleting report:', error);
        toast.error('Erro ao excluir relatório');
        return;
      }

      setReports(prev => prev.filter(report => report.id !== reportId));
      toast.success('Relatório excluído');
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Erro ao excluir relatório');
    }
  };

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user]);

  return {
    reports,
    loading,
    generateReport,
    deleteReport,
    refetch: fetchReports
  };
};

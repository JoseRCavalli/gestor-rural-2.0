
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Trash2, Plus, Calendar, BarChart3 } from 'lucide-react';
import { useReports } from '@/hooks/useReports';
import { useStock } from '@/hooks/useStock';
import { useEvents } from '@/hooks/useEvents';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ReportsManager = () => {
  const { reports, generateReport, deleteReport, loading } = useReports();
  const { stockItems } = useStock();
  const { events } = useEvents();
  const [generatingReport, setGeneratingReport] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(30);

  const handleGenerateReport = async (reportType: string) => {
    setGeneratingReport(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: {
          user_id: (await supabase.auth.getUser()).data.user?.id,
          report_type: reportType,
          title: `Relatório ${getReportTypeLabel(reportType)} - ${format(new Date(), 'dd/MM/yyyy', { locale: ptBR })}`,
          period: selectedPeriod
        }
      });

      if (error) {
        console.error('Error generating report:', error);
        toast.error('Erro ao gerar relatório');
      } else {
        toast.success('Relatório gerado com sucesso!');
        // Refresh reports list
        window.location.reload();
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Erro ao gerar relatório');
    } finally {
      setGeneratingReport(false);
    }
  };

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case 'stock': return 'de Estoque';
      case 'events': return 'de Eventos';
      case 'financial': return 'Financeiro';
      default: return 'Geral';
    }
  };

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'stock': return '📦';
      case 'events': return '📅';
      case 'financial': return '💰';
      default: return '📊';
    }
  };

  const downloadReport = (report: any) => {
    const dataStr = JSON.stringify(report.data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.title.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Relatório baixado!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando relatórios...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <FileText className="w-6 h-6 text-gray-700" />
          <h2 className="text-2xl font-bold text-gray-800">Gerenciador de Relatórios</h2>
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value={7}>Últimos 7 dias</option>
            <option value={30}>Últimos 30 dias</option>
            <option value={90}>Últimos 90 dias</option>
            <option value={365}>Último ano</option>
          </select>
        </div>
      </div>

      {/* Report Generation Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Gerar Novo Relatório
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleGenerateReport('stock')}
            disabled={generatingReport}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📦</span>
              <div className="text-left">
                <p className="font-medium text-gray-800">Relatório de Estoque</p>
                <p className="text-sm text-gray-600">{stockItems.length} itens cadastrados</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleGenerateReport('events')}
            disabled={generatingReport}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📅</span>
              <div className="text-left">
                <p className="font-medium text-gray-800">Relatório de Eventos</p>
                <p className="text-sm text-gray-600">{events.length} eventos cadastrados</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleGenerateReport('financial')}
            disabled={generatingReport}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">💰</span>
              <div className="text-left">
                <p className="font-medium text-gray-800">Relatório Financeiro</p>
                <p className="text-sm text-gray-600">Resumo financeiro básico</p>
              </div>
            </div>
          </button>
        </div>

        {generatingReport && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">Gerando relatório... Aguarde um momento.</p>
          </div>
        )}
      </motion.div>

      {/* Reports List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Relatórios Gerados
        </h3>

        {reports.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Nenhum relatório gerado ainda</p>
            <p className="text-gray-400 text-sm">Gere seu primeiro relatório acima</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <div
                key={report.id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getReportIcon(report.report_type)}</span>
                    
                    <div>
                      <h4 className="font-medium text-gray-800">{report.title}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span>Tipo: {getReportTypeLabel(report.report_type)}</span>
                        <span>
                          Gerado em: {format(new Date(report.generated_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => downloadReport(report)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                      title="Baixar relatório"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => deleteReport(report.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
                      title="Excluir relatório"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Report Summary */}
                {report.data && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {report.report_type === 'stock' && (
                        <>
                          <div>
                            <span className="text-gray-600">Total de Itens:</span>
                            <span className="font-medium ml-1">{report.data.totalItems || 0}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Baixo Estoque:</span>
                            <span className="font-medium ml-1 text-red-600">{report.data.lowStockItems || 0}</span>
                          </div>
                        </>
                      )}
                      {report.report_type === 'events' && (
                        <>
                          <div>
                            <span className="text-gray-600">Total de Eventos:</span>
                            <span className="font-medium ml-1">{report.data.totalEvents || 0}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Período:</span>
                            <span className="font-medium ml-1">{report.data.period || 'N/A'}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ReportsManager;

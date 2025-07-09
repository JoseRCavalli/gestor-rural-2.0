
import { useState } from 'react';
import { Upload, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useVaccinations } from '@/hooks/useVaccinations';
import { useAnimals } from '@/hooks/useAnimals';
import { toast } from 'sonner';

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

const ImportVaccinations = () => {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const { refetch } = useVaccinations();
  const { animals } = useAnimals();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Verificar extensão do arquivo
    const validExtensions = ['.csv', '.xlsx', '.xls'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!validExtensions.includes(fileExtension)) {
      toast.error('Formato de arquivo não suportado. Use CSV ou Excel (.xlsx, .xls)');
      return;
    }

    setImporting(true);
    setResult(null);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast.error('Arquivo deve conter pelo menos uma linha de cabeçalho e uma linha de dados');
        setImporting(false);
        return;
      }

      // Formato CSV: animal_tag,vaccine_type_id,application_date,next_dose_date,batch_number,manufacturer,responsible,notes
      const header = lines[0].toLowerCase().split(',').map(h => h.trim());
      const requiredColumns = ['animal_tag', 'vaccine_type_id', 'application_date'];
      
      // Verificar se as colunas obrigatórias estão presentes
      const missingColumns = requiredColumns.filter(col => !header.includes(col));
      if (missingColumns.length > 0) {
        toast.error(`Colunas obrigatórias faltando: ${missingColumns.join(', ')}`);
        setImporting(false);
        return;
      }

      const animalTagIndex = header.indexOf('animal_tag');
      const vaccineTypeIndex = header.indexOf('vaccine_type_id');
      const applicationDateIndex = header.indexOf('application_date');
      const nextDoseDateIndex = header.indexOf('next_dose_date');
      const batchNumberIndex = header.indexOf('batch_number');
      const manufacturerIndex = header.indexOf('manufacturer');
      const responsibleIndex = header.indexOf('responsible');
      const notesIndex = header.indexOf('notes');

      let successCount = 0;
      let failedCount = 0;
      const errors: string[] = [];

      // Processar cada linha
      for (let i = 1; i < lines.length; i++) {
        try {
          const data = lines[i].split(',').map(d => d.trim().replace(/"/g, ''));
          
          if (data.length < requiredColumns.length) {
            errors.push(`Linha ${i + 1}: Dados insuficientes`);
            failedCount++;
            continue;
          }

          const animalTag = data[animalTagIndex];
          const vaccineTypeId = data[vaccineTypeIndex];
          const applicationDate = data[applicationDateIndex];
          const nextDoseDate = nextDoseDateIndex >= 0 ? data[nextDoseDateIndex] || null : null;
          const batchNumber = batchNumberIndex >= 0 ? data[batchNumberIndex] || null : null;
          const manufacturer = manufacturerIndex >= 0 ? data[manufacturerIndex] || null : null;
          const responsible = responsibleIndex >= 0 ? data[responsibleIndex] || null : null;
          const notes = notesIndex >= 0 ? data[notesIndex] || null : null;

          // Validações
          if (!animalTag) {
            errors.push(`Linha ${i + 1}: Tag do animal obrigatória`);
            failedCount++;
            continue;
          }

          // Verificar se o animal existe
          const animal = animals.find(a => a.tag === animalTag);
          if (!animal) {
            errors.push(`Linha ${i + 1}: Animal com tag "${animalTag}" não encontrado`);
            failedCount++;
            continue;
          }

          if (!vaccineTypeId) {
            errors.push(`Linha ${i + 1}: ID do tipo de vacina obrigatório`);
            failedCount++;
            continue;
          }

          if (!applicationDate || !isValidDate(applicationDate)) {
            errors.push(`Linha ${i + 1}: Data de aplicação inválida (use formato YYYY-MM-DD)`);
            failedCount++;
            continue;
          }

          if (nextDoseDate && !isValidDate(nextDoseDate)) {
            errors.push(`Linha ${i + 1}: Data da próxima dose inválida (use formato YYYY-MM-DD)`);
            failedCount++;
            continue;
          }

          // Criar vacinação (simulação - aqui você chamaria a API real)
          console.log('Criando vacinação:', {
            animal_id: animal.id,
            vaccine_type_id: vaccineTypeId,
            application_date: applicationDate,
            next_dose_date: nextDoseDate,
            batch_number: batchNumber,
            manufacturer,
            responsible,
            notes
          });
          
          successCount++;
        } catch (error) {
          errors.push(`Linha ${i + 1}: Erro ao processar dados`);
          failedCount++;
        }
      }

      setResult({
        success: successCount,
        failed: failedCount,
        errors: errors.slice(0, 10) // Mostrar apenas os primeiros 10 erros
      });

      if (successCount > 0) {
        toast.success(`${successCount} vacinações importadas com sucesso!`);
        refetch(); // Recarregar a lista de vacinações
      }

      if (failedCount > 0) {
        toast.error(`${failedCount} registros falharam na importação`);
      }

    } catch (error) {
      console.error('Erro na importação:', error);
      toast.error('Erro ao processar arquivo');
    } finally {
      setImporting(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const isValidDate = (dateString: string): boolean => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  };

  const downloadTemplate = () => {
    const csvContent = 'animal_tag,vaccine_type_id,application_date,next_dose_date,batch_number,manufacturer,responsible,notes\n001,vaccine-uuid-1,2024-01-15,2024-07-15,LOTE123,Farmacorp,Dr. Silva,"Primeira dose da série"';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_vacinacoes.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="w-5 h-5" />
          <span>Importar Vacinações</span>
        </CardTitle>
        <CardDescription>
          Importe vacinações em lote através de arquivo CSV ou Excel
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Formato esperado:</strong> animal_tag, vaccine_type_id, application_date (YYYY-MM-DD), next_dose_date (opcional), batch_number, manufacturer, responsible, notes
            <br />
            <strong>Importante:</strong> O animal deve estar cadastrado no sistema (pela tag)
          </AlertDescription>
        </Alert>

        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={downloadTemplate}
            className="flex items-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>Baixar Template</span>
          </Button>

          <div className="relative">
            <input
              type="file"
              id="vaccination-file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              disabled={importing}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button disabled={importing} className="flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>{importing ? 'Importando...' : 'Selecionar Arquivo'}</span>
            </Button>
          </div>
        </div>

        {result && (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              {result.success > 0 && (
                <Badge variant="default" className="flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>{result.success} Sucesso</span>
                </Badge>
              )}
              {result.failed > 0 && (
                <Badge variant="destructive" className="flex items-center space-x-1">
                  <XCircle className="w-3 h-3" />
                  <span>{result.failed} Falhas</span>
                </Badge>
              )}
            </div>

            {result.errors.length > 0 && (
              <div className="bg-red-50 p-3 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2">Erros encontrados:</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {result.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                  {result.errors.length === 10 && (
                    <li className="italic">... e outros erros</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImportVaccinations;

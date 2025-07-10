import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, FileText, CheckCircle, XCircle } from 'lucide-react';
import { useHerd } from '@/hooks/useHerd';
import { toast } from 'sonner';

interface HerdImporterProps {
  onClose: () => void;
}

interface ImportItem {
  tag: string;
  name: string | null;
  phase: string;
  birth_date: string;
  reproductive_status: string;
  observations: string;
  last_calving_date: string;
  days_in_lactation: number | null;
  milk_control: number | null;
  expected_calving_interval: number | null;
  del_average: number | null;
  valid: boolean;
  errors: string[];
}

const HerdImporter = ({ onClose }: HerdImporterProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const { importAnimals } = useHerd();

  const processFile = async (selectedFile: File) => {
    setLoading(true);
    
    try {
      const text = await selectedFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        toast.error('Arquivo vazio');
        return;
      }

      // Remove header line
      const dataLines = lines.slice(1);
      const processedItems: ImportItem[] = [];

      dataLines.forEach((line, index) => {
        const columns = line.split(',').map(col => col.trim().replace(/"/g, ''));
        
        if (columns.length < 3) return;

        const item: ImportItem = {
          tag: columns[0] || '',
          name: columns[1] || null,
          reproductive_status: columns[2] || '',
          phase: columns[2] || '',
          observations: columns[3] || '',
          last_calving_date: columns[4] || '',
          days_in_lactation: columns[5] ? parseInt(columns[5]) : null,
          milk_control: columns[6] ? parseFloat(columns[6]) : null,
          expected_calving_interval: columns[7] ? parseInt(columns[7]) : null,
          del_average: columns[8] ? parseFloat(columns[8]) : null,
          birth_date: new Date().toISOString().split('T')[0], // Default birth date
          valid: true,
          errors: []
        };

        // Validações
        if (!item.tag) {
          item.errors.push('Código do animal é obrigatório');
          item.valid = false;
        }

        if (!item.reproductive_status) {
          item.errors.push('Estado reprodutivo/categoria é obrigatório');
          item.valid = false;
        }

        // Validar status reprodutivo
        const validStatuses = ['bezerra', 'novilha', 'vaca lactante', 'vaca seca', 'aberta', 'ciclando', 'gestante', 'dg+', 'dg-', 'seca'];
        if (item.reproductive_status && !validStatuses.includes(item.reproductive_status.toLowerCase())) {
          item.reproductive_status = item.reproductive_status.toLowerCase();
        }

        // Validar data
        if (item.last_calving_date && !isValidDate(item.last_calving_date)) {
          item.errors.push('Data do último parto inválida (use YYYY-MM-DD)');
          item.valid = false;
        }

        processedItems.push(item);
      });

      setPreview(processedItems);
      toast.success(`${processedItems.length} linhas processadas`);
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Erro ao processar arquivo');
    } finally {
      setLoading(false);
    }
  };

  const isValidDate = (dateString: string) => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
        toast.error('Por favor, selecione um arquivo CSV');
        return;
      }
      setFile(selectedFile);
      processFile(selectedFile);
    }
  };

  const handleImport = async () => {
    const validItems = preview.filter(item => item.valid);
    
    if (validItems.length === 0) {
      toast.error('Nenhum item válido para importar');
      return;
    }

    setImporting(true);
    
    try {
      const animalsToImport = validItems.map(item => ({
        tag: item.tag,
        name: item.name,
        phase: item.reproductive_status,
        birth_date: item.birth_date,
        reproductive_status: item.reproductive_status,
        observations: item.observations || undefined,
        last_calving_date: item.last_calving_date || undefined,
        days_in_lactation: item.days_in_lactation || undefined,
        milk_control: item.milk_control || undefined,
        expected_calving_interval: item.expected_calving_interval || undefined,
        del_average: item.del_average || undefined
      }));

      await importAnimals(animalsToImport);
      onClose();
    } catch (error) {
      console.error('Error importing:', error);
      toast.error('Erro ao importar animais');
    } finally {
      setImporting(false);
    }
  };

  const validCount = preview.filter(item => item.valid).length;
  const invalidCount = preview.length - validCount;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar Rebanho</DialogTitle>
          <DialogDescription>
            Importe os dados do rebanho através de um arquivo CSV
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <Label htmlFor="file-upload" className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Clique para selecionar arquivo CSV
                </span>
                <span className="mt-1 block text-xs text-gray-500">
                  Formato: Código, Nome, Estado Reprodutivo, Observações, Data Último Parto, DEL, PPS, Intervalo Parto, Média DEL
                </span>
              </Label>
              <Input
                id="file-upload"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="sr-only"
              />
            </div>
            
            {file && (
              <div className="mt-4 flex items-center justify-center space-x-2">
                <FileText className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-700">{file.name}</span>
              </div>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
              <span className="ml-2 text-sm text-gray-600">Processando arquivo...</span>
            </div>
          )}

          {/* Preview */}
          {preview.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Pré-visualização</h3>
                <div className="flex space-x-2">
                  <Badge variant="outline" className="text-green-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {validCount} válidos
                  </Badge>
                  {invalidCount > 0 && (
                    <Badge variant="outline" className="text-red-600">
                      <XCircle className="w-4 h-4 mr-1" />
                      {invalidCount} com erro
                    </Badge>
                  )}
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>DEL</TableHead>
                      <TableHead>PPS</TableHead>
                      <TableHead>Erros</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.slice(0, 10).map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {item.valid ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                        </TableCell>
                        <TableCell>{item.tag}</TableCell>
                        <TableCell>{item.name || '-'}</TableCell>
                        <TableCell>{item.reproductive_status}</TableCell>
                        <TableCell>{item.days_in_lactation || '-'}</TableCell>
                        <TableCell>{item.milk_control || '-'}</TableCell>
                        <TableCell>
                          {item.errors.length > 0 && (
                            <div className="text-xs text-red-600">
                              {item.errors.join(', ')}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {preview.length > 10 && (
                <p className="text-sm text-gray-500 text-center">
                  Mostrando 10 de {preview.length} itens
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleImport}
              disabled={validCount === 0 || importing}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {importing ? 'Importando...' : `Importar ${validCount} animais`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HerdImporter;

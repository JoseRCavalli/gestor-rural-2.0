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
import * as XLSX from 'xlsx';

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
      let dataLines: string[][] = []
      
      // Check if it's an Excel file
      if (selectedFile.name.toLowerCase().endsWith('.xlsx') || selectedFile.name.toLowerCase().endsWith('.xls')) {
        console.log('Processing Excel file:', selectedFile.name);
        
        const arrayBuffer = await selectedFile.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        
        // Get the first worksheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to array of arrays
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
        console.log(jsonData)
        dataLines = jsonData as string[][];
        
        console.log('Excel data processed:', dataLines.length, 'rows');
      } else {
        // Process CSV file
        console.log('Processing CSV file:', selectedFile.name);
        const text = await selectedFile.text();
        const lines = text.split('\n').filter(line => line.trim());

        if (lines.length === 0) {
          toast.error('Arquivo vazio');
          return;
        }

        dataLines = lines.map(line => 
          line.split(',').map(col => col.trim().replace(/"/g, ''))
        );
      }

      if (dataLines.length === 0) {
        toast.error('Arquivo vazio ou formato não reconhecido');
        return;
      }

      console.log(dataLines);

      // Remove header line (first row is usually headers)
      const processedItems: ImportItem[] = [];
      const startIndex = 1;

      dataLines.slice(startIndex).forEach((columns, index) => {

        const rawItem = columns.at(0).toString().split(';');

        // Mapear campos do arquivo
        const item: ImportItem = {
          tag: rawItem[0]?.toString() || '',
          name: rawItem[1]?.toString() || null,
          reproductive_status: rawItem[2].toString() || '',
          phase: mapPhase(rawItem[3]?.toString() || ''),
          observations: rawItem[4]?.toString() || '',
          last_calving_date: rawItem[5]?.toString() || '',
          days_in_lactation: rawItem[6] ? parseInt(rawItem[6].toString()) : null,
          milk_control: rawItem[7] ? parseFloat(rawItem[7].toString()) : null,
          expected_calving_interval: rawItem[8] ? parseInt(rawItem[8].toString()) : null,
          del_average: rawItem[9] ? parseFloat(rawItem[9].toString()) : null,
          birth_date: generateBirthDate(columns[2]?.toString() || ''),
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

        // Validar e converter data do último parto
        if (item.last_calving_date) {
          const convertedDate = convertDateToISO(item.last_calving_date);
          if (!convertedDate) {
            item.errors.push('Data do último parto inválida (use DD/MM/YYYY ou YYYY-MM-DD)');
            item.valid = false;
          } else {
            item.last_calving_date = convertedDate;
          }
        }

        // Validar DEL e PPS se fornecidos
        if (item.days_in_lactation !== null && (item.days_in_lactation < 0 || item.days_in_lactation > 999)) {
          item.errors.push('DEL deve estar entre 0 e 999 dias');
          item.valid = false;
        }

        if (item.milk_control !== null && item.milk_control < 0) {
          item.errors.push('PPS deve ser um valor positivo');
          item.valid = false;
        }

        processedItems.push(item);
      });

      setPreview(processedItems);
      toast.success(`${processedItems.length} linhas processadas`);
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Erro ao processar arquivo. Verifique se o formato está correto.');
    } finally {
      setLoading(false);
    }
  };

  const mapPhase = (reproductiveStatus: string): string => {
    const status = reproductiveStatus.toLowerCase().trim();
    
    // Mapear estados reprodutivos para fases do sistema
    if (status.includes('bezerra') || status.includes('bezerr')) {
      return 'bezerra';
    }
    if (status.includes('novilha') || status.includes('novill')) {
      return 'novilha';
    }
    if (status.includes('lactante') || status.includes('lactação') || status.includes('ordenhando')) {
      return 'vaca_lactante';
    }
    if (status.includes('seca') || status.includes('gestante') || status.includes('prenha')) {
      return 'vaca_seca';
    }

    // Padrão para casos não identificados
    return 'vaca_seca';
  };

  const generateBirthDate = (reproductiveStatus: string): string => {
    const today = new Date();
    const status = reproductiveStatus.toLowerCase().trim();
    
    // Estimar idade baseada no status reprodutivo
    let ageInMonths = 24; // Padrão para vaca adulta
    
    if (status.includes('bezerra') || status.includes('bezerr')) {
      ageInMonths = 6; // 6 meses
    } else if (status.includes('novilha') || status.includes('novill')) {
      ageInMonths = 18; // 18 meses
    } else if (status.includes('lactante') || status.includes('seca') || status.includes('gestante')) {
      ageInMonths = 36; // 3 anos
    }
    
    const birthDate = new Date(today);
    birthDate.setMonth(birthDate.getMonth() - ageInMonths);
    
    return birthDate.toISOString().split('T')[0];
  };

  const convertDateToISO = (dateString: string): string | null => {
    if (!dateString.trim()) return null;
    
    // Formato DD/MM/YYYY
    const ddmmyyyyRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const ddmmMatch = dateString.match(ddmmyyyyRegex);
    
    if (ddmmMatch) {
      const [, day, month, year] = ddmmMatch;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      
      // Validar se a data é válida
      if (date.getFullYear() == parseInt(year) &&
          date.getMonth() == parseInt(month) - 1 &&
          date.getDate() == parseInt(day)) {
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }
    
    // Formato YYYY-MM-DD
    const yyyymmddRegex = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
    const yyyymmMatch = dateString.match(yyyymmddRegex);
    
    if (yyyymmMatch) {
      const [, year, month, day] = yyyymmMatch;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      
      // Validar se a data é válida
      if (date.getFullYear() == parseInt(year) &&
          date.getMonth() == parseInt(month) - 1 &&
          date.getDate() == parseInt(day)) {
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }
    
    return null;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const fileName = selectedFile.name.toLowerCase();
      if (!fileName.endsWith('.csv') && !fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
        toast.error('Por favor, selecione um arquivo CSV, XLSX ou XLS');
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
        phase: item.phase,
        birth_date: item.birth_date,
        reproductive_status: item.reproductive_status,
        observations: item.observations || undefined,
        last_calving_date: item.last_calving_date || undefined,
        days_in_lactation: item.days_in_lactation || undefined,
        milk_control: item.milk_control || undefined,
        expected_calving_interval: item.expected_calving_interval || undefined,
        del_average: item.del_average || undefined,
        batch: 'Lote A'
      }));

      await importAnimals(animalsToImport);
      toast.success(`${validItems.length} animais importados com sucesso!`);
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
            Importe os dados do rebanho através de um arquivo CSV ou Excel
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <Label htmlFor="file-upload" className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Clique para selecionar arquivo CSV ou Excel
                </span>
                <span className="mt-1 block text-xs text-gray-500">
                  Formatos aceitos: .csv, .xlsx, .xls
                </span>
                <span className="mt-1 block text-xs text-gray-500">
                  Formato: Código, Nome, Estado Reprodutivo, Observações, Data Último Parto (DD/MM/YYYY), DEL, PPS, Intervalo Parto, Média DEL
                </span>
              </Label>
              <Input
                id="file-upload"
                type="file"
                accept=".csv,.xlsx,.xls"
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
                      <TableHead>Fase</TableHead>
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
                        <TableCell>{item.phase}</TableCell>
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

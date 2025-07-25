
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileSpreadsheet, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {mapRawToImportPreview} from "@/lib/mappers/stock/mapRawToImportPreview.ts";

export interface ImportPreview {
  name: string;
  code?: string;
  quantity: number;
  unit: string;
  category: string;
  min_stock: number;
  average_cost?: number;
  selling_price?: number;
  reserved_stock?: number;
  available_stock?: number;
  valid: boolean;
  errors: string[];
}


export type RawPreview = {
  name: string;
  code?: string;
  quantity: number;
  unit: string;
  category: string;
  min_stock?: number;
  average_cost?: number;
  selling_price?: number;
  reserved_stock?: number;
  available_stock?: number;
};

const StockImporter = ({ onImportComplete }: { onImportComplete: () => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<ImportPreview[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && (selectedFile.type.includes('spreadsheet') || 
        selectedFile.name.endsWith('.xlsx') || 
        selectedFile.name.endsWith('.xls') || 
        selectedFile.name.endsWith('.csv'))) {
      setFile(selectedFile);
      setShowPreview(false);
      setPreview([]);
    } else {
      toast.error('Por favor, selecione um arquivo Excel (.xlsx, .xls) ou CSV (.csv)');
    }
  };

  const processFile = async () => {
    if (!file || !user) {
      toast.error('Selecione um arquivo primeiro');
      return;
    }

    setUploading(true);

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      // Call edge function to process Excel/CSV
      const { data, error } = await supabase.functions.invoke('process-stock-excel', {
        body: {
          file_data: base64,
          file_name: file.name,
          user_id: user.id
        }
      });

      if (error) {
        console.error('Error processing file:', error);
        toast.error('Erro ao processar arquivo');
        return;
      }

      const dataPreview = data.preview as RawPreview[];
      const previews = dataPreview.map((row: RawPreview) => mapRawToImportPreview(row));

      setPreview(previews || []);
      setShowPreview(true);
      toast.success('Arquivo processado! Revise os dados antes de importar.');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Erro ao fazer upload do arquivo');
    } finally {
      setUploading(false);
    }
  };

  const confirmImport = async () => {
    if (!user) return;

    setUploading(true);
    try {
      const validItems = preview.filter(item => item.valid);
      
      const { data, error } = await supabase.functions.invoke('import-stock-items', {
        body: {
          items: validItems,
          user_id: user.id
        }
      });

      if (error) {
        console.error('Error importing items:', error);
        toast.error('Erro ao importar itens');
        return;
      }

      toast.success(`${validItems.length} itens importados com sucesso!`);
      setFile(null);
      setShowPreview(false);
      setPreview([]);
      onImportComplete();
    } catch (error) {
      console.error('Error importing:', error);
      toast.error('Erro ao importar estoque');
    } finally {
      setUploading(false);
    }
  };

  // Função para formatar valores em Real
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="w-5 h-5" />
          <span>Importar Estoque via Excel/CSV</span>
        </CardTitle>
        <CardDescription>
          Faça upload de uma planilha Excel ou CSV com informações de estoque para importação automática
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showPreview ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="excel-file">Arquivo Excel/CSV</Label>
              <Input
                id="excel-file"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </div>

            {file && (
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                <FileSpreadsheet className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">{file.name}</span>
              </div>
            )}

            <Button 
              onClick={processFile} 
              disabled={!file || uploading}
              className="w-full"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Processar Arquivo
                </>
              )}
            </Button>

            <div className="text-xs text-gray-500 space-y-1">
              <p><strong>Formato esperado da planilha:</strong></p>
              <p>• Coluna A: Código do Item</p>
              <p>• Coluna B: Nome do Item</p>
              <p>• Coluna C: Unidade de Medida (kg, litros, UN, MT, SC, TN...)</p>
              <p>• Coluna D: Categoria (Matéria-prima, Uso e Consumo...)</p>
              <p>• Coluna E: Custo Médio (R$)</p>
              <p>• Coluna F: Valor de Venda (R$)</p>
              <p>• Coluna G: Estoque Reservado</p>
              <p>• Coluna H: Estoque Disponível</p>
              <p>• Primeira linha pode ser cabeçalho (será ignorada)</p>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Prévia da Importação</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowPreview(false);
                  setPreview([]);
                }}
              >
                Cancelar
              </Button>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {preview.map((item, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    item.valid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        {item.valid ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                        )}
                        <span className="font-medium">{item.name}</span>
                        {item.code && <span className="text-sm text-gray-500">({item.code})</span>}
                      </div>
                      <div className="mt-1 space-y-1">
                        <p className="text-sm text-gray-600">
                          {item.unit} - {item.category}
                        </p>
                        {item.average_cost && (
                          <p className="text-sm text-gray-600">
                            Custo Médio: {formatCurrency(item.average_cost)}
                          </p>
                        )}
                        {item.selling_price && (
                          <p className="text-sm text-gray-600">
                            Vl. Venda: {formatCurrency(item.selling_price)}
                          </p>
                        )}
                        {item.reserved_stock && (
                          <p className="text-sm text-gray-600">
                            Est. Reservado: {item.reserved_stock} {item.unit}
                            {item.average_cost && (
                              <span className="text-green-600 ml-2">
                                ({formatCurrency(item.reserved_stock * item.average_cost)})
                              </span>
                            )}
                          </p>
                        )}
                        {item.available_stock && (
                          <p className="text-sm text-gray-600">
                            Est. Disponível: {item.available_stock} {item.unit}
                            {item.average_cost && (
                              <span className="text-blue-600 ml-2">
                                ({formatCurrency(item.available_stock * item.average_cost)})
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                      {!item.valid && item.errors.length > 0 && (
                        <div className="mt-2">
                          {item.errors.map((error, i) => (
                            <p key={i} className="text-xs text-red-600">• {error}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {preview.filter(item => item.valid).length} de {preview.length} itens serão importados.
                Itens com erro serão ignorados.
              </AlertDescription>
            </Alert>

            <Button 
              onClick={confirmImport} 
              disabled={uploading || preview.filter(item => item.valid).length === 0}
              className="w-full"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Confirmar Importação
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StockImporter;

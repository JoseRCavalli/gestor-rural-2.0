
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const StockImporter = ({ onImportComplete }: { onImportComplete: () => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      toast.error('Por favor, selecione um arquivo PDF válido');
    }
  };

  const handleUpload = async () => {
    if (!file || !user) {
      toast.error('Selecione um arquivo PDF primeiro');
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

      // Call edge function to process PDF
      const { data, error } = await supabase.functions.invoke('process-stock-pdf', {
        body: {
          pdf_data: base64,
          user_id: user.id
        }
      });

      if (error) {
        console.error('Error processing PDF:', error);
        toast.error('Erro ao processar PDF');
        return;
      }

      toast.success(`${data.imported_count} itens importados com sucesso!`);
      setFile(null);
      onImportComplete();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Erro ao fazer upload do arquivo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="w-5 h-5" />
          <span>Importar Estoque via PDF</span>
        </CardTitle>
        <CardDescription>
          Faça upload de um PDF com informações de estoque para importação automática
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="pdf-file">Arquivo PDF</Label>
          <Input
            id="pdf-file"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </div>

        {file && (
          <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
            <FileText className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-700">{file.name}</span>
          </div>
        )}

        <Button 
          onClick={handleUpload} 
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
              <Upload className="w-4 h-4 mr-2" />
              Importar Estoque
            </>
          )}
        </Button>

        <div className="text-xs text-gray-500 space-y-1">
          <p>• O PDF deve conter informações de estoque em formato de tabela</p>
          <p>• Colunas suportadas: Nome, Quantidade, Unidade, Categoria, Estoque Mínimo</p>
          <p>• O sistema irá identificar automaticamente os dados</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StockImporter;


import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import * as XLSX from 'xlsx';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ImportItem {
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { file_data, file_name, user_id } = await req.json();

    if (!file_data || !user_id) {
      return new Response(
        JSON.stringify({ error: 'Dados do arquivo e user_id são obrigatórios' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Processing file:', file_name);

    // Remove data URL prefix if present
    let base64Data = file_data;
    if (file_data.includes(',')) {
      base64Data = file_data.split(',')[1];
    }
    
    // Decode base64 to binary
    const fileBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    let extractedData: string[][] = [];

    if (file_name.toLowerCase().endsWith('.xlsx') || file_name.toLowerCase().endsWith('.xls')) {
      console.log('Processing Excel file');

      // Ler arquivo como workbook (a partir de buffer base64 decodificado)
      const workbook = XLSX.read(fileBytes, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Converte a planilha em matriz de arrays (linhas e colunas)
      extractedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    }

    else if (file_name.toLowerCase().endsWith('.csv')) {
      console.log('Processing CSV file');
      const textContent = new TextDecoder('utf-8').decode(fileBytes);
      const lines = textContent.split(/\r?\n/).filter(line => line.trim());
      
      extractedData = lines.map(line => {
        // Handle both comma and semicolon separators, and quoted fields
        const separator = line.includes(';') ? ';' : ',';
        const regex = new RegExp(`(?:^|${separator})("(?:[^"]+|"")*"|[^${separator}]*)`, 'g');
        const result = [];
        let match;
        
        while ((match = regex.exec(line)) !== null) {
          let value = match[1];
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1).replace(/""/g, '"');
          }
          result.push(value.trim());
        }
        
        return result;
      });
    }
    // For Excel files, we need to use a more sophisticated approach
     else {
      return new Response(
        JSON.stringify({ error: 'Formato de arquivo não suportado. Use CSV (.csv)' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Extracted data rows:', extractedData.length);

    if (extractedData.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Arquivo vazio ou formato não reconhecido' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Process and validate data
    const preview: ImportItem[] = [];
    
    // Check if first row contains headers
    const firstRow = extractedData[0];
    const hasHeaders = firstRow.some(cell => 
      cell && (
        cell.toLowerCase().includes('código') || 
        cell.toLowerCase().includes('nome') || 
        cell.toLowerCase().includes('item') ||
        cell.toLowerCase().includes('produto') ||
        cell.toLowerCase().includes('unidade') ||
        cell.toLowerCase().includes('categoria') ||
        cell.toLowerCase().includes('custo') ||
        cell.toLowerCase().includes('venda') ||
        cell.toLowerCase().includes('reservado') ||
        cell.toLowerCase().includes('disponível')
      )
    );
    
    const startRow = hasHeaders ? 1 : 0;
    console.log('Has headers:', hasHeaders, 'Starting from row:', startRow);

    for (let i = startRow; i < extractedData.length && i < startRow + 100; i++) {
      const row = extractedData[i];
      if (!row || row.length < 2) continue; // Skip rows with insufficient data

      const item: ImportItem = {
        name: '',
        code: '',
        quantity: 0,
        unit: 'kg',
        category: 'Geral',
        min_stock: 0,
        average_cost: 0,
        selling_price: 0,
        reserved_stock: 0,
        available_stock: 0,
        valid: true,
        errors: []
      };

      // Column mapping based on expected format:
      // A: Código, B: Nome, C: Unidade, D: Categoria, E: Custo Médio, F: Vl. Venda, G: Est. Reservado, H: Est. Disponível
      let codeIndex = 0;
      let nameIndex = 1;
      let unitIndex = 2;
      let categoryIndex = 3;
      let avgCostIndex = 4;
      let sellingPriceIndex = 5;
      let reservedStockIndex = 6;
      let availableStockIndex = 7;

      // If we have headers, try to find the right columns
      if (hasHeaders && extractedData[0]) {
        const headers = extractedData[0].map(h => h.toLowerCase());
        
        const codeHeaderIndex = headers.findIndex(h => 
          h.includes('código') || h.includes('codigo')
        );
        const nameHeaderIndex = headers.findIndex(h => 
          h.includes('nome') || h.includes('item') || h.includes('produto')
        );
        const unitHeaderIndex = headers.findIndex(h => 
          h.includes('unidade') || h.includes('un') || h.includes('medida')
        );
        const categoryHeaderIndex = headers.findIndex(h => 
          h.includes('categoria') || h.includes('tipo') || h.includes('grupo')
        );
        const avgCostHeaderIndex = headers.findIndex(h => 
          h.includes('custo') && h.includes('médio') || h.includes('custo medio')
        );
        const sellingPriceHeaderIndex = headers.findIndex(h => 
          h.includes('venda') || h.includes('preço') || h.includes('preco')
        );
        const reservedStockHeaderIndex = headers.findIndex(h => 
          h.includes('reservado')
        );
        const availableStockHeaderIndex = headers.findIndex(h => 
          h.includes('disponível') || h.includes('disponivel')
        );

        if (codeHeaderIndex >= 0) codeIndex = codeHeaderIndex;
        if (nameHeaderIndex >= 0) nameIndex = nameHeaderIndex;
        if (unitHeaderIndex >= 0) unitIndex = unitHeaderIndex;
        if (categoryHeaderIndex >= 0) categoryIndex = categoryHeaderIndex;
        if (avgCostHeaderIndex >= 0) avgCostIndex = avgCostHeaderIndex;
        if (sellingPriceHeaderIndex >= 0) sellingPriceIndex = sellingPriceHeaderIndex;
        if (reservedStockHeaderIndex >= 0) reservedStockIndex = reservedStockHeaderIndex;
        if (availableStockHeaderIndex >= 0) availableStockIndex = availableStockHeaderIndex;
      }

      // Extract data
      item.code = (row[codeIndex] || '').toString().trim();
      item.name = (row[nameIndex] || '').toString().trim();
      item.unit = (row[unitIndex] || '').toString().trim() || 'kg';
      item.category = (row[categoryIndex] || '').toString().trim() || 'Geral';

      // Parse numeric values
      const parseNumericValue = (value: string) => {
        if (!value) return 0;
        // Replace comma with dot and remove non-numeric characters except dots
        const cleanValue = value.toString().replace(',', '.').replace(/[^\d.-]/g, '');
        const parsed = parseFloat(cleanValue);
        return isNaN(parsed) ? 0 : parsed;
      };

      item.average_cost = parseNumericValue(row[avgCostIndex] || '0');
      item.selling_price = parseNumericValue(row[sellingPriceIndex] || '0');
      item.reserved_stock = Math.floor(parseNumericValue(row[reservedStockIndex] || '0'));
      item.available_stock = Math.floor(parseNumericValue(row[availableStockIndex] || '0'));

      // Set quantity as sum of reserved and available stock or available stock if no reserved
      item.quantity = Math.max(item.available_stock, item.reserved_stock + item.available_stock);
      
      // Set min_stock as 20% of total quantity
      item.min_stock = Math.max(1, Math.floor(item.quantity * 0.2));

      // Validate name
      if (!item.name || item.name.length < 2) {
        item.errors.push('Nome do item deve ter pelo menos 2 caracteres');
        item.valid = false;
      }

      console.log(`Row ${i}: ${item.name} (${item.code}) - Qty: ${item.quantity} - Valid: ${item.valid}`);
      preview.push(item);
    }

    console.log('Processed items:', preview.length, 'Valid items:', preview.filter(item => item.valid).length);

    return new Response(
      JSON.stringify({ 
        success: true, 
        preview,
        total_rows: preview.length,
        valid_rows: preview.filter(item => item.valid).length,
        has_headers: hasHeaders
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error processing file:', error);
    
    return new Response(
      JSON.stringify({ error: 'Erro ao processar arquivo: ' + error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

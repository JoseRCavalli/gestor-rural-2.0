
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ImportItem {
  name: string;
  quantity: number;
  unit: string;
  category: string;
  min_stock: number;
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

    // Remove data URL prefix
    const base64Data = file_data.replace(/^data:[^;]+;base64,/, '');
    
    // Decode base64 to binary
    const fileBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    let extractedData: string[][] = [];

    // Process CSV files
    if (file_name.toLowerCase().endsWith('.csv')) {
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
    else if (file_name.toLowerCase().endsWith('.xlsx') || file_name.toLowerCase().endsWith('.xls')) {
      console.log('Processing Excel file');
      
      // For now, we'll provide example data and suggest the user to convert to CSV
      // In a production environment, you'd use a library like sheetjs
      return new Response(
        JSON.stringify({ 
          error: 'Para arquivos Excel, por favor converta para CSV primeiro. Em breve suportaremos Excel diretamente.',
          suggestion: 'Abra seu arquivo Excel, vá em Arquivo > Salvar Como > CSV (separado por vírgulas)'
        }),
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
        cell.toLowerCase().includes('nome') || 
        cell.toLowerCase().includes('item') ||
        cell.toLowerCase().includes('produto') ||
        cell.toLowerCase().includes('quantidade') ||
        cell.toLowerCase().includes('estoque')
      )
    );
    
    const startRow = hasHeaders ? 1 : 0;
    console.log('Has headers:', hasHeaders, 'Starting from row:', startRow);

    for (let i = startRow; i < extractedData.length && i < startRow + 50; i++) { // Limit to 50 items for preview
      const row = extractedData[i];
      if (!row || row.length < 2) continue; // Skip rows with insufficient data

      const item: ImportItem = {
        name: '',
        quantity: 0,
        unit: 'kg',
        category: 'Geral',
        min_stock: 0,
        valid: true,
        errors: []
      };

      // Try to map columns intelligently
      let nameIndex = 0;
      let quantityIndex = 1;
      let unitIndex = 2;
      let categoryIndex = 3;
      let minStockIndex = 4;

      // If we have headers, try to find the right columns
      if (hasHeaders && extractedData[0]) {
        const headers = extractedData[0].map(h => h.toLowerCase());
        
        const nameHeaderIndex = headers.findIndex(h => 
          h.includes('nome') || h.includes('item') || h.includes('produto')
        );
        const quantityHeaderIndex = headers.findIndex(h => 
          h.includes('quantidade') || h.includes('qtd') || h.includes('estoque')
        );
        const unitHeaderIndex = headers.findIndex(h => 
          h.includes('unidade') || h.includes('un') || h.includes('medida')
        );
        const categoryHeaderIndex = headers.findIndex(h => 
          h.includes('categoria') || h.includes('tipo') || h.includes('grupo')
        );
        const minStockHeaderIndex = headers.findIndex(h => 
          h.includes('mínimo') || h.includes('min') || h.includes('limite')
        );

        if (nameHeaderIndex >= 0) nameIndex = nameHeaderIndex;
        if (quantityHeaderIndex >= 0) quantityIndex = quantityHeaderIndex;
        if (unitHeaderIndex >= 0) unitIndex = unitHeaderIndex;
        if (categoryHeaderIndex >= 0) categoryIndex = categoryHeaderIndex;
        if (minStockHeaderIndex >= 0) minStockIndex = minStockHeaderIndex;
      }

      // Extract data
      item.name = (row[nameIndex] || '').toString().trim();
      
      // Validate and parse quantity
      const quantityStr = (row[quantityIndex] || '').toString().replace(/[^\d.,]/g, '').replace(',', '.');
      const quantity = parseFloat(quantityStr);
      if (!quantityStr || isNaN(quantity) || quantity < 0) {
        item.errors.push('Quantidade inválida ou ausente');
        item.valid = false;
      } else {
        item.quantity = Math.floor(quantity);
      }

      // Set unit
      item.unit = (row[unitIndex] || '').toString().trim() || 'kg';

      // Set category
      item.category = (row[categoryIndex] || '').toString().trim() || 'Geral';

      // Validate and parse min_stock
      const minStockStr = (row[minStockIndex] || '').toString().replace(/[^\d.,]/g, '').replace(',', '.');
      const minStock = parseFloat(minStockStr);
      if (!minStockStr || isNaN(minStock) || minStock < 0) {
        item.min_stock = Math.max(1, Math.floor(item.quantity * 0.2)); // Default to 20% of quantity
      } else {
        item.min_stock = Math.floor(minStock);
      }

      // Validate name
      if (!item.name || item.name.length < 2) {
        item.errors.push('Nome do item deve ter pelo menos 2 caracteres');
        item.valid = false;
      }

      console.log(`Row ${i}: ${item.name} - ${item.quantity} ${item.unit} - Valid: ${item.valid}`);
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
    console.error('Error processing Excel/CSV:', error);
    
    return new Response(
      JSON.stringify({ error: 'Erro ao processar arquivo: ' + error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

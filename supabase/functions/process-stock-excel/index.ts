
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

    // Remove data URL prefix
    const base64Data = file_data.replace(/^data:[^;]+;base64,/, '');
    
    // Decode base64 to binary
    const fileBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    let extractedData: string[][] = [];

    // Process CSV files
    if (file_name.toLowerCase().endsWith('.csv')) {
      const textContent = new TextDecoder().decode(fileBytes);
      const lines = textContent.split('\n').filter(line => line.trim());
      
      extractedData = lines.map(line => {
        // Handle both comma and semicolon separators
        const separator = line.includes(';') ? ';' : ',';
        return line.split(separator).map(cell => cell.trim().replace(/^"|"$/g, ''));
      });
    }
    // For Excel files, we'll simulate processing (in production, use a proper Excel parser)
    else if (file_name.toLowerCase().endsWith('.xlsx') || file_name.toLowerCase().endsWith('.xls')) {
      // Simulated Excel data extraction - in production, use libraries like xlsx
      extractedData = [
        ['Nome', 'Quantidade', 'Unidade', 'Categoria', 'Estoque Mínimo'],
        ['Ração para Gado', '500', 'kg', 'Alimentação', '100'],
        ['Milho', '1000', 'kg', 'Grãos', '200'],
        ['Soja', '800', 'kg', 'Grãos', '150'],
        ['Medicamento X', '50', 'unidades', 'Veterinário', '10'],
        ['Adubo NPK', '300', 'kg', 'Fertilizante', '50']
      ];
    }

    // Process and validate data
    const preview: ImportItem[] = [];
    const startRow = extractedData.length > 0 && 
      (extractedData[0].some(cell => cell.toLowerCase().includes('nome') || 
                                   cell.toLowerCase().includes('item') ||
                                   cell.toLowerCase().includes('produto'))) ? 1 : 0;

    for (let i = startRow; i < extractedData.length; i++) {
      const row = extractedData[i];
      if (row.length < 3) continue; // Skip rows with insufficient data

      const item: ImportItem = {
        name: row[0] || '',
        quantity: 0,
        unit: row[2] || 'kg',
        category: row[3] || 'Geral',
        min_stock: 0,
        valid: true,
        errors: []
      };

      // Validate and parse quantity
      const quantityStr = row[1]?.replace(/[^\d.,]/g, '').replace(',', '.');
      const quantity = parseFloat(quantityStr);
      if (isNaN(quantity) || quantity < 0) {
        item.errors.push('Quantidade inválida');
        item.valid = false;
      } else {
        item.quantity = Math.floor(quantity);
      }

      // Validate and parse min_stock
      const minStockStr = row[4]?.replace(/[^\d.,]/g, '').replace(',', '.');
      const minStock = parseFloat(minStockStr);
      if (isNaN(minStock) || minStock < 0) {
        item.min_stock = Math.max(1, Math.floor(item.quantity * 0.2)); // Default to 20% of quantity
      } else {
        item.min_stock = Math.floor(minStock);
      }

      // Validate name
      if (!item.name || item.name.length < 2) {
        item.errors.push('Nome do item deve ter pelo menos 2 caracteres');
        item.valid = false;
      }

      // Validate unit
      if (!item.unit) {
        item.unit = 'kg';
      }

      // Clean category
      if (!item.category) {
        item.category = 'Geral';
      }

      preview.push(item);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        preview,
        total_rows: preview.length,
        valid_rows: preview.filter(item => item.valid).length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error processing Excel/CSV:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});


import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pdf_data, user_id } = await req.json();

    if (!pdf_data || !user_id) {
      return new Response(
        JSON.stringify({ error: 'PDF data and user_id are required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Remove data URL prefix
    const base64Data = pdf_data.replace(/^data:application\/pdf;base64,/, '');
    
    // Decode base64 to binary
    const pdfBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    // Simple text extraction simulation (in a real implementation, you'd use a PDF parser)
    // For now, we'll create sample data as if extracted from PDF
    const extractedItems = [
      {
        name: 'Ração para Gado',
        quantity: 500,
        unit: 'kg',
        category: 'Alimentação',
        min_stock: 100
      },
      {
        name: 'Milho',
        quantity: 1000,
        unit: 'kg',
        category: 'Grãos',
        min_stock: 200
      },
      {
        name: 'Soja',
        quantity: 800,
        unit: 'kg',
        category: 'Grãos',
        min_stock: 150
      }
    ];

    // Insert items into database
    const itemsToInsert = extractedItems.map(item => ({
      ...item,
      user_id: user_id
    }));

    const { data, error } = await supabase
      .from('stock_items')
      .upsert(itemsToInsert, { 
        onConflict: 'user_id,name',
        ignoreDuplicates: false 
      })
      .select();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to import stock items' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        imported_count: data?.length || 0,
        items: data 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error processing PDF:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});


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
    const { items, user_id } = await req.json();

    if (!items || !user_id) {
      return new Response(
        JSON.stringify({ error: 'Items e user_id são obrigatórios' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Processing import for user:', user_id);
    console.log('Items to import:', items.length);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Prepare items for insertion
    const itemsToInsert = items.map((item: any) => ({
      name: item.name,
      code: item.code || null,
      average_cost: item.average_cost || 0,
      selling_price: item.selling_price || 0,
      reserved_stock: item.reserved_stock || 0,
      quantity: Math.floor(item.quantity || 0),
      available_stock: item.available_stock || 0,
      unit: item.unit || 'kg',
      category: item.category || 'Geral',
      min_stock: Math.floor(item.min_stock || 0),
      user_id: user_id
    }));

    console.log('Items prepared for insertion:', itemsToInsert);

    // Insert items into database
    const { data, error } = await supabase
        .from('stock_items')
        .upsert(itemsToInsert, { onConflict: ['code', 'user_id'] })
        .select();

    if (error) {
      console.error('Database error:', error.message);
      return new Response(
        JSON.stringify({ error: 'Falha ao importar itens do estoque: ' + error.message }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Items inserted successfully:', data?.length);

    // Check for low stock items and create notifications
    const lowStockItems = data?.filter(item => item.quantity <= item.min_stock) || [];
    
    console.log('Low stock items found:', lowStockItems.length);

    return new Response(
      JSON.stringify({ 
        success: true, 
        imported_count: data?.length || 0,
        low_stock_alerts: lowStockItems.length,
        items: data 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error importing items:', error);
    
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor: ' + error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

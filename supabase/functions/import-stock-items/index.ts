
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

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Prepare items for insertion
    const itemsToInsert = items.map((item: any) => ({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      category: item.category,
      min_stock: item.min_stock,
      user_id: user_id
    }));

    // Insert items into database
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
        JSON.stringify({ error: 'Falha ao importar itens do estoque' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check for low stock items and create notifications
    const lowStockItems = data?.filter(item => item.quantity <= item.min_stock) || [];
    
    if (lowStockItems.length > 0) {
      // Send notification for low stock items
      const notificationPromises = lowStockItems.map(item => 
        supabase.functions.invoke('send-notification', {
          body: {
            user_id: user_id,
            title: 'Alerta de Estoque Baixo',
            message: `O item "${item.name}" está com estoque baixo (${item.quantity} ${item.unit}). Estoque mínimo: ${item.min_stock} ${item.unit}`,
            type: 'stock',
            channel: 'app'
          }
        })
      );

      await Promise.all(notificationPromises);
    }

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
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

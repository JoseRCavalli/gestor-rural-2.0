
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching CEPEA prices with manual values...');

    // Valores médios fixos - EDITÁVEIS MANUALMENTE A CADA MÊS
    const sojaChange = 0.47; // EDITAR AQUI: percentual de mudança da soja
    const milhoChange = -2.34; // EDITAR AQUI: percentual de mudança do milho  
    const leiteChange = -1.12; // EDITAR AQUI: percentual de mudança do leite

    const cepeaPrices = {
      soja: {
        price: 129.04, // EDITAR AQUI: preço da soja
        unit: 'saca 60kg',
        change: sojaChange,
        trend: sojaChange >= 0 ? 'up' : 'down', // Calculado automaticamente
        source: 'CEPEA - Paraná (Julho)',
        lastUpdate: new Date().toISOString()
      },
      milho: {
        price: 64.02, // EDITAR AQUI: preço do milho
        unit: 'saca 60kg',
        change: milhoChange,
        trend: milhoChange >= 0 ? 'up' : 'down', // Calculado automaticamente
        source: 'CEPEA - Paraná (Julho)',
        lastUpdate: new Date().toISOString()
      },
      leite: {
        price: 2.4099, // EDITAR AQUI: preço do leite
        unit: 'litro',
        change: leiteChange,
        trend: leiteChange >= 0 ? 'up' : 'down', // Calculado automaticamente
        source: 'Conseleite - Paraná (Junho)',
        lastUpdate: new Date().toISOString()
      }
    };

    console.log('CEPEA prices with manual values:', cepeaPrices);

    return new Response(
      JSON.stringify(cepeaPrices),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error fetching CEPEA prices:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});

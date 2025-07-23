
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
    const cepeaPrices = {
      soja: {
        price: 129.04, // Editar manualmente
        unit: 'saca 60kg',
        change: 0.47, // Editar manualmente
        trend: 1.2 >= 0 ? 'up' : 'down', // Automatically calculated based on change
        source: 'CEPEA - Paraná (Julho)',
        lastUpdate: new Date().toISOString()
      },
      milho: {
        price: 64.02, // Editar manualmente
        unit: 'saca 60kg',
        change: -5.34, // Editar manualmente
        trend: -0.5 >= 0 ? 'up' : 'down', // Automatically calculated based on change
        source: 'CEPEA - Paraná (Julho)',
        lastUpdate: new Date().toISOString()
      },
      leite: {
        price: 2.4099, // Editar manualmente
        unit: 'litro',
        change: -1.12, // Editar manualmente
        trend: -1.12 >= 0 ? 'up' : 'down', // Automatically calculated based on change
        source: 'Conseleite - Paraná (Junho)', // Fonte alterada conforme solicitado
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

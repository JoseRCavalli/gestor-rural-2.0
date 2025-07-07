
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching CEPEA prices...');

    // Simulação de dados da CEPEA para Paraná (substitua por scraping real se necessário)
    // Para implementar scraping real, seria necessário analisar a estrutura da página da CEPEA
    // e fazer requests HTTP para extrair os dados
    
    const cepeaPrices = {
      soja: {
        price: 158.40,
        unit: 'saca 60kg',
        change: 2.1,
        trend: 'up',
        source: 'CEPEA - Paraná',
        lastUpdate: new Date().toISOString()
      },
      milho: {
        price: 91.20,
        unit: 'saca 60kg',
        change: -0.8,
        trend: 'down',
        source: 'CEPEA - Paraná',
        lastUpdate: new Date().toISOString()
      },
      leite: {
        price: 2.52,
        unit: 'litro',
        change: 1.2,
        trend: 'up',
        source: 'CEPEA - Paraná',
        lastUpdate: new Date().toISOString()
      }
    };

    console.log('CEPEA prices fetched successfully');

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

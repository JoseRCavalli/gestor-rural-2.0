
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
    console.log('Fetching CEPEA prices with automatic percentage calculation...');

    // PREÇOS ATUAIS - EDITAR APENAS ESTES VALORES
    const currentPrices = {
      soja: 137.99,    // EDITAR AQUI: preço atual da soja
      milho: 63.51,    // EDITAR AQUI: preço atual do milho  
      leite: 2.4267    // EDITAR AQUI: preço atual do leite
    };

    // PREÇOS ANTERIORES (para calcular percentual) - EDITAR quando atualizar os preços
    const previousPrices = {
      soja: 129.04,    // EDITAR AQUI: preço anterior da soja
      milho: 64.02,    // EDITAR AQUI: preço anterior do milho
      leite: 2.41     // EDITAR AQUI: preço anterior do leite
    };

    // Função para calcular percentual de mudança
    const calculateChange = (current: number, previous: number): number => {
      return ((current - previous) / previous) * 100;
    };

    // Calcular mudanças automaticamente
    const sojaChange = calculateChange(currentPrices.soja, previousPrices.soja);
    const milhoChange = calculateChange(currentPrices.milho, previousPrices.milho);
    const leiteChange = calculateChange(currentPrices.leite, previousPrices.leite);

    const cepeaPrices = {
      soja: {
        price: currentPrices.soja,
        unit: 'saca 60kg',
        change: parseFloat(sojaChange.toFixed(2)),
        trend: sojaChange >= 0 ? 'up' : 'down',
        source: 'CEPEA - Paraná (Julho)',
        lastUpdate: new Date().toISOString()
      },
      milho: {
        price: currentPrices.milho,
        unit: 'saca 60kg',
        change: parseFloat(milhoChange.toFixed(2)),
        trend: milhoChange >= 0 ? 'up' : 'down',
        source: 'CEPEA - Paraná (Julho)',
        lastUpdate: new Date().toISOString()
      },
      leite: {
        price: currentPrices.leite,
        unit: 'litro',
        change: parseFloat(leiteChange.toFixed(2)),
        trend: leiteChange >= 0 ? 'up' : 'down',
        source: 'Conseleite - Paraná (Julho)',
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

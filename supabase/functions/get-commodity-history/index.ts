
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
    const { days = 30 } = await req.json();
    console.log(`Generating realistic commodity history for ${days} days`);

    // Preços base reais atuais (sincronizados com get-cepea-prices)
    const currentPrices = {
      soja: 129.04,
      milho: 64.02,
      leite: 2.4099,
      boiGordo: 312.00,
      dolar: 5.57
    };

    // Gerar histórico realista começando de hoje e voltando no tempo
    const history = [];
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      // Variação diária pequena (-1% a +1%) para simular mercado real
      const getDailyVariation = () => (Math.random() - 0.5) * 2;
      
      // Criar variação acumulativa ao longo do tempo
      const daysFactor = i / days;
      const baseVariation = daysFactor * 0.1; // Variação máxima de 10% ao longo do período
      
      const sojaPrice = currentPrices.soja * (1 - baseVariation + getDailyVariation() / 100);
      const milhoPrice = currentPrices.milho * (1 - baseVariation + getDailyVariation() / 100);
      const leitePrice = currentPrices.leite * (1 - baseVariation + getDailyVariation() / 100);
      const boiGordoPrice = currentPrices.boiGordo * (1 - baseVariation + getDailyVariation() / 100);
      const dolarPrice = currentPrices.dolar * (1 - baseVariation + getDailyVariation() / 100);

      history.unshift({ // unshift para ordem cronológica correta
        date: date.toISOString().split('T')[0],
        soja: parseFloat(sojaPrice.toFixed(2)),
        milho: parseFloat(milhoPrice.toFixed(2)),
        leite: parseFloat(leitePrice.toFixed(4)),
        boiGordo: parseFloat(boiGordoPrice.toFixed(2)),
        dolar: parseFloat(dolarPrice.toFixed(2))
      });
    }

    console.log('Realistic commodity history generated successfully');

    return new Response(
      JSON.stringify(history),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error generating commodity history:', error);
    
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

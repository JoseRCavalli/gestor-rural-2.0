
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

    // Preços reais atuais - SINCRONIZADOS com get-cepea-prices
    const currentPrices = {
      soja: 129.04,   // CEPEA - Paraná (Julho)
      milho: 64.02,   // CEPEA - Paraná (Julho)
      leite: 2.4267,  // Conseleite - Paraná (Julho) 
      boiGordo: 312.00, // Valor atual
      dolar: 5.57     // USD/BRL atual
    };

    // Preços históricos há 30 dias (baseados nos valores anteriores reais)
    const prices30DaysAgo = {
      soja: 128.43,   // Valor anterior real usado no cálculo de %
      milho: 65.52,   // Valor anterior real usado no cálculo de %
      leite: 2.41,    // Valor anterior real usado no cálculo de %
      boiGordo: 307.50, // Estimativa realista
      dolar: 5.65     // Estimativa realista
    };

    // Gerar histórico realista com progressão linear entre preços históricos e atuais
    const history = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i)); // Ordem cronológica crescente
      
      // Progressão linear do passado para o presente (0 = 30 dias atrás, 1 = hoje)
      const progress = i / (days - 1);
      
      // Volatilidade diária realística para commodities agrícolas
      const getVolatility = (baseVolatility) => {
        return 1 + (Math.random() - 0.5) * baseVolatility * 2;
      };
      
      // Interpolação linear entre preços históricos e atuais + volatilidade
      const sojaBase = prices30DaysAgo.soja + (currentPrices.soja - prices30DaysAgo.soja) * progress;
      const milhoBase = prices30DaysAgo.milho + (currentPrices.milho - prices30DaysAgo.milho) * progress;
      const leiteBase = prices30DaysAgo.leite + (currentPrices.leite - prices30DaysAgo.leite) * progress;
      const boiGordoBase = prices30DaysAgo.boiGordo + (currentPrices.boiGordo - prices30DaysAgo.boiGordo) * progress;
      const dolarBase = prices30DaysAgo.dolar + (currentPrices.dolar - prices30DaysAgo.dolar) * progress;

      history.push({
        date: date.toISOString().split('T')[0],
        soja: parseFloat((sojaBase * getVolatility(0.015)).toFixed(2)),        // ±1.5% volatilidade
        milho: parseFloat((milhoBase * getVolatility(0.012)).toFixed(2)),      // ±1.2% volatilidade
        leite: parseFloat((leiteBase * getVolatility(0.008)).toFixed(4)),      // ±0.8% volatilidade
        boiGordo: parseFloat((boiGordoBase * getVolatility(0.012)).toFixed(2)), // ±1.2% volatilidade
        dolar: parseFloat((dolarBase * getVolatility(0.025)).toFixed(2))       // ±2.5% volatilidade (mais volátil)
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

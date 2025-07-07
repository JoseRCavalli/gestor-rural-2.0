
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
    const { days = 7 } = await req.json();
    
    console.log(`Generating realistic commodity history for ${days} days`);

    // Base prices for historical data
    const basePrices = {
      soja: 157.80,
      milho: 89.50,
      leite: 2.45,
      boiGordo: 312.00,
      dolar: 5.23
    };

    const history = [];
    const baseDate = new Date();
    
    // Generate realistic historical trend
    let trend = Math.random() > 0.5 ? 1 : -1; // Start with upward or downward trend
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() - i);
      
      // Create realistic market movements with some trend persistence
      const getTrendedVariation = (base: number) => {
        const randomFactor = (Math.random() - 0.5) * 0.02; // ±1% random
        const trendFactor = trend * 0.005; // ±0.5% trend
        return Math.max(base * 0.8, base * (1 + randomFactor + trendFactor));
      };

      // Occasionally reverse trend (20% chance each day)
      if (Math.random() < 0.2) {
        trend *= -1;
      }
      
      history.push({
        date: date.toISOString().split('T')[0],
        soja: parseFloat(getTrendedVariation(basePrices.soja).toFixed(2)),
        milho: parseFloat(getTrendedVariation(basePrices.milho).toFixed(2)),
        leite: parseFloat(getTrendedVariation(basePrices.leite).toFixed(2)),
        boiGordo: parseFloat(getTrendedVariation(basePrices.boiGordo).toFixed(2)),
        dolar: parseFloat(getTrendedVariation(basePrices.dolar).toFixed(2))
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


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
    
    console.log(`Generating commodity history for ${days} days`);

    const history = [];
    const baseDate = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() - i);
      
      // Generate realistic historical data with trends
      const dayVariation = () => (Math.random() - 0.5) * 2;
      
      history.push({
        date: date.toISOString().split('T')[0],
        soja: Math.max(150, 155 + dayVariation() * 5),
        milho: Math.max(85, 89 + dayVariation() * 3),
        leite: Math.max(2.3, 2.45 + dayVariation() * 0.05),
        boiGordo: Math.max(300, 310 + dayVariation() * 8),
        dolar: Math.max(5.0, 5.20 + dayVariation() * 0.1)
      });
    }

    console.log('Commodity history generated successfully');

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

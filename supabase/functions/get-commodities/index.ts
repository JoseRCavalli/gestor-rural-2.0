
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
    console.log('Fetching commodity prices...');

    // For now, we'll use realistic data with some variation
    // In production, you would integrate with actual APIs like CEPEA, B3, etc.
    const baseTime = Date.now();
    const variation = () => (Math.random() - 0.5) * 4; // -2% to +2% variation

    const commodities = [
      {
        name: 'Soja',
        price: 157.80 + variation(),
        unit: 'saca 60kg',
        change: variation(),
        trend: Math.random() > 0.5 ? 'up' : 'down',
        icon: '🌱',
        lastUpdate: new Date().toISOString()
      },
      {
        name: 'Milho',
        price: 89.50 + variation(),
        unit: 'saca 60kg',
        change: variation(),
        trend: Math.random() > 0.5 ? 'up' : 'down',
        icon: '🌽',
        lastUpdate: new Date().toISOString()
      },
      {
        name: 'Leite',
        price: 2.45 + (variation() * 0.1),
        unit: 'litro',
        change: variation(),
        trend: Math.random() > 0.5 ? 'up' : 'down',
        icon: '🥛',
        lastUpdate: new Date().toISOString()
      },
      {
        name: 'Boi Gordo',
        price: 312.00 + variation() * 5,
        unit: '@',
        change: variation(),
        trend: Math.random() > 0.5 ? 'up' : 'down',
        icon: '🐂',
        lastUpdate: new Date().toISOString()
      },
      {
        name: 'Dólar',
        price: 5.23 + (variation() * 0.05),
        unit: 'R$',
        change: variation(),
        trend: Math.random() > 0.5 ? 'up' : 'down',
        icon: '💵',
        lastUpdate: new Date().toISOString()
      }
    ];

    // Ensure trend matches change direction
    commodities.forEach(commodity => {
      commodity.trend = commodity.change >= 0 ? 'up' : 'down';
      commodity.change = Math.abs(commodity.change);
      if (commodity.trend === 'down') commodity.change = -commodity.change;
    });

    console.log('Commodity prices fetched successfully');

    return new Response(
      JSON.stringify(commodities),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error fetching commodities:', error);
    
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

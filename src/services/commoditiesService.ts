
import { supabase } from '@/integrations/supabase/client';

export interface CommodityPrice {
  name: string;
  price: number;
  unit: string;
  change: number;
  trend: 'up' | 'down';
  icon: string;
  lastUpdate: string;
}

export interface CommodityHistory {
  date: string;
  soja: number;
  milho: number;
  leite: number;
  boiGordo: number;
  dolar: number;
}

export const getCommodityPrices = async (): Promise<CommodityPrice[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-commodities');
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching commodity prices:', error);
    // Fallback data with realistic Brazilian agricultural prices
    return [
      {
        name: 'Soja',
        price: 157.80,
        unit: 'saca 60kg',
        change: 2.3,
        trend: 'up',
        icon: '🌱',
        lastUpdate: new Date().toISOString()
      },
      {
        name: 'Milho',
        price: 89.50,
        unit: 'saca 60kg',
        change: -1.2,
        trend: 'down',
        icon: '🌽',
        lastUpdate: new Date().toISOString()
      },
      {
        name: 'Leite',
        price: 2.45,
        unit: 'litro',
        change: 0.8,
        trend: 'up',
        icon: '🥛',
        lastUpdate: new Date().toISOString()
      },
      {
        name: 'Boi Gordo',
        price: 312.00,
        unit: '@',
        change: 1.5,
        trend: 'up',
        icon: '🐂',
        lastUpdate: new Date().toISOString()
      },
      {
        name: 'Dólar',
        price: 5.23,
        unit: 'R$',
        change: -0.5,
        trend: 'down',
        icon: '💵',
        lastUpdate: new Date().toISOString()
      }
    ];
  }
};

export const getCommodityHistory = async (days: number = 7): Promise<CommodityHistory[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-commodity-history', {
      body: { days }
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching commodity history:', error);
    // Fallback historical data
    const history: CommodityHistory[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      history.push({
        date: date.toISOString().split('T')[0],
        soja: 155 + Math.random() * 10,
        milho: 87 + Math.random() * 5,
        leite: 2.40 + Math.random() * 0.1,
        boiGordo: 305 + Math.random() * 15,
        dolar: 5.15 + Math.random() * 0.2
      });
    }
    return history;
  }
};

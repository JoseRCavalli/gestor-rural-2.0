import { supabase } from '@/integrations/supabase/client';

export interface CommodityPrice {
  name: string;
  price: number;
  unit: string;
  change: number;
  trend: 'up' | 'down';
  icon: string;
  lastUpdate: string;
  source?: string;
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
    const [cepeaResponse, dollarResponse, generalResponse] = await Promise.all([
      supabase.functions.invoke('get-cepea-prices'),
      supabase.functions.invoke('get-dollar-price'),
      supabase.functions.invoke('get-commodities')
    ]);
    
    const cepeaData = cepeaResponse.data;
    const dollarData = dollarResponse.data;
    const generalData = generalResponse.data;
    
    if (cepeaData && generalData) {
      let commodities = generalData.map((item: CommodityPrice) => {
        if (item.name === 'Soja' && cepeaData.soja) {
          return {
            ...item,
            price: cepeaData.soja.price,
            change: cepeaData.soja.change,
            trend: cepeaData.soja.change >= 0 ? 'up' : 'down', // Fixed trend logic
            source: cepeaData.soja.source
          };
        }
        if (item.name === 'Milho' && cepeaData.milho) {
          return {
            ...item,
            price: cepeaData.milho.price,
            change: cepeaData.milho.change,
            trend: cepeaData.milho.change >= 0 ? 'up' : 'down', // Fixed trend logic
            source: cepeaData.milho.source
          };
        }
        if (item.name === 'Leite' && cepeaData.leite) {
          return {
            ...item,
            price: cepeaData.leite.price,
            change: cepeaData.leite.change,
            trend: cepeaData.leite.change >= 0 ? 'up' : 'down', // Fixed trend logic
            source: cepeaData.leite.source
          };
        }
        if (item.name === 'Dólar' && dollarData) {
          return {
            ...item,
            price: dollarData.price,
            change: dollarData.change,
            trend: dollarData.change >= 0 ? 'up' : 'down', // Fixed trend logic
            source: dollarData.source
          };
        }
        return item;
      });
      
      return commodities;
    }
    
    return generalData || [];
  } catch (error) {
    console.error('Error fetching commodity prices:', error);
    return [
      {
        name: 'Soja',
        price: 158.50,
        unit: 'saca 60kg',
        change: 1.2,
        trend: 'up',
        icon: '🌱',
        lastUpdate: new Date().toISOString(),
        source: 'CEPEA - Paraná'
      },
      {
        name: 'Milho',
        price: 90.00,
        unit: 'saca 60kg',
        change: -0.5,
        trend: 'down',
        icon: '🌽',
        lastUpdate: new Date().toISOString(),
        source: 'CEPEA - Paraná'
      },
      {
        name: 'Leite',
        price: 2.4099,
        unit: 'litro',
        change: -1.12,
        trend: 'down', // Fixed: negative change should be down trend
        icon: '🥛',
        lastUpdate: new Date().toISOString(),
        source: 'Conseleite - Paraná'
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

export const getCommodityHistory = async (days: number = 30): Promise<CommodityHistory[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-commodity-history', {
      body: { days }
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching commodity history:', error);
    // Fallback historical data for 30 days (monthly)
    const history: CommodityHistory[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      history.push({
        date: date.toISOString().split('T')[0],
        soja: 155 + Math.random() * 10,
        milho: 87 + Math.random() * 5,
        leite: 2.40 + Math.random() * 0.3,
        boiGordo: 305 + Math.random() * 15,
        dolar: 5.15 + Math.random() * 0.4
      });
    }
    return history;
  }
};

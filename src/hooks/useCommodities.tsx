
import { useState, useEffect } from 'react';
import { CommodityPrice, CommodityHistory, getCommodityPrices, getCommodityHistory } from '@/services/commoditiesService';

export const useCommodities = () => {
  const [commodities, setCommodities] = useState<CommodityPrice[]>([]);
  const [history, setHistory] = useState<CommodityHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCommodities = async () => {
    try {
      setLoading(true);
      setError(null);
      const [pricesData, historyData] = await Promise.all([
        getCommodityPrices(),
        getCommodityHistory(30) // Alterado para 30 dias (mensal)
      ]);
      setCommodities(pricesData);
      setHistory(historyData);
    } catch (err) {
      setError('Erro ao buscar preços de commodities');
      console.error('Commodities fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommodities();
    
    // Update commodities every hour
    const interval = setInterval(fetchCommodities, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    commodities,
    history,
    loading,
    error,
    refetch: fetchCommodities
  };
};

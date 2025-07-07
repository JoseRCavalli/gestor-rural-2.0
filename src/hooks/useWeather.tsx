
import { useState, useEffect } from 'react';
import { WeatherData, getWeatherData } from '@/services/weatherService';

export const useWeather = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWeatherData();
      setWeather(data);
    } catch (err) {
      setError('Erro ao buscar dados do clima');
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    
    // Update weather every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    weather,
    loading,
    error,
    refetch: fetchWeather
  };
};

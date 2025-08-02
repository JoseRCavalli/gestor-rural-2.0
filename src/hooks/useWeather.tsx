
import { useState, useEffect } from 'react';
import { WeatherData, getWeatherData } from '@/services/weather-service.ts';

export const useWeather = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching weather data...');
      const data = await getWeatherData();
      console.log('Weather data fetched:', data);
      setWeather(data);
    } catch (err) {
      const errorMessage = 'Erro ao buscar dados do clima';
      setError(errorMessage);
      console.error('Weather fetch error:', err);
      
      // Set fallback weather data even on error
      setWeather({
        temperature: 25,
        humidity: 65,
        description: 'Clima indisponível',
        icon: '☀️',
        location: 'Localização não disponível'
      });
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

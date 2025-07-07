
import { supabase } from '@/integrations/supabase/client';

export interface WeatherData {
  temperature: number;
  humidity: number;
  description: string;
  icon: string;
  location: string;
}

export const getWeatherData = async (): Promise<WeatherData> => {
  try {
    // Coordenadas fixas de Vera Cruz do Oeste - Paraná
    const lat = -24.987;
    const lon = -54.246;

    console.log(`Fetching weather for Vera Cruz do Oeste - Paraná: ${lat}, ${lon}`);

    const { data, error } = await supabase.functions.invoke('get-weather', {
      body: { lat, lon }
    });

    if (error) {
      console.error('Weather API error:', error);
      throw error;
    }

    console.log('Weather data received:', data);
    return {
      ...data,
      location: 'Vera Cruz do Oeste - PR'
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    // Return fallback data for better user experience
    return {
      temperature: 25,
      humidity: 65,
      description: 'Dados do clima temporariamente indisponíveis',
      icon: '☀️',
      location: 'Vera Cruz do Oeste - PR'
    };
  }
};


import { supabase } from '@/integrations/supabase/client';

export interface WeatherData {
  temperature: number;
  humidity: number;
  description: string;
  icon: string;
  location: string;
}

export const getWeatherData = async (lat?: number, lon?: number): Promise<WeatherData> => {
  try {
    // Try to get user's location if not provided
    if (!lat || !lon) {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          enableHighAccuracy: true
        });
      });
      lat = position.coords.latitude;
      lon = position.coords.longitude;
    }

    console.log(`Fetching weather for coordinates: ${lat}, ${lon}`);

    const { data, error } = await supabase.functions.invoke('get-weather', {
      body: { lat, lon }
    });

    if (error) {
      console.error('Weather API error:', error);
      throw error;
    }

    console.log('Weather data received:', data);
    return data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    // Return fallback data for better user experience
    return {
      temperature: 25,
      humidity: 65,
      description: 'Dados do clima temporariamente indisponíveis',
      icon: '☀️',
      location: 'Localização não disponível'
    };
  }
};

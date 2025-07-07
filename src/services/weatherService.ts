
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
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      lat = position.coords.latitude;
      lon = position.coords.longitude;
    }

    const { data, error } = await supabase.functions.invoke('get-weather', {
      body: { lat, lon }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    // Fallback data
    return {
      temperature: 25,
      humidity: 65,
      description: 'Tempo bom',
      icon: '☀️',
      location: 'Localização não disponível'
    };
  }
};

import {supabase} from '@/integrations/supabase/client';
import {WeatherType} from "@/lib/types/wheater-type.ts";
import {WarnLevel} from "@/lib/types/wheater-warn.ts";

export const getWeatherData = async (): Promise<WeatherType> => {
  try {
    // Coordenadas fixas de Toledo - Paraná
    const lat = -24.713;
    const lon = -53.743;

    const { data, error } = await supabase.functions.invoke('get-weather', {
      body: { lat, lon }
    });

    if (error) {
      throw error;
    }

    return {
      id: data.id as number,
      main: data.main as string,
      description: data.description as string,
      icon: data.icon as string,
      humidity: data.humidity as number,
      temperature: data.temperature as number,
      location: 'Vera Cruz do Oeste - PR'
    } as WeatherType;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    // Return fallback data for better user experience
    return {
      id: 0,
      temperature: 25,
      main: "Erro",
      humidity: 0,
      description: 'Dados do clima temporariamente indisponíveis',
      icon: '',
      location: '',
    };
  }
};

export const getWarnFromWeather = (weather: WeatherType) => {
    const level = [
        {
            id: [200, 232],
            warnLevel: 'critical',
            message: `Atenção - ${weather?.description}, tome os cuidados necessários!`,
            icon: '⛈️'
        },
        {
            id: [500, 531],
            warnLevel: 'warning',
            message: `Atenção - ${weather?.description}, tome os cuidades necessários!`,
            icon: '🌧️'
        },
    ];

    const match = level.find(
        ({ id }) => weather?.id >= id[0] && weather?.id <= id[1]
    );

    if ((weather?.id === 800 || weather?.id === 801) && weather?.humidity > 85 && weather?.temperature < 1) {
        return {
            id: 900,
            warnLevel: 'critical',
            message: "Atenção - Alerta para possibilidade de geada, tome as precauções necessárias",
            icon: '❄️'
        };
    }

    if (weather?.temperature >= 36 && weather?.humidity >= 60) {
        return {
            id: 900,
            warnLevel: 'critical',
            message: "Atenção - Alerta para calor intenso, tome as precauções necessárias",
            icon: '🔥'
        };
    }

    if (match) {
        return { id: weather?.id, warnLevel: match?.warnLevel, message: match?.message, icon: match?.icon };
    }

    return { id: weather?.id, warnLevel: '', message: "", icon: ''};
}

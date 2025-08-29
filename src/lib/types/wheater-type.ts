export type WeatherType = {
    id: number;
    main: string;
    description: string;
    icon: string;
    humidity: number;
    temperature: number;
    location: string;
}

export enum WeatherMainValues {
    THUNDERSTORM = 'THUNDERSTORM',
    DRIZZLE = 'DRIZZLE',
    RAIN = 'RAIN',
    SNOW = 'SNOW',
    CLEAR = 'CLEAR',
    CLOUDS = 'CLOUDS',
}

export const weatherPlaceholders: Record<string, string> = {
    [WeatherMainValues.THUNDERSTORM]: "Tempestade",
    [WeatherMainValues.DRIZZLE]: "Garoa",
    [WeatherMainValues.RAIN]: "Chuva",
    [WeatherMainValues.SNOW]: "Neve",
    [WeatherMainValues.CLEAR]: "Céu Limpo",
    [WeatherMainValues.CLOUDS]: "Nublado",
};

export const getPlaceholderFromTitleWeather = (title: string) => {
    return weatherPlaceholders[title] || "Clima desconhecido";
};
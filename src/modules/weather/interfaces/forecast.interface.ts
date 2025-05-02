// Define the wind direction as a union of compass points
export type WindDirection =
    | 'N'
    | 'NNE'
    | 'NE'
    | 'ENE'
    | 'E'
    | 'ESE'
    | 'SE'
    | 'SSE'
    | 'S'
    | 'SSW'
    | 'SW'
    | 'WSW'
    | 'W'
    | 'WNW'
    | 'NW'
    | 'NNW';

// Interface for location information
export interface Location {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    tz_id: string;
    localtime_epoch: number;
    localtime: string;
}

// Interface for weather condition
export interface Condition {
    text: string;
    icon: string;
    code: number;
}

// Interface for current weather data
export interface Current {
    last_updated_epoch: number;
    last_updated: string;
    temp_c: number;
    temp_f: number;
    is_day: number;
    condition: Condition;
    wind_mph: number;
    wind_kph: number;
    wind_degree: number;
    wind_dir: WindDirection;
    pressure_mb: number;
    pressure_in: number;
    precip_mm: number;
    precip_in: number;
    humidity: number;
    cloud: number;
    feelslike_c: number;
    feelslike_f: number;
    vis_km: number;
    vis_miles: number;
    uv: number;
    gust_mph: number;
    gust_kph: number;
}

// Interface for hourly forecast data
export interface Hour {
    time_epoch: number;
    time: string;
    temp_c: number;
    temp_f: number;
    is_day: number;
    condition: Condition;
    wind_mph: number;
    wind_kph: number;
    wind_degree: number;
    wind_dir: WindDirection;
    pressure_mb: number;
    pressure_in: number;
    precip_mm: number;
    precip_in: number;
    humidity: number;
    cloud: number;
    feelslike_c: number;
    feelslike_f: number;
    windchill_c: number;
    windchill_f: number;
    heatindex_c: number;
    heatindex_f: number;
    dewpoint_c: number;
    dewpoint_f: number;
    will_it_rain: number;
    chance_of_rain: number;
    will_it_snow: number;
    chance_of_snow: number;
    vis_km: number;
    vis_miles: number;
    gust_mph: number;
    gust_kph: number;
    uv: number;
}

// Interface for daily forecast data
export interface Day {
    maxtemp_c: number;
    maxtemp_f: number;
    mintemp_c: number;
    mintemp_f: number;
    avgtemp_c: number;
    avgtemp_f: number;
    maxwind_mph: number;
    maxwind_kph: number;
    totalprecip_mm: number;
    totalprecip_in: number;
    totalsnow_cm: number;
    avgvis_km: number;
    avgvis_miles: number;
    avghumidity: number;
    daily_will_it_rain: number;
    daily_chance_of_rain: number;
    daily_will_it_snow: number;
    daily_chance_of_snow: number;
    condition: Condition;
    uv: number;
}

// Interface for astronomical data
export interface Astro {
    sunrise: string;
    sunset: string;
    moonrise: string;
    moonset: string;
    moon_phase: string;
    moon_illumination: string;
}

// Interface for forecast day
export interface ForecastDay {
    date: string;
    date_epoch: number;
    day: Day;
    astro: Astro;
    hour: Hour[];
}

// Interface for forecast data
export interface Forecast {
    forecastday: ForecastDay[];
}

// Main interface for the forecast response
export interface ForecastResponse {
    location: Location;
    current: Current;
    forecast: Forecast;
}

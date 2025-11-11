/**
 * Weather Card - Brilliant Blue som i Figma
 * Solid blue background med white text
 */

import { Card, CardContent } from "@/components/ui/card";

export interface WeatherCardProps {
  city: string;
  temperature: number;
  condition: string;
  emoji: string;
  humidity?: number;
  wind?: number;
  forecast?: Array<{
    day: string;
    temp: number;
    emoji: string;
  }>;
}

export function WeatherCard({ 
  city, 
  temperature, 
  condition, 
  emoji,
  humidity,
  wind,
  forecast 
}: WeatherCardProps) {
  return (
    <Card className="overflow-hidden border-0 shadow-lg animate-in fade-in slide-in-from-bottom-3 duration-500">
      <CardContent className="p-0">
        {/* Main weather card - Brilliant Blue */}
        <div className="bg-[#007AFF] text-white p-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-2xl font-semibold">{city}</h3>
              <p className="text-blue-100 text-sm">{condition}</p>
            </div>
            <span className="text-4xl">{emoji}</span>
          </div>
          <div className="text-6xl font-light mt-4">{temperature}°C</div>
        </div>

        {/* Weather details - White background */}
        {(humidity || wind) && (
          <div className="bg-white dark:bg-gray-900 p-4 grid grid-cols-3 gap-4">
            {humidity && (
              <div className="text-center">
                <div className="text-2xl mb-1">💧</div>
                <p className="text-xs text-muted-foreground">Fugtighed</p>
                <p className="text-sm font-semibold">{humidity}%</p>
              </div>
            )}
            {wind && (
              <div className="text-center">
                <div className="text-2xl mb-1">💨</div>
                <p className="text-xs text-muted-foreground">Vind</p>
                <p className="text-sm font-semibold">{wind} km/h</p>
              </div>
            )}
            <div className="text-center">
              <div className="text-2xl mb-1">{emoji}</div>
              <p className="text-xs text-muted-foreground">Vejr</p>
              <p className="text-sm font-semibold">{condition}</p>
            </div>
          </div>
        )}

        {/* Forecast - White background */}
        {forecast && forecast.length > 0 && (
          <div className="bg-white dark:bg-gray-900 border-t p-4">
            <div className="grid grid-cols-3 gap-4">
              {forecast.map((day, idx) => (
                <div key={idx} className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">{day.day}</p>
                  <div className="text-2xl my-1">{day.emoji}</div>
                  <p className="text-sm font-semibold">{day.temp}°C</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

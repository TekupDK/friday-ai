/**
 * WEATHER CARD - Opgraderet
 * Vejr data med forecast og animation
 */

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Cloud,
  CloudRain,
  Sun,
  CloudSnow,
  Wind,
  Droplets,
  Thermometer,
  Eye,
  Gauge,
  Sunrise,
  Sunset,
} from "lucide-react";

export interface WeatherData {
  location: string;
  temperature: number;
  feelsLike: number;
  condition: "sunny" | "cloudy" | "rainy" | "snowy" | "windy";
  description: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
  pressure: number;
  sunrise?: string;
  sunset?: string;
  forecast?: Array<{
    day: string;
    temp: number;
    condition: string;
  }>;
}

interface WeatherCardProps {
  data: WeatherData;
  onRefresh?: () => void;
}

const weatherConfig = {
  sunny: {
    icon: Sun,
    gradient: "from-yellow-400 to-orange-500",
    bg: "from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20",
    color: "text-yellow-600 dark:text-yellow-400",
  },
  cloudy: {
    icon: Cloud,
    gradient: "from-gray-400 to-gray-600",
    bg: "from-gray-50 to-slate-50 dark:from-gray-950/20 dark:to-slate-950/20",
    color: "text-gray-600 dark:text-gray-400",
  },
  rainy: {
    icon: CloudRain,
    gradient: "from-blue-400 to-blue-600",
    bg: "from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20",
    color: "text-blue-600 dark:text-blue-400",
  },
  snowy: {
    icon: CloudSnow,
    gradient: "from-cyan-300 to-blue-400",
    bg: "from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20",
    color: "text-cyan-600 dark:text-cyan-400",
  },
  windy: {
    icon: Wind,
    gradient: "from-teal-400 to-cyan-500",
    bg: "from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20",
    color: "text-teal-600 dark:text-teal-400",
  },
};

export function WeatherCardUpgraded({ data, onRefresh }: WeatherCardProps) {
  const config = weatherConfig[data.condition];
  const WeatherIcon = config.icon;

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        "hover:shadow-xl hover:scale-[1.02]",
        "bg-linear-to-br",
        config.bg
      )}
    >
      {/* Animated background */}
      <div
        className={cn(
          "absolute inset-0 bg-linear-to-br opacity-5",
          config.gradient
        )}
      />

      <div className="relative p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">{data.location}</h3>
            <p className="text-sm text-muted-foreground">{data.description}</p>
          </div>

          {/* Animated Weather Icon */}
          <div
            className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg",
              "bg-linear-to-br",
              config.gradient,
              "animate-pulse"
            )}
          >
            <WeatherIcon className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Temperature - Large */}
        <div className="flex items-baseline gap-2">
          <span className={cn("text-5xl font-bold", config.color)}>
            {Math.round(data.temperature)}°
          </span>
          <div className="text-sm text-muted-foreground">
            <p>Føles som {Math.round(data.feelsLike)}°</p>
          </div>
        </div>

        {/* Weather Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatItem
            icon={Droplets}
            label="Luftfugtighed"
            value={`${data.humidity}%`}
          />
          <StatItem icon={Wind} label="Vind" value={`${data.windSpeed} km/t`} />
          <StatItem
            icon={Eye}
            label="Sigtbarhed"
            value={`${data.visibility} km`}
          />
          <StatItem icon={Gauge} label="Tryk" value={`${data.pressure} hPa`} />
        </div>

        {/* Sun Times */}
        {(data.sunrise || data.sunset) && (
          <div className="flex items-center justify-around pt-3 border-t">
            {data.sunrise && (
              <div className="flex items-center gap-2">
                <Sunrise className="w-4 h-4 text-orange-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Solopgang</p>
                  <p className="text-sm font-medium">{data.sunrise}</p>
                </div>
              </div>
            )}
            {data.sunset && (
              <div className="flex items-center gap-2">
                <Sunset className="w-4 h-4 text-purple-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Solnedgang</p>
                  <p className="text-sm font-medium">{data.sunset}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3-Day Forecast */}
        {data.forecast && data.forecast.length > 0 && (
          <div className="pt-3 border-t space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">
              3-dages vejrudsigt
            </p>
            <div className="grid grid-cols-3 gap-2">
              {data.forecast.map((day, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-lg bg-white/50 dark:bg-slate-800/50 text-center"
                >
                  <p className="text-xs font-medium mb-1">{day.day}</p>
                  <p className="text-lg font-bold">{Math.round(day.temp)}°</p>
                  <p className="text-xs text-muted-foreground">
                    {day.condition}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="w-full py-2 rounded-lg bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-colors text-sm font-medium"
          >
            🔄 Opdater vejr
          </button>
        )}
      </div>
    </Card>
  );
}

function StatItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Droplets;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-white/50 dark:bg-slate-800/50">
      <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <p className="text-sm font-semibold truncate">{value}</p>
      </div>
    </div>
  );
}

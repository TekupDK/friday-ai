import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
  Maximize2
} from "lucide-react"

export interface ChartDataPoint {
  label: string
  value: number
  color?: string
  metadata?: Record<string, any>
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'area' | 'pie' | 'donut'
  data: ChartDataPoint[]
  xAxis?: {
    label?: string
    format?: (value: any) => string
  }
  yAxis?: {
    label?: string
    format?: (value: number) => string
  }
  colors?: string[]
  showGrid?: boolean
  showLegend?: boolean
  animated?: boolean
  height?: number
}

export interface ChartComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  config: ChartConfig
  showControls?: boolean
  onRefresh?: () => void
  onExport?: () => void
  onFullscreen?: () => void
  isLoading?: boolean
  compact?: boolean
}

const defaultColors = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // yellow
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#f97316', // orange
  '#84cc16', // lime
]

function formatValue(value: number, format?: (value: number) => string): string {
  if (format) return format(value)
  return new Intl.NumberFormat('da-DK').format(value)
}

function SimpleBarChart({
  data,
  width,
  height,
  colors,
  showGrid = true,
  animated = true
}: {
  data: ChartDataPoint[]
  width: number
  height: number
  colors: string[]
  showGrid?: boolean
  animated?: boolean
}) {
  const maxValue = Math.max(...data.map(d => d.value))
  const barWidth = (width - 40) / data.length
  const padding = 20

  return (
    <svg width={width} height={height} className="overflow-visible">
      {/* Grid lines */}
      {showGrid && (
        <g>
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <line
              key={i}
              x1={padding}
              y1={padding + (height - 2 * padding) * (1 - ratio)}
              x2={width - padding}
              y2={padding + (height - 2 * padding) * (1 - ratio)}
              stroke="currentColor"
              strokeOpacity={0.1}
              strokeWidth={1}
            />
          ))}
        </g>
      )}

      {/* Bars */}
      {data.map((point, i) => {
        const barHeight = (point.value / maxValue) * (height - 2 * padding)
        const x = padding + i * barWidth + barWidth * 0.1
        const y = height - padding - barHeight

        return (
          <rect
            key={i}
            x={x}
            y={animated ? height - padding : y}
            width={barWidth * 0.8}
            height={animated ? 0 : barHeight}
            fill={point.color || colors[i % colors.length]}
            className={cn(
              "transition-all duration-1000 ease-out",
              animated && "animate-in slide-in-from-bottom-2"
            )}
            style={{
              animationDelay: animated ? `${i * 100}ms` : undefined,
              transform: animated ? `translateY(${barHeight}px)` : undefined
            }}
          />
        )
      })}

      {/* Labels */}
      {data.map((point, i) => {
        const x = padding + i * barWidth + barWidth / 2
        const y = height - padding + 15

        return (
          <text
            key={`label-${i}`}
            x={x}
            y={y}
            textAnchor="middle"
            className="text-xs fill-muted-foreground"
          >
            {point.label}
          </text>
        )
      })}
    </svg>
  )
}

function SimpleLineChart({
  data,
  width,
  height,
  colors,
  showGrid = true,
  animated = true
}: {
  data: ChartDataPoint[]
  width: number
  height: number
  colors: string[]
  showGrid?: boolean
  animated?: boolean
}) {
  const maxValue = Math.max(...data.map(d => d.value))
  const minValue = Math.min(...data.map(d => d.value))
  const range = maxValue - minValue || 1
  const padding = 20

  const points = data.map((point, i) => {
    const x = padding + (i / (data.length - 1)) * (width - 2 * padding)
    const y = padding + ((maxValue - point.value) / range) * (height - 2 * padding)
    return { x, y, ...point }
  })

  const pathData = points.map((point, i) =>
    `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ')

  return (
    <svg width={width} height={height} className="overflow-visible">
      {/* Grid lines */}
      {showGrid && (
        <g>
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <line
              key={`h-${i}`}
              x1={padding}
              y1={padding + (height - 2 * padding) * ratio}
              x2={width - padding}
              y2={padding + (height - 2 * padding) * ratio}
              stroke="currentColor"
              strokeOpacity={0.1}
              strokeWidth={1}
            />
          ))}
        </g>
      )}

      {/* Line */}
      <path
        d={pathData}
        fill="none"
        stroke={colors[0]}
        strokeWidth={2}
        className={cn(
          "transition-all duration-1000 ease-out",
          animated && "animate-in slide-in-from-left-2"
        )}
        style={{
          strokeDasharray: animated ? '1000' : '0',
          strokeDashoffset: animated ? '1000' : '0',
          animation: animated ? 'dash 2s ease-out forwards' : undefined
        }}
      />

      {/* Points */}
      {points.map((point, i) => (
        <circle
          key={i}
          cx={point.x}
          cy={point.y}
          r={4}
          fill={colors[0]}
          className={cn(
            "transition-all duration-500 ease-out",
            animated && "animate-in zoom-in-50"
          )}
          style={{
            animationDelay: animated ? `${i * 200}ms` : undefined
          }}
        />
      ))}

      {/* Labels */}
      {data.map((point, i) => {
        const x = padding + (i / (data.length - 1)) * (width - 2 * padding)
        const y = height - padding + 15

        return (
          <text
            key={`label-${i}`}
            x={x}
            y={y}
            textAnchor="middle"
            className="text-xs fill-muted-foreground"
          >
            {point.label}
          </text>
        )
      })}
    </svg>
  )
}

function SimplePieChart({
  data,
  width,
  height,
  colors,
  animated = true
}: {
  data: ChartDataPoint[]
  width: number
  height: number
  colors: string[]
  animated?: boolean
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  const centerX = width / 2
  const centerY = height / 2
  const radius = Math.min(width, height) / 2 - 20

  let currentAngle = -Math.PI / 2 // Start at top

  return (
    <svg width={width} height={height} className="overflow-visible">
      {data.map((point, i) => {
        const percentage = point.value / total
        const angle = percentage * 2 * Math.PI
        const startAngle = currentAngle
        const endAngle = currentAngle + angle

        const x1 = centerX + radius * Math.cos(startAngle)
        const y1 = centerY + radius * Math.sin(startAngle)
        const x2 = centerX + radius * Math.cos(endAngle)
        const y2 = centerY + radius * Math.sin(endAngle)

        const largeArcFlag = angle > Math.PI ? 1 : 0
        const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`

        currentAngle = endAngle

        return (
          <path
            key={i}
            d={pathData}
            fill={point.color || colors[i % colors.length]}
            className={cn(
              "transition-all duration-1000 ease-out stroke-white stroke-1",
              animated && "animate-in fade-in-50"
            )}
            style={{
              animationDelay: animated ? `${i * 200}ms` : undefined
            }}
          />
        )
      })}

      {/* Center label */}
      <text
        x={centerX}
        y={centerY}
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-sm font-medium fill-foreground"
      >
        {formatValue(total)}
      </text>
    </svg>
  )
}

function ChartLegend({
  data,
  colors
}: {
  data: ChartDataPoint[]
  colors: string[]
}) {
  return (
    <div className="flex flex-wrap gap-4 mt-4">
      {data.map((point, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: point.color || colors[i % colors.length] }}
          />
          <span className="text-sm text-muted-foreground">
            {point.label} ({formatValue(point.value)})
          </span>
        </div>
      ))}
    </div>
  )
}

export function ChartComponent({
  title,
  subtitle,
  config,
  showControls = false,
  onRefresh,
  onExport,
  onFullscreen,
  isLoading = false,
  compact = false,
  className,
  ...props
}: ChartComponentProps) {
  const chartRef = React.useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = React.useState({ width: 400, height: 300 })

  React.useEffect(() => {
    if (chartRef.current) {
      const rect = chartRef.current.getBoundingClientRect()
      setDimensions({
        width: rect.width || 400,
        height: config.height || (compact ? 200 : 300)
      })
    }
  }, [config.height, compact])

  const colors = config.colors || defaultColors

  const renderChart = () => {
    const { width, height } = dimensions

    switch (config.type) {
      case 'bar':
        return (
          <SimpleBarChart
            data={config.data}
            width={width}
            height={height}
            colors={colors}
            showGrid={config.showGrid}
            animated={config.animated}
          />
        )
      case 'line':
      case 'area':
        return (
          <SimpleLineChart
            data={config.data}
            width={width}
            height={height}
            colors={colors}
            showGrid={config.showGrid}
            animated={config.animated}
          />
        )
      case 'pie':
      case 'donut':
        return (
          <SimplePieChart
            data={config.data}
            width={width}
            height={height}
            colors={colors}
            animated={config.animated}
          />
        )
      default:
        return <div className="text-muted-foreground">Chart type not supported</div>
    }
  }

  const ChartIcon = config.type === 'bar' ? BarChart3 :
                   config.type === 'line' || config.type === 'area' ? LineChart :
                   PieChart

  return (
    <Card className={cn("relative", className)} {...props}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <ChartIcon className="h-5 w-5" />
            {title}
          </CardTitle>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>

        {showControls && (
          <div className="flex items-center gap-1">
            {onRefresh && (
              <Button variant="ghost" size="sm" onClick={onRefresh} disabled={isLoading}>
                <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
              </Button>
            )}
            {onExport && (
              <Button variant="ghost" size="sm" onClick={onExport}>
                <Download className="h-4 w-4" />
              </Button>
            )}
            {onFullscreen && (
              <Button variant="ghost" size="sm" onClick={onFullscreen}>
                <Maximize2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div
          ref={chartRef}
          className="w-full"
          style={{ height: config.height || (compact ? 200 : 300) }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            renderChart()
          )}
        </div>

        {config.showLegend !== false && (
          <ChartLegend data={config.data} colors={colors} />
        )}
      </CardContent>
    </Card>
  )
}

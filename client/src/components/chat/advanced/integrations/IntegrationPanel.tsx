import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Plug,
  Unplug,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  Database,
  Mail,
  Calendar,
  CreditCard,
  Users,
  Settings,
  ExternalLink,
  Shield,
  Activity,
  Wifi,
  WifiOff,
  AlertTriangle,
  Info
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { da } from "date-fns/locale"

export interface IntegrationService {
  id: string
  name: string
  description: string
  icon: string
  category: 'communication' | 'productivity' | 'finance' | 'analytics' | 'storage' | 'other'
  status: 'connected' | 'disconnected' | 'error' | 'connecting' | 'syncing'
  lastSync?: Date
  syncStatus?: {
    progress: number
    message: string
    itemsProcessed: number
    totalItems: number
  }
  health?: {
    score: number // 0-100
    issues: string[]
    lastCheck: Date
  }
  metadata?: {
    version?: string
    plan?: string
    limits?: {
      requests?: number
      storage?: string
      users?: number
    }
    usage?: {
      requests?: number
      storage?: string
      users?: number
    }
  }
  permissions?: string[]
  webhooks?: Array<{
    id: string
    name: string
    url: string
    events: string[]
    active: boolean
  }>
}

interface IntegrationPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  services: IntegrationService[]
  onConnect?: (serviceId: string) => void
  onDisconnect?: (serviceId: string) => void
  onSync?: (serviceId: string) => void
  onConfigure?: (serviceId: string) => void
  onViewLogs?: (serviceId: string) => void
  onTestConnection?: (serviceId: string) => void
  showHealth?: boolean
  showUsage?: boolean
  showWebhooks?: boolean
  className?: string
}

const categoryConfigs = {
  communication: {
    label: 'Kommunikation',
    color: 'bg-blue-100 text-blue-800',
    icon: Mail
  },
  productivity: {
    label: 'Produktivitet',
    color: 'bg-green-100 text-green-800',
    icon: Calendar
  },
  finance: {
    label: 'Finans',
    color: 'bg-emerald-100 text-emerald-800',
    icon: CreditCard
  },
  analytics: {
    label: 'Analyse',
    color: 'bg-purple-100 text-purple-800',
    icon: Activity
  },
  storage: {
    label: 'Lagring',
    color: 'bg-orange-100 text-orange-800',
    icon: Database
  },
  other: {
    label: 'Andet',
    color: 'bg-gray-100 text-gray-800',
    icon: Settings
  }
}

const statusConfigs = {
  connected: {
    label: 'Tilsluttet',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle
  },
  disconnected: {
    label: 'Ikke tilsluttet',
    color: 'bg-gray-100 text-gray-800',
    icon: Unplug
  },
  error: {
    label: 'Fejl',
    color: 'bg-red-100 text-red-800',
    icon: AlertCircle
  },
  connecting: {
    label: 'Tilslutter...',
    color: 'bg-yellow-100 text-yellow-800',
    icon: RefreshCw
  },
  syncing: {
    label: 'Synkroniserer',
    color: 'bg-blue-100 text-blue-800',
    icon: RefreshCw
  }
}

export function IntegrationPanel({
  services,
  onConnect,
  onDisconnect,
  onSync,
  onConfigure,
  onViewLogs,
  onTestConnection,
  showHealth = true,
  showUsage = true,
  showWebhooks = false,
  className,
  ...props
}: IntegrationPanelProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all')
  const [expandedService, setExpandedService] = React.useState<string | null>(null)

  const categories = ['all', ...Object.keys(categoryConfigs)]
  const filteredServices = selectedCategory === 'all'
    ? services
    : services.filter(s => s.category === selectedCategory)

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getUsagePercentage = (used: number | string, limit: number | string) => {
    if (typeof used === 'string' && typeof limit === 'string') {
      // Handle storage strings like "2.4 GB" vs "10 GB"
      const usedNum = parseFloat(used.replace(/[^\d.]/g, ''))
      const limitNum = parseFloat(limit.replace(/[^\d.]/g, ''))
      return Math.min((usedNum / limitNum) * 100, 100)
    }
    if (typeof used === 'number' && typeof limit === 'number') {
      return Math.min((used / limit) * 100, 100)
    }
    return 0
  }

  const renderServiceCard = (service: IntegrationService) => {
    const StatusIcon = statusConfigs[service.status].icon
    const CategoryIcon = categoryConfigs[service.category].icon
    const isExpanded = expandedService === service.id

    return (
      <Card key={service.id} className="relative">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                <CategoryIcon className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base">{service.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{service.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={statusConfigs[service.status].color}
              >
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusConfigs[service.status].label}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedService(isExpanded ? null : service.id)}
              >
                {isExpanded ? 'Skjul' : 'Vis mere'}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Status and Sync Info */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {service.lastSync && (
                <span>
                  Sidst synk: {formatDistanceToNow(service.lastSync, { addSuffix: true, locale: da })}
                </span>
              )}
              {service.metadata?.version && (
                <span>v{service.metadata.version}</span>
              )}
            </div>
            <div className="flex gap-1">
              {service.status === 'connected' && (
                <>
                  <Button variant="outline" size="sm" onClick={() => onSync?.(service.id)}>
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Synk
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onConfigure?.(service.id)}>
                    <Settings className="w-3 h-3 mr-1" />
                    Konfigurer
                  </Button>
                </>
              )}
              {service.status === 'connected' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDisconnect?.(service.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Unplug className="w-3 h-3 mr-1" />
                  Afbryd
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onConnect?.(service.id)}
                  disabled={service.status === 'connecting'}
                >
                  {service.status === 'connecting' ? (
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Plug className="w-3 h-3 mr-1" />
                  )}
                  {service.status === 'connecting' ? 'Tilslutter...' : 'Tilslut'}
                </Button>
              )}
            </div>
          </div>

          {/* Sync Progress */}
          {service.status === 'syncing' && service.syncStatus && (
            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Synkroniserer...</span>
                <span className="text-sm text-muted-foreground">
                  {service.syncStatus.itemsProcessed}/{service.syncStatus.totalItems}
                </span>
              </div>
              <Progress value={service.syncStatus.progress} className="mb-1" />
              <p className="text-xs text-muted-foreground">{service.syncStatus.message}</p>
            </div>
          )}

          {/* Health Status */}
          {showHealth && service.health && isExpanded && (
            <div className="mb-3 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Sundhedstilstand
                </span>
                <span className={cn("text-sm font-medium", getHealthColor(service.health.score))}>
                  {service.health.score}/100
                </span>
              </div>
              {service.health.issues.length > 0 && (
                <div className="space-y-1">
                  {service.health.issues.map((issue, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <AlertTriangle className="w-3 h-3 text-yellow-500" />
                      {issue}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Usage */}
          {showUsage && service.metadata?.usage && service.metadata?.limits && isExpanded && (
            <div className="mb-3 space-y-3">
              <h5 className="text-sm font-medium">Brug og begrænsninger</h5>
              <div className="space-y-2">
                {service.metadata.usage.requests !== undefined && service.metadata.limits.requests && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>API kald</span>
                      <span>{service.metadata.usage.requests}/{service.metadata.limits.requests}</span>
                    </div>
                    <Progress
                      value={getUsagePercentage(service.metadata.usage.requests, service.metadata.limits.requests)}
                      className="h-1"
                    />
                  </div>
                )}
                {service.metadata.usage.storage && service.metadata.limits.storage && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Lager</span>
                      <span>{service.metadata.usage.storage}/{service.metadata.limits.storage}</span>
                    </div>
                    <Progress
                      value={getUsagePercentage(service.metadata.usage.storage, service.metadata.limits.storage)}
                      className="h-1"
                    />
                  </div>
                )}
                {service.metadata.usage.users !== undefined && service.metadata.limits.users && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Brugere</span>
                      <span>{service.metadata.usage.users}/{service.metadata.limits.users}</span>
                    </div>
                    <Progress
                      value={getUsagePercentage(service.metadata.usage.users, service.metadata.limits.users)}
                      className="h-1"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Webhooks */}
          {showWebhooks && service.webhooks && service.webhooks.length > 0 && isExpanded && (
            <div className="mb-3">
              <h5 className="text-sm font-medium mb-2">Webhooks</h5>
              <div className="space-y-2">
                {service.webhooks.map(webhook => (
                  <div key={webhook.id} className="flex items-center justify-between p-2 bg-muted/30 rounded text-xs">
                    <div>
                      <span className="font-medium">{webhook.name}</span>
                      <div className="text-muted-foreground truncate max-w-xs">{webhook.url}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={webhook.active ? "default" : "secondary"} className="text-xs">
                        {webhook.active ? 'Aktiv' : 'Inaktiv'}
                      </Badge>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Permissions */}
          {service.permissions && service.permissions.length > 0 && isExpanded && (
            <div className="mb-3">
              <h5 className="text-sm font-medium mb-2">Tilladelser</h5>
              <div className="flex flex-wrap gap-1">
                {service.permissions.map(permission => (
                  <Badge key={permission} variant="outline" className="text-xs">
                    {permission}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {isExpanded && (
            <div className="flex gap-2 pt-2 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => onTestConnection?.(service.id)}>
                <Wifi className="w-3 h-3 mr-1" />
                Test forbindelse
              </Button>
              <Button variant="outline" size="sm" onClick={() => onViewLogs?.(service.id)}>
                <Activity className="w-3 h-3 mr-1" />
                Se logs
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-6", className)} {...props}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Integrationer</h2>
          <p className="text-muted-foreground">
            Administrer forbindelser til eksterne tjenester og API'er
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {services.filter(s => s.status === 'connected').length}/{services.length} tilsluttet
        </Badge>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="capitalize"
          >
            {category === 'all' ? 'Alle' : categoryConfigs[category as keyof typeof categoryConfigs].label}
          </Button>
        ))}
      </div>

      {/* Services Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredServices.map(renderServiceCard)}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-12">
          <Plug className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Ingen integrationer fundet</h3>
          <p className="text-muted-foreground">
            Der er ingen {selectedCategory === 'all' ? '' : `${categoryConfigs[selectedCategory as keyof typeof categoryConfigs].label.toLowerCase()} `}integrationer at vise.
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * SYNC STATUS CARD - Synkronisering mellem systemer (Billy, Gmail, Calendar)
 */

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { RefreshCw, CheckCircle, AlertCircle, XCircle, Clock, Database } from "lucide-react";
import { useState } from "react";

export interface SyncStatus {
  id: string;
  service: string;
  status: 'synced' | 'syncing' | 'error' | 'pending';
  lastSync: string;
  itemCount?: number;
  errorMessage?: string;
  icon?: string;
}

interface SyncStatusCardProps {
  syncItems: SyncStatus[];
  onSync?: (serviceId: string) => void;
  onSyncAll?: () => void;
}

export function SyncStatusCard({ syncItems, onSync, onSyncAll }: SyncStatusCardProps) {
  const [syncing, setSyncing] = useState<Record<string, boolean>>({});

  const handleSync = async (serviceId: string) => {
    setSyncing(prev => ({ ...prev, [serviceId]: true }));
    await onSync?.(serviceId);
    setTimeout(() => {
      setSyncing(prev => ({ ...prev, [serviceId]: false }));
    }, 2000);
  };

  const getStatusIcon = (status: SyncStatus['status']) => {
    switch (status) {
      case 'synced': return CheckCircle;
      case 'syncing': return RefreshCw;
      case 'error': return XCircle;
      case 'pending': return Clock;
      default: return AlertCircle;
    }
  };

  const getStatusColor = (status: SyncStatus['status']) => {
    switch (status) {
      case 'synced': return 'text-emerald-600';
      case 'syncing': return 'text-blue-600';
      case 'error': return 'text-red-600';
      case 'pending': return 'text-amber-600';
      default: return 'text-slate-600';
    }
  };

  const getStatusBadge = (status: SyncStatus['status']) => {
    switch (status) {
      case 'synced': return <Badge className="bg-emerald-600">Synkroniseret</Badge>;
      case 'syncing': return <Badge className="bg-blue-600">Synkroniserer...</Badge>;
      case 'error': return <Badge className="bg-red-600">Fejl</Badge>;
      case 'pending': return <Badge className="bg-amber-600">Afventer</Badge>;
      default: return <Badge variant="outline">Ukendt</Badge>;
    }
  };

  const allSynced = syncItems.every(item => item.status === 'synced');
  const hasErrors = syncItems.some(item => item.status === 'error');

  return (
    <Card className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold">System Synkronisering</h3>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={onSyncAll}
          className={cn(
            allSynced && "text-emerald-600",
            hasErrors && "text-red-600"
          )}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Sync alt
        </Button>
      </div>

      {/* Sync Items */}
      <div className="space-y-3">
        {syncItems.map((item) => {
          const StatusIcon = getStatusIcon(item.status);
          const isSyncing = syncing[item.id] || item.status === 'syncing';

          return (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
            >
              <div className={cn(
                "w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center",
                item.status === 'synced' && "bg-emerald-50 dark:bg-emerald-950/20",
                item.status === 'error' && "bg-red-50 dark:bg-red-950/20"
              )}>
                <StatusIcon className={cn(
                  "w-5 h-5",
                  getStatusColor(item.status),
                  isSyncing && "animate-spin"
                )} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm">{item.service}</h4>
                  {getStatusBadge(item.status)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {item.status === 'error' && item.errorMessage ? (
                    <span className="text-red-600">{item.errorMessage}</span>
                  ) : (
                    <>
                      Sidst synkroniseret: {item.lastSync}
                      {item.itemCount !== undefined && ` · ${item.itemCount} elementer`}
                    </>
                  )}
                </div>
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleSync(item.id)}
                disabled={isSyncing}
              >
                <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
              </Button>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t text-center text-xs">
        <div>
          <p className="font-semibold text-emerald-600">
            {syncItems.filter(i => i.status === 'synced').length}
          </p>
          <p className="text-muted-foreground">Synkroniseret</p>
        </div>
        <div>
          <p className="font-semibold text-blue-600">
            {syncItems.filter(i => i.status === 'syncing').length}
          </p>
          <p className="text-muted-foreground">Aktiv</p>
        </div>
        <div>
          <p className="font-semibold text-red-600">
            {syncItems.filter(i => i.status === 'error').length}
          </p>
          <p className="text-muted-foreground">Fejl</p>
        </div>
      </div>
    </Card>
  );
}

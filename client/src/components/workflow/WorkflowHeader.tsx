import { Sparkles, Plus, Settings, Bell, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Rendetalje Workflow Header
 * Professional header with branding, quick actions, and notifications
 */
export default function WorkflowHeader() {
  return (
    <div className="p-4 border-b border-border bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
      <div className="flex items-center justify-between mb-4">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              Rendetalje Workflow
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Professionel rengøringsadministration
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" aria-hidden="true" />
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
            >
              3
            </Badge>
          </Button>

          {/* Quick Add */}
          <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Ny Opgave</span>
          </Button>

          {/* Settings */}
          <Button variant="ghost" size="icon" aria-label="Open settings">
            <Settings className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {/* Quick Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Søg kunder, opgaver, lokationer..."
          className="pl-10 bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700"
        />
      </div>
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  TrendingUp,
  Clock,
  DollarSign,
  Users,
} from "lucide-react";
import { useWorkflowContext } from "@/contexts/WorkflowContext";

/**
 * Rendetalje Workflow Footer
 * Real-time business metrics and KPIs
 */
export default function WorkflowFooter() {
  const { state } = useWorkflowContext();
  const { stats } = state;

  // Mock data - replace with real business metrics
  const businessMetrics = {
    todayRevenue: "12.450 kr",
    activeJobs: 8,
    completionRate: 94,
    customerSatisfaction: 4.8,
  };

  return (
    <div className="p-3 border-t border-border bg-gray-50/50 dark:bg-gray-900/50">
      <div className="grid grid-cols-4 gap-3">
        {/* Today's Revenue */}
        <Card className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <div>
              <div className="text-xs text-green-700 dark:text-green-400 font-medium">
                I dag
              </div>
              <div className="text-sm font-bold text-green-800 dark:text-green-300">
                {businessMetrics.todayRevenue}
              </div>
            </div>
          </div>
        </Card>

        {/* Active Jobs */}
        <Card className="p-3 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <div>
              <div className="text-xs text-blue-700 dark:text-blue-400 font-medium">
                Aktive jobs
              </div>
              <div className="text-sm font-bold text-blue-800 dark:text-blue-300">
                {businessMetrics.activeJobs}
              </div>
            </div>
          </div>
        </Card>

        {/* Completion Rate */}
        <Card className="p-3 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <div>
              <div className="text-xs text-purple-700 dark:text-purple-400 font-medium">
                Gennemførelse
              </div>
              <div className="text-sm font-bold text-purple-800 dark:text-purple-300">
                {businessMetrics.completionRate}%
              </div>
            </div>
          </div>
        </Card>

        {/* Customer Satisfaction */}
        <Card className="p-3 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-orange-600" />
            <div>
              <div className="text-xs text-orange-700 dark:text-orange-400 font-medium">
                Tilfredshed
              </div>
              <div className="text-sm font-bold text-orange-800 dark:text-orange-300">
                {businessMetrics.customerSatisfaction}/5
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
          <span>Rendetalje Friday AI v2.0</span>
          <Badge variant="outline" className="text-xs">
            Online
          </Badge>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-500">
          Sidst opdateret: {new Date().toLocaleTimeString('da-DK')}
        </div>
      </div>
    </div>
  );
}
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, BarChart3, PieChart } from "lucide-react";

/**
 * Rendetalje Analytics Tab
 * Professional business intelligence and reporting
 */
export default function AnalyticsTab() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg">
          <TrendingUp className="w-10 h-10 text-white" />
        </div>
        
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Business Analytics
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Avanceret forretningsanalyse for Rendetalje. Følg nøgletal, 
            indtjening, kundetilfredshed og medarbejderproduktivitet.
          </p>
        </div>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border-purple-200 dark:border-purple-800">
          <div className="space-y-4">
            <h3 className="font-semibold text-purple-900 dark:text-purple-100">
              Kommende rapporter:
            </h3>
            <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-2">
              <li className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Månedlig omsætning og profit
              </li>
              <li className="flex items-center gap-2">
                <PieChart className="w-4 h-4" />
                Service type fordeling
              </li>
              <li className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Kundetilfredshed trends
              </li>
              <li className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Medarbejder performance
              </li>
            </ul>
          </div>
        </Card>

        <div className="flex gap-3">
          <Button className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Se Rapporter
          </Button>
          <Button variant="outline">
            Eksporter Data
          </Button>
        </div>
      </div>
    </div>
  );
}
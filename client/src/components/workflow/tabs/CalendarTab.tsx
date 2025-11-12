import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Plus } from "lucide-react";

/**
 * Rendetalje Calendar Tab
 * Professional scheduling and calendar management
 */
export default function CalendarTab() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
          <Calendar className="w-10 h-10 text-white" />
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Kalender & Planlægning
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Professionel kalenderstyring til Rendetalje. Planlæg rengøringsjobs,
            administrer medarbejderskemaer og optimer ruter mellem lokationer.
          </p>
        </div>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
          <div className="space-y-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">
              Kommende funktioner:
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Automatisk jobplanlægning
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Medarbejder tidsregistrering
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Rute optimering
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Kunde booking system
              </li>
            </ul>
          </div>
        </Card>

        <div className="flex gap-3">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Planlæg Job
          </Button>
          <Button variant="outline">Se Kalender</Button>
        </div>
      </div>
    </div>
  );
}

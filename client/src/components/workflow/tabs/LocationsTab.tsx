import { MapPin, Navigation, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/**
 * Rendetalje Locations Tab
 * Professional location and route management
 */
export default function LocationsTab() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
          <MapPin className="w-10 h-10 text-white" />
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Lokationer & Ruter
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Administrer alle rengøringslokationer i København og omegn. Optimer
            kørselsruter og reducer transporttid mellem jobs.
          </p>
        </div>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
          <div className="space-y-4">
            <h3 className="font-semibold text-green-900 dark:text-green-100">
              Kommende funktioner:
            </h3>
            <ul className="text-sm text-green-800 dark:text-green-200 space-y-2">
              <li className="flex items-center gap-2">
                <Navigation className="w-4 h-4" />
                Interaktivt kort over alle lokationer
              </li>
              <li className="flex items-center gap-2">
                <Navigation className="w-4 h-4" />
                Automatisk rute optimering
              </li>
              <li className="flex items-center gap-2">
                <Navigation className="w-4 h-4" />
                GPS tracking af medarbejdere
              </li>
              <li className="flex items-center gap-2">
                <Navigation className="w-4 h-4" />
                Afstands- og tidsberegning
              </li>
            </ul>
          </div>
        </Card>

        <div className="flex gap-3">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Tilføj Lokation
          </Button>
          <Button variant="outline">Se Kort</Button>
        </div>
      </div>
    </div>
  );
}

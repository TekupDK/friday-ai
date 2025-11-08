import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Plus,
  MapPin,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Filter,
} from "lucide-react";
import { useWorkflowContext } from "@/contexts/WorkflowContext";

interface CleaningTask {
  id: string;
  title: string;
  type: "flytterengøring" | "hovedrengøring" | "løbende" | "vinduespolering";
  customer: {
    name: string;
    phone: string;
  };
  location: {
    address: string;
    city: string;
    postalCode: string;
  };
  scheduledDate: Date;
  estimatedDuration: number; // minutes
  price: number;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high";
  assignedTo?: string;
  notes?: string;
}

/**
 * Rendetalje Tasks Tab
 * Professional cleaning job management
 */
export default function TasksTab() {
  const { state } = useWorkflowContext();
  const [filter, setFilter] = useState<"all" | "today" | "pending" | "completed">("all");

  // Mock cleaning tasks - replace with real data
  const cleaningTasks: CleaningTask[] = [
    {
      id: "1",
      title: "Flytterengøring - 3 værelser",
      type: "flytterengøring",
      customer: {
        name: "Sarah Johnson",
        phone: "+45 12 34 56 78"
      },
      location: {
        address: "Nørrebrogade 123, 2. tv",
        city: "København",
        postalCode: "2200"
      },
      scheduledDate: new Date(),
      estimatedDuration: 240,
      price: 3500,
      status: "pending",
      priority: "high",
      assignedTo: "Maria",
      notes: "Ekstra snavset køkken, husk specialrengøring"
    },
    {
      id: "2", 
      title: "Hovedrengøring - Villa",
      type: "hovedrengøring",
      customer: {
        name: "Michael Chen",
        phone: "+45 87 65 43 21"
      },
      location: {
        address: "Strandvejen 45",
        city: "Hellerup",
        postalCode: "2900"
      },
      scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      estimatedDuration: 360,
      price: 4200,
      status: "pending",
      priority: "medium",
      assignedTo: "Anna"
    },
    {
      id: "3",
      title: "Løbende rengøring - Kontor",
      type: "løbende",
      customer: {
        name: "TechStart Solutions",
        phone: "+45 33 44 55 66"
      },
      location: {
        address: "Vesterbrogade 89, 3. sal",
        city: "København",
        postalCode: "1620"
      },
      scheduledDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
      estimatedDuration: 120,
      price: 1800,
      status: "completed",
      priority: "low"
    }
  ];

  const getStatusColor = (status: CleaningTask["status"]) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in_progress": return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeColor = (type: CleaningTask["type"]) => {
    switch (type) {
      case "flytterengøring": return "bg-purple-100 text-purple-800";
      case "hovedrengøring": return "bg-blue-100 text-blue-800";
      case "løbende": return "bg-green-100 text-green-800";
      case "vinduespolering": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('da-DK', {
      style: 'currency',
      currency: 'DKK'
    }).format(price);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}t ${mins}m`;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header & Filters */}
      <div className="p-4 border-b border-border bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Rengøringsopgaver</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Administrer og planlæg alle rengøringsjobs
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Ny Opgave
          </Button>
        </div>

        {/* Quick Filters */}
        <div className="flex gap-2">
          {[
            { key: "all", label: "Alle", count: cleaningTasks.length },
            { key: "today", label: "I dag", count: 2 },
            { key: "pending", label: "Afventer", count: 2 },
            { key: "completed", label: "Færdige", count: 1 }
          ].map((filterOption) => (
            <Button
              key={filterOption.key}
              variant={filter === filterOption.key ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(filterOption.key as any)}
              className="gap-2"
            >
              {filterOption.label}
              <Badge variant="secondary" className="ml-1">
                {filterOption.count}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {cleaningTasks.map((task) => (
          <Card key={task.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              {/* Status Checkbox */}
              <div className="mt-1">
                <Checkbox 
                  checked={task.status === "completed"}
                  className="w-5 h-5"
                />
              </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {task.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getTypeColor(task.type)}>
                        {task.type}
                      </Badge>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status === "pending" && "Afventer"}
                        {task.status === "in_progress" && "I gang"}
                        {task.status === "completed" && "Færdig"}
                        {task.status === "cancelled" && "Aflyst"}
                      </Badge>
                      {task.priority === "high" && (
                        <Badge variant="destructive" className="gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Høj prioritet
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      {formatPrice(task.price)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDuration(task.estimatedDuration)}
                    </div>
                  </div>
                </div>

                {/* Customer & Location */}
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium">{task.customer.name}</div>
                      <div className="text-xs text-gray-500">{task.customer.phone}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-sm">{task.location.address}</div>
                      <div className="text-xs text-gray-500">
                        {task.location.postalCode} {task.location.city}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Schedule & Assignment */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {task.scheduledDate.toLocaleDateString('da-DK')} kl. {task.scheduledDate.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {task.assignedTo && (
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs">
                            {task.assignedTo.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-600">{task.assignedTo}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Rediger
                    </Button>
                    <Button variant="outline" size="sm">
                      Kontakt
                    </Button>
                  </div>
                </div>

                {/* Notes */}
                {task.notes && (
                  <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded border border-yellow-200 dark:border-yellow-800">
                    <div className="text-xs text-yellow-800 dark:text-yellow-200">
                      <strong>Note:</strong> {task.notes}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
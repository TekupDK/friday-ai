import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Star,
  Calendar,
  DollarSign,
  Building,
  User,
} from "lucide-react";
import { useWorkflowContext } from "@/contexts/WorkflowContext";

interface RendetaljeCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: "privat" | "erhverv";
  address: {
    street: string;
    city: string;
    postalCode: string;
  };
  totalJobs: number;
  totalRevenue: number;
  lastService: Date;
  nextService?: Date;
  rating: number;
  status: "aktiv" | "inaktiv" | "lead";
  preferredServices: string[];
  notes?: string;
}

/**
 * Rendetalje Customers Tab
 * Professional customer relationship management for cleaning business
 */
export default function CustomersTab() {
  const { openCustomerProfile } = useWorkflowContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "aktiv" | "lead" | "erhverv">(
    "all"
  );

  // Mock customer data - replace with real CRM data
  const customers: RendetaljeCustomer[] = [
    {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      phone: "+45 12 34 56 78",
      type: "privat",
      address: {
        street: "Nørrebrogade 123, 2. tv",
        city: "København",
        postalCode: "2200",
      },
      totalJobs: 8,
      totalRevenue: 24500,
      lastService: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      nextService: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      rating: 4.8,
      status: "aktiv",
      preferredServices: ["flytterengøring", "hovedrengøring"],
      notes: "Foretrækker Maria som rengøringsassistent",
    },
    {
      id: "2",
      name: "TechStart Solutions ApS",
      email: "kontakt@techstart.dk",
      phone: "+45 33 44 55 66",
      type: "erhverv",
      address: {
        street: "Vesterbrogade 89, 3. sal",
        city: "København",
        postalCode: "1620",
      },
      totalJobs: 24,
      totalRevenue: 86400,
      lastService: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      nextService: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      rating: 4.9,
      status: "aktiv",
      preferredServices: ["løbende", "vinduespolering"],
      notes: "Ugentlig kontor rengøring, adgang med nøglekort",
    },
    {
      id: "3",
      name: "Michael Chen",
      email: "m.chen@gmail.com",
      phone: "+45 87 65 43 21",
      type: "privat",
      address: {
        street: "Strandvejen 45",
        city: "Hellerup",
        postalCode: "2900",
      },
      totalJobs: 0,
      totalRevenue: 0,
      lastService: new Date(),
      rating: 0,
      status: "lead",
      preferredServices: ["hovedrengøring"],
      notes: "Interesseret i månedlig hovedrengøring af villa",
    },
  ];

  const getStatusColor = (status: RendetaljeCustomer["status"]) => {
    switch (status) {
      case "aktiv":
        return "bg-green-100 text-green-800 border-green-200";
      case "inaktiv":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "lead":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("da-DK", {
      style: "currency",
      currency: "DKK",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);

    const matchesFilter =
      filter === "all" ||
      customer.status === filter ||
      (filter === "erhverv" && customer.type === "erhverv");

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="h-full flex flex-col">
      {/* Header & Search */}
      <div className="p-4 border-b border-border bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Kunder</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Administrer kundeforhold og service historik
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Ny Kunde
          </Button>
        </div>

        {/* Search & Filters */}
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Søg kunder..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {[
              { key: "all", label: "Alle" },
              { key: "aktiv", label: "Aktive" },
              { key: "lead", label: "Leads" },
              { key: "erhverv", label: "Erhverv" },
            ].map(filterOption => (
              <Button
                key={filterOption.key}
                variant={filter === filterOption.key ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(filterOption.key as any)}
              >
                {filterOption.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Customers List */}
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {filteredCustomers.map(customer => (
          <Card
            key={customer.id}
            className="p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => openCustomerProfile(parseInt(customer.id))}
          >
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {customer.type === "erhverv" ? (
                    <Building className="w-6 h-6" />
                  ) : (
                    customer.name
                      .split(" ")
                      .map(n => n[0])
                      .join("")
                      .slice(0, 2)
                  )}
                </AvatarFallback>
              </Avatar>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      {customer.name}
                      {customer.type === "erhverv" && (
                        <Building className="w-4 h-4 text-blue-500" />
                      )}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getStatusColor(customer.status)}>
                        {customer.status === "aktiv" && "Aktiv kunde"}
                        {customer.status === "inaktiv" && "Inaktiv"}
                        {customer.status === "lead" && "Potentiel kunde"}
                      </Badge>
                      {customer.rating > 0 && (
                        <div className="flex items-center gap-1">
                          {renderStars(customer.rating)}
                          <span className="text-xs text-gray-500 ml-1">
                            ({customer.rating})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      {formatCurrency(customer.totalRevenue)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {customer.totalJobs} jobs
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-3 h-3 text-gray-400" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-3 h-3 text-gray-400" />
                      <span>{customer.phone}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3 h-3 text-gray-400 mt-0.5" />
                    <div className="text-sm">
                      <div>{customer.address.street}</div>
                      <div className="text-gray-500">
                        {customer.address.postalCode} {customer.address.city}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Service Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {customer.lastService && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="w-3 h-3" />
                        Sidst:{" "}
                        {customer.lastService.toLocaleDateString("da-DK")}
                      </div>
                    )}
                    {customer.nextService && (
                      <div className="flex items-center gap-1 text-sm text-blue-600">
                        <Calendar className="w-3 h-3" />
                        Næste:{" "}
                        {customer.nextService.toLocaleDateString("da-DK")}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Phone className="w-3 h-3 mr-1" />
                      Ring
                    </Button>
                    <Button variant="outline" size="sm">
                      <Mail className="w-3 h-3 mr-1" />
                      Email
                    </Button>
                  </div>
                </div>

                {/* Preferred Services */}
                {customer.preferredServices.length > 0 && (
                  <div className="mt-3">
                    <div className="text-xs text-gray-500 mb-1">
                      Foretrukne services:
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {customer.preferredServices.map((service, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {customer.notes && (
                  <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-800">
                    <div className="text-xs text-blue-800 dark:text-blue-200">
                      <strong>Note:</strong> {customer.notes}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}

        {filteredCustomers.length === 0 && (
          <div className="text-center py-8">
            <User className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              Ingen kunder fundet
            </h3>
            <p className="text-sm text-gray-500">
              Prøv at justere dine søgekriterier eller tilføj en ny kunde
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * BILLY PRODUCT CARD - Håndtere REN-001 til REN-005 produkter
 */

import {
  Package,
  Plus,
  Edit2,
  Save,
  X,
  Euro,
  TrendingUp,
  Box,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface ProductData {
  id: string;
  sku: string; // REN-001, REN-002, etc.
  name: string;
  description: string;
  price: number;
  unit: "stk" | "time" | "m2" | "km";
  category: "rengøring" | "vedligehold" | "service" | "materiale";
  stock?: number;
  active: boolean;
}

interface BillyProductCardProps {
  product?: ProductData;
  mode?: "view" | "edit" | "create";
  onSave?: (product: ProductData) => void;
  onCancel?: () => void;
}

// Default products for REN series
const DEFAULT_PRODUCTS: Omit<ProductData, "id">[] = [
  {
    sku: "REN-001",
    name: "Standard Rengøring",
    description: "Grundlæggende rengøring af kontor",
    price: 500,
    unit: "time",
    category: "rengøring",
    stock: 0,
    active: true,
  },
  {
    sku: "REN-002",
    name: "Hovedrengøring",
    description: "Dybdegående rengøring inkl. vinduer",
    price: 750,
    unit: "time",
    category: "rengøring",
    stock: 0,
    active: true,
  },
  {
    sku: "REN-003",
    name: "Gulvbehandling",
    description: "Voksning og polering af hårde gulve",
    price: 1200,
    unit: "m2",
    category: "vedligehold",
    stock: 0,
    active: true,
  },
  {
    sku: "REN-004",
    name: "Facade Rengøring",
    description: "Udvendig rengøring af facader",
    price: 150,
    unit: "m2",
    category: "rengøring",
    stock: 0,
    active: true,
  },
  {
    sku: "REN-005",
    name: "Serviceaftale",
    description: "Månedlig service og vedligehold",
    price: 2500,
    unit: "stk",
    category: "service",
    stock: 0,
    active: true,
  },
];

export function BillyProductCard({
  product,
  mode = "view",
  onSave,
  onCancel,
}: BillyProductCardProps) {
  const [data, setData] = useState<ProductData>(
    product || {
      ...DEFAULT_PRODUCTS[0],
      id: Math.random().toString(),
    }
  );
  const [isEditing, setIsEditing] = useState(
    mode === "edit" || mode === "create"
  );

  const update = (field: keyof ProductData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave?.(data);
    if (mode !== "create") {
      setIsEditing(false);
    }
  };

  const getCategoryColor = (category: ProductData["category"]) => {
    switch (category) {
      case "rengøring":
        return "bg-blue-500";
      case "vedligehold":
        return "bg-green-500";
      case "service":
        return "bg-purple-500";
      case "materiale":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const getCategoryLabel = (category: ProductData["category"]) => {
    switch (category) {
      case "rengøring":
        return "Rengøring";
      case "vedligehold":
        return "Vedligehold";
      case "service":
        return "Service";
      case "materiale":
        return "Materiale";
      default:
        return "Andet";
    }
  };

  const getUnitLabel = (unit: ProductData["unit"]) => {
    switch (unit) {
      case "stk":
        return "pr. stk";
      case "time":
        return "pr. time";
      case "m2":
        return "pr. m²";
      case "km":
        return "pr. km";
      default:
        return unit;
    }
  };

  return (
    <Card className="border-l-4 border-l-purple-500">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-md">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold">
                {mode === "create"
                  ? "Opret Produkt"
                  : isEditing
                    ? "Rediger Produkt"
                    : "Produkt Detaljer"}
              </h4>
              <p className="text-xs text-muted-foreground">Billy.dk produkt</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getCategoryColor(data.category)}>
              {getCategoryLabel(data.category)}
            </Badge>
            {data.active ? (
              <Badge className="bg-green-500">Aktiv</Badge>
            ) : (
              <Badge variant="secondary">Inaktiv</Badge>
            )}
          </div>
        </div>

        {/* Product Form */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground">SKU</label>
              {isEditing ? (
                <Input
                  value={data.sku}
                  onChange={e => update("sku", e.target.value)}
                  className="h-9 mt-1"
                />
              ) : (
                <p className="font-mono text-sm mt-1">{data.sku}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Kategori</label>
              {isEditing ? (
                <select
                  value={data.category}
                  onChange={e => update("category", e.target.value)}
                  className="w-full h-9 px-2 border rounded text-sm mt-1"
                >
                  <option value="rengøring">Rengøring</option>
                  <option value="vedligehold">Vedligehold</option>
                  <option value="service">Service</option>
                  <option value="materiale">Materiale</option>
                </select>
              ) : (
                <p className="text-sm mt-1">
                  {getCategoryLabel(data.category)}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground">Produktnavn</label>
            {isEditing ? (
              <Input
                value={data.name}
                onChange={e => update("name", e.target.value)}
                className="h-9 mt-1"
              />
            ) : (
              <p className="font-medium text-sm mt-1">{data.name}</p>
            )}
          </div>

          <div>
            <label className="text-xs text-muted-foreground">Beskrivelse</label>
            {isEditing ? (
              <Input
                value={data.description}
                onChange={e => update("description", e.target.value)}
                className="h-9 mt-1"
              />
            ) : (
              <p className="text-sm mt-1">{data.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground flex items-center gap-1">
                <Euro className="w-3 h-3" /> Pris
              </label>
              {isEditing ? (
                <Input
                  type="number"
                  value={data.price}
                  onChange={e =>
                    update("price", parseFloat(e.target.value) || 0)
                  }
                  className="h-9 mt-1"
                />
              ) : (
                <p className="font-medium text-sm mt-1">
                  {data.price.toLocaleString("da-DK")} kr
                </p>
              )}
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Enhed</label>
              {isEditing ? (
                <select
                  value={data.unit}
                  onChange={e =>
                    update("unit", e.target.value as ProductData["unit"])
                  }
                  className="w-full h-9 px-2 border rounded text-sm mt-1"
                >
                  <option value="stk">Stk</option>
                  <option value="time">Time</option>
                  <option value="m2">m²</option>
                  <option value="km">km</option>
                </select>
              ) : (
                <p className="text-sm mt-1">{getUnitLabel(data.unit)}</p>
              )}
            </div>
          </div>

          {/* Price Display */}
          <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-purple-700 dark:text-purple-400">
                Salgspris:
              </span>
              <span className="text-lg font-bold text-purple-700 dark:text-purple-400">
                {data.price.toLocaleString("da-DK")} kr{" "}
                {getUnitLabel(data.unit)}
              </span>
            </div>
          </div>

          {/* Status (edit mode) */}
          {isEditing && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={data.active}
                onChange={e => update("active", e.target.checked)}
              />
              <label htmlFor="active" className="text-sm">
                Produkt er aktivt
              </label>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        {!isEditing && (
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm">
              <TrendingUp className="w-3 h-3 mr-1" />
              Se salg
            </Button>
            <Button variant="outline" size="sm">
              <Box className="w-3 h-3 mr-1" />
              Lagerstatus
            </Button>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          {!isEditing ? (
            <>
              <Button onClick={() => setIsEditing(true)} className="flex-1">
                <Edit2 className="w-4 h-4 mr-2" />
                Rediger
              </Button>
              <Button onClick={onCancel} variant="outline" className="flex-1">
                Luk
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handleSave}
                className="flex-1 bg-linear-to-r from-purple-600 to-pink-600"
              >
                <Save className="w-4 h-4 mr-2" />
                {mode === "create" ? "Opret" : "Gem"}
              </Button>
              <Button onClick={onCancel} variant="outline" className="flex-1">
                <X className="w-4 h-4 mr-2" />
                Annuller
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}

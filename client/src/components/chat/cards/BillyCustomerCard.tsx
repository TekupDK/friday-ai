/**
 * BILLY CUSTOMER CARD - Administrere kundedata
 */

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Users, Plus, Edit2, Save, X, Mail, Phone, MapPin, Building } from "lucide-react";
import { useState } from "react";

export interface CustomerData {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  address?: string;
  cvr?: string;
  type: 'person' | 'company';
  status: 'active' | 'inactive' | 'prospect';
  totalInvoices?: number;
  lastInvoice?: string;
}

interface BillyCustomerCardProps {
  customer?: CustomerData;
  mode?: 'view' | 'edit' | 'create';
  onSave?: (customer: CustomerData) => void;
  onCancel?: () => void;
}

export function BillyCustomerCard({ 
  customer,
  mode = 'view',
  onSave,
  onCancel 
}: BillyCustomerCardProps) {
  const [data, setData] = useState<CustomerData>(customer || {
    id: Math.random().toString(),
    name: '',
    email: '',
    type: 'person',
    status: 'prospect'
  });
  const [isEditing, setIsEditing] = useState(mode === 'edit' || mode === 'create');

  const update = (field: keyof CustomerData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave?.(data);
    if (mode !== 'create') {
      setIsEditing(false);
    }
  };

  const getStatusColor = (status: CustomerData['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'prospect': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: CustomerData['status']) => {
    switch (status) {
      case 'active': return 'Aktiv';
      case 'inactive': return 'Inaktiv';
      case 'prospect': return 'Prospect';
      default: return 'Ukendt';
    }
  };

  return (
    <Card className="border-l-4 border-l-green-500">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold">
                {mode === 'create' ? 'Opret Kunde' : isEditing ? 'Rediger Kunde' : 'Kunde Detaljer'}
              </h4>
              <p className="text-xs text-muted-foreground">Billy.dk kunde</p>
            </div>
          </div>
          <Badge className={getStatusColor(data.status)}>
            {getStatusLabel(data.status)}
          </Badge>
        </div>

        {/* Customer Form */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground">Navn</label>
              {isEditing ? (
                <Input value={data.name} onChange={(e) => update('name', e.target.value)} className="h-9 mt-1" />
              ) : (
                <p className="font-medium text-sm mt-1">{data.name}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Type</label>
              {isEditing ? (
                <select 
                  value={data.type} 
                  onChange={(e) => update('type', e.target.value)}
                  className="w-full h-9 px-2 border rounded text-sm mt-1"
                >
                  <option value="person">Person</option>
                  <option value="company">Virksomhed</option>
                </select>
              ) : (
                <p className="text-sm mt-1">{data.type === 'person' ? 'Person' : 'Virksomhed'}</p>
              )}
            </div>
          </div>

          {data.type === 'company' && (
            <div>
              <label className="text-xs text-muted-foreground flex items-center gap-1">
                <Building className="w-3 h-3" /> Virksomhed
              </label>
              {isEditing ? (
                <Input value={data.company || ''} onChange={(e) => update('company', e.target.value)} className="h-9 mt-1" />
              ) : (
                <p className="text-sm mt-1">{data.company || 'Ingen virksomhed'}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground flex items-center gap-1">
                <Mail className="w-3 h-3" /> Email
              </label>
              {isEditing ? (
                <Input type="email" value={data.email} onChange={(e) => update('email', e.target.value)} className="h-9 mt-1" />
              ) : (
                <p className="text-sm mt-1">{data.email}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-muted-foreground flex items-center gap-1">
                <Phone className="w-3 h-3" /> Telefon
              </label>
              {isEditing ? (
                <Input value={data.phone || ''} onChange={(e) => update('phone', e.target.value)} className="h-9 mt-1" />
              ) : (
                <p className="text-sm mt-1">{data.phone || 'Intet telefonnummer'}</p>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Addresse
            </label>
            {isEditing ? (
              <Input value={data.address || ''} onChange={(e) => update('address', e.target.value)} className="h-9 mt-1" />
            ) : (
              <p className="text-sm mt-1">{data.address || 'Ingen addresse'}</p>
            )}
          </div>

          {data.type === 'company' && (
            <div>
              <label className="text-xs text-muted-foreground">CVR Nummer</label>
              {isEditing ? (
                <Input value={data.cvr || ''} onChange={(e) => update('cvr', e.target.value)} className="h-9 mt-1" />
              ) : (
                <p className="text-sm mt-1">{data.cvr || 'Intet CVR'}</p>
              )}
            </div>
          )}

          {/* Stats (view mode only) */}
          {!isEditing && customer && (
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Total fakturaer:</span>
                  <span className="ml-2 font-medium">{data.totalInvoices || 0}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Sidste faktura:</span>
                  <span className="ml-2 font-medium">{data.lastInvoice || 'Ingen'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

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
              <Button onClick={handleSave} className="flex-1 bg-linear-to-r from-green-600 to-emerald-600">
                <Save className="w-4 h-4 mr-2" />
                {mode === 'create' ? 'Opret' : 'Gem'}
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

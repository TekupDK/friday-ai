/**
 * DATA VERIFICATION CARD - Verificere data før booking
 */

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Calendar,
  Users,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { useState } from "react";

export interface VerificationItem {
  id: string;
  type:
    | "email"
    | "phone"
    | "address"
    | "calendar"
    | "customer"
    | "availability";
  label: string;
  value: string;
  status: "valid" | "warning" | "error" | "pending";
  message?: string;
  suggestions?: string[];
}

export interface DataVerificationData {
  bookingData: {
    customer?: string;
    email?: string;
    phone?: string;
    address?: string;
    date?: string;
    time?: string;
    service?: string;
  };
  verifications: VerificationItem[];
  overallScore: number;
  canProceed: boolean;
}

interface DataVerificationCardProps {
  data?: DataVerificationData;
  onVerify?: (itemId: string) => void;
  onFixItem?: (itemId: string, fix: string) => void;
  onProceedAnyway?: () => void;
  onCancel?: () => void;
}

export function DataVerificationCard({
  data,
  onVerify,
  onFixItem,
  onProceedAnyway,
  onCancel,
}: DataVerificationCardProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyingItem, setVerifyingItem] = useState<string | null>(null);

  // Default verification data
  const defaultData: DataVerificationData = {
    bookingData: {
      customer: "John Smith",
      email: "john@abc.com",
      phone: "+45 12345678",
      address: "Business Park 123, 8000 Aarhus C",
      date: "2024-01-20",
      time: "14:00",
      service: "Standard Rengøring",
    },
    verifications: [
      {
        id: "1",
        type: "customer",
        label: "Kunde",
        value: "John Smith",
        status: "valid",
        message: "Kunde findes i systemet",
      },
      {
        id: "2",
        type: "email",
        label: "Email",
        value: "john@abc.com",
        status: "valid",
        message: "Email format er korrekt",
      },
      {
        id: "3",
        type: "phone",
        label: "Telefon",
        value: "+45 12345678",
        status: "warning",
        message: "Telefonnummer format kan forbedres",
        suggestions: ["+45 12 34 56 78", "+4512345678"],
      },
      {
        id: "4",
        type: "address",
        label: "Addresse",
        value: "Business Park 123, 8000 Aarhus C",
        status: "valid",
        message: "Addresse verificeret",
      },
      {
        id: "5",
        type: "calendar",
        label: "Kalender",
        value: "2024-01-20 14:00",
        status: "error",
        message: "Konflikt med eksisterende møde",
        suggestions: ["2024-01-20 15:00", "2024-01-21 14:00"],
      },
      {
        id: "6",
        type: "availability",
        label: "Ressourcer",
        value: "Standard Rengøring",
        status: "valid",
        message: "Medarbejdere tilgængelige",
      },
    ],
    overallScore: 75,
    canProceed: false,
  };

  const verificationData = data || defaultData;

  const handleVerify = async (itemId: string) => {
    setVerifyingItem(itemId);
    setIsVerifying(true);
    // Simulate verification
    await new Promise(resolve => setTimeout(resolve, 2000));
    onVerify?.(itemId);
    setVerifyingItem(null);
    setIsVerifying(false);
  };

  const getStatusIcon = (status: VerificationItem["status"]) => {
    switch (status) {
      case "valid":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "pending":
        return <RefreshCw className="w-4 h-4 text-gray-600" />;
      default:
        return <RefreshCw className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: VerificationItem["status"]) => {
    switch (status) {
      case "valid":
        return "border-green-500 bg-green-50 dark:bg-green-950/20";
      case "warning":
        return "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20";
      case "error":
        return "border-red-500 bg-red-50 dark:bg-red-950/20";
      case "pending":
        return "border-gray-500 bg-gray-50 dark:bg-gray-900/20";
      default:
        return "border-gray-500 bg-gray-50 dark:bg-gray-900/20";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getTypeIcon = (type: VerificationItem["type"]) => {
    switch (type) {
      case "customer":
        return <Users className="w-4 h-4" />;
      case "email":
        return <Mail className="w-4 h-4" />;
      case "phone":
        return <Phone className="w-4 h-4" />;
      case "address":
        return <MapPin className="w-4 h-4" />;
      case "calendar":
        return <Calendar className="w-4 h-4" />;
      case "availability":
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  const errorsCount = verificationData.verifications.filter(
    v => v.status === "error"
  ).length;
  const warningsCount = verificationData.verifications.filter(
    v => v.status === "warning"
  ).length;

  return (
    <Card className="border-l-4 border-l-orange-500">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold">Data Verificering</h4>
              <p className="text-xs text-muted-foreground">
                Verificer booking data
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {errorsCount > 0 && (
              <Badge className="bg-red-500">{errorsCount} fejl</Badge>
            )}
            {warningsCount > 0 && (
              <Badge className="bg-yellow-500">{warningsCount} advarsler</Badge>
            )}
          </div>
        </div>

        {/* Overall Score */}
        <div className="p-3 rounded-lg bg-muted/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Verificering Score</span>
            <span
              className={cn(
                "text-lg font-bold",
                getScoreColor(verificationData.overallScore)
              )}
            >
              {verificationData.overallScore}%
            </span>
          </div>
          <Progress value={verificationData.overallScore} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {verificationData.canProceed
              ? "Data er klar til booking"
              : "Ret venligst fejlene før fortsættelse"}
          </p>
        </div>

        {/* Verification Items */}
        <div className="space-y-2">
          <h5 className="text-sm font-semibold">Verificeringsdetaljer:</h5>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {verificationData.verifications.map(item => (
              <div
                key={item.id}
                className={cn(
                  "p-3 rounded-lg border",
                  getStatusColor(item.status)
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1">
                    <div className="mt-0.5">{getTypeIcon(item.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {item.label}
                        </span>
                        {getStatusIcon(item.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.value}
                      </p>
                      {item.message && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.message}
                        </p>
                      )}

                      {/* Suggestions */}
                      {item.suggestions && item.suggestions.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-medium">Forslag:</p>
                          {item.suggestions.map((suggestion, idx) => (
                            <button
                              key={idx}
                              onClick={() => onFixItem?.(item.id, suggestion)}
                              className="w-full text-left p-1 rounded bg-white dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs border"
                            >
                              💡 {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Verify Button */}
                  {item.status === "pending" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleVerify(item.id)}
                      disabled={isVerifying && verifyingItem === item.id}
                    >
                      {isVerifying && verifyingItem === item.id ? (
                        <>
                          <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                          Verificerer...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Verificer
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Warning Message */}
        {!verificationData.canProceed && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="text-xs text-red-700 dark:text-red-400">
                <p className="font-semibold">Advarsel:</p>
                <p>
                  Der er {errorsCount} fejl{errorsCount > 1 ? "r" : ""} der skal
                  rettes før booking kan fortsætte.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            onClick={onProceedAnyway}
            className="flex-1"
            disabled={!verificationData.canProceed}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Fortsæt til booking
          </Button>
          <Button onClick={onCancel} variant="outline" className="flex-1">
            Annuller
          </Button>
        </div>
      </div>
    </Card>
  );
}

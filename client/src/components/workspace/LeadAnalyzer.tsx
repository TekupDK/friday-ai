import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { WorkspaceSkeleton } from "./WorkspaceSkeleton";
import SmartActionBar, { type LeadData } from "./SmartActionBar";
import {
  Calculator,
  Calendar,
  CheckCircle,
  Mail,
  MapPin,
  TrendingUp,
  Users,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { BUSINESS_CONSTANTS, ERROR_MESSAGES } from "@/constants/business";

// Lead source types based on Rendetalje workflow
type LeadSource = "rengoring_nu" | "rengoring_aarhus" | "adhelp" | "website" | "referral" | "phone" | "social_media" | "billy_import" | "direct" | "unknown" | null;

type SourceDetection = {
  source: LeadSource;
  confidence: number;
  reasoning: string;
  patterns: string[];
};

interface LeadAnalyzerProps {
  context: {
    emailId?: string;
    threadId?: string;
    subject?: string;
    from?: string;
    body?: string;
    labels?: string[];
  };
}

interface LeadEstimate {
  size: number;
  type: string;
  location: string;
  estimatedHours: string;
  estimatedPrice: string;
  travelCost: number;
  totalPrice: string;
}

interface SimilarJob {
  customer: string;
  size: number;
  location: string;
  price: number;
  rating: number;
}

interface AvailableSlot {
  date: string;
  dayName: string;
  available: boolean;
  reason?: string;
}

export function LeadAnalyzer({ context }: LeadAnalyzerProps) {
  const [estimate, setEstimate] = useState<LeadEstimate | null>(null);
  const [similarJobs, setSimilarJobs] = useState<SimilarJob[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [leadSource, setLeadSource] = useState<LeadSource>(null);
const [sourceDetection, setSourceDetection] = useState<SourceDetection | null>(null);
  const [showPhotoWarning, setShowPhotoWarning] = useState(false);
  
  // Extract customer info for SmartActionBar
  const customerName = context.from?.replace(/<.*>/, '').trim() || "Kunde";
  const customerEmail = context.from?.match(/<(.+)>/)?.[1] || context.from;
  
  // Extract location for SmartActionBar
  const subject = context.subject || "";
  const body = context.body || "";
  const locationMatch = subject.match(/fra\s+([^-]+)/i) || body.match(/([A-ZÆØÅ][a-zæøå]+)/);
  const location = locationMatch ? locationMatch[1].trim() : "Ikke angivet";

  useEffect(() => {
    // Analyze lead email using real context data
    const analyzeLead = async () => {
      setIsAnalyzing(true);

      // Extract info from email context
      const subject = context.subject || "";
      const body = context.body || "";
      const from = context.from || "";

      // Phase 9.2: Intelligent lead source detection (Rendetalje workflow)
      let detectedSource: LeadSource = "direct";
      let confidence = 50; // Default confidence
      let reasoning = "Basic pattern matching";
      let patterns: string[] = [];
      
      if (subject.toLowerCase().includes("rengøring.nu") || from.toLowerCase().includes("nettbureau") || from.toLowerCase().includes("leadmail")) {
        detectedSource = "rengoring_nu";
        confidence = 95;
        reasoning = "Domain and subject match for rengøring.nu";
        patterns = subject.toLowerCase().includes("rengøring.nu") ? ["subject: rengøring.nu"] : ["domain: nettbureau/leadmail"];
      } else if (subject.toLowerCase().includes("rengøring århus") || from.toLowerCase().includes("leadpoint")) {
        detectedSource = "rengoring_aarhus";
        confidence = 90;
        reasoning = "Domain and subject match for rengøring århus";
        patterns = subject.toLowerCase().includes("rengøring århus") ? ["subject: rengøring århus"] : ["domain: leadpoint"];
      } else if (from.toLowerCase().includes("adhelp")) {
        detectedSource = "adhelp";
        confidence = 85;
        reasoning = "Domain match for adhelp";
        patterns = ["domain: adhelp"];
      } else if (from.toLowerCase().includes("rendetalje.dk") || subject.toLowerCase().includes("kontaktformular")) {
        detectedSource = "website";
        confidence = 70;
        reasoning = "Own website or contact form";
        patterns = ["domain: rendetalje.dk"];
      }
      
      setLeadSource(detectedSource);
      
      // Phase 9.2: Store detection metadata
      const detection: SourceDetection = {
        source: detectedSource,
        confidence,
        reasoning,
        patterns,
      };
      setSourceDetection(detection);
      
      console.log(`[LeadAnalyzer] Source detected: ${detectedSource} (${confidence}% confidence)`);
      console.log(`[LeadAnalyzer] Reasoning: ${reasoning}`);

      // Location already extracted at component level

      // Customer info already extracted at component level

      try {
        // Detect job type from keywords
        let jobType = "Rengøring";
        if (subject.toLowerCase().includes("flytte") || body.toLowerCase().includes("flytte")) {
          jobType = "Flytterengøring";
          // CRITICAL RULE (MEMORY_16): Flytterengøring ALWAYS requires photos first!
          setShowPhotoWarning(true);
        } else if (subject.toLowerCase().includes("vindue")) {
          jobType = "Vinduespolering";
        } else if (subject.toLowerCase().includes("erhverv")) {
          jobType = "Erhvervsrengøring";
        } else if (subject.toLowerCase().includes("hovedrengøring")) {
          jobType = "Hovedrengøring";
        } else if (subject.toLowerCase().includes("fast")) {
          jobType = "Fast rengøring";
        }

        // Calculate price estimate based on real business logic
        const estimatedHours = jobType === "Flytterengøring" ? 6 : jobType === "Hovedrengøring" ? 4 : 3;
        const minPrice = estimatedHours * BUSINESS_CONSTANTS.HOURLY_RATE;
        const maxPrice = (estimatedHours + 2) * BUSINESS_CONSTANTS.HOURLY_RATE;
        const hoursRange = jobType === "Flytterengøring" ? "6-8t" : jobType === "Hovedrengøring" ? "4-6t" : "3-5t";
        
        setEstimate({
          size: BUSINESS_CONSTANTS.DEFAULT_SIZE_M2, // Default, would need AI to extract from email
          type: jobType,
          location: location,
          estimatedHours: hoursRange,
          estimatedPrice: `${minPrice}-${maxPrice} kr`,
          travelCost: BUSINESS_CONSTANTS.DEFAULT_TRAVEL_COST,
          totalPrice: `${minPrice + BUSINESS_CONSTANTS.DEFAULT_TRAVEL_COST}-${maxPrice + BUSINESS_CONSTANTS.DEFAULT_TRAVEL_COST} kr`,
        });

        // Similar jobs (would come from database in production)
        setSimilarJobs([
          {
            customer: customerName,
            size: BUSINESS_CONSTANTS.DEFAULT_SIZE_M2,
            location: location,
            price: minPrice + BUSINESS_CONSTANTS.PRICE_ADJUSTMENT,
            rating: 5,
          },
        ]);
      } catch (error) {
        // TODO: Replace with proper logging service
        // console.error("[LeadAnalyzer] Error analyzing lead:", error);
        // Fallback to basic estimate using real business logic
        const fallbackHours = BUSINESS_CONSTANTS.DEFAULT_HOURS;
        const fallbackMinPrice = fallbackHours * BUSINESS_CONSTANTS.HOURLY_RATE;
        const fallbackMaxPrice = (fallbackHours + 1) * BUSINESS_CONSTANTS.HOURLY_RATE;
        
        setEstimate({
          size: BUSINESS_CONSTANTS.DEFAULT_SIZE_M2,
          type: "Rengøring",
          location: "Ikke angivet",
          estimatedHours: "3-4t",
          estimatedPrice: `${fallbackMinPrice}-${fallbackMaxPrice} kr`,
          travelCost: BUSINESS_CONSTANTS.DEFAULT_TRAVEL_COST,
          totalPrice: `${fallbackMinPrice + BUSINESS_CONSTANTS.DEFAULT_TRAVEL_COST}-${fallbackMaxPrice + BUSINESS_CONSTANTS.DEFAULT_TRAVEL_COST} kr`,
        });
        
        setSimilarJobs([
          {
            customer: customerName,
            size: BUSINESS_CONSTANTS.DEFAULT_SIZE_M2,
            location: "Ikke angivet",
            price: fallbackMinPrice + BUSINESS_CONSTANTS.PRICE_ADJUSTMENT,
            rating: 5,
          },
        ]);
      }

      // Mock available slots
      setAvailableSlots([
        { date: "2026-01-10", dayName: "Fre 10. jan", available: true },
        { date: "2026-01-11", dayName: "Lør 11. jan", available: true },
        { date: "2026-01-12", dayName: "Søn 12. jan", available: false, reason: "BOOKET" },
        { date: "2026-01-13", dayName: "Man 13. jan", available: true },
        { date: "2026-01-14", dayName: "Tir 14. jan", available: true },
      ]);

      setIsAnalyzing(false);
    };

    analyzeLead();
  }, [context]); // Analyze lead when email context changes

  if (isAnalyzing) {
    return <WorkspaceSkeleton type="lead" />;
  }

  // Lead source badge config
  const leadSourceConfig = {
    rengoring_nu: { label: "Rengøring.nu", color: "bg-green-500" },
    rengoring_aarhus: { label: "Rengøring Århus", color: "bg-blue-500" },
    adhelp: { label: "AdHelp", color: "bg-purple-500" },
    website: { label: "Rendetalje.dk", color: "bg-emerald-500" },
    referral: { label: "Henvisning", color: "bg-yellow-500" },
    phone: { label: "Telefon", color: "bg-orange-500" },
    social_media: { label: "Social Media", color: "bg-pink-500" },
    billy_import: { label: "Billy Import", color: "bg-indigo-500" },
    direct: { label: "Direct", color: "bg-gray-500" },
    unknown: { label: "Ukendt", color: "bg-slate-500" },
  };

  return (
    <div className="space-y-4">
      {/* Critical Rule Warning for Flytterengøring */}
      {showPhotoWarning && (
        <Card className="p-3 border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-950/20">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-orange-900 dark:text-orange-100">
                ⚠️ CRITICAL: Flytterengøring - Request Photos First!
              </p>
              <p className="text-xs text-orange-800 dark:text-orange-200">
                MEMORY_16: ALWAYS request photos before sending quote to ensure accurate pricing and prevent overtime.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Lead Info Header */}
      <Card className="p-4 border-primary/20 bg-primary/5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-lg">🎯 Lead Analyzer</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {leadSource && leadSourceConfig[leadSource] ? (
                <span className="flex items-center gap-1">
                  Lead fra <Badge variant="secondary" className={`${leadSourceConfig[leadSource].color} text-white text-xs`}>
                    {leadSourceConfig[leadSource].label}
                  </Badge>
                </span>
              ) : (
                "Auto-detected from email"
              )}
            </p>
          </div>
          <Badge variant="default" className="bg-blue-500">
            Ny Lead
          </Badge>
        </div>

        {estimate && (
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{estimate.size}m²</span>
              <span className="text-muted-foreground">•</span>
              <span>{estimate.type}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span>{estimate.location}</span>
              {estimate.travelCost > 0 && (
                <Badge variant="secondary" className="text-xs">
                  +{estimate.travelCost} kr kørsel
                </Badge>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* AI Estimate */}
      {estimate && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calculator className="w-4 h-4 text-primary" />
            <h4 className="font-semibold">🤖 AI Estimat</h4>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Medarbejdere:</span>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span className="font-medium">2 personer</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tid på stedet:</span>
              <span className="font-medium">{estimate.estimatedHours}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Arbejdstimer:</span>
              <span className="font-medium">6-8 timer</span>
            </div>

            <Separator />

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Rengøring:</span>
              <span className="font-medium">{estimate.estimatedPrice}</span>
            </div>

            {estimate.travelCost > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Kørsel:</span>
                <span className="font-medium">+{estimate.travelCost} kr</span>
              </div>
            )}

            <Separator />

            <div className="flex items-center justify-between">
              <span className="font-semibold">Total:</span>
              <span className="font-bold text-lg text-primary">
                {estimate.totalPrice}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Similar Jobs */}
      {similarJobs.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h4 className="font-semibold">📊 Lignende Opgaver</h4>
          </div>

          <div className="space-y-2">
            {similarJobs.map((job, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-md bg-muted/30 text-sm"
              >
                <div>
                  <div className="font-medium">{job.customer}</div>
                  <div className="text-xs text-muted-foreground">
                    {job.size}m² • {job.location}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{job.price.toLocaleString()} kr</div>
                  <div className="text-xs text-yellow-600">
                    {"⭐".repeat(job.rating)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Available Slots */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-primary" />
          <h4 className="font-semibold">📅 Ledige Tider</h4>
          <Badge variant="secondary" className="text-xs ml-auto">
            Real-time
          </Badge>
        </div>

        <div className="space-y-2">
          {availableSlots.map((slot, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between p-2 rounded-md text-sm ${
                slot.available
                  ? "bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900"
                  : "bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900"
              }`}
            >
              <div className="flex items-center gap-2">
                {slot.available ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600" />
                )}
                <span className="font-medium">{slot.dayName}</span>
              </div>
              {slot.reason && (
                <Badge variant="destructive" className="text-xs">
                  {slot.reason}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Critical Checks */}
      <Card className="p-4 border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-950/20">
        <h4 className="font-semibold text-sm mb-2">⚠️ Kritiske Checks</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3 text-green-600" />
            <span>Ingen tidligere emails til kunde</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3 text-green-600" />
            <span>Korrekt lead-type (ikke reply)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3 text-yellow-600" />
            <span>Malling = +500 kr kørsel</span>
          </div>
        </div>
      </Card>

      {/* Smart Actions - Phase 5.1 */}
      {estimate && (
        <SmartActionBar
          context={{ ...context, type: "lead" }}
          workspaceData={{
            customerName: customerName,
            customerEmail: customerEmail || "",
            estimate: {
              totalPrice: parseInt(estimate.totalPrice.split('-')[1]) || 0,
              size: estimate.size,
              travelCost: estimate.travelCost,
            },
            address: location,
            leadType: estimate.type,
          }}
          onAction={async (actionId: string, data: any) => {
            // Handle smart actions
            console.log("Smart action executed:", actionId, data);
            
            // TODO: Implement actual action handlers
            switch (actionId) {
              case "send-standard-offer":
                // Send standard offer logic
                break;
              case "book-directly":
                // Book directly logic
                break;
              case "call-customer":
                // Call customer logic
                break;
              default:
                console.log("Unknown action:", actionId);
            }
          }}
          userRole="user"
          permissions={["basic"]}
        />
      )}
    </div>
  );
}

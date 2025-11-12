/**
 * ABOUT/INFO - Om systemet og information
 */

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Info,
  Code,
  Users,
  Shield,
  Zap,
  Heart,
  ExternalLink,
  Mail,
  Github,
  Twitter,
  Globe,
} from "lucide-react";
import { useState } from "react";

export interface SystemInfo {
  name: string;
  version: string;
  build: string;
  environment: "development" | "staging" | "production";
  lastUpdated: string;
  uptime: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  bio?: string;
}

export interface FeatureInfo {
  id: string;
  name: string;
  description: string;
  status: "active" | "beta" | "coming-soon";
  icon: any;
}

interface AboutInfoProps {
  systemInfo?: SystemInfo;
  teamMembers?: TeamMember[];
  features?: FeatureInfo[];
  onCheckUpdates?: () => void;
  onContactTeam?: () => void;
  onViewDocs?: () => void;
}

export function AboutInfo({
  systemInfo,
  teamMembers = [],
  features = [],
  onCheckUpdates,
  onContactTeam,
  onViewDocs,
}: AboutInfoProps) {
  const [activeTab, setActiveTab] = useState<
    "system" | "team" | "features" | "contact"
  >("system");

  // Default system info
  const defaultSystemInfo: SystemInfo = {
    name: "Tekup AI v2",
    version: "2.1.0",
    build: "2024.01.15.1423",
    environment: "production",
    lastUpdated: "15. januar 2024",
    uptime: "14 dage, 7 timer, 32 minutter",
  };

  // Default team members
  const defaultTeamMembers: TeamMember[] = [
    {
      id: "1",
      name: "John Smith",
      role: "Lead Developer",
      bio: "Full-stack developer med passion for AI og moderne web teknologier",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      role: "Product Manager",
      bio: "Product manager med erfaring i SaaS og enterprise software",
    },
    {
      id: "3",
      name: "Mike Wilson",
      role: "UI/UX Designer",
      bio: "Designer med fokus på brugeroplevelse og intuitivt design",
    },
    {
      id: "4",
      name: "Emma Davis",
      role: "Backend Engineer",
      bio: "Backend specialist med ekspertise i skalering og performance",
    },
  ];

  // Default features
  const defaultFeatures: FeatureInfo[] = [
    {
      id: "1",
      name: "AI Email Assistant",
      description:
        "Intelligent email assistance med auto-fuldførelse og suggestions",
      status: "active",
      icon: Mail,
    },
    {
      id: "2",
      name: "Realtime Collaboration",
      description:
        "Samarbejd i real-time med live cursors og typing indicators",
      status: "active",
      icon: Users,
    },
    {
      id: "3",
      name: "Smart Search",
      description: "Universal søgning på tværs af alle systemets funktioner",
      status: "beta",
      icon: Zap,
    },
    {
      id: "4",
      name: "Voice Commands",
      description: "Styr systemet med stemmekommandoer og dictation",
      status: "coming-soon",
      icon: Zap,
    },
    {
      id: "5",
      name: "Advanced Analytics",
      description: "Detaljeret analyse og rapportering af brugsdata",
      status: "beta",
      icon: Code,
    },
    {
      id: "6",
      name: "Mobile App",
      description: "Fuld funktions mobil applikation til iOS og Android",
      status: "coming-soon",
      icon: Globe,
    },
  ];

  const currentSystemInfo = systemInfo || defaultSystemInfo;
  const currentTeamMembers =
    teamMembers.length > 0 ? teamMembers : defaultTeamMembers;
  const currentFeatures = features.length > 0 ? features : defaultFeatures;

  const getEnvironmentColor = (environment: SystemInfo["environment"]) => {
    switch (environment) {
      case "development":
        return "bg-yellow-500";
      case "staging":
        return "bg-blue-500";
      case "production":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusColor = (status: FeatureInfo["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "beta":
        return "bg-yellow-500";
      case "coming-soon":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: FeatureInfo["status"]) => {
    switch (status) {
      case "active":
        return "Aktiv";
      case "beta":
        return "Beta";
      case "coming-soon":
        return "Kommer snart";
      default:
        return status;
    }
  };

  return (
    <Card className="border-l-4 border-l-gray-500">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-gray-500 to-slate-600 flex items-center justify-center shadow-md">
              <Info className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold">About / Info</h4>
              <p className="text-xs text-muted-foreground">
                Om systemet og information
              </p>
            </div>
          </div>
          <Badge className={getEnvironmentColor(currentSystemInfo.environment)}>
            {currentSystemInfo.environment}
          </Badge>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-lg bg-muted">
          {[
            { id: "system", label: "System", icon: Info },
            { id: "team", label: "Team", icon: Users },
            { id: "features", label: "Funktioner", icon: Zap },
            { id: "contact", label: "Kontakt", icon: Mail },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1",
                  activeTab === tab.id
                    ? "bg-background shadow-sm"
                    : "hover:bg-background/50"
                )}
              >
                <Icon className="w-3 h-3" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* System Tab */}
        {activeTab === "system" && (
          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-linear-to-r from-gray-50 to-slate-50 dark:from-gray-900 dark:to-slate-900 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-linear-to-br from-gray-500 to-slate-600 flex items-center justify-center text-white">
                  <Code className="w-6 h-6" />
                </div>
                <div>
                  <h5 className="font-semibold text-lg">
                    {currentSystemInfo.name}
                  </h5>
                  <p className="text-sm text-muted-foreground">
                    Version {currentSystemInfo.version}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Build:</span>
                  <p className="font-mono">{currentSystemInfo.build}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Miljø:</span>
                  <Badge
                    className={getEnvironmentColor(
                      currentSystemInfo.environment
                    )}
                  >
                    {currentSystemInfo.environment}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    Sidst opdateret:
                  </span>
                  <p>{currentSystemInfo.lastUpdated}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Uptime:</span>
                  <p>{currentSystemInfo.uptime}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="text-sm font-semibold">System status:</h5>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/20 text-center">
                  <p className="font-bold text-green-700 dark:text-green-300">
                    ✅
                  </p>
                  <p className="text-green-600 dark:text-green-400">
                    API Status
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/20 text-center">
                  <p className="font-bold text-green-700 dark:text-green-300">
                    ✅
                  </p>
                  <p className="text-green-600 dark:text-green-400">Database</p>
                </div>
                <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/20 text-center">
                  <p className="font-bold text-green-700 dark:text-green-300">
                    ✅
                  </p>
                  <p className="text-green-600 dark:text-green-400">
                    AI Services
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/20 text-center">
                  <p className="font-bold text-green-700 dark:text-green-300">
                    ✅
                  </p>
                  <p className="text-green-600 dark:text-green-400">Email</p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-700 dark:text-blue-400">
                  <p className="font-semibold mb-1">Sikkerhed:</p>
                  <ul className="space-y-1">
                    <li>• End-to-end encryption for alle data</li>
                    <li>• GDPR compliant data behandling</li>
                    <li>• Daglige backups og disaster recovery</li>
                    <li>• 24/7 monitoring og threat detection</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Team Tab */}
        {activeTab === "team" && (
          <div className="space-y-3">
            <h5 className="text-sm font-semibold">Vores team:</h5>
            <div className="space-y-2">
              {currentTeamMembers.map(member => (
                <div
                  key={member.id}
                  className="p-3 rounded-lg bg-background border border-border"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                      {member.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {member.name}
                        </span>
                        <Badge className="bg-blue-500">{member.role}</Badge>
                      </div>
                      {member.bio && (
                        <p className="text-xs text-muted-foreground">
                          {member.bio}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
              <div className="flex items-start gap-2">
                <Users className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div className="text-xs text-purple-700 dark:text-purple-400">
                  <p className="font-semibold mb-1">Om vores team:</p>
                  <p>
                    Vi er et passioneret team af udviklere, designere og product
                    managers dedikeret til at skabe den bedste AI-drevne
                    business platform.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features Tab */}
        {activeTab === "features" && (
          <div className="space-y-3">
            <h5 className="text-sm font-semibold">Funktioner:</h5>
            <div className="space-y-2">
              {currentFeatures.map(feature => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.id}
                    className="p-3 rounded-lg bg-background border border-border"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {feature.name}
                          </span>
                          <Badge className={getStatusColor(feature.status)}>
                            {getStatusLabel(feature.status)}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/20 text-center">
                <p className="font-bold text-green-700 dark:text-green-300">
                  {currentFeatures.filter(f => f.status === "active").length}
                </p>
                <p className="text-green-600 dark:text-green-400">Aktive</p>
              </div>
              <div className="p-2 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 text-center">
                <p className="font-bold text-yellow-700 dark:text-yellow-300">
                  {currentFeatures.filter(f => f.status === "beta").length}
                </p>
                <p className="text-yellow-600 dark:text-yellow-400">Beta</p>
              </div>
              <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-950/20 text-center">
                <p className="font-bold text-gray-700 dark:text-gray-300">
                  {
                    currentFeatures.filter(f => f.status === "coming-soon")
                      .length
                  }
                </p>
                <p className="text-gray-600 dark:text-gray-400">Kommer snart</p>
              </div>
            </div>
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === "contact" && (
          <div className="space-y-3">
            <h5 className="text-sm font-semibold">Kontakt os:</h5>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() =>
                  (window.location.href = "mailto:support@tekup.dk")
                }
                className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <Mail className="w-5 h-5 text-blue-600 mb-2" />
                <div className="text-sm font-medium">Email</div>
                <div className="text-xs text-muted-foreground">
                  support@tekup.dk
                </div>
              </button>

              <button
                onClick={() =>
                  window.open("https://github.com/tekup", "_blank")
                }
                className="p-3 rounded-lg bg-gray-50 dark:bg-gray-950/20 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Github className="w-5 h-5 text-gray-600 mb-2" />
                <div className="text-sm font-medium">GitHub</div>
                <div className="text-xs text-muted-foreground">
                  github.com/tekup
                </div>
              </button>

              <button
                onClick={() =>
                  window.open("https://twitter.com/tekup", "_blank")
                }
                className="p-3 rounded-lg bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900/30 transition-colors"
              >
                <Twitter className="w-5 h-5 text-sky-600 mb-2" />
                <div className="text-sm font-medium">Twitter</div>
                <div className="text-xs text-muted-foreground">@tekup</div>
              </button>

              <button
                onClick={() => window.open("https://tekup.dk", "_blank")}
                className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
              >
                <Globe className="w-5 h-5 text-green-600 mb-2" />
                <div className="text-sm font-medium">Website</div>
                <div className="text-xs text-muted-foreground">tekup.dk</div>
              </button>
            </div>

            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-950/20 border border-gray-200 dark:border-gray-800">
              <div className="flex items-start gap-2">
                <Heart className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="text-xs text-gray-700 dark:text-gray-400">
                  <p className="font-semibold mb-1">Lavet med ❤️ i Danmark</p>
                  <p>
                    Tak fordi du bruger Tekup AI v2! Vi værdsætter dit feedback
                    og er altid klar til at hjælpe.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-700 dark:text-amber-400">
                  <p className="font-semibold mb-1">Support information:</p>
                  <ul className="space-y-1">
                    <li>• Support åbningstider: Mandag-Fredag 09:00-17:00</li>
                    <li>
                      • Gennemsnitlig svartid: 2 timer (email), 5 minutter
                      (chat)
                    </li>
                    <li>• Gratis support for alle abonnementer</li>
                    <li>• Enterprise support med SLA tilgængelig</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-center">
            <p className="font-bold text-blue-700 dark:text-blue-300">
              {currentTeamMembers.length}
            </p>
            <p className="text-blue-600 dark:text-blue-400">Team medlemmer</p>
          </div>
          <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/20 text-center">
            <p className="font-bold text-green-700 dark:text-green-300">
              {currentFeatures.filter(f => f.status === "active").length}
            </p>
            <p className="text-green-600 dark:text-green-400">
              Aktive funktioner
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t">
          <Button
            onClick={onCheckUpdates}
            className="bg-linear-to-r from-gray-600 to-slate-600"
          >
            <Zap className="w-4 h-4 mr-2" />
            Tjek for opdateringer
          </Button>
          <Button onClick={onViewDocs} variant="outline">
            <ExternalLink className="w-4 h-4 mr-2" />
            Åbn dokumentation
          </Button>
          <Button onClick={onContactTeam} variant="outline">
            <Mail className="w-4 h-4 mr-2" />
            Kontakt team
          </Button>
          <Button
            onClick={() => window.open("/changelog", "_blank")}
            variant="outline"
          >
            <Code className="w-4 h-4 mr-2" />
            Ændringslog
          </Button>
        </div>
      </div>
    </Card>
  );
}

/**
 * SETTINGS PANEL - Indstillinger og konfiguration
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Bell,
  Database,
  Download,
  RotateCcw,
  Save,
  Settings,
  Shield,
  Upload,
  User,
  Zap,
} from "lucide-react";
import { useState } from "react";

export interface SettingsSection {
  id: string;
  title: string;
  description: string;
  icon: any;
  settings: Array<{
    id: string;
    label: string;
    type: "toggle" | "select" | "input" | "slider";
    value: any;
    options?: string[];
    min?: number;
    max?: number;
    description?: string;
  }>;
}

interface SettingsPanelProps {
  sections?: SettingsSection[];
  onSave?: (settings: Record<string, any>) => void;
  onReset?: () => void;
  onExport?: () => void;
  onImport?: () => void;
}

export function SettingsPanel({
  sections = [],
  onSave,
  onReset,
  onExport,
  onImport,
}: SettingsPanelProps) {
  const [activeSection, setActiveSection] = useState<string>("general");
  const [settings, setSettings] = useState<Record<string, any>>({
    // General settings
    language: "dansk",
    theme: "light",
    autoSave: true,
    autoSaveInterval: 30,

    // User settings
    fullName: "John Smith",
    email: "john@company.com",
    avatar: "",
    role: "Administrator",

    // Notification settings
    emailNotifications: true,
    pushNotifications: true,
    soundEnabled: true,
    notificationFrequency: "immediate",

    // Security settings
    twoFactorAuth: false,
    sessionTimeout: 60,
    loginAlerts: true,

    // Privacy settings
    shareUsageData: false,
    analyticsEnabled: true,
    publicProfile: false,

    // Database settings
    backupEnabled: true,
    backupFrequency: "daily",
    retentionPeriod: 30,

    // Performance settings
    cachingEnabled: true,
    compressionEnabled: true,
    lazyLoading: true,
  });

  // Default settings sections
  const defaultSections: SettingsSection[] = [
    {
      id: "general",
      title: "Generelt",
      description: "Generelle indstillinger",
      icon: Settings,
      settings: [
        {
          id: "language",
          label: "Sprog",
          type: "select",
          value: settings.language,
          options: ["dansk", "english", "svenska", "norsk"],
          description: "Vælg dit foretrukne sprog",
        },
        {
          id: "theme",
          label: "Tema",
          type: "select",
          value: settings.theme,
          options: ["light", "dark", "auto"],
          description: "Vælg farvetema for applikationen",
        },
        {
          id: "autoSave",
          label: "Auto-gem",
          type: "toggle",
          value: settings.autoSave,
          description: "Gem automatisk dine ændringer",
        },
        {
          id: "autoSaveInterval",
          label: "Auto-gem interval (sekunder)",
          type: "slider",
          value: settings.autoSaveInterval,
          min: 10,
          max: 300,
          description: "Hvor ofte skal der auto-gemmes",
        },
      ],
    },
    {
      id: "user",
      title: "Bruger",
      description: "Dine brugeroplysninger",
      icon: User,
      settings: [
        {
          id: "fullName",
          label: "Fulde navn",
          type: "input",
          value: settings.fullName,
          description: "Dit fulde navn",
        },
        {
          id: "email",
          label: "Email",
          type: "input",
          value: settings.email,
          description: "Din email adresse",
        },
        {
          id: "role",
          label: "Rolle",
          type: "select",
          value: settings.role,
          options: ["Administrator", "Manager", "User", "Viewer"],
          description: "Din rolle i systemet",
        },
      ],
    },
    {
      id: "notifications",
      title: "Notifikationer",
      description: "Notifikationsindstillinger",
      icon: Bell,
      settings: [
        {
          id: "emailNotifications",
          label: "Email notifikationer",
          type: "toggle",
          value: settings.emailNotifications,
          description: "Modtag notifikationer via email",
        },
        {
          id: "pushNotifications",
          label: "Push notifikationer",
          type: "toggle",
          value: settings.pushNotifications,
          description: "Modtag push notifikationer",
        },
        {
          id: "soundEnabled",
          label: "Lyd til notifikationer",
          type: "toggle",
          value: settings.soundEnabled,
          description: "Afspil lyd ved notifikationer",
        },
        {
          id: "notificationFrequency",
          label: "Notifikations frekvens",
          type: "select",
          value: settings.notificationFrequency,
          options: ["immediate", "hourly", "daily", "weekly"],
          description: "Hvor ofte skal du modtage notifikationer",
        },
      ],
    },
    {
      id: "security",
      title: "Sikkerhed",
      description: "Sikkerhedsindstillinger",
      icon: Shield,
      settings: [
        {
          id: "twoFactorAuth",
          label: "To-faktor autentificering",
          type: "toggle",
          value: settings.twoFactorAuth,
          description: "Aktiver to-faktor autentificering",
        },
        {
          id: "sessionTimeout",
          label: "Session timeout (minutter)",
          type: "slider",
          value: settings.sessionTimeout,
          min: 15,
          max: 480,
          description: "Hvor længe en session varer",
        },
        {
          id: "loginAlerts",
          label: "Login advarsler",
          type: "toggle",
          value: settings.loginAlerts,
          description: "Modtag advarsler ved nye logins",
        },
      ],
    },
    {
      id: "privacy",
      title: "Privatliv",
      description: "Privatlivsindstillinger",
      icon: Shield,
      settings: [
        {
          id: "shareUsageData",
          label: "Del brugsdata",
          type: "toggle",
          value: settings.shareUsageData,
          description: "Del anonym brugsdata for at forbedre produktet",
        },
        {
          id: "analyticsEnabled",
          label: "Analytics",
          type: "toggle",
          value: settings.analyticsEnabled,
          description: "Aktiver analytics og sporing",
        },
        {
          id: "publicProfile",
          label: "Offentlig profil",
          type: "toggle",
          value: settings.publicProfile,
          description: "Gør din profil offentlig",
        },
      ],
    },
    {
      id: "database",
      title: "Database",
      description: "Database indstillinger",
      icon: Database,
      settings: [
        {
          id: "backupEnabled",
          label: "Backup aktiveret",
          type: "toggle",
          value: settings.backupEnabled,
          description: "Aktiver automatisk backup",
        },
        {
          id: "backupFrequency",
          label: "Backup frekvens",
          type: "select",
          value: settings.backupFrequency,
          options: ["hourly", "daily", "weekly", "monthly"],
          description: "Hvor ofte skal der tages backup",
        },
        {
          id: "retentionPeriod",
          label: "Opbevaringsperiode (dage)",
          type: "slider",
          value: settings.retentionPeriod,
          min: 7,
          max: 365,
          description: "Hvor længe data skal opbevares",
        },
      ],
    },
  ];

  const allSections = sections.length > 0 ? sections : defaultSections;

  const currentSection =
    allSections.find(section => section.id === activeSection) || allSections[0];

  const handleSettingChange = (settingId: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [settingId]: value,
    }));
  };

  const handleSave = () => {
    onSave?.(settings);
  };

  const handleReset = () => {
    onReset?.();
    // Reset to default values
    setSettings({
      language: "dansk",
      theme: "light",
      autoSave: true,
      autoSaveInterval: 30,
      fullName: "John Smith",
      email: "john@company.com",
      role: "Administrator",
      emailNotifications: true,
      pushNotifications: true,
      soundEnabled: true,
      notificationFrequency: "immediate",
      twoFactorAuth: false,
      sessionTimeout: 60,
      loginAlerts: true,
      shareUsageData: false,
      analyticsEnabled: true,
      publicProfile: false,
      backupEnabled: true,
      backupFrequency: "daily",
      retentionPeriod: 30,
      cachingEnabled: true,
      compressionEnabled: true,
      lazyLoading: true,
    });
  };

  const renderSettingInput = (setting: any) => {
    switch (setting.type) {
      case "toggle":
        return (
          <button
            onClick={() => handleSettingChange(setting.id, !setting.value)}
            className={cn(
              "w-12 h-6 rounded-full transition-colors",
              setting.value ? "bg-blue-500" : "bg-gray-300"
            )}
          >
            <div
              className={cn(
                "w-5 h-5 bg-white rounded-full transition-transform",
                setting.value ? "translate-x-6" : "translate-x-0.5"
              )}
            />
          </button>
        );

      case "select":
        return (
          <select
            value={setting.value}
            onChange={e => handleSettingChange(setting.id, e.target.value)}
            className="px-3 py-1 border rounded text-sm"
          >
            {setting.options?.map((option: string) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case "input":
        return (
          <input
            type="text"
            value={setting.value}
            onChange={e => handleSettingChange(setting.id, e.target.value)}
            className="px-3 py-1 border rounded text-sm w-full"
          />
        );

      case "slider":
        return (
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={setting.min}
              max={setting.max}
              value={setting.value}
              onChange={e =>
                handleSettingChange(setting.id, parseInt(e.target.value))
              }
              className="flex-1"
            />
            <span className="text-sm font-medium w-12 text-right">
              {setting.value}
            </span>
          </div>
        );

      default:
        return null;
    }
  };

  const getSectionIcon = (sectionId: string) => {
    switch (sectionId) {
      case "general":
        return Settings;
      case "user":
        return User;
      case "notifications":
        return Bell;
      case "security":
        return Shield;
      case "privacy":
        return Shield;
      case "database":
        return Database;
      default:
        return Settings;
    }
  };

  return (
    <Card className="border-l-4 border-l-gray-500">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-gray-500 to-slate-600 flex items-center justify-center shadow-md">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold">Settings Panel</h4>
              <p className="text-xs text-muted-foreground">
                Indstillinger og konfiguration
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-gray-500">
              {allSections.length} sektioner
            </Badge>
            <Button size="sm" variant="ghost" onClick={handleSave}>
              <Save className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Section Navigation */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Sektioner:
          </label>
          <div className="grid grid-cols-3 gap-1">
            {allSections.map(section => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors",
                    activeSection === section.id
                      ? "bg-gray-500 text-white"
                      : "bg-muted hover:bg-muted/70"
                  )}
                >
                  <Icon className="w-3 h-3" />
                  <span>{section.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Section */}
        {currentSection && (
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-950/20 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <currentSection.icon className="w-4 h-4 text-gray-600" />
                <h5 className="font-semibold text-sm">
                  {currentSection.title}
                </h5>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {currentSection.description}
              </p>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              {currentSection.settings.map(setting => (
                <div key={setting.id} className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <label className="text-sm font-medium">
                        {setting.label}
                      </label>
                      {setting.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {setting.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    {renderSettingInput(setting)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Summary */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-center">
            <p className="font-bold text-blue-700 dark:text-blue-300">
              {
                Object.values(settings).filter(v => typeof v === "boolean" && v)
                  .length
              }
            </p>
            <p className="text-blue-600 dark:text-blue-400">Aktive</p>
          </div>
          <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/20 text-center">
            <p className="font-bold text-green-700 dark:text-green-300">
              {allSections.length}
            </p>
            <p className="text-green-600 dark:text-green-400">Sektioner</p>
          </div>
          <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/20 text-center">
            <p className="font-bold text-orange-700 dark:text-orange-300">
              {currentSection.settings.length}
            </p>
            <p className="text-orange-600 dark:text-orange-400">
              Indstillinger
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-950/20 border border-gray-200 dark:border-gray-800">
          <div className="flex items-start gap-2">
            <Zap className="w-4 h-4 text-gray-600 shrink-0 mt-0.5" />
            <div className="text-xs text-gray-700 dark:text-gray-400">
              <p className="font-semibold mb-1">Hurtige handlinger:</p>
              <ul className="space-y-1">
                <li>• Gem indstillinger automatisk</li>
                <li>• Eksporter konfiguration til backup</li>
                <li>• Importer indstillinger fra fil</li>
                <li>• Nulstil til standardværdier</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t">
          <Button
            onClick={handleSave}
            className="bg-linear-to-r from-gray-600 to-slate-600"
          >
            <Save className="w-4 h-4 mr-2" />
            Gem indstillinger
          </Button>
          <Button onClick={handleReset} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Nulstil
          </Button>
          <Button onClick={onExport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Eksporter
          </Button>
          <Button onClick={onImport} variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Importer
          </Button>
        </div>
      </div>
    </Card>
  );
}

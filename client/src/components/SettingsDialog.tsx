import { Bell, Globe, Moon, Palette, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/contexts/ThemeContext";
import { getLanguage, setLanguage, useI18n, type Language } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { theme, setTheme: setThemeDirect } = useTheme();
  const t = useI18n();

  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">(theme);
  const [currentLanguage, setCurrentLanguage] =
    useState<Language>(getLanguage());
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);

  // Fetch preferences
  const { data: preferences, refetch } = (
    trpc as any
  ).auth.getPreferences.useQuery(undefined, {
    enabled: open,
  });

  // Sync preferences when data is loaded
  useEffect(() => {
    if (preferences) {
      setCurrentTheme(preferences.theme || "dark");
      setCurrentLanguage(
        ("language" in preferences
          ? (preferences.language as Language)
          : null) || "da"
      );
      setEmailNotifications(preferences.emailNotifications ?? true);
      setPushNotifications(
        ("pushNotifications" in preferences
          ? preferences.pushNotifications
          : null) ?? false
      );

      // Sync theme with ThemeContext
      if (preferences.theme && preferences.theme !== theme && setThemeDirect) {
        setThemeDirect(preferences.theme);
      }

      // Sync language
      if ("language" in preferences && preferences.language) {
        setLanguage(preferences.language as Language);
      }
    }
     
  }, [preferences]); // Only re-run when preferences change, not theme/setThemeDirect

  const updatePreferencesMutation = (
    trpc as any
  ).auth.updatePreferences.useMutation({
    onSuccess: () => {
      toast.success("Indstillinger gemt");
      refetch();
    },
    onError: (error: any) => {
      toast.error("Fejl ved opdatering: " + error.message);
    },
  });

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setCurrentTheme(newTheme);

    // Update ThemeContext directly
    if (setThemeDirect) {
      setThemeDirect(newTheme);
    }

    // Update backend
    updatePreferencesMutation.mutate({ theme: newTheme });
  };

  const handleLanguageChange = (newLang: Language) => {
    setCurrentLanguage(newLang);
    setLanguage(newLang);
    updatePreferencesMutation.mutate({ language: newLang });

    // Reload to apply language changes
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const handleEmailNotificationsChange = (enabled: boolean) => {
    setEmailNotifications(enabled);
    updatePreferencesMutation.mutate({ emailNotifications: enabled });
  };

  const handlePushNotificationsChange = (enabled: boolean) => {
    setPushNotifications(enabled);
    updatePreferencesMutation.mutate({ pushNotifications: enabled });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t.settings.title}</DialogTitle>
          <DialogDescription>{t.settings.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Appearance Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Palette className="w-5 h-5 text-primary" />
              {/* ✅ A11Y FIX: Changed to h2 for proper hierarchy per accessibility audit */}
              <h2 className="text-base font-semibold">{t.settings.appearance}</h2>
            </div>
            <div className="pl-8 space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                <div className="flex-1">
                  <p className="text-sm font-medium">{t.settings.theme}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.settings.themeDescription}
                  </p>
                </div>
                <Select
                  value={currentTheme}
                  onValueChange={value =>
                    handleThemeChange(value as "light" | "dark")
                  }
                  disabled={updatePreferencesMutation.isPending}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="w-4 h-4" />
                        {t.settings.themeLight}
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="w-4 h-4" />
                        {t.settings.themeDark}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Notifications Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-primary" />
              {/* ✅ A11Y FIX: Changed to h2 for proper hierarchy per accessibility audit */}
              <h2 className="text-base font-semibold">
                {t.settings.notifications}
              </h2>
            </div>
            <div className="pl-8 space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                <div className="flex-1">
                  <p id="email-notifications-label" className="text-sm font-medium">
                    {t.settings.emailNotifications}
                  </p>
                  <p id="email-notifications-desc" className="text-xs text-muted-foreground">
                    {t.settings.emailNotificationsDescription}
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={handleEmailNotificationsChange}
                  disabled={updatePreferencesMutation.isPending}
                  aria-labelledby="email-notifications-label"
                  aria-describedby="email-notifications-desc"
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                <div className="flex-1">
                  <p id="push-notifications-label" className="text-sm font-medium">
                    {t.settings.pushNotifications}
                  </p>
                  <p id="push-notifications-desc" className="text-xs text-muted-foreground">
                    {t.settings.pushNotificationsDescription}
                  </p>
                </div>
                <Switch
                  checked={pushNotifications}
                  onCheckedChange={handlePushNotificationsChange}
                  disabled={updatePreferencesMutation.isPending}
                  aria-labelledby="push-notifications-label"
                  aria-describedby="push-notifications-desc"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Language Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-primary" />
              {/* ✅ A11Y FIX: Changed to h2 for proper hierarchy per accessibility audit */}
              <h2 className="text-base font-semibold">{t.settings.language}</h2>
            </div>
            <div className="pl-8 space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                <div className="flex-1">
                  <p className="text-sm font-medium">{t.settings.language}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.settings.languageDescription}
                  </p>
                </div>
                <Select
                  value={currentLanguage}
                  onValueChange={value =>
                    handleLanguageChange(value as Language)
                  }
                  disabled={updatePreferencesMutation.isPending}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="da">
                      {t.settings.languageDanish}
                    </SelectItem>
                    <SelectItem value="en">
                      {t.settings.languageEnglish}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Debug Section (Only for testing Sentry) */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-semibold text-muted-foreground">Debug</h2>
            </div>
            <div className="pl-8 space-y-3">
               <div className="flex items-center justify-between p-3 rounded-lg border border-dashed border-yellow-500/50 bg-yellow-500/5">
                 <div className="flex-1">
                   <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Sentry Test</p>
                   <p className="text-xs text-muted-foreground">Triggers a client-side error to verify Sentry integration.</p>
                 </div>
                 <button
                   onClick={() => {
                     throw new Error("Sentry Verification Test Error (Frontend Button)");
                   }}
                   className="px-3 py-1.5 text-xs font-medium bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/20 rounded border border-yellow-500/20 transition-colors"
                 >
                   Trigger Error
                 </button>
               </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

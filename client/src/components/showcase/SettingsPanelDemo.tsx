import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Bell, Moon, Globe, Zap, Shield, Database } from "lucide-react";

export function SettingsPanelDemo() {
  return (
    <div className="grid gap-6 max-w-2xl">
      {/* Notifications Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifikationer
          </CardTitle>
          <CardDescription>
            Administrer hvordan du modtager notifikationer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notif">Email notifikationer</Label>
              <p className="text-xs text-muted-foreground">
                Modtag emails ved vigtige events
              </p>
            </div>
            <Switch id="email-notif" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-notif">Push notifikationer</Label>
              <p className="text-xs text-muted-foreground">
                Modtag browser notifikationer
              </p>
            </div>
            <Switch id="push-notif" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="ai-notif">AI Assistant updates</Label>
              <p className="text-xs text-muted-foreground">
                Notifikationer fra Friday AI
              </p>
            </div>
            <Switch id="ai-notif" />
          </div>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="w-5 h-5" />
            Udseende
          </CardTitle>
          <CardDescription>Tilpas appens visuelle fremtoning</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme">Tema</Label>
            <Select defaultValue="system">
              <SelectTrigger id="theme">
                <SelectValue placeholder="Vælg tema" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">☀️ Lyst</SelectItem>
                <SelectItem value="dark">🌙 Mørkt</SelectItem>
                <SelectItem value="system">💻 System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Sprog</Label>
            <Select defaultValue="da">
              <SelectTrigger id="language">
                <SelectValue placeholder="Vælg sprog" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="da">🇩🇰 Dansk</SelectItem>
                <SelectItem value="en">🇬🇧 English</SelectItem>
                <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* AI Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Friday AI Indstillinger
          </CardTitle>
          <CardDescription>Tilpas din AI assistents adfærd</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ai-model">AI Model</Label>
            <Select defaultValue="gpt4">
              <SelectTrigger id="ai-model">
                <SelectValue placeholder="Vælg model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt4">GPT-4 Turbo (Hurtigst)</SelectItem>
                <SelectItem value="claude">
                  Claude 3.5 Sonnet (Bedst)
                </SelectItem>
                <SelectItem value="gemini">Gemini Pro (Balance)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-suggest">Automatiske forslag</Label>
              <p className="text-xs text-muted-foreground">
                Vis AI-forslag automatisk
              </p>
            </div>
            <Switch id="auto-suggest" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="context-aware">Kontekst bevidst</Label>
              <p className="text-xs text-muted-foreground">
                Brug historik og profil data
              </p>
            </div>
            <Switch id="context-aware" defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privatliv & Sikkerhed
          </CardTitle>
          <CardDescription>
            Styr dine data og sikkerhedsindstillinger
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="analytics">Anonyme analytics</Label>
              <p className="text-xs text-muted-foreground">
                Hjælp os forbedre produktet
              </p>
            </div>
            <Switch id="analytics" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="data-sharing">Data deling</Label>
              <p className="text-xs text-muted-foreground">
                Del data med integrationer
              </p>
            </div>
            <Switch id="data-sharing" defaultChecked />
          </div>

          <div className="pt-4 border-t">
            <Button variant="outline" className="w-full" size="sm">
              <Database className="w-4 h-4 mr-2" />
              Download mine data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-2">
        <Button variant="outline">Annuller</Button>
        <Button>Gem ændringer</Button>
      </div>
    </div>
  );
}

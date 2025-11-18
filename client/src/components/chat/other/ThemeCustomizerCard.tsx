import {
  Palette,
  Sun,
  Moon,
  Monitor,
  Upload,
  Download,
  Save,
  RotateCcw,
  CheckCircle,
} from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface ThemeCustomizerCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  currentTheme: "light" | "dark" | "system";
  customColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
  };
  onThemeChange?: (theme: "light" | "dark" | "system") => void;
  onColorChange?: (colorType: string, color: string) => void;
  onReset?: () => void;
  onSave?: () => void;
  isLoading?: boolean;
}

export function ThemeCustomizerCard({
  currentTheme,
  customColors = {},
  onThemeChange,
  onColorChange,
  onReset,
  onSave,
  isLoading = false,
  className,
  ...props
}: ThemeCustomizerCardProps) {
  const themes = [
    { id: "light", label: "Lys", icon: Sun, description: "Klassisk lys tema" },
    { id: "dark", label: "Mørk", icon: Moon, description: "Nem på øjnene" },
    {
      id: "system",
      label: "System",
      icon: Monitor,
      description: "Følger enhedens indstilling",
    },
  ] as const;

  const colorOptions = [
    { key: "primary", label: "Primær", default: "#3b82f6" },
    { key: "secondary", label: "Sekundær", default: "#6b7280" },
    { key: "accent", label: "Accent", default: "#10b981" },
    { key: "background", label: "Baggrund", default: "#ffffff" },
  ];

  return (
    <Card className={cn("w-full", className)} {...props}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Palette className="h-5 w-5 text-purple-500" />
          Theme Customizer
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Tilpas udseendet af din applikation
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Theme Selection */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Tema</Label>
          <div className="grid grid-cols-3 gap-3">
            {themes.map(theme => {
              const Icon = theme.icon;
              const isSelected = currentTheme === theme.id;

              return (
                <button
                  key={theme.id}
                  onClick={() => onThemeChange?.(theme.id as any)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                    isSelected
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <Icon className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium text-sm">{theme.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {theme.description}
                    </div>
                  </div>
                  {isSelected && (
                    <CheckCircle className="h-4 w-4 text-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Colors */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Tilpassede Farver</Label>
          <div className="grid grid-cols-2 gap-4">
            {colorOptions.map(option => (
              <div key={option.key} className="space-y-2">
                <Label className="text-xs">{option.label}</Label>
                <div className="flex gap-2">
                  <div
                    className="w-8 h-8 rounded border-2 border-border cursor-pointer"
                    style={{
                      backgroundColor:
                        customColors[option.key as keyof typeof customColors] ||
                        option.default,
                    }}
                    onClick={() => {
                      // In a real implementation, this would open a color picker
                      const newColor = prompt(
                        `Indtast farve for ${option.label}:`,
                        customColors[option.key as keyof typeof customColors] ||
                          option.default
                      );
                      if (newColor) {
                        onColorChange?.(option.key, newColor);
                      }
                    }}
                  />
                  <Input
                    value={
                      customColors[option.key as keyof typeof customColors] ||
                      option.default
                    }
                    onChange={e => onColorChange?.(option.key, e.target.value)}
                    placeholder={option.default}
                    className="flex-1 text-xs font-mono"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Preview</Label>
          <div className="p-4 rounded-lg border bg-card">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary"></div>
                <div>
                  <div className="font-medium text-sm">John Doe</div>
                  <div className="text-xs text-muted-foreground">
                    john@example.com
                  </div>
                </div>
              </div>
              <Button size="sm" className="w-full">
                Test Knap
              </Button>
              <div className="flex gap-2">
                <Badge>Primær</Badge>
                <Badge variant="secondary">Sekundær</Badge>
                <Badge variant="outline">Accent</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onReset} className="flex-1">
            <RotateCcw className="h-4 w-4 mr-2" />
            Nulstil
          </Button>
          <Button onClick={onSave} disabled={isLoading} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Gemmer..." : "Gem"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

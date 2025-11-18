/**
 * CRM Layout Wrapper
 *
 * Provides consistent navigation and layout for all CRM pages
 */

import { Home } from "lucide-react";
import React, { useMemo } from "react";
import { useLocation } from "wouter";

import { Button } from "@/components/ui/button";
import { CRM_NAV_ITEMS } from "@/const/crm";
import { cn } from "@/lib/utils";

interface CRMLayoutProps {
  children: React.ReactNode;
}

export default function CRMLayout({ children }: CRMLayoutProps) {
  const [path, navigate] = useLocation();

  // Memoize active path to avoid unnecessary recalculations
  const activePath = useMemo(() => path, [path]);

  return (
    <div className="min-h-screen bg-background">
      {/* CRM Navigation Bar */}
      <nav className="border-b border-border bg-background sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // In standalone mode, navigate to standalone dashboard
                  const isStandalone =
                    window.location.pathname.startsWith("/crm-standalone") ||
                    window.location.pathname.startsWith("/crm/debug");
                  if (isStandalone) {
                    navigate("/crm-standalone/dashboard");
                  } else {
                    navigate("/");
                  }
                }}
                className="text-sm"
                aria-label="Navigate to workspace"
              >
                <Home className="w-4 h-4 mr-1" />
                {window.location.pathname.startsWith("/crm-standalone") ||
                window.location.pathname.startsWith("/crm/debug")
                  ? "CRM Home"
                  : "Workspace"}
              </Button>
              <div className="h-6 w-px bg-border mx-2" />
              {CRM_NAV_ITEMS.map(item => {
                const Icon = item.icon;
                // Check if we're in standalone mode
                const isStandalone =
                  typeof window !== "undefined" &&
                  (window.location.pathname.startsWith("/crm-standalone") ||
                    window.location.pathname.startsWith("/crm/debug"));

                // Adjust path for standalone mode
                const targetPath = isStandalone
                  ? `/crm-standalone${item.path.replace("/crm", "")}`
                  : item.path;

                const isActive =
                  activePath === item.path || activePath === targetPath;

                return (
                  <Button
                    key={item.path}
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => navigate(targetPath)}
                    className={cn(
                      "text-sm",
                      isActive && "bg-primary/10 text-primary"
                    )}
                    aria-label={`Navigate to ${item.label}`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon className="w-4 h-4 mr-1" />
                    {item.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      {children}
    </div>
  );
}

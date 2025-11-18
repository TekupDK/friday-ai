/**
 * EmailCenter - Phase 4 Integrated Email Hub
 *
 * Evolution from EmailTab (2318 lines) to intelligent email center.
 * Integrates Phase 4 SmartWorkspacePanel with contextual tab system.
 *
 * Architecture:
 * - Left: EmailListV2 (modular email rendering)
 * - Right: SmartWorkspacePanel + ContextualTabs (Phase 4 integration)
 * - Context-aware: Dynamic tabs based on email context detection
 */

import { PenSquare } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import SmartWorkspacePanel from "../panels/SmartWorkspacePanel";
import SmartActionBar, {
  type LeadData,
  type BookingData,
  type InvoiceData,
  type CustomerData,
} from "../workspace/SmartActionBar";

import EmailListV2 from "./EmailListV2";
import EmailSearchV2, { type FolderType } from "./EmailSearchV2";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEmailContext } from "@/contexts/EmailContext";
import {
  detectEmailContext,
  type EmailContextData,
} from "@/services/emailContextDetection";




// Contextual tab components (will be created in Phase 5.3.x)
const LeadActionsTab = () => (
  <div className="p-4">🎯 Lead Actions (Coming Soon)</div>
);
const BookingActionsTab = () => (
  <div className="p-4">📅 Booking Actions (Coming Soon)</div>
);
const InvoiceActionsTab = () => (
  <div className="p-4">💰 Invoice Actions (Coming Soon)</div>
);
const CustomerActionsTab = () => (
  <div className="p-4">👤 Customer Actions (Coming Soon)</div>
);

interface EmailCenterProps {
  // Configuration
  showAIFeatures?: boolean;
  density?: "comfortable" | "compact";
  maxResults?: number;

  // Phase 4 integration
  enableContextualTabs?: boolean;
  defaultContext?: EmailContextData;

  // Navigation state
  activeFolder?: FolderType;
  onFolderChange?: (folder: FolderType) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;

  // UI Controls
  viewMode?: "list" | "pipeline" | "dashboard";
  onViewModeChange?: (mode: "list" | "pipeline" | "dashboard") => void;
  onDensityChange?: (density: "comfortable" | "compact") => void;
  onComposeNew?: () => void;
}

export default function EmailCenter({
  showAIFeatures = true,
  density = "compact",
  maxResults = 25,
  enableContextualTabs = true,
  defaultContext = { type: "dashboard", confidence: 1.0 },
  activeFolder = "inbox",
  onFolderChange,
  searchQuery = "",
  onSearchChange,
  viewMode = "list",
  onViewModeChange,
  onDensityChange,
  onComposeNew,
}: EmailCenterProps) {
  // Email context integration
  const emailContext = useEmailContext();
  const selectedEmail = emailContext.state.selectedEmail;

  // Phase 4: Smart context detection
  const detectedContext = useMemo(() => {
    const context = selectedEmail
      ? detectEmailContext(selectedEmail)
      : defaultContext;
    return {
      ...context,
      confidence: context.confidence ?? 1.0, // Ensure confidence is never undefined
    };
  }, [selectedEmail, defaultContext]);

  // Determine which contextual tab to show
  const contextualTabConfig = useMemo(() => {
    const configs = {
      lead: {
        id: "lead",
        label: "🎯 Lead",
        component: LeadActionsTab,
        description: "Lead management and conversion",
      },
      booking: {
        id: "booking",
        label: "📅 Booking",
        component: BookingActionsTab,
        description: "Calendar and scheduling",
      },
      invoice: {
        id: "invoice",
        label: "💰 Invoice",
        component: InvoiceActionsTab,
        description: "Billing and payments",
      },
      customer: {
        id: "customer",
        label: "👤 Customer",
        component: CustomerActionsTab,
        description: "Customer relationship management",
      },
      dashboard: {
        id: "dashboard",
        label: "📊 Overview",
        component: () => (
          <div className="p-4 text-center text-muted-foreground">
            Select an email to see contextual actions
          </div>
        ),
        description: "General email actions",
      },
    };

    return configs[detectedContext.type] || configs.dashboard;
  }, [detectedContext]);

  // Handle email selection with Phase 4 integration
  const handleEmailSelect = useCallback(
    (email: any) => {
      // Update EmailContext for SmartWorkspacePanel
      emailContext.setSelectedEmail({
        id: email.id,
        threadId: email.threadId,
        subject: email.subject,
        from: email.from,
        snippet: email.snippet,
        labels: email.labels || [],
        threadLength: 1,
      });
    },
    [emailContext]
  );

  // Handle smart actions from contextual tabs
  const handleSmartAction = useCallback(
    async (actionId: string, data: any) => {
      console.log("EmailCenter: Smart action executed", actionId, data);

      // TODO: Implement action routing based on context
      switch (detectedContext.type) {
        case "lead":
          // Route to lead workflow
          break;
        case "booking":
          // Route to booking workflow
          break;
        case "invoice":
          // Route to invoice workflow
          break;
        case "customer":
          // Route to customer workflow
          break;
        default:
          console.log("General action:", actionId);
      }
    },
    [detectedContext]
  );

  // Generate workspace data for SmartActionBar
  const workspaceData = useMemo(() => {
    if (!selectedEmail) return null;

    // Extract data based on context type
    switch (detectedContext.type) {
      case "lead":
        return {
          customerName:
            selectedEmail.from?.replace(/<.*>/, "").trim() || "Kunde",
          customerEmail:
            selectedEmail.from?.match(/<(.+)>/)?.[1] ||
            selectedEmail.from ||
            "",
          estimate: {
            totalPrice: 3490, // Would be extracted from email
            size: 120,
            travelCost: 500,
          },
          address: "Aarhus C", // Would be extracted from email
          leadType: "Hovedrengøring", // Would be detected from email
        } as LeadData;

      case "booking":
        return {
          customer: selectedEmail.from?.replace(/<.*>/, "").trim() || "Kunde",
          email:
            selectedEmail.from?.match(/<(.+)>/)?.[1] ||
            selectedEmail.from ||
            "",
          phone: "+45 12 34 56 78",
          address: "Aarhus C",
          date: "December 2025",
          time: "09:00-12:00",
          duration: "3t",
          type: "Hovedrengøring",
          size: "120m²",
          team: "Jonas + Team",
          price: 3490,
          profit: 2590,
          status: "upcoming" as const,
        } as BookingData;

      case "invoice":
        return {
          customer: selectedEmail.from?.replace(/<.*>/, "").trim() || "Kunde",
          email:
            selectedEmail.from?.match(/<(.+)>/)?.[1] ||
            selectedEmail.from ||
            "",
          amount: 3490,
          dueDate: "2025-12-15",
          status: "unpaid" as const,
          isPaid: false,
        } as InvoiceData;

      case "customer":
        return {
          name: selectedEmail.from?.replace(/<.*>/, "").trim() || "Kunde",
          email:
            selectedEmail.from?.match(/<(.+)>/)?.[1] ||
            selectedEmail.from ||
            "",
          phone: "+45 12 34 56 78",
          address: "Aarhus C",
          totalBookings: 3,
          totalValue: 12000,
          status: "active" as const,
          lastBooking: "2025-11-01",
        } as CustomerData;

      default:
        return null;
    }
  }, [selectedEmail, detectedContext]);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header with context indicator */}
      <div className="p-4 border-b border-border/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">📧 Email Center</h2>
            <p className="text-sm text-muted-foreground">
              {detectedContext.confidence > 0.7
                ? `Context: ${contextualTabConfig.label} (${Math.round(detectedContext.confidence * 100)}% confidence)`
                : "Analyzing email context..."}
            </p>
          </div>

          {/* Context confidence indicator */}
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                detectedContext.confidence > 0.8
                  ? "bg-green-500"
                  : detectedContext.confidence > 0.5
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }`}
            />
            <span className="text-xs text-muted-foreground">
              {Math.round(detectedContext.confidence * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Main content: Email list + Contextual panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Email List with Search and Navigation */}
        <div className="w-1/2 border-r border-border/20 overflow-hidden flex flex-col">
          {/* Search and Navigation Bar */}
          <div className="p-3 border-b border-border/20 shrink-0">
            <div className="flex flex-col gap-3">
              {/* Search and Folder Navigation */}
              <EmailSearchV2
                searchQuery={searchQuery}
                onSearchChange={onSearchChange || (() => {})}
                selectedFolder={activeFolder}
                onFolderChange={onFolderChange || (() => {})}
                selectedLabels={[]}
                onLabelsChange={() => {}}
                isLoading={false}
              />

              {/* UI Controls: Density, View Mode, Compose */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-1 lg:gap-2 items-center overflow-x-auto">
                  {/* Density Toggle */}
                  <div className="flex gap-0.5 border rounded-md p-0.5">
                    <Button
                      variant={density === "comfortable" ? "outline" : "ghost"}
                      size="sm"
                      onClick={() => onDensityChange?.("comfortable")}
                      className="h-7 px-2 text-xs"
                      title="Comfortable density"
                    >
                      Comfortable
                    </Button>
                    <Button
                      variant={density === "compact" ? "outline" : "ghost"}
                      size="sm"
                      onClick={() => onDensityChange?.("compact")}
                      className="h-7 px-2 text-xs"
                      title="Compact density (Shortwave-style)"
                    >
                      Compact
                    </Button>
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex gap-0.5 border rounded-md p-0.5">
                    <Button
                      variant={viewMode === "list" ? "outline" : "ghost"}
                      size="sm"
                      onClick={() => onViewModeChange?.("list")}
                      className="h-7 px-2 text-xs"
                    >
                      Liste
                    </Button>
                    <Button
                      variant={viewMode === "pipeline" ? "outline" : "ghost"}
                      size="sm"
                      onClick={() => onViewModeChange?.("pipeline")}
                      className="h-7 px-2 text-xs"
                    >
                      Pipeline
                    </Button>
                    <Button
                      variant={viewMode === "dashboard" ? "outline" : "ghost"}
                      size="sm"
                      onClick={() => onViewModeChange?.("dashboard")}
                      className="h-7 px-2 text-xs"
                    >
                      Dashboard
                    </Button>
                  </div>
                </div>

                {/* Compose Button */}
                <Button
                  variant="default"
                  size="sm"
                  onClick={onComposeNew}
                  className="h-7 px-3 text-xs gap-1.5"
                  title="Skriv ny email (c)"
                >
                  <PenSquare className="w-3 h-3" />
                  Skriv
                </Button>
              </div>
            </div>
          </div>

          {/* Email List */}
          <div className="flex-1 overflow-hidden">
            <EmailListV2
              emails={[]} // Would be populated from API
              onEmailSelect={handleEmailSelect}
              selectedThreadId={selectedEmail?.threadId || null}
              selectedEmails={new Set()}
              onEmailSelectionChange={() => {}}
              density={density}
              showAIFeatures={showAIFeatures}
              isLoading={false}
            />
          </div>
        </div>

        {/* Right: SmartWorkspacePanel - Unified Layout */}
        <div className="w-1/2 flex flex-col overflow-hidden">
          {/* SmartWorkspacePanel handles all navigation and content */}
          <div className="flex-1 overflow-hidden">
            <SmartWorkspacePanel />
          </div>
        </div>
      </div>
    </div>
  );
}

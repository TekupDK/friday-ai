/**
 * 3-Panel Layout Demo
 * Viser jeres WorkspaceLayout system i miniature
 */

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Mail, Briefcase } from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export function ThreePanelDemo() {
  return (
    <Card className="h-[400px] overflow-hidden">
      <ResizablePanelGroup direction="horizontal">
        {/* AI Assistant Panel */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <div className="h-full bg-blue-50 dark:bg-blue-950/20 border-r p-4">
            <div className="flex items-center gap-2 mb-4">
              <Bot className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-sm">Friday AI</h3>
            </div>

            <div className="space-y-2">
              {/* Welcome screen mockup */}
              <div className="text-center space-y-3 py-8">
                <p className="text-sm font-medium">Hvad kan jeg hjælpe med?</p>
                <div className="space-y-2">
                  {[
                    "📅 Tjek kalender",
                    "💰 Vis fakturaer",
                    "📧 Analyser emails",
                    "❓ Hjælp",
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="p-2 bg-white dark:bg-gray-900 rounded-lg border text-xs hover:bg-muted transition-colors"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat messages mockup */}
              <div className="space-y-2 mt-4">
                <div className="bg-primary text-primary-foreground rounded-lg p-2 ml-auto max-w-[80%]">
                  <p className="text-xs">Hvad er vejret?</p>
                </div>
                <div className="bg-muted rounded-lg p-2 max-w-[80%]">
                  <p className="text-xs">I København er det...</p>
                </div>
              </div>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Email Center Panel */}
        <ResizablePanel defaultSize={60} minSize={40}>
          <div className="h-full bg-background border-r p-4">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-sm">Email Center</h3>
              <Badge variant="secondary" className="text-xs">
                3
              </Badge>
            </div>

            {/* Email list mockup */}
            <div className="space-y-2">
              {[
                {
                  from: "kunde@firma.dk",
                  subject: "Tilbud på projekt",
                  unread: true,
                },
                {
                  from: "partner@email.dk",
                  subject: "Meeting i morgen",
                  unread: true,
                },
                {
                  from: "info@service.dk",
                  subject: "Faktura betalt",
                  unread: false,
                },
              ].map((email, i) => (
                <div
                  key={i}
                  className={`p-3 border rounded-lg hover:bg-muted/50 transition-colors ${email.unread ? "bg-blue-50/30 dark:bg-blue-950/20" : ""}`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-sm font-medium">{email.from}</p>
                    {email.unread && (
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {email.subject}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Smart Workspace Panel */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <div className="h-full bg-purple-50 dark:bg-purple-950/20 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-sm">Workspace</h3>
            </div>

            {/* Context panel mockup */}
            <div className="space-y-3">
              <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border">
                <p className="text-xs font-medium mb-2">📊 Quick Actions</p>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">
                    • Opret lead
                  </div>
                  <div className="text-xs text-muted-foreground">
                    • Book møde
                  </div>
                  <div className="text-xs text-muted-foreground">
                    • Ny faktura
                  </div>
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border">
                <p className="text-xs font-medium mb-2">📋 Recent</p>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">
                    • Lead #123
                  </div>
                  <div className="text-xs text-muted-foreground">
                    • Faktura #456
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </Card>
  );
}

/**
 * COMPLETE CHAT PANEL - Dedicated Page
 * Viser ALLE chat komponenter + fungerende chat til sidst
 */

import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

// Placeholder - components will be added
export default function ChatPanelComplete() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950">
      <div className="container mx-auto p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/showcase">
            <Button variant="ghost" size="icon" aria-label="Go back to showcase">
              <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              🚀 Complete Chat Panel - Friday AI
            </h1>
            <p className="text-muted-foreground">
              Alle komponenter individuelt + Fungerende komplet chat til sidst
            </p>
          </div>
        </div>

        {/* Navigation */}
        <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  document
                    .getElementById("typing")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Typing Indicator
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  document
                    .getElementById("reactions")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Reactions
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  document
                    .getElementById("threading")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Threading
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  document
                    .getElementById("commands")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Commands
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  document
                    .getElementById("lead-card")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Lead Card
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  document
                    .getElementById("task-card")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Task Card
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  document
                    .getElementById("complete-chat")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                🌟 Complete Chat
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Placeholder for components - will be filled */}
        <Card>
          <CardHeader>
            <CardTitle>⏳ Loading Components...</CardTitle>
            <CardDescription>Komponenter bliver tilføjet nu...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}

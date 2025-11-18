import { Bot, Mail, Grid, Settings } from "lucide-react";
import { useState } from "react";

import { AppleButton, AppleCard } from "../components/crm/apple-ui";

import ChatTab from "./tabs/ChatTab";

import { useAuth } from "@/_core/hooks/useAuth";

export default function MobileShell() {
  const { isAuthenticated, loading } = useAuth({
    redirectOnUnauthenticated: false,
  });
  const [tab, setTab] = useState<"chat" | "email" | "workspace" | "settings" | "home">("chat");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AppleCard variant="elevated">
          <div className="text-sm">Log ind for at bruge Friday AI</div>
          <div className="mt-3">
            <AppleButton variant="primary">Log ind</AppleButton>
          </div>
        </AppleCard>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="flex-1 min-h-0">
        {tab === "chat" && <ChatTab />}
        {tab === "email" && (
          <div className="p-4">
            <AppleCard variant="elevated">Email kommer snart på mobil</AppleCard>
          </div>
        )}
        {tab === "workspace" && (
          <div className="p-4">
            <AppleCard variant="elevated">Workspace kommer snart på mobil</AppleCard>
          </div>
        )}
        {tab === "settings" && (
          <div className="p-4">
            <AppleCard variant="elevated">Indstillinger</AppleCard>
          </div>
        )}
        {tab === "home" && (
          <div className="p-4">
            <AppleCard variant="elevated">Velkommen til Friday AI mobil</AppleCard>
          </div>
        )}
      </div>

      <nav className="h-16 border-t border-border bg-background flex items-center justify-around">
        <button className={`flex flex-col items-center text-xs ${tab === "chat" ? "text-primary" : "text-muted-foreground"}`} onClick={() => setTab("chat")}>
          <Bot className="w-5 h-5" />
          Chat
        </button>
        <button className={`flex flex-col items-center text-xs ${tab === "email" ? "text-primary" : "text-muted-foreground"}`} onClick={() => setTab("email")}>
          <Mail className="w-5 h-5" />
          Email
        </button>
        <button className={`flex flex-col items-center text-xs ${tab === "workspace" ? "text-primary" : "text-muted-foreground"}`} onClick={() => setTab("workspace")}>
          <Grid className="w-5 h-5" />
          Workspace
        </button>
        <button className={`flex flex-col items-center text-xs ${tab === "settings" ? "text-primary" : "text-muted-foreground"}`} onClick={() => setTab("settings")}>
          <Settings className="w-5 h-5" />
          Settings
        </button>
      </nav>
    </div>
  );
}


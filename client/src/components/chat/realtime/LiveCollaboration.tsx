/**
 * LIVE COLLABORATION - Realtime samarbejde
 */

import {
  Users,
  Edit3,
  Eye,
  MessageSquare,
  Zap,
  UserCircle,
  Activity,
  Lock,
} from "lucide-react";
import { useState, useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface Collaborator {
  id: string;
  name: string;
  avatar?: string;
  status: "online" | "away" | "busy" | "offline";
  role: "owner" | "editor" | "viewer";
  cursor?: {
    x: number;
    y: number;
    selection?: string;
  };
  lastActivity: string;
}

export interface LiveDocument {
  id: string;
  title: string;
  type: "email" | "document" | "chat" | "whiteboard";
  isActive: boolean;
  lastModified: string;
  collaborators: string[];
}

interface LiveCollaborationProps {
  collaborators?: Collaborator[];
  documents?: LiveDocument[];
  onJoinDocument?: (documentId: string) => void;
  onInviteUser?: () => void;
  onTogglePermissions?: (userId: string, role: Collaborator["role"]) => void;
}

export function LiveCollaboration({
  collaborators = [],
  documents = [],
  onJoinDocument,
  onInviteUser,
  onTogglePermissions,
}: LiveCollaborationProps) {
  const [activeDocument, setActiveDocument] = useState<string | null>(null);
  const [showActivity, setShowActivity] = useState(true);

  // Default collaborators
  const defaultCollaborators: Collaborator[] = [
    {
      id: "1",
      name: "John Smith",
      status: "online",
      role: "owner",
      cursor: { x: 150, y: 80, selection: "faktura" },
      lastActivity: "Lige nu",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      status: "online",
      role: "editor",
      cursor: { x: 300, y: 120 },
      lastActivity: "For 2 min siden",
    },
    {
      id: "3",
      name: "Mike Wilson",
      status: "away",
      role: "viewer",
      lastActivity: "For 15 min siden",
    },
    {
      id: "4",
      name: "Emma Davis",
      status: "busy",
      role: "editor",
      cursor: { x: 220, y: 200, selection: "kunde" },
      lastActivity: "For 5 min siden",
    },
  ];

  // Default documents
  const defaultDocuments: LiveDocument[] = [
    {
      id: "1",
      title: "Faktura - ABC Corporation",
      type: "email",
      isActive: true,
      lastModified: "Lige nu",
      collaborators: ["1", "2", "4"],
    },
    {
      id: "2",
      title: "Møde referat - Q1",
      type: "document",
      isActive: true,
      lastModified: "For 5 min siden",
      collaborators: ["1", "3"],
    },
    {
      id: "3",
      title: "Kunde chat - Support",
      type: "chat",
      isActive: false,
      lastModified: "For 1 time siden",
      collaborators: ["2"],
    },
  ];

  const liveCollaborators =
    collaborators.length > 0 ? collaborators : defaultCollaborators;
  const liveDocuments = documents.length > 0 ? documents : defaultDocuments;

  const getStatusColor = (status: Collaborator["status"]) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      case "busy":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getRoleColor = (role: Collaborator["role"]) => {
    switch (role) {
      case "owner":
        return "bg-purple-500";
      case "editor":
        return "bg-blue-500";
      case "viewer":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getRoleLabel = (role: Collaborator["role"]) => {
    switch (role) {
      case "owner":
        return "Ejer";
      case "editor":
        return "Redaktør";
      case "viewer":
        return "Læser";
      default:
        return role;
    }
  };

  const getDocumentIcon = (type: LiveDocument["type"]) => {
    switch (type) {
      case "email":
        return "📧";
      case "document":
        return "📄";
      case "chat":
        return "💬";
      case "whiteboard":
        return "🎨";
      default:
        return "📄";
    }
  };

  const getDocumentTypeColor = (type: LiveDocument["type"]) => {
    switch (type) {
      case "email":
        return "bg-blue-500";
      case "document":
        return "bg-green-500";
      case "chat":
        return "bg-purple-500";
      case "whiteboard":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const activeCollaborators = liveCollaborators.filter(
    c => c.status === "online"
  );
  const totalActiveUsers = liveCollaborators.filter(
    c => c.status !== "offline"
  ).length;

  return (
    <Card className="border-l-4 border-l-green-500">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold">Live Collaboration</h4>
              <p className="text-xs text-muted-foreground">
                Realtime samarbejde
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-500">
              {activeCollaborators.length} online
            </Badge>
            <Button size="sm" variant="ghost" onClick={onInviteUser}>
              <Users className="w-3 h-3 mr-1" />
              Inviter
            </Button>
          </div>
        </div>

        {/* Active Document */}
        {activeDocument && (
          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                  Redigerer:{" "}
                  {liveDocuments.find(d => d.id === activeDocument)?.title}
                </span>
              </div>
              <Badge className="bg-green-500">Live</Badge>
            </div>
          </div>
        )}

        {/* Active Collaborators */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h5 className="text-sm font-semibold">
              Aktive brugere ({totalActiveUsers}):
            </h5>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowActivity(!showActivity)}
            >
              <Activity className="w-3 h-3 mr-1" />
              {showActivity ? "Skjul" : "Vis"} aktivitet
            </Button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {liveCollaborators.map(collaborator => (
              <div
                key={collaborator.id}
                className="p-3 rounded-lg bg-background border border-border"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-sm font-medium">
                        {collaborator.name.charAt(0)}
                      </div>
                      <div
                        className={cn(
                          "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background",
                          getStatusColor(collaborator.status)
                        )}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {collaborator.name}
                        </span>
                        <Badge className={getRoleColor(collaborator.role)}>
                          {getRoleLabel(collaborator.role)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {collaborator.lastActivity}
                      </p>

                      {/* Cursor Position */}
                      {showActivity && collaborator.cursor && (
                        <div className="mt-2 p-2 rounded bg-green-50 dark:bg-green-950/20 text-xs">
                          <div className="flex items-center gap-2">
                            <Edit3 className="w-3 h-3 text-green-600" />
                            <span>
                              Redigerer ved position ({collaborator.cursor.x},{" "}
                              {collaborator.cursor.y})
                            </span>
                          </div>
                          {collaborator.cursor.selection && (
                            <p className="text-green-600 dark:text-green-400 mt-1">
                              Markeret: "{collaborator.cursor.selection}"
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" className="h-6 w-6">
                      <MessageSquare className="w-3 h-3" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6">
                      <Eye className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shared Documents */}
        <div className="space-y-2">
          <h5 className="text-sm font-semibold">Delte dokumenter:</h5>
          <div className="space-y-2">
            {liveDocuments.map(document => (
              <button
                key={document.id}
                onClick={() => {
                  setActiveDocument(document.id);
                  onJoinDocument?.(document.id);
                }}
                className={cn(
                  "w-full text-left p-3 rounded-lg border transition-colors",
                  document.isActive
                    ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                    : "bg-background border-border hover:bg-muted/50"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">
                      {getDocumentIcon(document.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {document.title}
                        </span>
                        <Badge className={getDocumentTypeColor(document.type)}>
                          {document.type}
                        </Badge>
                        {document.isActive && (
                          <Badge className="bg-green-500">Live</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {document.lastModified}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Users className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {document.collaborators.length} brugere
                        </span>
                      </div>
                    </div>
                  </div>

                  {activeDocument === document.id && (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs text-green-600">Aktiv</span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Live Activity Feed */}
        {showActivity && (
          <div className="space-y-2">
            <h5 className="text-sm font-semibold">Live aktivitet:</h5>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              <div className="flex items-center gap-2 p-2 rounded bg-blue-50 dark:bg-blue-950/20 text-xs">
                <Edit3 className="w-3 h-3 text-blue-600" />
                <span>
                  <strong>John Smith</strong> redigerer "faktura"
                </span>
                <span className="text-muted-foreground">• lige nu</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-purple-50 dark:bg-purple-950/20 text-xs">
                <MessageSquare className="w-3 h-3 text-purple-600" />
                <span>
                  <strong>Sarah Johnson</strong> kommenterede på linje 42
                </span>
                <span className="text-muted-foreground">• for 2 min siden</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-green-50 dark:bg-green-950/20 text-xs">
                <Users className="w-3 h-3 text-green-600" />
                <span>
                  <strong>Emma Davis</strong> joined dokumentet
                </span>
                <span className="text-muted-foreground">• for 5 min siden</span>
              </div>
            </div>
          </div>
        )}

        {/* Collaboration Stats */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/20 text-center">
            <p className="font-bold text-green-700 dark:text-green-300">
              {activeCollaborators.length}
            </p>
            <p className="text-green-600 dark:text-green-400">Online nu</p>
          </div>
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-center">
            <p className="font-bold text-blue-700 dark:text-blue-300">
              {liveDocuments.filter(d => d.isActive).length}
            </p>
            <p className="text-blue-600 dark:text-blue-400">Aktive docs</p>
          </div>
          <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/20 text-center">
            <p className="font-bold text-purple-700 dark:text-purple-300">
              {liveCollaborators.filter(c => c.role === "editor").length}
            </p>
            <p className="text-purple-600 dark:text-purple-400">Redaktører</p>
          </div>
        </div>

        {/* Permissions Info */}
        <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-2">
            <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-700 dark:text-amber-400">
              <p className="font-semibold mb-1">Rettigheder:</p>
              <p>
                Ejer kan administrere dokumenter og brugere. Redaktører kan
                redigere indhold. Læsere kan kun se.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            onClick={onInviteUser}
            className="flex-1 bg-linear-to-r from-green-600 to-emerald-600"
          >
            <Users className="w-4 h-4 mr-2" />
            Inviter bruger
          </Button>
          <Button variant="outline" className="flex-1">
            <Activity className="w-4 h-4 mr-2" />
            Aktivitet
          </Button>
          <Button variant="outline" className="flex-1">
            <Lock className="w-4 h-4 mr-2" />
            Rettigheder
          </Button>
        </div>
      </div>
    </Card>
  );
}

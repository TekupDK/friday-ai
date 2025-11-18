/**
 * LIVE TYPING INDICATORS - Viser hvem der skriver
 */

import {
  Type,
  Edit3,
  Users,
  MessageSquare,
  Eye,
  Zap,
  Pause,
} from "lucide-react";
import { useState, useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface TypingUser {
  id: string;
  name: string;
  avatar?: string;
  status: "typing" | "paused" | "stopped";
  lastTyped: string;
  text?: string;
  cursorPosition?: number;
  documentId?: string;
}

export interface TypingDocument {
  id: string;
  title: string;
  typers: string[];
  lastActivity: string;
}

interface LiveTypingIndicatorsProps {
  typingUsers?: TypingUser[];
  documents?: TypingDocument[];
  onJoinTyping?: (documentId: string) => void;
  onShowUserCursor?: (userId: string) => void;
  onPauseNotifications?: () => void;
}

export function LiveTypingIndicators({
  typingUsers = [],
  documents = [],
  onJoinTyping,
  onShowUserCursor,
  onPauseNotifications,
}: LiveTypingIndicatorsProps) {
  const [activeDocument, setActiveDocument] = useState<string | null>(null);
  const [showCursors, setShowCursors] = useState(true);
  const [notificationsPaused, setNotificationsPaused] = useState(false);

  // Default typing users
  const defaultTypingUsers: TypingUser[] = [
    {
      id: "1",
      name: "John Smith",
      status: "typing",
      lastTyped: "lige nu",
      text: "Kan du hjælpe mig med at oprette en ny",
      cursorPosition: 42,
      documentId: "1",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      status: "paused",
      lastTyped: "for 5 sekunder siden",
      text: "Jeg skal bruge prislisten for REN-00",
      cursorPosition: 38,
      documentId: "2",
    },
    {
      id: "3",
      name: "Mike Wilson",
      status: "typing",
      lastTyped: "lige nu",
      text: "Mødet er flyttet til kl. 14:00",
      cursorPosition: 31,
      documentId: "1",
    },
    {
      id: "4",
      name: "Emma Davis",
      status: "stopped",
      lastTyped: "for 15 sekunder siden",
      text: "Send faktura til kunde",
      documentId: "3",
    },
  ];

  // Default documents
  const defaultDocuments: TypingDocument[] = [
    {
      id: "1",
      title: "Faktura - ABC Corporation",
      typers: ["1", "3"],
      lastActivity: "lige nu",
    },
    {
      id: "2",
      title: "Email - Support team",
      typers: ["2"],
      lastActivity: "for 5 sekunder siden",
    },
    {
      id: "3",
      title: "Chat - Kunde henvendelse",
      typers: ["4"],
      lastActivity: "for 15 sekunder siden",
    },
  ];

  const liveTypingUsers =
    typingUsers.length > 0 ? typingUsers : defaultTypingUsers;
  const liveDocuments = documents.length > 0 ? documents : defaultDocuments;

  const activeTypers = liveTypingUsers.filter(user => user.status === "typing");
  const pausedTypers = liveTypingUsers.filter(user => user.status === "paused");
  const totalActiveTypers = liveTypingUsers.filter(
    user => user.status !== "stopped"
  ).length;

  const getStatusColor = (status: TypingUser["status"]) => {
    switch (status) {
      case "typing":
        return "bg-green-500";
      case "paused":
        return "bg-yellow-500";
      case "stopped":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: TypingUser["status"]) => {
    switch (status) {
      case "typing":
        return "Skriver";
      case "paused":
        return "Pause";
      case "stopped":
        return "Stoppet";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: TypingUser["status"]) => {
    switch (status) {
      case "typing":
        return "✏️";
      case "paused":
        return "⏸️";
      case "stopped":
        return "⏹️";
      default:
        return "⏹️";
    }
  };

  const getTypingAnimation = (status: TypingUser["status"]) => {
    if (status === "typing") {
      return (
        <div className="flex items-center gap-1">
          <div
            className="w-1 h-1 bg-green-500 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="w-1 h-1 bg-green-500 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <div
            className="w-1 h-1 bg-green-500 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      );
    }
    return null;
  };

  const truncateText = (text: string, maxLength: number = 30) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const getDocumentTypers = (documentId: string) => {
    return liveTypingUsers.filter(user => user.documentId === documentId);
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
              <Type className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold">Live Typing Indicators</h4>
              <p className="text-xs text-muted-foreground">
                Viser hvem der skriver
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-500">{totalActiveTypers} aktive</Badge>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setNotificationsPaused(!notificationsPaused);
                onPauseNotifications?.();
              }}
            >
              {notificationsPaused ? (
                <Zap className="w-3 h-3" />
              ) : (
                <Pause className="w-3 h-3" />
              )}
            </Button>
          </div>
        </div>

        {/* Active Document */}
        {activeDocument && (
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                  Følgende skriver i:{" "}
                  {liveDocuments.find(d => d.id === activeDocument)?.title}
                </span>
              </div>
              <Badge className="bg-blue-500">Live</Badge>
            </div>
          </div>
        )}

        {/* Notifications Status */}
        {notificationsPaused && (
          <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2">
              <Pause className="w-4 h-4 text-amber-600" />
              <span className="text-xs text-amber-700 dark:text-amber-400">
                Notifikationer pauseret
              </span>
            </div>
          </div>
        )}

        {/* Currently Typing */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h5 className="text-sm font-semibold">
              Skriver nu ({activeTypers.length}):
            </h5>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowCursors(!showCursors)}
            >
              <Eye className="w-3 h-3 mr-1" />
              {showCursors ? "Skjul" : "Vis"} cursors
            </Button>
          </div>

          {activeTypers.length > 0 ? (
            <div className="space-y-2">
              {activeTypers.map(user => (
                <div
                  key={user.id}
                  className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800"
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-sm font-medium">
                        {user.name.charAt(0)}
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background animate-pulse" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{user.name}</span>
                        <Badge className="bg-green-500">
                          {getStatusLabel(user.status)}
                        </Badge>
                        <div className="flex items-center gap-1">
                          {getTypingAnimation(user.status)}
                        </div>
                      </div>

                      {/* Current Text */}
                      {user.text && (
                        <div className="mb-2 p-2 rounded bg-white/50 dark:bg-black/20 text-sm font-mono">
                          {truncateText(user.text)}
                          <span className="animate-pulse">|</span>
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{user.lastTyped}</span>
                        {user.cursorPosition && (
                          <span>Position: {user.cursorPosition}</span>
                        )}
                        {user.documentId && (
                          <span>
                            Dokument:{" "}
                            {
                              liveDocuments.find(d => d.id === user.documentId)
                                ?.title
                            }
                          </span>
                        )}
                      </div>

                      {/* Cursor Position Indicator */}
                      {showCursors && user.cursorPosition && (
                        <div className="mt-2 p-2 rounded bg-green-100 dark:bg-green-900/30 text-xs">
                          <div className="flex items-center gap-2">
                            <Edit3 className="w-3 h-3 text-green-600" />
                            <span className="text-green-700 dark:text-green-400">
                              Cursor ved position {user.cursorPosition}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {user.documentId && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setActiveDocument(user.documentId!);
                            onJoinTyping?.(user.documentId!);
                          }}
                          className="h-6 w-6"
                        >
                          <MessageSquare className="w-3 h-3" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onShowUserCursor?.(user.id)}
                        className="h-6 w-6"
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              <Type className="w-6 h-6 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Ingen skriver lige nu</p>
            </div>
          )}
        </div>

        {/* Paused Typing */}
        {pausedTypers.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-sm font-semibold">
              Pause ({pausedTypers.length}):
            </h5>
            <div className="space-y-1">
              {pausedTypers.map(user => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800"
                >
                  <div className="w-8 h-8 rounded-full bg-linear-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-white text-sm font-medium">
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{user.name}</span>
                      <Badge className="bg-yellow-500">Pause</Badge>
                      <span className="text-xs text-muted-foreground">
                        {user.lastTyped}
                      </span>
                    </div>
                    {user.text && (
                      <p className="text-xs text-muted-foreground truncate">
                        {truncateText(user.text)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents with Activity */}
        <div className="space-y-2">
          <h5 className="text-sm font-semibold">Dokumenter med aktivitet:</h5>
          <div className="space-y-2">
            {liveDocuments.map(document => {
              const documentTypers = getDocumentTypers(document.id);
              const activeCount = documentTypers.filter(
                u => u.status === "typing"
              ).length;
              const pausedCount = documentTypers.filter(
                u => u.status === "paused"
              ).length;

              return (
                <button
                  key={document.id}
                  onClick={() => {
                    setActiveDocument(document.id);
                    onJoinTyping?.(document.id);
                  }}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border transition-colors",
                    activeDocument === document.id
                      ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
                      : "bg-background border-border hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <Edit3 className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {document.title}
                          </span>
                          {activeCount > 0 && (
                            <Badge className="bg-green-500">
                              {activeCount} skriver
                            </Badge>
                          )}
                          {pausedCount > 0 && (
                            <Badge className="bg-yellow-500">
                              {pausedCount} pause
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {document.lastActivity}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <Users className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {documentTypers.map(u => u.name).join(", ")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {activeDocument === document.id && (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        <span className="text-xs text-blue-600">Følger</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Typing Stats */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/20 text-center">
            <p className="font-bold text-green-700 dark:text-green-300">
              {activeTypers.length}
            </p>
            <p className="text-green-600 dark:text-green-400">Skriver nu</p>
          </div>
          <div className="p-2 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 text-center">
            <p className="font-bold text-yellow-700 dark:text-yellow-300">
              {pausedTypers.length}
            </p>
            <p className="text-yellow-600 dark:text-yellow-400">Pause</p>
          </div>
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-center">
            <p className="font-bold text-blue-700 dark:text-blue-300">
              {liveDocuments.filter(d => d.typers.length > 0).length}
            </p>
            <p className="text-blue-600 dark:text-blue-400">Aktive docs</p>
          </div>
        </div>

        {/* Settings */}
        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-2">
            <Type className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-700 dark:text-blue-400">
              <p className="font-semibold mb-1">Live typing features:</p>
              <ul className="space-y-1">
                <li>• Se hvem der skriver i real-time</li>
                <li>• Følg med i deres cursor position</li>
                <li>• Se delvist skrevet tekst</li>
                <li>• Detecter pause og stop status</li>
                <li>• Join dokumenter med aktivitet</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            onClick={() => setNotificationsPaused(!notificationsPaused)}
            variant={notificationsPaused ? "default" : "outline"}
            className="flex-1"
          >
            {notificationsPaused ? (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Genoptag notifikationer
              </>
            ) : (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause notifikationer
              </>
            )}
          </Button>
          <Button
            onClick={() => setShowCursors(!showCursors)}
            variant="outline"
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-2" />
            {showCursors ? "Skjul" : "Vis"} cursors
          </Button>
        </div>
      </div>
    </Card>
  );
}

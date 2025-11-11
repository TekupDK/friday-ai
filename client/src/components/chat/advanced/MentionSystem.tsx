/**
 * MENTION SYSTEM - @mentions i chat
 */

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AtSign, Users, User, Check, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export interface MentionUser {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
  status: 'online' | 'offline' | 'away';
}

interface MentionSystemProps {
  users?: MentionUser[];
  onMention?: (userId: string) => void;
  placeholder?: string;
}

export function MentionSystem({ 
  users = [],
  onMention,
  placeholder = "Skriv @ for at mentionere..."
}: MentionSystemProps) {
  const [input, setInput] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<MentionUser[]>([]);
  const [selectedUserIndex, setSelectedUserIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Default users for demo
  const defaultUsers: MentionUser[] = [
    { id: '1', name: 'John Smith', role: 'Sales Manager', status: 'online' },
    { id: '2', name: 'Sarah Johnson', role: 'Customer Success', status: 'online' },
    { id: '3', name: 'Mike Wilson', role: 'Technical Lead', status: 'away' },
    { id: '4', name: 'Emma Davis', role: 'Marketing', status: 'offline' },
    { id: '5', name: 'Alex Chen', role: 'Developer', status: 'online' }
  ];

  const mentionUsers = users.length > 0 ? users : defaultUsers;

  useEffect(() => {
    const lastWord = input.split(' ').pop() || '';
    if (lastWord.startsWith('@')) {
      const query = lastWord.substring(1).toLowerCase();
      const filtered = mentionUsers.filter(user => 
        user.name.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
      setShowMentions(true);
      setSelectedUserIndex(0);
    } else {
      setShowMentions(false);
      setFilteredUsers([]);
    }
  }, [input, mentionUsers]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showMentions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedUserIndex(prev => (prev + 1) % filteredUsers.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedUserIndex(prev => (prev - 1 + filteredUsers.length) % filteredUsers.length);
        break;
      case 'Enter':
      case 'Tab':
        e.preventDefault();
        if (filteredUsers[selectedUserIndex]) {
          selectUser(filteredUsers[selectedUserIndex]);
        }
        break;
      case 'Escape':
        setShowMentions(false);
        break;
    }
  };

  const selectUser = (user: MentionUser) => {
    const words = input.split(' ');
    words[words.length - 1] = `@${user.name}`;
    const newInput = words.join(' ');
    setInput(newInput);
    setShowMentions(false);
    onMention?.(user.id);
  };

  const getStatusColor = (status: MentionUser['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: MentionUser['status']) => {
    switch (status) {
      case 'online': return 'Online';
      case 'away': return 'Away';
      case 'offline': return 'Offline';
      default: return status;
    }
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
            <AtSign className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold">Mention System</h4>
            <p className="text-xs text-muted-foreground">@mentions i chat</p>
          </div>
        </div>

        {/* Mention Input */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Skriv en besked:</label>
          <div className="relative">
            <input
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full h-10 px-3 border rounded-lg text-sm pr-10"
              onFocus={() => {
                if (input.split(' ').pop()?.startsWith('@')) {
                  setShowMentions(true);
                }
              }}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <AtSign className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Mentions Dropdown */}
        {showMentions && filteredUsers.length > 0 && (
          <div className="border rounded-lg bg-background shadow-lg max-h-48 overflow-y-auto">
            {filteredUsers.map((user, index) => (
              <button
                key={user.id}
                onClick={() => selectUser(user)}
                className={cn(
                  "w-full text-left p-3 flex items-center gap-3 transition-colors",
                  index === selectedUserIndex 
                    ? "bg-blue-50 dark:bg-blue-950/20 border-l-2 border-l-blue-500" 
                    : "hover:bg-muted/50"
                )}
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                    {user.name.charAt(0)}
                  </div>
                  <div className={cn("absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background", getStatusColor(user.status))} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{user.name}</span>
                    {user.role && (
                      <Badge variant="secondary" className="text-xs">
                        {user.role}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{getStatusLabel(user.status)}</p>
                </div>
                
                {index === selectedUserIndex && (
                  <Check className="w-4 h-4 text-blue-600" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Recent Mentions */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Online brugere:</label>
          <div className="flex flex-wrap gap-2">
            {mentionUsers
              .filter(user => user.status === 'online')
              .map((user) => (
              <button
                key={user.id}
                onClick={() => selectUser(user)}
                className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
              >
                <div className="relative">
                  <div className="w-6 h-6 rounded-full bg-linear-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-xs font-medium">
                    {user.name.charAt(0)}
                  </div>
                  <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-green-500 border border-white" />
                </div>
                <span className="text-xs font-medium">{user.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-2">
            <AtSign className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-700 dark:text-blue-400">
              <p className="font-semibold mb-1">Hvordan bruges mentions:</p>
              <ul className="space-y-1">
                <li>• Skriv @ for at åbne brugerliste</li>
                <li>• Brug ↑/↓ piletaster til navigation</li>
                <li>• Tryk Enter eller Tab for at vælge</li>
                <li>• Brug Escape for at lukke listen</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button className="flex-1 bg-linear-to-r from-blue-600 to-indigo-600">
            <AtSign className="w-4 h-4 mr-2" />
            Send besked
          </Button>
          <Button onClick={() => setInput('')} variant="outline" className="flex-1">
            <X className="w-4 h-4 mr-2" />
            Ryd
          </Button>
        </div>
      </div>
    </Card>
  );
}

/**
 * USER PROFILE - Bruger profil og konto information
 */

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  Shield,
  Settings,
  Edit3,
  Save,
  Camera,
  Award,
  Activity,
  Clock,
} from "lucide-react";
import { useState } from "react";

export interface UserProfileData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: string;
  department: string;
  location: string;
  joinDate: string;
  lastActive: string;
  status: "online" | "away" | "busy" | "offline";
  bio?: string;
  skills: string[];
  stats: {
    emailsSent: number;
    documentsCreated: number;
    meetingsBooked: number;
    tasksCompleted: number;
  };
  preferences: {
    language: string;
    timezone: string;
    theme: string;
    notifications: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    lastLogin: string;
    loginCount: number;
    activeSessions: number;
  };
}

interface UserProfileProps {
  profile?: UserProfileData;
  onEdit?: (field: string, value: any) => void;
  onSave?: (profile: UserProfileData) => void;
  onAvatarChange?: (avatar: string) => void;
  onPasswordChange?: () => void;
}

export function UserProfile({
  profile,
  onEdit,
  onSave,
  onAvatarChange,
  onPasswordChange,
}: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfileData | null>(
    null
  );

  // Default user profile
  const defaultProfile: UserProfileData = {
    id: "1",
    name: "John Smith",
    email: "john.smith@tekup.dk",
    phone: "+45 1234 5678",
    avatar: "",
    role: "Senior Consultant",
    department: "Customer Success",
    location: "Aarhus, Denmark",
    joinDate: "15. januar 2023",
    lastActive: "Lige nu",
    status: "online",
    bio: "Erfaren konsulent med speciale i kunde succes og procesoptimering. Hjælper virksomheder med at implementere effektive workflows.",
    skills: [
      "Kunde Success",
      "Procesoptimering",
      "Project Management",
      "AI Integration",
      "Data Analyse",
    ],
    stats: {
      emailsSent: 1234,
      documentsCreated: 567,
      meetingsBooked: 234,
      tasksCompleted: 890,
    },
    preferences: {
      language: "Dansk",
      timezone: "CET (GMT+1)",
      theme: "Light",
      notifications: true,
    },
    security: {
      twoFactorEnabled: true,
      lastLogin: "I dag kl. 09:15",
      loginCount: 156,
      activeSessions: 2,
    },
  };

  const userProfile = profile || defaultProfile;
  const currentProfile = editedProfile || userProfile;

  const handleEdit = () => {
    if (isEditing) {
      onSave?.(currentProfile);
      setEditedProfile(null);
    } else {
      setEditedProfile({ ...currentProfile });
    }
    setIsEditing(!isEditing);
  };

  const handleFieldChange = (field: string, value: any) => {
    if (isEditing && editedProfile) {
      setEditedProfile({ ...editedProfile, [field]: value });
    }
    onEdit?.(field, value);
  };

  const getStatusColor = (status: UserProfileData["status"]) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      case "busy":
        return "bg-red-500";
      case "offline":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: UserProfileData["status"]) => {
    switch (status) {
      case "online":
        return "Online";
      case "away":
        return "Away";
      case "busy":
        return "Busy";
      case "offline":
        return "Offline";
      default:
        return status;
    }
  };

  const getRoleColor = (role: string) => {
    if (role.includes("Senior")) return "bg-purple-500";
    if (role.includes("Manager")) return "bg-blue-500";
    if (role.includes("Lead")) return "bg-green-500";
    return "bg-gray-500";
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold">User Profile</h4>
              <p className="text-xs text-muted-foreground">
                Bruger profil og konto information
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(currentProfile.status)}>
              {getStatusLabel(currentProfile.status)}
            </Badge>
            <Button size="sm" variant="ghost" onClick={handleEdit}>
              {isEditing ? (
                <Save className="w-3 h-3" />
              ) : (
                <Edit3 className="w-3 h-3" />
              )}
            </Button>
          </div>
        </div>

        {/* Profile Header */}
        <div className="flex items-center gap-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-linear-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
              {currentProfile.name.charAt(0)}
            </div>
            <button
              onClick={() => onAvatarChange?.("")}
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
            >
              <Camera className="w-3 h-3 text-gray-600" />
            </button>
          </div>

          <div className="flex-1">
            {isEditing ? (
              <Input
                value={currentProfile.name}
                onChange={e => handleFieldChange("name", e.target.value)}
                className="text-lg font-semibold mb-1"
              />
            ) : (
              <h5 className="text-lg font-semibold mb-1">
                {currentProfile.name}
              </h5>
            )}

            <div className="flex items-center gap-2 mb-2">
              <Badge className={getRoleColor(currentProfile.role)}>
                {currentProfile.role}
              </Badge>
              <Badge variant="outline">{currentProfile.department}</Badge>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{currentProfile.location}</span>
              <span>•</span>
              <span>Medlem siden {currentProfile.joinDate}</span>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-2">
          <h5 className="text-sm font-semibold">Kontaktinformation:</h5>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-background border border-border">
              <Mail className="w-4 h-4 text-blue-600" />
              <div className="flex-1">
                <span className="text-xs text-muted-foreground">Email</span>
                {isEditing ? (
                  <Input
                    value={currentProfile.email}
                    onChange={e => handleFieldChange("email", e.target.value)}
                    className="text-sm h-6"
                  />
                ) : (
                  <p className="text-sm">{currentProfile.email}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 p-2 rounded-lg bg-background border border-border">
              <Phone className="w-4 h-4 text-green-600" />
              <div className="flex-1">
                <span className="text-xs text-muted-foreground">Telefon</span>
                {isEditing ? (
                  <Input
                    value={currentProfile.phone || ""}
                    onChange={e => handleFieldChange("phone", e.target.value)}
                    className="text-sm h-6"
                  />
                ) : (
                  <p className="text-sm">
                    {currentProfile.phone || "Ikke angivet"}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 p-2 rounded-lg bg-background border border-border">
              <MapPin className="w-4 h-4 text-orange-600" />
              <div className="flex-1">
                <span className="text-xs text-muted-foreground">Lokation</span>
                <p className="text-sm">{currentProfile.location}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <h5 className="text-sm font-semibold">Bio:</h5>
          {isEditing ? (
            <textarea
              value={currentProfile.bio || ""}
              onChange={e => handleFieldChange("bio", e.target.value)}
              className="w-full p-2 border rounded-lg text-sm resize-none"
              rows={3}
              placeholder="Fortæl lidt om dig selv..."
            />
          ) : (
            <p className="text-sm text-muted-foreground p-2 rounded-lg bg-background border border-border">
              {currentProfile.bio || "Ingen bio tilføjet"}
            </p>
          )}
        </div>

        {/* Skills */}
        <div className="space-y-2">
          <h5 className="text-sm font-semibold">Kompetencer:</h5>
          <div className="flex flex-wrap gap-1">
            {currentProfile.skills.map((skill, index) => (
              <Badge key={index} className="bg-blue-500">
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        {/* Statistics */}
        <div className="space-y-2">
          <h5 className="text-sm font-semibold">Statistik:</h5>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-center">
              <p className="font-bold text-blue-700 dark:text-blue-300">
                {currentProfile.stats.emailsSent}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Emails sendt
              </p>
            </div>
            <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/20 text-center">
              <p className="font-bold text-green-700 dark:text-green-300">
                {currentProfile.stats.documentsCreated}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                Dokumenter oprettet
              </p>
            </div>
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/20 text-center">
              <p className="font-bold text-purple-700 dark:text-purple-300">
                {currentProfile.stats.meetingsBooked}
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400">
                Møder booket
              </p>
            </div>
            <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/20 text-center">
              <p className="font-bold text-orange-700 dark:text-orange-300">
                {currentProfile.stats.tasksCompleted}
              </p>
              <p className="text-xs text-orange-600 dark:text-orange-400">
                Opgaver fuldført
              </p>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="space-y-2">
          <h5 className="text-sm font-semibold">Præferencer:</h5>
          <div className="space-y-1">
            <div className="flex justify-between items-center p-2 rounded-lg bg-background border border-border">
              <span className="text-sm">Sprog</span>
              <Badge variant="outline">
                {currentProfile.preferences.language}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg bg-background border border-border">
              <span className="text-sm">Tidszone</span>
              <Badge variant="outline">
                {currentProfile.preferences.timezone}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg bg-background border border-border">
              <span className="text-sm">Tema</span>
              <Badge variant="outline">
                {currentProfile.preferences.theme}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg bg-background border border-border">
              <span className="text-sm">Notifikationer</span>
              <Badge
                className={
                  currentProfile.preferences.notifications
                    ? "bg-green-500"
                    : "bg-red-500"
                }
              >
                {currentProfile.preferences.notifications ? "Aktiv" : "Inaktiv"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="space-y-2">
          <h5 className="text-sm font-semibold">Sikkerhed:</h5>
          <div className="space-y-1">
            <div className="flex justify-between items-center p-2 rounded-lg bg-background border border-border">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-gray-600" />
                <span className="text-sm">To-faktor auth</span>
              </div>
              <Badge
                className={
                  currentProfile.security.twoFactorEnabled
                    ? "bg-green-500"
                    : "bg-red-500"
                }
              >
                {currentProfile.security.twoFactorEnabled ? "Aktiv" : "Inaktiv"}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg bg-background border border-border">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-600" />
                <span className="text-sm">Seneste login</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {currentProfile.security.lastLogin}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg bg-background border border-border">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-gray-600" />
                <span className="text-sm">Aktive sessioner</span>
              </div>
              <Badge variant="outline">
                {currentProfile.security.activeSessions}
              </Badge>
            </div>
          </div>
        </div>

        {/* Activity */}
        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-blue-700 dark:text-blue-400">
              Senest aktiv: {currentProfile.lastActive} •{" "}
              {currentProfile.security.loginCount} logins totalt
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t">
          <Button
            onClick={handleEdit}
            className={
              isEditing
                ? "bg-green-600"
                : "bg-linear-to-r from-blue-600 to-indigo-600"
            }
          >
            {isEditing ? (
              <>
                <Save className="w-4 h-4 mr-2" />
                Gem ændringer
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4 mr-2" />
                Rediger profil
              </>
            )}
          </Button>
          <Button onClick={onPasswordChange} variant="outline">
            <Shield className="w-4 h-4 mr-2" />
            Skift adgangskode
          </Button>
          <Button onClick={() => {}} variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Indstillinger
          </Button>
          <Button onClick={() => {}} variant="outline">
            <Award className="w-4 h-4 mr-2" />
            Præstationer
          </Button>
        </div>
      </div>
    </Card>
  );
}

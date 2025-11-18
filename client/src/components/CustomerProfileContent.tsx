import {
  AlertTriangle,
  Calendar,
  FileText,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  RefreshCw,
  StickyNote,
  TrendingUp,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ActivityTimeline } from "./ActivityTimeline";
import { CaseAnalysisTab } from "./CaseAnalysisTab";
import { CustomerNotesTab } from "./CustomerNotesTab";
import { CustomerStatusTags } from "./CustomerStatusTags";
import { SafeStreamdown } from "./SafeStreamdown";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";

interface CustomerProfileContentProps {
  leadId: number;
  initialTab?:
    | "overview"
    | "invoices"
    | "emails"
    | "calendar"
    | "chat"
    | "case"
    | "timeline"
    | "notes";
  onOpenEmailThread?: (threadId: string) => void;
  onClose?: () => void;
}

export default function CustomerProfileContent({
  leadId,
  initialTab = "timeline",
  onOpenEmailThread,
  onClose,
}: CustomerProfileContentProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [autoSyncDone, setAutoSyncDone] = useState(false);

  // Get customer profile by lead ID
  const {
    data: profile,
    isLoading: profileLoading,
    refetch: refetchProfile,
  } = trpc.customer.getByLeadId.useQuery({ leadId }, { enabled: !!leadId });

  // Get case analysis data
  const { data: caseData, isLoading: caseLoading } =
    trpc.customer.getProfileWithCase.useQuery(
      { email: profile?.email || "" },
      { enabled: !!profile?.email }
    );

  // Get calendar events
  const { data: calendarEvents } = trpc.customer.getCalendarEvents.useQuery(
    { customerId: profile?.id || 0 },
    { enabled: !!profile?.id }
  );

  // Sync mutations
  const syncGmail = trpc.customer.syncGmail.useMutation({
    onSuccess: () => {
      refetchProfile();
      toast.success("Gmail synkroniseret");
    },
    onError: (error: any) => {
      toast.error("Gmail sync fejl: " + error.message);
    },
  });

  const syncBilly = trpc.customer.syncBilly.useMutation({
    onSuccess: () => {
      refetchProfile();
      toast.success("Billy synkroniseret");
    },
    onError: (error: any) => {
      toast.error("Billy sync fejl: " + error.message);
    },
  });

  // Auto-sync when profile opens (with 5-minute cache)
  useEffect(() => {
    if (!profile?.id || autoSyncDone) return;

    const lastSyncKey = `customer-last-sync-${profile.id}`;
    const lastSync = localStorage.getItem(lastSyncKey);
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

    if (!lastSync || parseInt(lastSync) < fiveMinutesAgo) {
      console.log(`[CustomerProfile] Auto-syncing customer ${profile.id}`);

      // Parallel sync
      Promise.all([
        syncGmail.mutateAsync({ customerId: profile.id }),
        syncBilly.mutateAsync({ customerId: profile.id }),
      ]).finally(() => {
        localStorage.setItem(lastSyncKey, Date.now().toString());
        setAutoSyncDone(true);
      });
    } else {
      setAutoSyncDone(true);
    }
  }, [profile?.id, autoSyncDone]); // Auto-sync customer data with 5-minute cache

  // Auto-generate AI resume on first open if missing
  useEffect(() => {
    if (!profile) return;

    // Only auto-generate if no resume exists and customer has some activity
    const shouldAutoGenerate =
      !profile.aiResume &&
      (profile.emailCount > 0 ||
        profile.invoiceCount > 0 ||
        profile.totalInvoiced > 0);

    if (shouldAutoGenerate) {
      console.log(
        `[CustomerProfile] Auto-generating AI resume for customer ${profile.id}`
      );
      generateResume.mutate({ customerId: profile.id });
    }
  }, [
    profile?.id,
    profile?.aiResume,
    profile?.emailCount,
    profile?.invoiceCount,
  ]); // Auto-generate AI resume if missing

  // Generate AI resume
  const generateResume = trpc.customer.generateResume.useMutation({
    onSuccess: () => {
      refetchProfile();
      toast.success("AI resumé genereret");
    },
    onError: error => {
      toast.error("Kunne ikke generere AI resumé: " + error.message);
    },
  });

  if (profileLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="space-y-3 text-center">
          <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading customer...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="space-y-3 text-center">
          <User className="w-8 h-8 mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Customer not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 space-y-4 border-b">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-xl font-semibold">
                {profile?.name || profile?.email || "Loading..."}
              </div>
              {profile?.name && (
                <div className="text-sm text-muted-foreground font-normal">
                  {profile.email}
                </div>
              )}
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            {profile?.status || "new"}
          </Badge>
          <Badge variant="outline">{profile?.customerType || "private"}</Badge>
          {profile?.tags?.map((tag: string) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            <Mail className="w-4 h-4 mr-2" />
            Email
          </Button>
          <Button size="sm" variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Møde
          </Button>
          <Button size="sm" variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Faktura
          </Button>
          <Button size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Note
          </Button>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={v => setActiveTab(v as any)}
        className="flex-1 flex flex-col"
      >
        <div className="border-b px-6">
          <TabsList className="w-full justify-start bg-transparent">
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Info
            </TabsTrigger>
            <TabsTrigger value="invoices" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Invoices ({profile?.invoiceCount || 0})
            </TabsTrigger>
            <TabsTrigger value="emails" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Emails ({profile?.emailCount || 0})
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Calendar ({calendarEvents?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <StickyNote className="w-4 h-4" />
              Notes
            </TabsTrigger>
            <TabsTrigger value="case" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Case Analysis
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1 min-h-0">
          {/* Timeline Tab */}
          <TabsContent value="timeline" className="m-0 p-6">
            <ActivityTimeline
              customerId={profile?.id || 0}
              onEmailClick={threadId => {
                if (onOpenEmailThread) {
                  onOpenEmailThread(threadId);
                } else {
                  toast.info(`Email navigation (${threadId}) kommer snart`);
                }
              }}
              onInvoiceClick={invoiceId => {
                toast.info(`Faktura detaljer (ID: ${invoiceId}) kommer snart`);
              }}
            />
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview" className="m-0 p-6 space-y-6">
            {/* Status & Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Kunde Status & Tags</CardTitle>
                <CardDescription>
                  Organiser og kategoriser kunden
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CustomerStatusTags
                  customerId={profile?.id || 0}
                  currentStatus={profile?.status || "new"}
                  currentTags={profile?.tags || []}
                  currentType={profile?.customerType || "private"}
                  onUpdate={() => refetchProfile()}
                />
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{profile?.email}</span>
                </div>
                {profile?.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{profile.phone}</span>
                  </div>
                )}
                {profile?.lastContactDate && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>
                      Last Contact:{" "}
                      {new Date(profile.lastContactDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Financial Summary */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Total Invoiced</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {((profile?.totalInvoiced || 0) / 100).toFixed(2)} DKK
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Total Paid</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {((profile?.totalPaid || 0) / 100).toFixed(2)} DKK
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Outstanding</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {((profile?.balance || 0) / 100).toFixed(2)} DKK
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Resume */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">
                    AI Customer Summary
                  </CardTitle>
                  <CardDescription>
                    AI-generated insights and recommendations
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    generateResume.mutate({ customerId: profile?.id || 0 })
                  }
                  disabled={generateResume.isPending || !profile?.id}
                >
                  {generateResume.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  <span className="ml-2">Regenerate</span>
                </Button>
              </CardHeader>
              <CardContent>
                {profile?.aiResume ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <SafeStreamdown content={profile.aiResume} />
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No AI summary available</p>
                    <p className="text-xs">Click "Regenerate" to create one</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="m-0 p-6">
            <CustomerNotesTab customerId={profile?.id || 0} />
          </TabsContent>

          {/* Other tabs would go here... */}
          <TabsContent value="invoices" className="m-0 p-6">
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Invoice details coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="emails" className="m-0 p-6">
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Email details coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="m-0 p-6">
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Calendar integration coming soon</p>
            </div>
          </TabsContent>

          {/* Case Analysis Tab */}
          <TabsContent value="case" className="m-0 p-6">
            {caseLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : caseData?.caseAnalysis ? (
              <CaseAnalysisTab analysis={caseData.caseAnalysis} />
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No case analysis available</p>
                <p className="text-sm mt-2">
                  Case analysis will be generated based on customer
                  interactions.
                </p>
              </div>
            )}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}

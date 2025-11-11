import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { 
  Filter, Inbox, Tag as LabelIcon, Search, SlidersHorizontal, ChevronDown, 
  X, Archive, Clock, UserPlus, Maximize2, Minimize2, Paperclip, Calendar,
  Mail, Reply, Forward, Trash2, MoreVertical
} from "lucide-react";
import { SmartSplitsDemo } from "@/components/showcase/SmartSplitsDemo";
import { EmailListItem } from "@/components/showcase/EmailListItem";
import { BusinessMetricsCard } from "@/components/showcase/BusinessMetricsCard";

interface FilterChip {
  id: string;
  label: string;
  count?: number;
}

interface EmailData {
  id: string;
  sender: string;
  source: string;
  subject: string;
  preview: string;
  time: string;
  hasAttachments: boolean;
  badges: Array<{ label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }>;
  metrics?: { leads?: number; value?: number; avgValue?: number };
  aiScore: number; // 0-100
  fullBody?: string;
  attachments?: Array<{ name: string; size: string }>;
}

const chips: FilterChip[] = [
  { id: "all", label: "All", count: 3 },
  { id: "rengoering", label: "Rengøring.nu", count: 3 },
  { id: "direct", label: "Direct", count: 20 }
];

type DensityMode = 'comfortable' | 'compact' | 'ultra-compact';

export function EmailCenterShowcaseV2() {
  const [active, setActive] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [scoreOn, setScoreOn] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [density, setDensity] = useState<DensityMode>('comfortable');
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());

  const emails = useMemo((): EmailData[] => [
    {
      id: 'e1',
      sender: 'Matilde Skinneholm',
      source: 'Rengøring.nu',
      subject: 'Matilde Skinneholm fra Rengøring.nu - Nettbureau AS',
      preview: 'Hej – vi vil gerne have et tilbud på rengøring for vores kontor...',
      time: '22:08',
      hasAttachments: false,
      badges: [{ label: '🔥 HOT', variant: 'destructive' as const }],
      metrics: { leads: 3, value: 40000, avgValue: 13333 },
      aiScore: 95,
      fullBody: 'Hej,\n\nVi vil gerne have et tilbud på rengøring for vores kontor i København.\n\nVi er ca. 250 m² og ønsker ugentlig rengøring.\n\nKan I sende et tilbud?\n\nVenlig hilsen,\nMatilde Skinneholm',
    },
    {
      id: 'e2',
      sender: 'Hanne Andersen',
      source: 'Rengøring.nu',
      subject: 'Hanne andersen fra Rengøring.nu - Nettbureau AS',
      preview: 'Hej, jeg følger op på vores tidligere mail vedr. tilbud...',
      time: '17:39',
      hasAttachments: false,
      badges: [{ label: '🔥 HOT', variant: 'destructive' as const }],
      aiScore: 88,
      fullBody: 'Hej,\n\nJeg følger op på vores tidligere mail vedr. tilbud.\n\nHar I haft mulighed for at se på det?\n\nVenlig hilsen,\nHanne Andersen',
    },
    {
      id: 'e3',
      sender: 'Rendetalje.dk',
      source: 'Website',
      subject: 'Camilla Nehaus fra Rengøring.nu - Nettbureau AS',
      preview: 'Vedr. booking af besigtigelse – vi kan tirsdag eller torsdag...',
      time: '20:53',
      hasAttachments: true,
      badges: [{ label: '🔥 HOT', variant: 'destructive' as const }],
      aiScore: 92,
      fullBody: 'Vedr. booking af besigtigelse\n\nVi kan tirsdag eller torsdag denne uge.\n\nHvad passer jer bedst?\n\nMvh,\nCamilla Nehaus',
      attachments: [
        { name: 'Plantegning.pdf', size: '2.4 MB' },
        { name: 'Billeder.zip', size: '8.1 MB' }
      ]
    },
  ], []);

  const filtered = emails.filter(e => {
    const q = query.trim().toLowerCase();
    const matchQuery = !q || [e.sender, e.source, e.subject, e.preview].some(v => v?.toLowerCase().includes(q));
    const matchChip = active === 'all' || (active === 'rengoering' && e.source === 'Rengøring.nu') || (active === 'direct' && e.source === 'Website');
    return matchQuery && matchChip;
  });

  const currentEmail = filtered[selectedIndex];

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && currentEmail) {
        setShowPreview(true);
      } else if (e.key === 'Escape') {
        setShowPreview(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [filtered.length, currentEmail]);

  const toggleSelectEmail = (id: string) => {
    setSelectedEmails(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedEmails.size === filtered.length) {
      setSelectedEmails(new Set());
    } else {
      setSelectedEmails(new Set(filtered.map(e => e.id)));
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 75) return 'bg-blue-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-gray-100';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Inbox className="w-5 h-5 text-primary" /> Email Center V2
          </h2>
          <p className="text-sm text-muted-foreground">
            Complete email workspace • AI scoring • Multi-select • Split preview • Keyboard nav (↑↓ Enter Esc)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <SlidersHorizontal className="w-4 h-4" /> 
                Density: {density}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Density</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setDensity('comfortable')}>
                Comfortable
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDensity('compact')}>
                Compact
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDensity('ultra-compact')}>
                Ultra-compact
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowPreview(!showPreview)}
            className="gap-2"
          >
            {showPreview ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            {showPreview ? 'Hide' : 'Show'} Preview
          </Button>
          <Button 
            variant={scoreOn ? "default" : "outline"} 
            size="sm" 
            onClick={() => setScoreOn(s => !s)}
          >
            AI Score
          </Button>
        </div>
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedEmails.size > 0 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold">{selectedEmails.size} selected</span>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Archive className="w-4 h-4" /> Archive
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Clock className="w-4 h-4" /> Snooze
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <UserPlus className="w-4 h-4" /> Assign
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Trash2 className="w-4 h-4" /> Delete
                </Button>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedEmails(new Set())}>
              <X className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Grid */}
      <div className={cn(
        "grid gap-6",
        showPreview ? "grid-cols-1 lg:grid-cols-[260px_1fr_400px_320px]" : "grid-cols-1 lg:grid-cols-[260px_1fr_320px]"
      )}>
        {/* Left: Smart Splits */}
        <div className="hidden lg:block">
          <SmartSplitsDemo />
        </div>

        {/* Center: Toolbar + List */}
        <div className="space-y-3">
          {/* Toolbar */}
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="w-4 h-4 absolute left-2 top-2.5 text-muted-foreground" />
                  <Input 
                    value={query} 
                    onChange={e => setQuery(e.target.value)} 
                    placeholder="Søg emails..." 
                    className="pl-8" 
                  />
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Inbox className="w-4 h-4" /> Indbakke
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <LabelIcon className="w-4 h-4" /> Labels
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter className="w-4 h-4" /> Filter <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter</DropdownMenuLabel>
                    <DropdownMenuItem>Only unread</DropdownMenuItem>
                    <DropdownMenuItem>Has attachments</DropdownMenuItem>
                    <DropdownMenuItem>Has AI suggestions</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Chips */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {chips.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setActive(c.id)}
                    className={cn(
                      "px-3 py-1.5 text-xs rounded-full border transition-colors",
                      active === c.id ? "bg-primary text-primary-foreground border-primary" : "bg-muted hover:bg-accent"
                    )}
                  >
                    <span className="font-medium">{c.label}</span>
                    {typeof c.count === 'number' && (
                      <Badge variant={active === c.id ? "secondary" : "outline"} className="ml-2 text-[10px] rounded-full">
                        {c.count}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Email list */}
          <Card>
            <CardHeader className="py-3 px-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Checkbox 
                      checked={selectedEmails.size === filtered.length && filtered.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                    {filtered.length} Results
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Multi-select • AI scoring • Staggered animations
                  </CardDescription>
                </div>
                {scoreOn && (
                  <div className="text-xs text-muted-foreground">
                    AI Score: <span className="text-green-600">90+</span> / 
                    <span className="text-blue-600">75+</span> / 
                    <span className="text-yellow-600">60+</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className={cn(
                "transition-all",
                density === 'comfortable' && "h-[520px]",
                density === 'compact' && "h-[600px]",
                density === 'ultra-compact' && "h-[700px]"
              )}>
                <div>
                  {filtered.map((e, idx) => (
                    <div
                      key={e.id}
                      style={{ 
                        animation: `slideIn 0.3s ease-out ${idx * 0.05}s both` 
                      }}
                      className={cn(
                        "border-b hover:bg-accent/50 transition-all group",
                        idx === selectedIndex && "bg-accent/30 border-l-4 border-l-primary",
                        selectedEmails.has(e.id) && "bg-primary/5"
                      )}
                    >
                      <div className="flex items-start gap-3 p-3">
                        {/* Checkbox */}
                        <Checkbox 
                          checked={selectedEmails.has(e.id)}
                          onCheckedChange={() => toggleSelectEmail(e.id)}
                          className="mt-1"
                        />

                        {/* Email content */}
                        <div 
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => {
                            setSelectedIndex(idx);
                            setShowPreview(true);
                          }}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className={cn(
                                  "font-semibold truncate",
                                  density === 'ultra-compact' ? "text-xs" : "text-sm"
                                )}>
                                  {e.sender}
                                </span>
                                <Badge variant="outline" className="text-xs shrink-0">
                                  {e.source}
                                </Badge>
                              </div>
                              <div className={cn(
                                "text-muted-foreground truncate",
                                density === 'ultra-compact' ? "text-[10px]" : "text-xs"
                              )}>
                                Re: {e.subject}
                              </div>
                              {density !== 'ultra-compact' && e.preview && (
                                <div className="text-xs text-muted-foreground line-clamp-1 mt-1">
                                  {e.preview}
                                </div>
                              )}
                            </div>

                            {/* Right side: Time + Score */}
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs text-muted-foreground">{e.time}</span>
                              {scoreOn && (
                                <div className={cn(
                                  "px-2 py-0.5 rounded-md text-xs font-semibold",
                                  getScoreBg(e.aiScore),
                                  getScoreColor(e.aiScore)
                                )}>
                                  {e.aiScore}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Badges & Metrics */}
                          {density !== 'ultra-compact' && (
                            <div className="flex items-center justify-between gap-2 mt-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                {e.badges.map((badge, bidx) => (
                                  <Badge key={bidx} variant={badge.variant} className="text-xs">
                                    {badge.label}
                                  </Badge>
                                ))}
                                {e.hasAttachments && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Paperclip className="w-3 h-3" />
                                  </div>
                                )}
                              </div>

                              {e.metrics && (
                                <div className="flex items-center gap-2 text-xs shrink-0">
                                  {e.metrics.leads !== undefined && (
                                    <span className="font-semibold text-red-600">
                                      🔥 {e.metrics.leads}
                                    </span>
                                  )}
                                  {e.metrics.value !== undefined && (
                                    <span className="font-semibold text-green-600">
                                      {e.metrics.value.toLocaleString('da-DK')} kr
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel (conditional) */}
        {showPreview && currentEmail && (
          <div className="hidden lg:block space-y-3 animate-slideInRight">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base mb-1">{currentEmail.sender}</CardTitle>
                    <CardDescription className="text-xs">{currentEmail.subject}</CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowPreview(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <Separator className="my-3" />
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline">{currentEmail.source}</Badge>
                  <Badge variant="outline">{currentEmail.time}</Badge>
                  {currentEmail.aiScore && (
                    <Badge className={cn(
                      getScoreBg(currentEmail.aiScore),
                      getScoreColor(currentEmail.aiScore)
                    )}>
                      AI Score: {currentEmail.aiScore}
                    </Badge>
                  )}
                  {currentEmail.badges.map((b, idx) => (
                    <Badge key={idx} variant={b.variant}>{b.label}</Badge>
                  ))}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Email Body */}
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-sm">
                    {currentEmail.fullBody}
                  </div>
                </div>

                {/* Attachments */}
                {currentEmail.attachments && currentEmail.attachments.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold mb-2 flex items-center gap-2">
                      <Paperclip className="w-3 h-3" />
                      Attachments ({currentEmail.attachments.length})
                    </div>
                    <div className="space-y-2">
                      {currentEmail.attachments.map((att, idx) => (
                        <div 
                          key={idx}
                          className="flex items-center gap-2 p-2 rounded-md border bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <Paperclip className="w-4 h-4 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium truncate">{att.name}</div>
                            <div className="text-[10px] text-muted-foreground">{att.size}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Quick Actions */}
                <div className="flex items-center gap-2">
                  <Button size="sm" className="gap-2 flex-1">
                    <Reply className="w-4 h-4" /> Reply
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2 flex-1">
                    <Forward className="w-4 h-4" /> Forward
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Archive className="w-4 h-4 mr-2" /> Archive
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Clock className="w-4 h-4 mr-2" /> Snooze
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <UserPlus className="w-4 h-4 mr-2" /> Assign
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* AI Insights */}
                {currentEmail.metrics && (
                  <div className="p-3 rounded-md bg-primary/5 border border-primary/20">
                    <div className="text-xs font-semibold mb-2 flex items-center gap-2">
                      ✨ AI Insights
                    </div>
                    <div className="space-y-1 text-xs">
                      {currentEmail.metrics.leads && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Hot Leads</span>
                          <span className="font-semibold text-red-600">
                            🔥 {currentEmail.metrics.leads}
                          </span>
                        </div>
                      )}
                      {currentEmail.metrics.value && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Est. Value</span>
                          <span className="font-semibold text-green-600">
                            {currentEmail.metrics.value.toLocaleString('da-DK')} kr
                          </span>
                        </div>
                      )}
                      {currentEmail.metrics.avgValue && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Avg Value/Lead</span>
                          <span className="font-semibold">
                            {currentEmail.metrics.avgValue.toLocaleString('da-DK')} kr
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Right: Dashboard */}
        <div className="space-y-3">
          <BusinessMetricsCard />

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">I Dag</CardTitle>
              <CardDescription>Ingen bookings i dag</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex items-center gap-2 p-2 rounded-md bg-muted">
                <span className="text-base">📧</span>
                <span>0 nye emails</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-md bg-yellow-500/10 border border-yellow-500/20">
                <span className="text-base">⚠️</span>
                <span>Kræver handling: 1 lead venter svar</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Denne Uge</CardTitle>
              <CardDescription>Overview</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-md bg-muted">Bookings: 0</div>
              <div className="p-2 rounded-md bg-muted">Conversion: 0%</div>
              <div className="p-2 rounded-md bg-muted">Revenue: 0 kr</div>
              <div className="p-2 rounded-md bg-muted">New Leads: 0</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add CSS animations */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

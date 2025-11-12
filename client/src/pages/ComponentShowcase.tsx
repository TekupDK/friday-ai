import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme } from "@/contexts/ThemeContext";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import {
  AlertCircle,
  CalendarIcon,
  Check,
  CheckCircle2,
  Clock,
  Moon,
  Sun,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast as sonnerToast } from "sonner";
import { AIThinking } from "@/components/chat/AIThinking";
import { ToolExecutionBox } from "@/components/chat/ToolExecutionBox";
import { WeatherCard } from "@/components/chat/WeatherCard";
import {
  InvoiceCards,
  type InvoiceCardData,
} from "@/components/chat/InvoiceCards";
import {
  ResponseCard,
  type ResponseCardData,
} from "@/components/chat/ResponseCards";
import {
  AIMemoryPanel,
  type AIMemoryItem,
} from "@/components/chat/AIMemoryPanel";
import {
  EmailThreadCard,
  type EmailThreadData,
} from "@/components/chat/EmailThreadCard";
import {
  CalendarEventCard,
  type CalendarEventData,
} from "@/components/chat/CalendarEventCard";
import {
  SearchResultsCard,
  type SearchResult,
} from "@/components/chat/SearchResultsCard";
import { ChatFlowDemo } from "@/components/chat/ChatFlowDemo";
import { ThreePanelDemo } from "@/components/showcase/ThreePanelDemo";
import { HeaderDemo } from "@/components/showcase/HeaderDemo";
import { AIEmailAssistantDemo } from "@/components/showcase/AIEmailAssistantDemo";
import { CodeBlock } from "@/components/showcase/CodeBlock";
import { ComponentSearch } from "@/components/showcase/ComponentSearch";
import { CategorySidebar } from "@/components/showcase/CategorySidebar";
import { SettingsPanelDemo } from "@/components/showcase/SettingsPanelDemo";
import { NotificationsDemo } from "@/components/showcase/NotificationsDemo";
import { LeadCardDemo } from "@/components/showcase/LeadCardDemo";
import { SmartSplitsDemo } from "@/components/showcase/SmartSplitsDemo";
import { BusinessMetricsCard } from "@/components/showcase/BusinessMetricsCard";
import { EmailListDemo } from "@/components/showcase/EmailListItem";
import { TaskListCompact } from "@/components/showcase/TaskListCompact";
import { ChatSuggestionsPanel } from "@/components/showcase/ChatSuggestionsPanel";
import { AnimatedStatsCard } from "@/components/showcase/AnimatedStatsCard";
import { SkeletonDemo } from "@/components/showcase/SkeletonDemo";
import { InteractiveHoverCard } from "@/components/showcase/InteractiveHoverCard";
import { AnimatedTimeline } from "@/components/showcase/AnimatedTimeline";
import { ProgressRingDemo } from "@/components/showcase/ProgressRingDemo";
import { ToastNotificationDemo } from "@/components/showcase/ToastNotificationDemo";
import { KanbanBoardDemo } from "@/components/showcase/KanbanBoardDemo";
import { CalendarFullDemo } from "@/components/showcase/CalendarFullDemo";
import { LeadProfileCard } from "@/components/showcase/LeadProfileCard";
import { CustomerCardV5 } from "@/components/showcase/CustomerCardV5";
import { ChatPanelUIShowcase } from "@/components/showcase/ChatPanelUIShowcase";
import { PropsTable } from "@/components/showcase/PropsTable";
import { ToolExecutionPlayground } from "@/components/showcase/ToolExecutionPlayground";
import { EmailCenterShowcaseV2 } from "@/components/showcase/EmailCenterShowcaseV2";
import { EmailCenterGmailStyle } from "@/components/showcase/EmailCenterGmailStyle";
import { EmailCenterLinearStyle } from "@/components/showcase/EmailCenterLinearStyle";
import { EmailCenterKanbanStyle } from "@/components/showcase/EmailCenterKanbanStyle";
import { EmailCenterArcStyle } from "@/components/showcase/EmailCenterArcStyle";
import { EmailCenterAppleStyle } from "@/components/showcase/EmailCenterAppleStyle";
import { EmailCenterSlackStyle } from "@/components/showcase/EmailCenterSlackStyle";
import { EmailCenterAIFirst } from "@/components/showcase/EmailCenterAIFirst";
import { EmailCenterPipelineOptimized } from "@/components/showcase/EmailCenterPipelineOptimized";
import { EmailCenterLeadCRM } from "@/components/showcase/EmailCenterLeadCRM";
import { EmailCenterUnified } from "@/components/showcase/EmailCenterUnified";
import { EmailCenterShortwavePremium } from "@/components/showcase/EmailCenterShortwavePremium";
import { EmailCenterJaceModern } from "@/components/showcase/EmailCenterJaceModern";
import { EmailCenterFridayPro } from "@/components/showcase/EmailCenterFridayPro";
import { EmailCenterProV2 } from "@/components/showcase/EmailCenterProV2";
import { EmailCenterShowcase } from "@/components/showcase/EmailCenterShowcase";
import { CalendarEventCardDemo } from "@/components/showcase/CalendarEventCardDemo";
import { ChatDemoComplete } from "@/components/showcase/ChatDemoComplete";
import { ChatPanelUIUpgradedShowcase } from "@/components/showcase/ChatPanelUIUpgradedShowcase";
import { CustomerCard } from "@/components/leads/CustomerCardClean";

export default function ComponentsShowcase() {
  const { theme, toggleTheme } = useTheme();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [datePickerDate, setDatePickerDate] = useState<Date>();
  const [selectedFruits, setSelectedFruits] = useState<string[]>([]);
  const [progress, setProgress] = useState(33);
  const [currentPage, setCurrentPage] = useState(2);
  const [openCombobox, setOpenCombobox] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [dialogInput, setDialogInput] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Friday AI Tool Execution demo state
  const [showToolBox, setShowToolBox] = useState(false);
  const [toolProgress, setToolProgress] = useState(0);
  const [isThinking, setIsThinking] = useState(false);

  // Friday AI Memory demo state
  const [memoryItems] = useState<AIMemoryItem[]>([
    {
      id: "1",
      type: "lead",
      title: "Oprettet lead:",
      subtitle: "Hans Jensen, 12345678",
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 min ago
    },
    {
      id: "2",
      type: "task",
      title: "Oprettet opgave:",
      subtitle: "Ring kunde i morgen",
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
    },
    {
      id: "3",
      type: "meeting",
      title: "Booket møde:",
      subtitle: "Ons 10:00",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      id: "4",
      type: "invoice",
      title: "Oprettet faktura:",
      subtitle: "Ole Olsen - 5000 kr",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    },
  ]);

  // Weather Card demo data
  const weatherData = {
    city: "København",
    temperature: 18,
    condition: "Partly Cloudy",
    emoji: "☁️",
    humidity: 65,
    wind: 12,
    forecast: [
      { day: "Man", temp: 19, emoji: "☀️" },
      { day: "Tir", temp: 17, emoji: "☁️" },
      { day: "Ons", temp: 16, emoji: "🌧️" },
    ],
  };

  // Invoice Cards demo data (Billy Integration)
  const invoiceData: InvoiceCardData[] = [
    {
      id: "#1234",
      company: "Acme Corp",
      amount: 12500,
      currency: "kr",
      dueInDays: 5,
      status: "pending",
    },
    {
      id: "#1235",
      company: "TechStart",
      amount: 8200,
      currency: "kr",
      dueInDays: 2,
      status: "pending",
    },
    {
      id: "#1236",
      company: "Nordic Ltd",
      amount: 15800,
      currency: "kr",
      dueInDays: -3,
      status: "overdue",
    },
  ];

  // Customer Card V5 (Quote Estimation) demo data
  const customerCardV5Demo = {
    profileKey: "E:as_vk1@hotmail.com",
    name: "Anne Sofie Kristensen",
    primaryEmail: "as_vk1@hotmail.com",
    primaryPhone: "23844904",
    addresses: ["Elverdalsvej 24, 8270 Højbjerg"],
    serviceTypes: ["REN-005"],
    leadSources: {
      "Leadpoint.dk (Rengøring Aarhus)": 6,
      "Rengøring.nu (Leadmail.no)": 2,
    },
    gmailThreads: ["19a68c9b5b9bbb44"],
    calendarEvents: 8,
    quoteRecommendation: {
      basis: "m2_rule" as const,
      serviceType: "REN-005",
      isFastFirst: false,
      hours: 3.6,
      hourlyRate: 349,
      price: 3.6 * 349,
      details: {
        coeff: 0.01,
        m2: 150,
        baseHours: 3,
        windowsExtra: 20,
        notes: ["m²-regel anvendt (fast vedligehold)", "Vinduespudsning +20%"],
      },
    },
  };

  const serviceTypeName = (code?: string) => {
    switch (code) {
      case "REN-001":
        return "Privatrengøring";
      case "REN-002":
        return "Hovedrengøring";
      case "REN-003":
        return "Flytterengøring";
      case "REN-004":
        return "Erhvervsrengøring";
      case "REN-005":
        return "Fast rengøring";
      default:
        return "Rengøring";
    }
  };

  // Email Thread demo data (Gmail Integration)
  const emailThreadData: EmailThreadData = {
    subject: "Tilbud på website projekt",
    from: "kunde@firma.dk",
    messageCount: 5,
    summary:
      "Kunde efterspørger tilbud på nyt website med e-commerce. Budget omkring 50.000 kr. Deadline Q1 2025.",
    labels: ["Lead", "Høj prioritet", "Website"],
    priority: "high",
    hasAttachments: true,
  };

  // Calendar Event demo data (Google Calendar Integration)
  const calendarEventData: CalendarEventData = {
    title: "Team Standup",
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 timer fra nu
    endTime: new Date(Date.now() + 2.5 * 60 * 60 * 1000),
    location: "Google Meet",
    attendees: ["Hans", "Peter", "Mette"],
    description: "Daglig standup meeting - status på projekter",
    isBooked: true,
  };

  // Search Results demo data
  const searchResultsData: SearchResult[] = [
    {
      title: "AI Trends 2024: What to Expect",
      url: "https://example.com/ai-trends",
      snippet:
        "Artificial intelligence continues to evolve rapidly in 2024, with significant advances in large language models, multimodal AI, and agent-based systems...",
      source: "TechCrunch",
    },
    {
      title: "The State of AI Report 2024",
      url: "https://example.com/state-of-ai",
      snippet:
        "Comprehensive analysis of AI developments, including GPT-4, Claude 3, and emerging open-source models. Key insights on adoption rates and market trends...",
      source: "AI Index",
    },
    {
      title: "Best Practices for AI Integration",
      url: "https://example.com/ai-best-practices",
      snippet:
        "Learn how to effectively integrate AI into your business workflows. Covers prompt engineering, RAG systems, and production deployment strategies...",
      source: "Medium",
    },
  ];

  // Response Cards demo data
  const demoCards: ResponseCardData[] = [
    {
      type: "lead_created",
      title: "Lead oprettet",
      lead: {
        id: 123,
        name: "Hans Jensen",
        email: "hans@email.dk",
        phone: "12345678",
        source: "Friday AI",
      },
    },
    {
      type: "task_created",
      title: "Opgave oprettet",
      task: {
        id: 456,
        title: "Ring til kunde om rengøring",
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        priority: "high",
      },
    },
    {
      type: "meeting_booked",
      title: "Møde booket",
      meeting: {
        id: "evt-789",
        title: "Kundemøde om tilbud",
        startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(
          Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000
        ).toISOString(),
        location: "Kontoret, Aarhus",
      },
    },
    {
      type: "invoice_created",
      title: "Faktura oprettet",
      invoice: {
        id: "INV-2024-001",
        customerName: "Ole Olsen",
        amount: 5000,
        currency: "DKK",
        status: "draft",
      },
    },
    {
      type: "calendar_events",
      title: "Kalender oversigt",
      date: new Date().toISOString(),
      events: [
        {
          id: "1",
          title: "Team standup",
          startTime: new Date().setHours(9, 0).toString(),
          endTime: new Date().setHours(9, 30).toString(),
        },
        {
          id: "2",
          title: "Kundemøde",
          startTime: new Date().setHours(14, 0).toString(),
          endTime: new Date().setHours(15, 0).toString(),
        },
      ],
    },
  ];

  const handleDialogSubmit = () => {
    console.log("Dialog submitted with value:", dialogInput);
    sonnerToast.success("Submitted successfully", {
      description: `Input: ${dialogInput}`,
    });
    setDialogInput("");
    setDialogOpen(false);
  };

  const handleDialogKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleDialogSubmit();
    }
  };

  // Simulate inline tool execution
  const simulateToolExecution = () => {
    setIsThinking(true);
    setShowToolBox(false);
    setToolProgress(0);

    // After 1 second, show tool box
    setTimeout(() => {
      setIsThinking(false);
      setShowToolBox(true);

      // Animate progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setToolProgress(progress);

        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => setShowToolBox(false), 2000);
        }
      }, 300);
    }, 1000);
  };

  // Component Search and Navigation
  const [activeSection, setActiveSection] = useState<string>("");

  const componentCategories = [
    {
      name: "Showcase Features",
      emoji: "⭐",
      items: [
        { id: "code-examples", name: "Code Examples", emoji: "💻" },
        { id: "search", name: "Component Search", emoji: "🔍" },
      ],
    },
    {
      name: "App Architecture",
      emoji: "🏗️",
      items: [
        { id: "three-panel", name: "3-Panel Layout", emoji: "📱" },
        { id: "header", name: "Header", emoji: "🎯" },
        { id: "ai-email-assistant", name: "AI Email Assistant", emoji: "🤖" },
      ],
    },
    {
      name: "Business Components",
      emoji: "💼",
      items: [
        { id: "settings", name: "Settings Panel", emoji: "⚙️" },
        { id: "notifications", name: "Notifications", emoji: "🔔" },
        { id: "leads", name: "Lead Cards", emoji: "📊" },
        { id: "lead-profile", name: "Lead Profile", emoji: "🧑‍💼" },
        {
          id: "chromadb-customer-card",
          name: "Customer Card V5.1 AI",
          emoji: "🤖",
        },
      ],
    },
    {
      name: "Calendar & Scheduling",
      emoji: "📆",
      items: [{ id: "calendar-full", name: "Full Calendar", emoji: "📅" }],
    },
    {
      name: "Email Center Designs",
      emoji: "📧",
      items: [
        {
          id: "email-designs-comparison",
          name: "🎨 All 10 Designs",
          emoji: "🎨",
        },
        { id: "email-gmail", name: "Gmail/Superhuman", emoji: "📮" },
        { id: "email-linear", name: "Linear Minimal", emoji: "✨" },
        { id: "email-kanban", name: "Notion Kanban", emoji: "📋" },
        { id: "email-arc", name: "Arc Browser", emoji: "🌐" },
        { id: "email-apple", name: "Apple Mail", emoji: "🍎" },
        { id: "email-slack", name: "Slack Threads", emoji: "💬" },
      ],
    },
    {
      name: "Premium Designs ✨",
      emoji: "💎",
      items: [
        {
          id: "email-unified-showcase",
          name: "🌟 Unified Email Center",
          emoji: "🎯",
        },
        { id: "email-pro-v2", name: "⭐ Email Center Pro V2", emoji: "🚀" },
        {
          id: "email-shortwave-premium",
          name: "Shortwave Premium",
          emoji: "🌊",
        },
        { id: "email-jace-modern", name: "Jace Modern AI", emoji: "🤖" },
        { id: "email-friday-pro", name: "Friday AI Pro", emoji: "⭐" },
      ],
    },
    {
      name: "Friday AI Optimized",
      emoji: "🤖",
      items: [
        { id: "email-ai-first", name: "AI-First Smart Inbox", emoji: "🧠" },
        { id: "email-pipeline", name: "Pipeline Optimized", emoji: "⚡" },
        { id: "email-crm", name: "Lead Management CRM", emoji: "👥" },
        { id: "email-unified", name: "Unified Workspace", emoji: "🔗" },
      ],
    },
    {
      name: "Email Components",
      emoji: "📨",
      items: [
        { id: "smart-splits", name: "Smart Splits", emoji: "🎯" },
        { id: "email-list", name: "Email List Items", emoji: "📬" },
        { id: "business-metrics", name: "Business Metrics", emoji: "📊" },
      ],
    },
    {
      name: "Chat & Tasks",
      emoji: "💬",
      items: [
        { id: "chat-suggestions", name: "Chat Suggestions", emoji: "✨" },
        { id: "task-list", name: "Task List", emoji: "✅" },
        { id: "chat-panel-ui", name: "Chat Panel UI", emoji: "💬" },
        {
          id: "chat-demo-complete",
          name: "🌟 Complete Chat Demo",
          emoji: "🚀",
        },
        {
          id: "chat-panel-upgraded",
          name: "✨ Chat Panel OPGRADERET",
          emoji: "🎨",
        },
      ],
    },
    {
      name: "Animationer & Effects",
      emoji: "✨",
      items: [
        { id: "animated-stats", name: "Animated Stats", emoji: "📊" },
        { id: "skeleton-loading", name: "Skeleton Loading", emoji: "⏳" },
        { id: "hover-cards", name: "Interactive Hover", emoji: "🎨" },
        { id: "timeline", name: "Animated Timeline", emoji: "📅" },
        { id: "progress-rings", name: "Progress Rings", emoji: "⭕" },
        { id: "toasts", name: "Toast Notifications", emoji: "🔔" },
        { id: "kanban", name: "Kanban Board", emoji: "📋" },
      ],
    },
  ];

  const componentItems = componentCategories.flatMap(cat =>
    cat.items.map(item => ({
      id: item.id,
      name: item.name,
      category: cat.name,
      keywords: [item.name.toLowerCase(), cat.name.toLowerCase()],
    }))
  );

  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container max-w-7xl mx-auto py-8 px-4">
        <div className="space-y-6 mb-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-3xl font-bold tracking-tight">
              Friday AI Component Showcase
            </h2>
            <div className="flex items-center gap-2">
              <ComponentSearch
                components={componentItems}
                onSelect={handleNavigate}
              />
              <Button variant="outline" size="icon" onClick={toggleTheme}>
                {theme === "light" ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground">
            Komplet oversigt over alle UI komponenter, integrationer og
            features. Brug Ctrl+K til søgning.
          </p>
        </div>

        <div className="grid grid-cols-[240px_1fr] gap-8">
          <CategorySidebar
            categories={componentCategories}
            activeSection={activeSection}
            onNavigate={handleNavigate}
          />

          <div className="space-y-12">
            {/* Text Colors Section */}
            <section className="space-y-4">
              <h3 className="text-2xl font-semibold">Text Colors</h3>
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Foreground (Default)
                        </p>
                        <p className="text-foreground text-lg">
                          Default text color for main content
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Muted Foreground
                        </p>
                        <p className="text-muted-foreground text-lg">
                          Muted text for secondary information
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Primary
                        </p>
                        <p className="text-primary text-lg font-medium">
                          Primary brand color text
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Secondary Foreground
                        </p>
                        <p className="text-secondary-foreground text-lg">
                          Secondary action text color
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Accent Foreground
                        </p>
                        <p className="text-accent-foreground text-lg">
                          Accent text for emphasis
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Destructive
                        </p>
                        <p className="text-destructive text-lg font-medium">
                          Error or destructive action text
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Card Foreground
                        </p>
                        <p className="text-card-foreground text-lg">
                          Text color on card backgrounds
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Popover Foreground
                        </p>
                        <p className="text-popover-foreground text-lg">
                          Text color in popovers
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Color Combinations Section */}
            <section className="space-y-4">
              <h3 className="text-2xl font-semibold">Color Combinations</h3>
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-primary text-primary-foreground rounded-lg p-4">
                      <p className="font-medium mb-1">Primary</p>
                      <p className="text-sm opacity-90">
                        Primary background with foreground text
                      </p>
                    </div>
                    <div className="bg-secondary text-secondary-foreground rounded-lg p-4">
                      <p className="font-medium mb-1">Secondary</p>
                      <p className="text-sm opacity-90">
                        Secondary background with foreground text
                      </p>
                    </div>
                    <div className="bg-muted text-muted-foreground rounded-lg p-4">
                      <p className="font-medium mb-1">Muted</p>
                      <p className="text-sm opacity-90">
                        Muted background with foreground text
                      </p>
                    </div>
                    <div className="bg-accent text-accent-foreground rounded-lg p-4">
                      <p className="font-medium mb-1">Accent</p>
                      <p className="text-sm opacity-90">
                        Accent background with foreground text
                      </p>
                    </div>
                    <div className="bg-destructive text-destructive-foreground rounded-lg p-4">
                      <p className="font-medium mb-1">Destructive</p>
                      <p className="text-sm opacity-90">
                        Destructive background with foreground text
                      </p>
                    </div>
                    <div className="bg-card text-card-foreground rounded-lg p-4 border">
                      <p className="font-medium mb-1">Card</p>
                      <p className="text-sm opacity-90">
                        Card background with foreground text
                      </p>
                    </div>
                    <div className="bg-popover text-popover-foreground rounded-lg p-4 border">
                      <p className="font-medium mb-1">Popover</p>
                      <p className="text-sm opacity-90">
                        Popover background with foreground text
                      </p>
                    </div>
                    <div className="bg-background text-foreground rounded-lg p-4 border">
                      <p className="font-medium mb-1">Background</p>
                      <p className="text-sm opacity-90">
                        Default background with foreground text
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Buttons Section */}
            <section className="space-y-4">
              <h3 className="text-2xl font-semibold">Buttons</h3>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-wrap gap-4">
                    <Button>Default</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="link">Link</Button>
                    <Button size="sm">Small</Button>
                    <Button size="lg">Large</Button>
                    <Button size="icon">
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Form Inputs Section */}
            <section className="space-y-4">
              <h3 className="text-2xl font-semibold">Form Inputs</h3>
              <Card>
                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="Email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Type your message here."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Select</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a fruit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apple">Apple</SelectItem>
                        <SelectItem value="banana">Banana</SelectItem>
                        <SelectItem value="orange">Orange</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" />
                    <Label htmlFor="terms">Accept terms and conditions</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="airplane-mode" />
                    <Label htmlFor="airplane-mode">Airplane Mode</Label>
                  </div>
                  <div className="space-y-2">
                    <Label>Radio Group</Label>
                    <RadioGroup defaultValue="option-one">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="option-one" id="option-one" />
                        <Label htmlFor="option-one">Option One</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="option-two" id="option-two" />
                        <Label htmlFor="option-two">Option Two</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="space-y-2">
                    <Label>Slider</Label>
                    <Slider defaultValue={[50]} max={100} step={1} />
                  </div>
                  <div className="space-y-2">
                    <Label>Input OTP</Label>
                    <InputOTP maxLength={6}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <div className="space-y-2">
                    <Label>Date Time Picker</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-full justify-start text-left font-normal ${
                            !datePickerDate && "text-muted-foreground"
                          }`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {datePickerDate ? (
                            format(datePickerDate, "PPP HH:mm", {
                              locale: zhCN,
                            })
                          ) : (
                            <span>Select date and time</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <div className="p-3 space-y-3">
                          <Calendar
                            mode="single"
                            selected={datePickerDate}
                            onSelect={setDatePickerDate}
                          />
                          <div className="border-t pt-3 space-y-2">
                            <Label className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              Time
                            </Label>
                            <div className="flex gap-2">
                              <Input
                                type="time"
                                value={
                                  datePickerDate
                                    ? format(datePickerDate, "HH:mm")
                                    : "00:00"
                                }
                                onChange={e => {
                                  const [hours, minutes] =
                                    e.target.value.split(":");
                                  const newDate = datePickerDate
                                    ? new Date(datePickerDate)
                                    : new Date();
                                  newDate.setHours(parseInt(hours));
                                  newDate.setMinutes(parseInt(minutes));
                                  setDatePickerDate(newDate);
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    {datePickerDate && (
                      <p className="text-sm text-muted-foreground">
                        Selected:{" "}
                        {format(datePickerDate, "yyyy/MM/dd  HH:mm", {
                          locale: zhCN,
                        })}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Searchable Dropdown</Label>
                    <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openCombobox}
                          className="w-full justify-between"
                        >
                          {selectedFramework
                            ? [
                                { value: "react", label: "React" },
                                { value: "vue", label: "Vue" },
                                { value: "angular", label: "Angular" },
                                { value: "svelte", label: "Svelte" },
                                { value: "nextjs", label: "Next.js" },
                                { value: "nuxt", label: "Nuxt" },
                                { value: "remix", label: "Remix" },
                              ].find(fw => fw.value === selectedFramework)
                                ?.label
                            : "Select framework..."}
                          <CalendarIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search frameworks..." />
                          <CommandList>
                            <CommandEmpty>No framework found</CommandEmpty>
                            <CommandGroup>
                              {[
                                { value: "react", label: "React" },
                                { value: "vue", label: "Vue" },
                                { value: "angular", label: "Angular" },
                                { value: "svelte", label: "Svelte" },
                                { value: "nextjs", label: "Next.js" },
                                { value: "nuxt", label: "Nuxt" },
                                { value: "remix", label: "Remix" },
                              ].map(framework => (
                                <CommandItem
                                  key={framework.value}
                                  value={framework.value}
                                  onSelect={currentValue => {
                                    setSelectedFramework(
                                      currentValue === selectedFramework
                                        ? ""
                                        : currentValue
                                    );
                                    setOpenCombobox(false);
                                  }}
                                >
                                  <Check
                                    className={`mr-2 h-4 w-4 ${
                                      selectedFramework === framework.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    }`}
                                  />
                                  {framework.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {selectedFramework && (
                      <p className="text-sm text-muted-foreground">
                        Selected:{" "}
                        {
                          [
                            { value: "react", label: "React" },
                            { value: "vue", label: "Vue" },
                            { value: "angular", label: "Angular" },
                            { value: "svelte", label: "Svelte" },
                            { value: "nextjs", label: "Next.js" },
                            { value: "nuxt", label: "Nuxt" },
                            { value: "remix", label: "Remix" },
                          ].find(fw => fw.value === selectedFramework)?.label
                        }
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="month" className="text-sm font-medium">
                          Month
                        </Label>
                        <Select
                          value={selectedMonth}
                          onValueChange={setSelectedMonth}
                        >
                          <SelectTrigger id="month">
                            <SelectValue placeholder="MM" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(
                              month => (
                                <SelectItem
                                  key={month}
                                  value={month.toString().padStart(2, "0")}
                                >
                                  {month.toString().padStart(2, "0")}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="year" className="text-sm font-medium">
                          Year
                        </Label>
                        <Select
                          value={selectedYear}
                          onValueChange={setSelectedYear}
                        >
                          <SelectTrigger id="year">
                            <SelectValue placeholder="YYYY" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from(
                              { length: 10 },
                              (_, i) => new Date().getFullYear() - 5 + i
                            ).map(year => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {selectedMonth && selectedYear && (
                      <p className="text-sm text-muted-foreground">
                        Selected: {selectedYear}/{selectedMonth}/
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Data Display Section */}
            <section className="space-y-4">
              <h3 className="text-2xl font-semibold">Data Display</h3>
              <Card>
                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-2">
                    <Label>Badges</Label>
                    <div className="flex flex-wrap gap-2">
                      <Badge>Default</Badge>
                      <Badge variant="secondary">Secondary</Badge>
                      <Badge variant="destructive">Destructive</Badge>
                      <Badge variant="outline">Outline</Badge>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Avatar</Label>
                    <div className="flex gap-4">
                      <Avatar>
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>CN</AvatarFallback>
                      </Avatar>
                      <Avatar>
                        <AvatarFallback>AB</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Progress</Label>
                    <Progress value={progress} />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => setProgress(Math.max(0, progress - 10))}
                      >
                        -10
                      </Button>
                      <Button
                        size="sm"
                        onClick={() =>
                          setProgress(Math.min(100, progress + 10))
                        }
                      >
                        +10
                      </Button>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Skeleton</Label>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Pagination</Label>
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={e => {
                              e.preventDefault();
                              setCurrentPage(Math.max(1, currentPage - 1));
                            }}
                          />
                        </PaginationItem>
                        {[1, 2, 3, 4, 5].map(page => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              href="#"
                              isActive={currentPage === page}
                              onClick={e => {
                                e.preventDefault();
                                setCurrentPage(page);
                              }}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={e => {
                              e.preventDefault();
                              setCurrentPage(Math.min(5, currentPage + 1));
                            }}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                    <p className="text-sm text-muted-foreground text-center">
                      Current page: {currentPage}
                    </p>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Table</Label>
                    <Table>
                      <TableCaption>
                        A list of your recent invoices.
                      </TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px]">Invoice</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">INV001</TableCell>
                          <TableCell>Paid</TableCell>
                          <TableCell>Credit Card</TableCell>
                          <TableCell className="text-right">$250.00</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">INV002</TableCell>
                          <TableCell>Pending</TableCell>
                          <TableCell>PayPal</TableCell>
                          <TableCell className="text-right">$150.00</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">INV003</TableCell>
                          <TableCell>Unpaid</TableCell>
                          <TableCell>Bank Transfer</TableCell>
                          <TableCell className="text-right">$350.00</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Menubar</Label>
                    <Menubar>
                      <MenubarMenu>
                        <MenubarTrigger>File</MenubarTrigger>
                        <MenubarContent>
                          <MenubarItem>New Tab</MenubarItem>
                          <MenubarItem>New Window</MenubarItem>
                          <MenubarSeparator />
                          <MenubarItem>Share</MenubarItem>
                          <MenubarSeparator />
                          <MenubarItem>Print</MenubarItem>
                        </MenubarContent>
                      </MenubarMenu>
                      <MenubarMenu>
                        <MenubarTrigger>Edit</MenubarTrigger>
                        <MenubarContent>
                          <MenubarItem>Undo</MenubarItem>
                          <MenubarItem>Redo</MenubarItem>
                        </MenubarContent>
                      </MenubarMenu>
                      <MenubarMenu>
                        <MenubarTrigger>View</MenubarTrigger>
                        <MenubarContent>
                          <MenubarItem>Reload</MenubarItem>
                          <MenubarItem>Force Reload</MenubarItem>
                        </MenubarContent>
                      </MenubarMenu>
                    </Menubar>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Breadcrumb</Label>
                    <Breadcrumb>
                      <BreadcrumbList>
                        <BreadcrumbItem>
                          <BreadcrumbLink href="/">Home</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          <BreadcrumbLink href="/components">
                            Components
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
                        </BreadcrumbItem>
                      </BreadcrumbList>
                    </Breadcrumb>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Alerts Section */}
            <section className="space-y-4">
              <h3 className="text-2xl font-semibold">Alerts</h3>
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Heads up!</AlertTitle>
                  <AlertDescription>
                    You can add components to your app using the cli.
                  </AlertDescription>
                </Alert>
                <Alert variant="destructive">
                  <X className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    Your session has expired. Please log in again.
                  </AlertDescription>
                </Alert>
              </div>
            </section>

            {/* Tabs Section */}
            <section className="space-y-4">
              <h3 className="text-2xl font-semibold">Tabs</h3>
              <Tabs defaultValue="account" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="account">Account</TabsTrigger>
                  <TabsTrigger value="password">Password</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                <TabsContent value="account">
                  <Card>
                    <CardHeader>
                      <CardTitle>Account</CardTitle>
                      <CardDescription>
                        Make changes to your account here.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="space-y-1">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" defaultValue="Pedro Duarte" />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button>Save changes</Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                <TabsContent value="password">
                  <Card>
                    <CardHeader>
                      <CardTitle>Password</CardTitle>
                      <CardDescription>
                        Change your password here.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="space-y-1">
                        <Label htmlFor="current">Current password</Label>
                        <Input id="current" type="password" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="new">New password</Label>
                        <Input id="new" type="password" />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button>Save password</Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                <TabsContent value="settings">
                  <Card>
                    <CardHeader>
                      <CardTitle>Settings</CardTitle>
                      <CardDescription>
                        Manage your settings here.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Settings content goes here.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </section>

            {/* Accordion Section */}
            <section className="space-y-4">
              <h3 className="text-2xl font-semibold">Accordion</h3>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Is it accessible?</AccordionTrigger>
                  <AccordionContent>
                    Yes. It adheres to the WAI-ARIA design pattern.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Is it styled?</AccordionTrigger>
                  <AccordionContent>
                    Yes. It comes with default styles that matches the other
                    components' aesthetic.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>Is it animated?</AccordionTrigger>
                  <AccordionContent>
                    Yes. It's animated by default, but you can disable it if you
                    prefer.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>

            {/* Collapsible Section */}
            <section className="space-y-4">
              <h3 className="text-2xl font-semibold">Collapsible</h3>
              <Collapsible>
                <Card>
                  <CardHeader>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-between"
                      >
                        <CardTitle>@peduarte starred 3 repositories</CardTitle>
                      </Button>
                    </CollapsibleTrigger>
                  </CardHeader>
                  <CollapsibleContent>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="rounded-md border px-4 py-3 font-mono text-sm">
                          @radix-ui/primitives
                        </div>
                        <div className="rounded-md border px-4 py-3 font-mono text-sm">
                          @radix-ui/colors
                        </div>
                        <div className="rounded-md border px-4 py-3 font-mono text-sm">
                          @stitches/react
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            </section>

            {/* Dialog, Sheet, Drawer Section */}
            <section className="space-y-4">
              <h3 className="text-2xl font-semibold">Overlays</h3>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-wrap gap-4">
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline">Open Dialog</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Test Input</DialogTitle>
                          <DialogDescription>
                            Enter some text below. Press Enter to submit (IME
                            composition supported).
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="dialog-input">Input</Label>
                            <Input
                              id="dialog-input"
                              placeholder="Type something..."
                              value={dialogInput}
                              onChange={e => setDialogInput(e.target.value)}
                              onKeyDown={handleDialogKeyDown}
                              autoFocus
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleDialogSubmit}>Submit</Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline">Open Sheet</Button>
                      </SheetTrigger>
                      <SheetContent>
                        <SheetHeader>
                          <SheetTitle>Edit profile</SheetTitle>
                          <SheetDescription>
                            Make changes to your profile here. Click save when
                            you're done.
                          </SheetDescription>
                        </SheetHeader>
                      </SheetContent>
                    </Sheet>

                    <Drawer>
                      <DrawerTrigger asChild>
                        <Button variant="outline">Open Drawer</Button>
                      </DrawerTrigger>
                      <DrawerContent>
                        <DrawerHeader>
                          <DrawerTitle>Are you absolutely sure?</DrawerTitle>
                          <DrawerDescription>
                            This action cannot be undone.
                          </DrawerDescription>
                        </DrawerHeader>
                        <DrawerFooter>
                          <Button>Submit</Button>
                          <DrawerClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DrawerClose>
                        </DrawerFooter>
                      </DrawerContent>
                    </Drawer>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline">Open Popover</Button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <div className="space-y-2">
                          <h4 className="font-medium leading-none">
                            Dimensions
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Set the dimensions for the layer.
                          </p>
                        </div>
                      </PopoverContent>
                    </Popover>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline">Hover me</Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Add to library</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Menus Section */}
            <section className="space-y-4">
              <h3 className="text-2xl font-semibold">Menus</h3>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-wrap gap-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">Dropdown Menu</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Profile</DropdownMenuItem>
                        <DropdownMenuItem>Billing</DropdownMenuItem>
                        <DropdownMenuItem>Team</DropdownMenuItem>
                        <DropdownMenuItem>Subscription</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <ContextMenu>
                      <ContextMenuTrigger asChild>
                        <Button variant="outline">Right Click Me</Button>
                      </ContextMenuTrigger>
                      <ContextMenuContent>
                        <ContextMenuItem>Profile</ContextMenuItem>
                        <ContextMenuItem>Billing</ContextMenuItem>
                        <ContextMenuItem>Team</ContextMenuItem>
                        <ContextMenuItem>Subscription</ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>

                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <Button variant="outline">Hover Card</Button>
                      </HoverCardTrigger>
                      <HoverCardContent>
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold">@nextjs</h4>
                          <p className="text-sm">
                            The React Framework – created and maintained by
                            @vercel.
                          </p>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Calendar Section */}
            <section className="space-y-4">
              <h3 className="text-2xl font-semibold">Calendar</h3>
              <Card>
                <CardContent className="pt-6 flex justify-center">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>
            </section>

            {/* Carousel Section */}
            <section className="space-y-4">
              <h3 className="text-2xl font-semibold">Carousel</h3>
              <Card>
                <CardContent className="pt-6">
                  <Carousel className="w-full max-w-xs mx-auto">
                    <CarouselContent>
                      {Array.from({ length: 5 }).map((_, index) => (
                        <CarouselItem key={index}>
                          <div className="p-1">
                            <Card>
                              <CardContent className="flex aspect-square items-center justify-center p-6">
                                <span className="text-4xl font-semibold">
                                  {index + 1}
                                </span>
                              </CardContent>
                            </Card>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                  </Carousel>
                </CardContent>
              </Card>
            </section>

            {/* Toggle Section */}
            <section className="space-y-4">
              <h3 className="text-2xl font-semibold">Toggle</h3>
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label>Toggle</Label>
                    <div className="flex gap-2">
                      <Toggle aria-label="Toggle italic">
                        <span className="font-bold">B</span>
                      </Toggle>
                      <Toggle aria-label="Toggle italic">
                        <span className="italic">I</span>
                      </Toggle>
                      <Toggle aria-label="Toggle underline">
                        <span className="underline">U</span>
                      </Toggle>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Toggle Group</Label>
                    <ToggleGroup type="multiple">
                      <ToggleGroupItem value="bold" aria-label="Toggle bold">
                        <span className="font-bold">B</span>
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="italic"
                        aria-label="Toggle italic"
                      >
                        <span className="italic">I</span>
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="underline"
                        aria-label="Toggle underline"
                      >
                        <span className="underline">U</span>
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Aspect Ratio & Scroll Area Section */}
            <section className="space-y-4">
              <h3 className="text-2xl font-semibold">Layout Components</h3>
              <Card>
                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-2">
                    <Label>Aspect Ratio (16/9)</Label>
                    <AspectRatio ratio={16 / 9} className="bg-muted">
                      <div className="flex h-full items-center justify-center">
                        <p className="text-muted-foreground">
                          16:9 Aspect Ratio
                        </p>
                      </div>
                    </AspectRatio>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Scroll Area</Label>
                    <ScrollArea className="h-[200px] w-full rounded-md border overflow-hidden">
                      <div className="p-4">
                        <div className="space-y-4">
                          {Array.from({ length: 20 }).map((_, i) => (
                            <div key={i} className="text-sm">
                              Item {i + 1}: This is a scrollable content area
                            </div>
                          ))}
                        </div>
                      </div>
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Resizable Section */}
            <section className="space-y-4">
              <h3 className="text-2xl font-semibold">Resizable Panels</h3>
              <Card>
                <CardContent className="pt-6">
                  <ResizablePanelGroup
                    direction="horizontal"
                    className="min-h-[200px] rounded-lg border"
                  >
                    <ResizablePanel defaultSize={50}>
                      <div className="flex h-full items-center justify-center p-6">
                        <span className="font-semibold">Panel One</span>
                      </div>
                    </ResizablePanel>
                    <ResizableHandle />
                    <ResizablePanel defaultSize={50}>
                      <div className="flex h-full items-center justify-center p-6">
                        <span className="font-semibold">Panel Two</span>
                      </div>
                    </ResizablePanel>
                  </ResizablePanelGroup>
                </CardContent>
              </Card>
            </section>

            {/* Toast Section */}
            <section className="space-y-4">
              <h3 className="text-2xl font-semibold">Toast</h3>
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label>Sonner Toast</Label>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          sonnerToast.success("Operation successful", {
                            description: "Your changes have been saved",
                          });
                        }}
                      >
                        Success
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          sonnerToast.error("Operation failed", {
                            description:
                              "Cannot complete operation, please try again",
                          });
                        }}
                      >
                        Error
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          sonnerToast.info("Information", {
                            description: "This is an information message",
                          });
                        }}
                      >
                        Info
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          sonnerToast.warning("Warning", {
                            description:
                              "Please note the impact of this operation",
                          });
                        }}
                      >
                        Warning
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          sonnerToast.loading("Loading", {
                            description: "Please wait",
                          });
                        }}
                      >
                        Loading
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          const promise = new Promise(resolve =>
                            setTimeout(resolve, 2000)
                          );
                          sonnerToast.promise(promise, {
                            loading: "Processing...",
                            success: "Processing complete!",
                            error: "Processing failed",
                          });
                        }}
                      >
                        Promise
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* App Architecture Demos */}
            <section className="space-y-4">
              <h2 className="text-3xl font-bold">🏗️ App Architecture</h2>
              <p className="text-muted-foreground">
                Jeres workspace layout, header og core UI features
              </p>
            </section>

            {/* 3-Panel Layout Demo */}
            <section className="space-y-4">
              <h3 className="text-2xl font-semibold">
                📱 3-Panel Workspace Layout
              </h3>
              <Card>
                <CardHeader>
                  <CardTitle>Resizable 3-Panel System</CardTitle>
                  <CardDescription>
                    Left (20%): Friday AI Assistant | Center (60%): Email Center
                    | Right (20%): Smart Workspace
                    <br />
                    Keyboard shortcuts: Ctrl+1/2/3 for panel focus
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ThreePanelDemo />
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium mb-2">Features:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Resizable panels med min/max constraints</li>
                      <li>• Lazy loading med Suspense for performance</li>
                      <li>• Error boundaries per panel</li>
                      <li>• Mobile responsive med drawer navigation</li>
                      <li>• Keyboard shortcuts (Ctrl+1/2/3)</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Header Demo */}
            <section className="space-y-4">
              <h3 className="text-2xl font-semibold">🎯 Header & User Menu</h3>
              <Card>
                <CardHeader>
                  <CardTitle>Application Header</CardTitle>
                  <CardDescription>
                    Logo, workspace badge, notifications og user dropdown menu
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <HeaderDemo />
                </CardContent>
              </Card>
            </section>

            {/* AI Email Assistant Demo */}
            <section className="space-y-4">
              <h3 className="text-2xl font-semibold">
                🤖 AI Email Assistant (3-Panel Feature)
              </h3>
              <Card>
                <CardHeader>
                  <CardTitle>Intelligent Email Response Generation</CardTitle>
                  <CardDescription>
                    Analyserer email indhold og genererer AI-drevne svar
                    forslag. Integreret i email panel med source detection,
                    price estimation og urgency analysis.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AIEmailAssistantDemo />
                </CardContent>
              </Card>
            </section>

            {/* Friday AI: Inline Tool Execution - Som i Figma */}
            <section className="space-y-4">
              <h2 className="text-3xl font-bold mt-12">
                💬 Chat Components (Figma Style)
              </h2>
            </section>

            <section className="space-y-4">
              <h3 className="text-2xl font-semibold">
                🛠️ Friday AI: Tool Execution (Figma Style)
              </h3>
              <Card>
                <CardHeader>
                  <CardTitle>Inline Tool Execution Tracking</CardTitle>
                  <CardDescription>
                    Inline tool execution boxes som i Figma designet. Ingen
                    modal - vises direkte i chat flow.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={simulateToolExecution}>
                    🚀 Start Tool Execution Demo
                  </Button>

                  {/* AI Thinking Indicator */}
                  {isThinking && <AIThinking message="AI Thinking..." />}

                  {/* Tool Execution Box */}
                  {showToolBox && (
                    <ToolExecutionBox
                      emoji="🔍"
                      message="Fetching weather data..."
                      progress={toolProgress}
                      status={toolProgress === 100 ? "completed" : "running"}
                    />
                  )}

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Figma Design Match</AlertTitle>
                    <AlertDescription>
                      Inline box med emoji, progress bar og percentage. Smooth
                      animations og fade-in effects.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </section>

            {/* Friday AI: Weather Card - Brilliant Blue */}
            <section className="space-y-4">
              <h3 className="text-2xl font-semibold">
                🌤️ Friday AI: Weather Card
              </h3>
              <Card>
                <CardHeader>
                  <CardTitle>Brilliant Blue Weather Card</CardTitle>
                  <CardDescription>
                    Solid blue background (#007AFF) med white text som i Figma.
                    3-column grid med vejr detaljer.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <WeatherCard {...weatherData} />
                </CardContent>
              </Card>
            </section>

            {/* Friday AI: Invoice Cards - Minimal White */}
            <section className="space-y-4">
              <h3 className="text-2xl font-semibold">
                💰 Friday AI: Invoice Cards
              </h3>
              <Card>
                <CardHeader>
                  <CardTitle>Minimal White Invoice Cards</CardTitle>
                  <CardDescription>
                    Kompakte white cards med emoji icons og status badges.
                    3-column grid layout.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <InvoiceCards invoices={invoiceData} />
                </CardContent>
              </Card>
            </section>

            {/* Friday AI: Gmail Email Thread */}
            <section className="space-y-4">
              <h3 className="text-2xl font-semibold">
                📧 Friday AI: Gmail Integration
              </h3>
              <Card>
                <CardHeader>
                  <CardTitle>Email Thread Card med AI Summary</CardTitle>
                  <CardDescription>
                    Viser email threads fra Gmail med AI-genereret summary.
                    Priority indication og labels for hurtig triage.
                  </CardDescription>
                </CardHeader>
                <CardContent className="max-w-2xl">
                  <EmailThreadCard
                    data={emailThreadData}
                    onClick={() => sonnerToast.info("Opening email thread...")}
                  />
                </CardContent>
              </Card>
            </section>

            {/* Friday AI: Google Calendar Event */}
            <section className="space-y-4">
              <h3 className="text-2xl font-semibold">
                📅 Friday AI: Calendar Integration
              </h3>
              <Card>
                <CardHeader>
                  <CardTitle>Calendar Event Card</CardTitle>
                  <CardDescription>
                    Viser Google Calendar events med tid, location og attendees.
                    Grøn border og badge når møde er booket.
                  </CardDescription>
                </CardHeader>
                <CardContent className="max-w-md">
                  <CalendarEventCard data={calendarEventData} />
                </CardContent>
              </Card>
            </section>

            {/* Friday AI: Search Results */}
            <section className="space-y-4">
              <h3 className="text-2xl font-semibold">
                🔍 Friday AI: Search Integration
              </h3>
              <Card>
                <CardHeader>
                  <CardTitle>Search Results Card</CardTitle>
                  <CardDescription>
                    Viser web/knowledge search results med snippets. Klikbare
                    links med source attribution.
                  </CardDescription>
                </CardHeader>
                <CardContent className="max-w-2xl">
                  <SearchResultsCard
                    query="AI trends 2024"
                    results={searchResultsData}
                  />
                </CardContent>
              </Card>
            </section>

            {/* Friday AI: Memory Panel */}
            <section className="space-y-4">
              <h3 className="text-2xl font-semibold">
                📜 Friday AI: Memory Panel
              </h3>
              <Card>
                <CardHeader>
                  <CardTitle>AI Memory Timeline</CardTitle>
                  <CardDescription>
                    Timeline af Friday AI's seneste actions. Giver brugeren
                    quick access til historik uden scroll.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AIMemoryPanel
                    items={memoryItems}
                    onItemClick={item => {
                      sonnerToast.info("Memory item clicked", {
                        description: `${item.title} ${item.subtitle}`,
                      });
                    }}
                    className="max-w-md"
                  />
                </CardContent>
              </Card>
            </section>

            {/* Friday AI: Interactive Chat Flow Demos */}
            <section className="space-y-4">
              <h3 className="text-2xl font-semibold">
                💬 Friday AI: Full Chat Flow Demos
              </h3>
              <p className="text-sm text-muted-foreground">
                Se hele conversation flows fra start til slut. Demonstrerer
                integration mellem AI Thinking, Tool Execution og Response
                Cards.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weather Flow */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">🌤️ Vejr Flow</CardTitle>
                    <CardDescription className="text-xs">
                      User spørger → AI tænker → Henter vejrdata → Viser weather
                      card
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChatFlowDemo scenario="weather" />
                  </CardContent>
                </Card>

                {/* Email Flow */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">📧 Email Flow</CardTitle>
                    <CardDescription className="text-xs">
                      Gmail integration → Analyzer inbox → Viser prioriteret
                      email
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChatFlowDemo scenario="email" />
                  </CardContent>
                </Card>

                {/* Calendar Flow */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      📅 Calendar Flow
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Book møde → Tjek availability → Confirmer booking
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChatFlowDemo scenario="calendar" />
                  </CardContent>
                </Card>

                {/* Invoice Flow */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      💰 Faktura Flow (Billy)
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Hent ubetalte → Billy API → Vis faktura cards
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChatFlowDemo scenario="invoices" />
                  </CardContent>
                </Card>

                {/* Search Flow */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">🔍 Search Flow</CardTitle>
                    <CardDescription className="text-xs">
                      Web search → Fetch results → Display med snippets
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChatFlowDemo scenario="search" />
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* NEW: Showcase Features */}
            <section id="code-examples" className="space-y-4 scroll-mt-8">
              <h3 className="text-2xl font-semibold">
                💻 Code Examples with Copy
              </h3>
              <Card>
                <CardHeader>
                  <CardTitle>CodeBlock Component</CardTitle>
                  <CardDescription>
                    Hover over code for copy button. Click to copy til clipboard
                    med feedback.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Tabs defaultValue="button">
                    <TabsList className="flex flex-wrap gap-2">
                      <TabsTrigger value="button">Button</TabsTrigger>
                      <TabsTrigger value="tool">ToolExecutionBox</TabsTrigger>
                      <TabsTrigger value="weather">WeatherCard</TabsTrigger>
                      <TabsTrigger value="email">EmailThreadCard</TabsTrigger>
                      <TabsTrigger value="calendar">
                        CalendarFullDemo
                      </TabsTrigger>
                      <TabsTrigger value="lead">LeadProfileCard</TabsTrigger>
                      <TabsTrigger value="chat">ChatPanelUI</TabsTrigger>
                      <TabsTrigger value="pipeline">Email Pipeline</TabsTrigger>
                      <TabsTrigger value="inbox">Inbox Panel</TabsTrigger>
                      <TabsTrigger value="playground">Playground</TabsTrigger>
                    </TabsList>

                    <TabsContent value="button">
                      <CodeBlock
                        language="tsx"
                        code={`import { Button } from "@/components/ui/button";

export function Example() {
  return (
    <Button variant="default">Click me</Button>
  );
}`}
                      />
                      <div className="mt-3">
                        <p className="text-xs font-medium mb-2">
                          Props & Usage
                        </p>
                        <PropsTable
                          items={[
                            { name: "emoji", type: "string", required: true },
                            { name: "message", type: "string", required: true },
                            {
                              name: "progress",
                              type: "number (0-100)",
                              required: true,
                            },
                            {
                              name: "status",
                              type: "'running' | 'completed' | 'failed'",
                              defaultValue: "running",
                            },
                            { name: "className", type: "string" },
                          ]}
                          dense
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="tool">
                      <CodeBlock
                        language="tsx"
                        code={`import { useEffect, useState } from "react";
import { ToolExecutionBox } from "@/components/chat/ToolExecutionBox";

export function ToolDemo() {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'running' | 'completed'>('running');
  useEffect(() => {
    const id = setInterval(() => {
      setProgress(p => {
        const next = p + 15;
        if (next >= 100) { clearInterval(id); setStatus('completed'); return 100; }
        return next;
      });
    }, 300);
    return () => clearInterval(id);
  }, []);
  return (
    <ToolExecutionBox
      emoji="🛠️"
      message="Henter data fra Billy API..."
      progress={progress}
      status={status}
    />
  );
}`}
                      />
                    </TabsContent>

                    <TabsContent value="weather">
                      <CodeBlock
                        language="tsx"
                        code={`import { WeatherCard } from "@/components/chat/WeatherCard";

export function WeatherDemo() {
  const data = { city: 'København', temperature: 18, condition: 'Partly Cloudy', emoji: '☁️',
    humidity: 65, wind: 12, forecast: [
      { day: 'Man', temp: 19, emoji: '☀️' },
      { day: 'Tir', temp: 17, emoji: '☁️' },
      { day: 'Ons', temp: 16, emoji: '🌧️' },
    ] };
  return <WeatherCard {...data} />;
}`}
                      />
                      <div className="mt-3">
                        <p className="text-xs font-medium mb-2">
                          Props & Usage
                        </p>
                        <PropsTable
                          items={[
                            { name: "city", type: "string", required: true },
                            {
                              name: "temperature",
                              type: "number",
                              required: true,
                            },
                            {
                              name: "condition",
                              type: "string",
                              required: true,
                            },
                            { name: "emoji", type: "string", required: true },
                            { name: "humidity", type: "number" },
                            { name: "wind", type: "number" },
                            {
                              name: "forecast",
                              type: "{ day: string; temp: number; emoji: string; }[]",
                            },
                          ]}
                          dense
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="email">
                      <CodeBlock
                        language="tsx"
                        code={`import { EmailThreadCard } from "@/components/chat/EmailThreadCard";

export function EmailThreadDemo() {
  const thread = {
    subject: 'Tilbud på website projekt',
    from: 'kunde@firma.dk',
    messageCount: 5,
    summary: 'Kunde efterspørger tilbud... Budget 50.000 kr.',
    labels: ['Lead','Høj prioritet','Website'],
    priority: 'high' as const,
    hasAttachments: true,
  };
  return <EmailThreadCard data={thread} />;
}`}
                      />
                      <div className="mt-3">
                        <p className="text-xs font-medium mb-2">
                          Props & Usage
                        </p>
                        <PropsTable
                          items={[
                            {
                              name: "data",
                              type: "EmailThreadData",
                              required: true,
                            },
                            { name: "onClick", type: "() => void" },
                          ]}
                          dense
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="calendar">
                      <CodeBlock
                        language="tsx"
                        code={`import { CalendarFullDemo } from "@/components/showcase/CalendarFullDemo";

export default function Page() {
  return <CalendarFullDemo />;
}`}
                      />
                    </TabsContent>

                    <TabsContent value="lead">
                      <CodeBlock
                        language="tsx"
                        code={`import { LeadProfileCard } from "@/components/showcase/LeadProfileCard";

export function LeadExample() {
  return <LeadProfileCard />;
}`}
                      />
                      <div className="mt-3">
                        <p className="text-xs font-medium mb-2">
                          Props & Usage
                        </p>
                        <PropsTable
                          items={[
                            {
                              name: "lead",
                              type: "LeadProfile",
                              defaultValue: "demoLead",
                            },
                          ]}
                          dense
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="chat">
                      <CodeBlock
                        language="tsx"
                        code={`import { ChatPanelUIShowcase } from "@/components/showcase/ChatPanelUIShowcase";

export default function ChatUIPreview() {
  return <ChatPanelUIShowcase />;
}`}
                      />
                    </TabsContent>

                    <TabsContent value="pipeline">
                      <CodeBlock
                        language="tsx"
                        code={`import { EmailPipelineBoard } from "@/components/inbox/EmailPipelineBoard";

export default function PipelinePage() {
  return <EmailPipelineBoard onEmailClick={(email) => console.log('open', email.threadId)} />;
}`}
                      />
                      <div className="mt-3">
                        <p className="text-xs font-medium mb-2">
                          Props & Usage
                        </p>
                        <PropsTable
                          items={[
                            {
                              name: "onEmailClick",
                              type: "(email: EmailCardData) => void",
                            },
                          ]}
                          dense
                        />
                        <p className="text-[11px] text-muted-foreground mt-2">
                          Note: Kræver tRPC backend og @dnd-kit for
                          drag-and-drop.
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="inbox">
                      <CodeBlock
                        language="tsx"
                        code={`import InboxPanel from "@/components/InboxPanel";

export default function InboxPage() {
  const [tab, setTab] = useState<'email' | 'invoices' | 'calendar' | 'leads' | 'tasks'>('email');
  return <InboxPanel activeTab={tab} onTabChange={setTab} />;
}`}
                      />
                      <div className="mt-3">
                        <p className="text-xs font-medium mb-2">
                          Props & Usage
                        </p>
                        <PropsTable
                          items={[
                            {
                              name: "activeTab",
                              type: "'email' | 'invoices' | 'calendar' | 'leads' | 'tasks'",
                              required: true,
                            },
                            {
                              name: "onTabChange",
                              type: "(tab) => void",
                              required: true,
                            },
                          ]}
                          dense
                        />
                        <p className="text-[11px] text-muted-foreground mt-2">
                          Note: Denne komponent er markeret som deprecated i V2,
                          brug EmailCenterPanel direkte i produktion. Vises her
                          til reference.
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="playground">
                      <ToolExecutionPlayground />
                    </TabsContent>
                  </Tabs>

                  <p className="text-xs text-muted-foreground">
                    ✨ Hover for copy • Alle eksempler kan copy-pastes direkte
                    ind i jeres pages/components
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* NEW: Business Components - Settings */}
            <section id="settings" className="space-y-4 scroll-mt-8">
              <h3 className="text-2xl font-semibold">⚙️ Settings Panel</h3>
              <Card>
                <CardHeader>
                  <CardTitle>Komplet Settings Interface</CardTitle>
                  <CardDescription>
                    Notifikationer, udseende, AI indstillinger og privatliv.
                    Produktionsklar settings UI.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SettingsPanelDemo />
                </CardContent>
              </Card>
            </section>

            {/* NEW: Business Components - Notifications */}
            <section id="notifications" className="space-y-4 scroll-mt-8">
              <h3 className="text-2xl font-semibold">
                🔔 Notifications Center
              </h3>
              <Card>
                <CardHeader>
                  <CardTitle>Real-time Notification Panel</CardTitle>
                  <CardDescription>
                    Email, calendar, invoice, lead og system notifikationer med
                    prioritet badges.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <NotificationsDemo />
                </CardContent>
              </Card>
            </section>

            {/* NEW: Business Components - Leads */}
            <section id="leads" className="space-y-4 scroll-mt-8">
              <h3 className="text-2xl font-semibold">
                📊 Lead Management Cards
              </h3>
              <Card>
                <CardHeader>
                  <CardTitle>Lead Cards med Fuld Context</CardTitle>
                  <CardDescription>
                    Detaljerede lead cards med kontakt info, estimeret værdi,
                    source tracking og quick actions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LeadCardDemo />
                </CardContent>
              </Card>
            </section>

            {/* NEW: Email Center Design Variations */}
            <section
              id="email-designs-comparison"
              className="space-y-6 scroll-mt-8"
            >
              <div>
                <h3 className="text-3xl font-bold mb-2">
                  🎨 10 Email Center Design Variations
                </h3>
                <p className="text-muted-foreground">
                  Sammenlign forskellige layout approaches og vælg den bedste
                  for dit workflow. 6 inspireret af moderne email clients + 4
                  specifikt optimeret til Friday AI workflow med AI features,
                  pipeline stages, lead management og unified workspace.
                </p>
              </div>

              {/* Design 1: Gmail/Superhuman */}
              <Card id="email-gmail" className="scroll-mt-8">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      Design 1
                    </Badge>
                    <CardTitle className="text-xl">
                      📮 Gmail/Superhuman Style
                    </CardTitle>
                  </div>
                  <CardDescription>
                    Ultra-compact density • Keyboard shortcuts • 40/60 split
                    view • Hover actions • 10+ emails synlige
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EmailCenterGmailStyle />
                </CardContent>
              </Card>

              {/* Design 2: Linear */}
              <Card id="email-linear" className="scroll-mt-8">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      Design 2
                    </Badge>
                    <CardTitle className="text-xl">
                      ✨ Linear-Inspired Minimal
                    </CardTitle>
                  </div>
                  <CardDescription>
                    Ultra-clean spacious layout • Hover actions appear on demand
                    • Priority indicators • Single column focus • Smooth
                    animations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EmailCenterLinearStyle />
                </CardContent>
              </Card>

              {/* Design 3: Kanban */}
              <Card id="email-kanban" className="scroll-mt-8">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      Design 3
                    </Badge>
                    <CardTitle className="text-xl">
                      📋 Notion-Style Kanban Board
                    </CardTitle>
                  </div>
                  <CardDescription>
                    Workflow stages (Inbox → Review → Replied → Done) •
                    Card-based design • Drag & drop • Property tags • Avatar +
                    timestamp
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EmailCenterKanbanStyle />
                </CardContent>
              </Card>

              {/* Design 4: Arc */}
              <Card id="email-arc" className="scroll-mt-8">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      Design 4
                    </Badge>
                    <CardTitle className="text-xl">
                      🌐 Arc Browser-Inspired Sidebar
                    </CardTitle>
                  </div>
                  <CardDescription>
                    Vertikal sidebar navigation • Spacious modern layout •
                    Color-coded sections • Smart categories • Quick access
                    favorites
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EmailCenterArcStyle />
                </CardContent>
              </Card>

              {/* Design 5: Apple Mail */}
              <Card id="email-apple" className="scroll-mt-8">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      Design 5
                    </Badge>
                    <CardTitle className="text-xl">
                      🍎 Apple Mail Classic 3-Column
                    </CardTitle>
                  </div>
                  <CardDescription>
                    Classic 3-column layout (Folders | List | Preview) •
                    macOS-inspired design • Clean minimal styling • Familiar UX
                    pattern
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EmailCenterAppleStyle />
                </CardContent>
              </Card>

              {/* Design 6: Slack */}
              <Card id="email-slack" className="scroll-mt-8">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      Design 6
                    </Badge>
                    <CardTitle className="text-xl">
                      💬 Slack-Inspired Thread View
                    </CardTitle>
                  </div>
                  <CardDescription>
                    Conversation-focused • Nested replies • Reactions & mentions
                    • Thread count indicators • Real-time messaging feel
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EmailCenterSlackStyle />
                </CardContent>
              </Card>

              {/* PREMIUM POLISHED DESIGNS */}
              <div className="my-16">
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                    💎 Premium Polished Designs
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                    Professionelt designede email centers inspireret af
                    Shortwave og Jace.ai med glassmorphism, rich gradients, soft
                    shadows og moderne UI trends
                  </p>
                </div>
              </div>

              {/* 🌟 ULTIMATE: Unified Email Center - Chat + Email */}
              <Card
                id="email-unified-showcase"
                className="scroll-mt-8 overflow-hidden border-4 border-purple-600 shadow-2xl mb-8"
              >
                <CardHeader className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className="text-xl px-5 py-2 bg-white text-purple-700 shadow-lg font-bold">
                      🌟 ULTIMATE
                    </Badge>
                    <Badge className="text-sm px-3 py-1 bg-white/20 text-white backdrop-blur-sm">
                      Unified Experience
                    </Badge>
                  </div>
                  <CardTitle className="text-3xl text-white mb-2">
                    🎯 Unified Email Center
                  </CardTitle>
                  <CardDescription className="text-purple-100 text-base">
                    <strong className="text-white">
                      Chat Panel (23%) + Email Center (77%) + Full Dialogs &
                      Modals
                    </strong>
                    <br />
                    AI Assistant conversation • Real-time email management •
                    Quick actions • Send Quote dialog • Book Meeting dialog •
                    Reply modal • Complete animations • Rendetalje personalized
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <EmailCenterShowcase />
                </CardContent>
                <div className="p-6 bg-gradient-to-r from-purple-50 via-blue-50 to-cyan-50 border-t-2 border-purple-200">
                  <h4 className="font-bold text-lg text-purple-900 mb-3">
                    ✨ Complete Features:
                  </h4>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>AI Chat Panel:</strong> Conversation interface,
                        message history, AI suggestions
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Pipeline Tabs:</strong> Needs Action, Venter,
                        Kalender, Finance, Done
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Email List & Preview:</strong> 40/60 split,
                        search, filters, full context
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Reply Dialog:</strong> Full email composer with
                        subject & body
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Quote Dialog:</strong> Service type, price,
                        description generator
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Booking Dialog:</strong> Date, time, location,
                        notes
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>AI Quick Actions:</strong> Send Tilbud, Book
                        Møde, Ring Kunde
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Customer Context:</strong> Service type, value,
                        address cards
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Animations:</strong> Slide-in, fade-in, smooth
                        transitions
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* 🚀 FLAGSHIP: Email Center Pro V2 - Rendetalje Edition */}
              <Card
                id="email-pro-v2"
                className="scroll-mt-8 overflow-hidden border-4 border-blue-600 shadow-2xl"
              >
                <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className="text-xl px-5 py-2 bg-white text-blue-700 shadow-lg font-bold">
                      🚀 FLAGSHIP DESIGN
                    </Badge>
                    <Badge className="text-sm px-3 py-1 bg-white/20 text-white backdrop-blur-sm">
                      Rendetalje Edition
                    </Badge>
                  </div>
                  <CardTitle className="text-3xl text-white mb-2">
                    ⭐ Email Center Pro V2
                  </CardTitle>
                  <CardDescription className="text-blue-100 text-base">
                    <strong className="text-white">
                      Ultimate email management for rengøringsvirksomhed
                    </strong>
                    <br />
                    Split inbox pipeline stages • AI quick actions • Command
                    palette (⌘K) • Smart customer preview med Billy & Calendar
                    integration • Lead source tracking • Bulk actions •
                    Real-time stats dashboard • Full Rendetalje personalization
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <EmailCenterProV2 />
                </CardContent>
                <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-t-2 border-blue-200">
                  <h4 className="font-bold text-lg text-blue-900 mb-3">
                    ✨ Nøgle Features:
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Pipeline Stages Tabs:</strong> Needs Action,
                        Venter, I Kalender, Finance, Done
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>AI Quick Actions:</strong> Send Tilbud
                        Kontorrengøring, Book Besigtigelse, Ring Kunde
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Lead Sources:</strong> Rengøring.nu, AdHelp,
                        Website, Direct med badges
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Customer Context:</strong> Service type,
                        property size, estimated value, address
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Real-time Stats:</strong> Today's revenue,
                        bookings, leads, response time
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Bulk Operations:</strong> Multi-select, archive,
                        move to stage
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Premium Design 1: Shortwave Premium */}
              <Card
                id="email-shortwave-premium"
                className="scroll-mt-8 overflow-hidden border-2 mt-8"
              >
                <CardHeader className="bg-gradient-to-r from-purple-50 via-blue-50 to-cyan-50">
                  <div className="flex items-center gap-3">
                    <Badge className="text-lg px-4 py-1.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg">
                      Premium 1
                    </Badge>
                    <CardTitle className="text-2xl">
                      🌊 Shortwave-Inspired Premium
                    </CardTitle>
                  </div>
                  <CardDescription className="text-base mt-2">
                    <strong>Features:</strong> Glassmorphism panels • Rich mesh
                    gradients • Smart bundles med animations • Multi-layer
                    shadows • AI summaries prominent • Split inbox • Backdrop
                    blur effects • Professional spacing
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <EmailCenterShortwavePremium />
                </CardContent>
              </Card>

              {/* Premium Design 2: Jace Modern */}
              <Card
                id="email-jace-modern"
                className="scroll-mt-8 overflow-hidden border-2 mt-8"
              >
                <CardHeader className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
                  <div className="flex items-center gap-3">
                    <Badge className="text-lg px-4 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg">
                      Premium 2
                    </Badge>
                    <CardTitle className="text-2xl">
                      🤖 Jace.ai Modern Design
                    </CardTitle>
                  </div>
                  <CardDescription className="text-base mt-2">
                    <strong>Features:</strong> AI chat interface •
                    Conversational email management • Beautiful gradient cards •
                    Priority glow effects • AI recommendations prominent • Rich
                    card design • Suggested actions • Real-time stats dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <EmailCenterJaceModern />
                </CardContent>
              </Card>

              {/* Premium Design 3: Friday AI Pro */}
              <Card
                id="email-friday-pro"
                className="scroll-mt-8 overflow-hidden border-2 mt-8"
              >
                <CardHeader className="bg-gradient-to-r from-slate-50 via-blue-50 to-purple-50">
                  <div className="flex items-center gap-3">
                    <Badge className="text-lg px-4 py-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg">
                      Premium 3
                    </Badge>
                    <CardTitle className="text-2xl">
                      ⭐ Friday AI Pro - Unified Workspace
                    </CardTitle>
                  </div>
                  <CardDescription className="text-base mt-2">
                    <strong>Features:</strong> Email + Calendar + Invoices
                    unified • Animated mesh gradient background • Activity feed
                    med rich cards • Context switcher pills • Dashboard widgets
                    • Multi-layer depth • Blob animations • Revenue tracking
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <EmailCenterFridayPro />
                </CardContent>
              </Card>

              {/* FRIDAY AI OPTIMIZED DESIGNS */}
              <div className="my-12 mt-16">
                <h3 className="text-3xl font-bold mb-2">
                  🤖 Friday AI Optimized Designs
                </h3>
                <p className="text-muted-foreground">
                  Baseret på jeres docs og workflow - specifikt optimeret til AI
                  features, pipeline stages, lead management og integration med
                  Billy/Calendar.
                </p>
              </div>

              {/* Design 7: AI-First */}
              <Card id="email-ai-first" className="scroll-mt-8">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      Design 7
                    </Badge>
                    <CardTitle className="text-xl">
                      🧠 AI-First Smart Inbox
                    </CardTitle>
                  </div>
                  <CardDescription>
                    AI summaries prominent • Auto-labeling suggestions •
                    Suggested actions per email • Confidence scores • Priority
                    scoring • Learning from user actions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EmailCenterAIFirst />
                </CardContent>
              </Card>

              {/* Design 8: Pipeline Optimized */}
              <Card id="email-pipeline" className="scroll-mt-8">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      Design 8
                    </Badge>
                    <CardTitle className="text-xl">
                      ⚡ Pipeline Optimized with Quick Actions
                    </CardTitle>
                  </div>
                  <CardDescription>
                    5 pipeline stages (Needs Action → Venter på svar → I
                    kalender → Finance → Afsluttet) • One-click quick actions •
                    Visual workflow • Keyboard shortcuts (1-5) • Progress
                    tracking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EmailCenterPipelineOptimized />
                </CardContent>
              </Card>

              {/* Design 9: Lead Management CRM */}
              <Card id="email-crm" className="scroll-mt-8">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      Design 9
                    </Badge>
                    <CardTitle className="text-xl">
                      👥 Lead Management CRM View
                    </CardTitle>
                  </div>
                  <CardDescription>
                    Email center as mini-CRM • Customer cards med all contact
                    info • Lead scoring • Value estimation • Communication
                    history • Quick contact actions (Email/Ring/Book/Tilbud)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EmailCenterLeadCRM />
                </CardContent>
              </Card>

              {/* Design 10: Unified Workspace */}
              <Card id="email-unified" className="scroll-mt-8">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      Design 10
                    </Badge>
                    <CardTitle className="text-xl">
                      🔗 Unified Workspace (Email + Calendar + Invoices)
                    </CardTitle>
                  </div>
                  <CardDescription>
                    All-in-one view • Email + Calendar + Invoices integration •
                    Timeline view • Context switching • Quick stats dashboard •
                    Today/This Week overview
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EmailCenterUnified />
                </CardContent>
              </Card>
            </section>

            <section id="smart-splits" className="space-y-4 scroll-mt-8">
              <h3 className="text-2xl font-semibold">
                🎯 Smart Splits - AI Email Kategorisering
              </h3>
              <Card>
                <CardHeader>
                  <CardTitle>Intelligent Email Sortering</CardTitle>
                  <CardDescription>
                    AI-powered kategorisering af emails i Hot Leads, Finance,
                    Venter på Svar osv. Med real-time counts og visual
                    indicators.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <SmartSplitsDemo />
                </CardContent>
              </Card>
            </section>

            <section id="email-list" className="space-y-4 scroll-mt-8">
              <h3 className="text-2xl font-semibold">
                📬 Email List Items med Metrics
              </h3>
              <Card>
                <CardHeader>
                  <CardTitle>Avanceret Email List View</CardTitle>
                  <CardDescription>
                    Email list items med badges, metrics (Hot Leads count,
                    Estimated Value, Avg Value), attachments og source tracking.
                    Hover effects og selection state.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EmailListDemo />
                </CardContent>
              </Card>
            </section>

            <section id="business-metrics" className="space-y-4 scroll-mt-8">
              <h3 className="text-2xl font-semibold">
                📊 Business Metrics Dashboard
              </h3>
              <Card>
                <CardHeader>
                  <CardTitle>Real-time Business Overview</CardTitle>
                  <CardDescription>
                    Kompakt metrics dashboard med bookings, conversion, revenue,
                    new leads. Inkluderer action alerts og trend indicators.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <BusinessMetricsCard />
                </CardContent>
              </Card>
            </section>

            {/* NEW: Chat & Tasks UI */}
            <section id="chat-suggestions" className="space-y-4 scroll-mt-8">
              <h3 className="text-2xl font-semibold">
                ✨ Chat Suggestions Panel
              </h3>
              <Card>
                <CardHeader>
                  <CardTitle>Friday AI Suggestions</CardTitle>
                  <CardDescription>
                    Sidebar med quick suggestions som "Hvad kan jeg hjælpe
                    med?", "Tjek min kalender", "Vis ubetalte fakturaer". Med
                    icons og hover states.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <ChatSuggestionsPanel />
                </CardContent>
              </Card>
            </section>

            <section id="task-list" className="space-y-4 scroll-mt-8">
              <h3 className="text-2xl font-semibold">✅ Compact Task List</h3>
              <Card>
                <CardHeader>
                  <CardTitle>Task Management UI</CardTitle>
                  <CardDescription>
                    Kompakt task list med checkboxes, priority indicators, due
                    dates og categories. Perfekt til "Denne Uge" view med active
                    task count.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <TaskListCompact />
                </CardContent>
              </Card>
            </section>

            {/* NEW: Calendar & CRM */}
            <section id="calendar-full" className="space-y-4 scroll-mt-8">
              <h3 className="text-2xl font-semibold">
                📆 Full Calendar (Month Grid)
              </h3>
              <Card>
                <CardHeader>
                  <CardTitle>AI-Connected Calendar</CardTitle>
                  <CardDescription>
                    Månedsgitter med events (møder, opgaver, leads, fakturaer),
                    tooltips og daglige opgaver. Navigation mellem måneder og
                    badges for event-typer. Smooth enter animations.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CalendarFullDemo />
                </CardContent>
              </Card>
            </section>

            <section id="lead-profile" className="space-y-4 scroll-mt-8">
              <h3 className="text-2xl font-semibold">
                🧑‍💼 Lead Profile / Customer Card
              </h3>
              <Card>
                <CardHeader>
                  <CardTitle>Customer 360° View</CardTitle>
                  <CardDescription>
                    Kontaktinfo, status/priority badges, est. value, win rate,
                    tags, actions (email, ring, møde), og kompakt
                    aktivitetstimeline.
                  </CardDescription>
                </CardHeader>
                <CardContent className="max-w-3xl">
                  <LeadProfileCard />
                  <div className="mt-6">
                    <CustomerCardV5 data={customerCardV5Demo} />
                  </div>
                </CardContent>
              </Card>
            </section>

            <section
              id="chromadb-customer-card"
              className="space-y-4 scroll-mt-8"
            >
              <h3 className="text-2xl font-semibold">
                🤖 Customer Card V5.1 - ChromaDB AI Integration
              </h3>
              <Card>
                <CardHeader>
                  <CardTitle>
                    AI-Powered Lead Intelligence med Semantic Search
                  </CardTitle>
                  <CardDescription>
                    Complete customer 360° view med ChromaDB integration.
                    Inkluderer Gmail, Calendar, Billy data, AI win probability
                    prediction, similar customer matching, og smart
                    recommendations.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CustomerCard
                    lead={{
                      id: "LEAD-001",
                      customerName: "Dorte Bendixen",
                      customerEmail: "dorte@example.com",
                      customerPhone: "+45 12345678",
                      pipeline: {
                        status: "won",
                        stage: "Won",
                      },
                      gmail: {
                        leadSource: "Leadpoint.dk (Rengøring Aarhus)",
                        date: "2025-07-15",
                        subject: "Forespørgsel om flytterengøring",
                        snippet:
                          "Hej, jeg skal bruge hjælp til flytterengøring af min villa på 150m²...",
                        body: `Hej,

Jeg skal snart flytte fra min nuværende bolig, og har brug for professionel hjælp til flytterengøring.

Oplysninger om opgaven:
- Type: Villa på 150 m²
- Adresse: Strandvejen 123, 8000 Aarhus C
- Antal etager: 2
- Antal værelser: 5 + køkken og 2 badeværelser
- Ønsket dato: 20. juli 2025
- Særlige behov: Vinduespudsning indvendigt

Jeg skal aflevere nøglerne d. 22. juli, så det er vigtigt at rengøringen er helt perfekt.

Kan I give mig et tilbud på opgaven? Jeg har hørt gode ting om jeres service gennem Leadpoint.

Med venlig hilsen,
Dorte Bendixen
Tlf: +45 12345678`,
                        threadId: "19a68c9b5b9bbb44",
                      },
                      calendar: {
                        eventTitle: "🏠 RenOS Booking - Dorte Bendixen",
                        startTime: "2025-07-20T10:00:00",
                        endTime: "2025-07-20T13:00:00",
                        duration: 180,
                        serviceType: "Flytterengøring",
                        price: 2792,
                        address: "Strandvejen 123, 8000 Aarhus C",
                      },
                      billy: {
                        invoiceNo: "2025-1234",
                        state: "paid",
                        isPaid: true,
                        grossAmount: 2792,
                        dueDate: "2025-08-15",
                        paidDate: "2025-08-10",
                      },
                      calculated: {
                        financial: {
                          invoicedPrice: 2792,
                          netProfit: 2650,
                          netMargin: 94.9,
                          leadCost: 90,
                          roi: 2944,
                        },
                        property: {
                          serviceType: "Flytterengøring",
                          propertySize: 150,
                        },
                        quality: {
                          dataCompleteness: 100,
                        },
                      },
                      customer: {
                        lifetimeValue: 8500,
                        totalBookings: 3,
                        avgBookingValue: 2833,
                        repeatRate: 33.3,
                      },
                    }}
                    similarLeads={[
                      {
                        id: "LEAD-045",
                        customerName: "Liv Primby",
                        similarity: 92.3,
                        status: "won",
                      },
                      {
                        id: "LEAD-078",
                        customerName: "Danny B 96",
                        similarity: 88.7,
                        status: "paid",
                      },
                      {
                        id: "LEAD-112",
                        customerName: "Stine Skovgaard",
                        similarity: 85.1,
                        status: "calendar",
                      },
                    ]}
                    winProbability={92}
                    recommendations={[
                      "🔥 Priority follow-up - High win probability",
                      "📞 Call customer to confirm satisfaction",
                      "💰 Offer 10% discount on next booking",
                      "📧 Add to monthly newsletter",
                      "🎯 Cross-sell window cleaning service",
                    ]}
                  />
                </CardContent>
              </Card>
            </section>

            {/* NEW: Chat Panel UI Kit */}
            <section id="chat-panel-ui" className="space-y-4 scroll-mt-8">
              <h3 className="text-2xl font-semibold">
                💬 Chat Panel UI – Komplet Sæt
              </h3>
              <Card>
                <CardHeader>
                  <CardTitle>Alle Chat Komponenter Samlet</CardTitle>
                  <CardDescription>
                    AI Thinking, Tool Execution, Weather, Invoices, Email
                    Thread, Calendar Event, Search Results, AI Memory – med
                    animationer og real-time demo states.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChatPanelUIShowcase />
                </CardContent>
              </Card>
            </section>

            {/* Complete Chat Demo - Realistic Full Chat */}
            <section id="chat-demo-complete" className="space-y-4 scroll-mt-8">
              <h3 className="text-2xl font-semibold">
                🌟 Complete Chat Demo - Realistisk Friday AI
              </h3>
              <ChatDemoComplete />
            </section>

            {/* Chat Panel UI - OPGRADERET */}
            <section id="chat-panel-upgraded" className="space-y-4 scroll-mt-8">
              <div className="text-center mb-6">
                <h3 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ✨ Chat Panel UI - OPGRADERET
                </h3>
                <p className="text-muted-foreground">
                  Alle chat komponenter med moderne design, glassmorphism og
                  animations
                </p>
              </div>
              <ChatPanelUIUpgradedShowcase />
            </section>

            {/* NEW: Animations & Effects */}
            <section id="animated-stats" className="space-y-4 scroll-mt-8">
              <h3 className="text-2xl font-semibold">
                📊 Animated Statistics Cards
              </h3>
              <Card>
                <CardHeader>
                  <CardTitle>Counter Animations med Gradients</CardTitle>
                  <CardDescription>
                    Tal tæller op fra 0 til target value med smooth animation.
                    Hover for scale effect, shimmer animation og progress bars.
                    Staggered entrance med delay per card.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AnimatedStatsCard />
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      💡 <strong>Animations:</strong> Number counter (2s),
                      Entrance stagger (100ms delay), Hover scale (1.05x),
                      Shimmer sweep, Progress bars, Gradient backgrounds
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section id="skeleton-loading" className="space-y-4 scroll-mt-8">
              <h3 className="text-2xl font-semibold">
                ⏳ Skeleton Loading States
              </h3>
              <Card>
                <CardHeader>
                  <CardTitle>Placeholder Animations</CardTitle>
                  <CardDescription>
                    Skeleton screens med pulse animation mens data loader. Click
                    reload button for at se transition fra loading til loaded
                    state.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SkeletonDemo />
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      💡 <strong>Use Cases:</strong> Email lists, Metric cards,
                      Task lists, User profiles. Forbedrer perceived performance
                      og giver brugeren feedback mens data loader.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section id="hover-cards" className="space-y-4 scroll-mt-8">
              <h3 className="text-2xl font-semibold">
                🎨 Interactive Hover Cards
              </h3>
              <Card>
                <CardHeader>
                  <CardTitle>Multi-Layer Hover Animations</CardTitle>
                  <CardDescription>
                    6 forskellige hover effects: Lift (translateY), Icon
                    rotation + scale, Gradient fade-in, Progress bar fill,
                    Shimmer sweep, Corner accent. Smooth cubic-bezier timing
                    functions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <InteractiveHoverCard />
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      💡 <strong>Animations:</strong> translateY(-8px),
                      rotate(6deg), scale(1.1), opacity transitions, width
                      0→100%, shimmer translate. Duration: 300-1000ms.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section id="timeline" className="space-y-4 scroll-mt-8">
              <h3 className="text-2xl font-semibold">
                📅 Animated Activity Timeline
              </h3>
              <Card>
                <CardHeader>
                  <CardTitle>Staggered Timeline Animation</CardTitle>
                  <CardDescription>
                    Activity timeline med staggered reveal (200ms delay), icon
                    rotations, status indicators og hover effects. Vertical
                    timeline med gradient line.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <AnimatedTimeline />
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      💡 <strong>Events:</strong> Email, Call, Meeting, Note.
                      <strong>Animations:</strong> Staggered reveal, Icon scale,
                      Status checkmark rotation.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section id="progress-rings" className="space-y-4 scroll-mt-8">
              <h3 className="text-2xl font-semibold">⭕ SVG Progress Rings</h3>
              <Card>
                <CardHeader>
                  <CardTitle>Circular Progress Indicators</CardTitle>
                  <CardDescription>
                    SVG-baserede cirkulære progress bars med smooth animations.
                    Different sizes, colors og speeds. Stroke-dasharray teknik.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProgressRingDemo />
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      💡 <strong>Technique:</strong> SVG circles med
                      stroke-dashoffset animation. Sizes: 80px-140px. Duration:
                      1000ms ease-out.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section id="toasts" className="space-y-4 scroll-mt-8">
              <h3 className="text-2xl font-semibold">
                🔔 Toast Notifications System
              </h3>
              <Card>
                <CardHeader>
                  <CardTitle>Animated Toast Messages</CardTitle>
                  <CardDescription>
                    Click buttons to trigger toast notifications. Slide-in
                    animation, auto-dismiss efter 5 sek, stacked layout, 4 typer
                    (success, error, warning, info).
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ToastNotificationDemo />
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      💡 <strong>Features:</strong> Slide-in-from-right,
                      Auto-dismiss (5s), Manual close, Stacked layout, Random
                      messages.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section id="kanban" className="space-y-4 scroll-mt-8">
              <h3 className="text-2xl font-semibold">
                📋 Drag & Drop Kanban Board
              </h3>
              <Card>
                <CardHeader>
                  <CardTitle>Interactive Task Board</CardTitle>
                  <CardDescription>
                    Drag tasks mellem kolonner. Staggered entrance per task
                    (50ms), hover scale, active scale-down. To Do, In Progress,
                    Review, Done.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <KanbanBoardDemo />
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      💡 <strong>Interactions:</strong> Drag & Drop mellem
                      kolonner, Hover scale (1.02x), Active scale (0.95x),
                      Priority badges, Assignee display.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
          {/* Close inner content div */}
        </div>
        {/* Close grid div */}
      </main>

      <footer className="border-t py-6 mt-12">
        <div className="container text-center text-sm text-muted-foreground">
          <p>
            Friday AI Component Showcase • 70+ Components • Animationer &
            Effects • Drag & Drop • Ctrl+K
          </p>
        </div>
      </footer>
    </div>
  );
}

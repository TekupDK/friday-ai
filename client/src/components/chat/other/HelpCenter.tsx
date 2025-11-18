/**
 * HELP CENTER - Hjælp og support center
 */

import {
  Book,
  ExternalLink,
  FileText,
  HelpCircle,
  Mail,
  MessageSquare,
  Phone,
  Search,
  Shield,
  Users,
  Video,
  Zap,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface HelpArticle {
  id: string;
  title: string;
  description: string;
  category:
    | "getting-started"
    | "features"
    | "troubleshooting"
    | "api"
    | "billing"
    | "security";
  content: string;
  tags: string[];
  views: number;
  helpful: number;
  lastUpdated: string;
}

export interface HelpCategory {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  articleCount: number;
}

interface HelpCenterProps {
  articles?: HelpArticle[];
  categories?: HelpCategory[];
  onArticleClick?: (article: HelpArticle) => void;
  onContactSupport?: (type: string) => void;
  onSearch?: (query: string) => void;
}

export function HelpCenter({
  articles = [],
  categories = [],
  onArticleClick,
  onContactSupport,
  onSearch,
}: HelpCenterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<
    "articles" | "categories" | "contact"
  >("articles");

  // Default help articles
  const defaultArticles: HelpArticle[] = [
    {
      id: "1",
      title: "Kom i gang med Tekup AI",
      description: "Lær at bruge de grundlæggende funktioner i Tekup AI",
      category: "getting-started",
      content: "Denne guide viser dig hvordan du kommer i gang...",
      tags: ["begynder", "guide", "opsætning"],
      views: 1234,
      helpful: 89,
      lastUpdated: "for 2 dage siden",
    },
    {
      id: "2",
      title: "Opret og send fakturaer",
      description: "Step-by-step guide til fakturering",
      category: "features",
      content: "Lær hvordan du opretter og sender fakturaer...",
      tags: ["faktura", "billing", "økonomi"],
      views: 892,
      helpful: 95,
      lastUpdated: "for 1 dag siden",
    },
    {
      id: "3",
      title: "Fejlfinding: Login problemer",
      description: "Løsninger til almindelige login problemer",
      category: "troubleshooting",
      content: "Hvis du har problemer med at logge ind...",
      tags: ["login", "fejl", "support"],
      views: 567,
      helpful: 78,
      lastUpdated: "for 3 timer siden",
    },
    {
      id: "4",
      title: "API dokumentation",
      description: "Komplet API reference og eksempler",
      category: "api",
      content: "Vores API giver dig adgang til alle funktioner...",
      tags: ["api", "udvikler", "integration"],
      views: 445,
      helpful: 92,
      lastUpdated: "for 5 dage siden",
    },
    {
      id: "5",
      title: "Prisplaner og fakturering",
      description: "Forstå vores prisplaner og faktureringscyklus",
      category: "billing",
      content: "Vi tilbyder fleksible prisplaner...",
      tags: ["pris", "billing", "abonnement"],
      views: 789,
      helpful: 85,
      lastUpdated: "for 1 uge siden",
    },
    {
      id: "6",
      title: "Sikkerhed og privatliv",
      description: "Hvordan vi beskytter dine data",
      category: "security",
      content: "Din sikkerhed er vores højeste prioritet...",
      tags: ["sikkerhed", "privatliv", "GDPR"],
      views: 623,
      helpful: 91,
      lastUpdated: "for 4 dage siden",
    },
  ];

  // Default help categories
  const defaultCategories: HelpCategory[] = [
    {
      id: "getting-started",
      name: "Kom i gang",
      description: "Grundlæggende guides og opsætning",
      icon: Book,
      color: "from-blue-500 to-indigo-600",
      articleCount: 12,
    },
    {
      id: "features",
      name: "Funktioner",
      description: "Detaljerede guides til alle funktioner",
      icon: Zap,
      color: "from-green-500 to-emerald-600",
      articleCount: 24,
    },
    {
      id: "troubleshooting",
      name: "Fejlfinding",
      description: "Løsninger på almindelige problemer",
      icon: HelpCircle,
      color: "from-orange-500 to-red-600",
      articleCount: 18,
    },
    {
      id: "api",
      name: "API",
      description: "API dokumentation og integration",
      icon: FileText,
      color: "from-purple-500 to-pink-600",
      articleCount: 8,
    },
    {
      id: "billing",
      name: "Fakturering",
      description: "Prisplaner og faktureringsspørgsmål",
      icon: FileText,
      color: "from-yellow-500 to-orange-600",
      articleCount: 6,
    },
    {
      id: "security",
      name: "Sikkerhed",
      description: "Sikkerhedsindstillinger og privatliv",
      icon: Shield,
      color: "from-red-500 to-pink-600",
      articleCount: 10,
    },
  ];

  const allArticles = articles.length > 0 ? articles : defaultArticles;
  const allCategories = categories.length > 0 ? categories : defaultCategories;

  const filteredArticles = allArticles.filter(article => {
    const matchesCategory =
      selectedCategory === "all" || article.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some(tag =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    return matchesCategory && matchesSearch;
  });

  const handleSearch = () => {
    onSearch?.(searchQuery);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "getting-started":
        return "bg-blue-500";
      case "features":
        return "bg-green-500";
      case "troubleshooting":
        return "bg-orange-500";
      case "api":
        return "bg-purple-500";
      case "billing":
        return "bg-yellow-500";
      case "security":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "getting-started":
        return "Kom i gang";
      case "features":
        return "Funktioner";
      case "troubleshooting":
        return "Fejlfinding";
      case "api":
        return "API";
      case "billing":
        return "Fakturering";
      case "security":
        return "Sikkerhed";
      default:
        return category;
    }
  };

  const popularArticles = allArticles
    .sort((a, b) => b.views - a.views)
    .slice(0, 3);

  const recentArticles = allArticles
    .sort((a, b) => {
      // Simple sort by lastUpdated (in real app, use proper date parsing)
      const aRecent =
        a.lastUpdated.includes("time") || a.lastUpdated.includes("dag");
      const bRecent =
        b.lastUpdated.includes("time") || b.lastUpdated.includes("dag");
      return bRecent ? 1 : aRecent ? -1 : 0;
    })
    .slice(0, 3);

  return (
    <Card className="border-l-4 border-l-teal-500">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-md">
              <HelpCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold">Help Center</h4>
              <p className="text-xs text-muted-foreground">
                Hjælp og support center
              </p>
            </div>
          </div>
          <Badge className="bg-teal-500">{allArticles.length} artikler</Badge>
        </div>

        {/* Search */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Søg i hjælp artikler..."
              className="pl-9 pr-10 h-10"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <kbd className="px-2 py-1 text-xs bg-muted rounded">Ctrl+?</kbd>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-lg bg-muted">
          {[
            { id: "articles", label: "Artikler", icon: Book },
            { id: "categories", label: "Kategorier", icon: FileText },
            { id: "contact", label: "Kontakt", icon: MessageSquare },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1",
                  activeTab === tab.id
                    ? "bg-background shadow-sm"
                    : "hover:bg-background/50"
                )}
              >
                <Icon className="w-3 h-3" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Articles Tab */}
        {activeTab === "articles" && (
          <div className="space-y-3">
            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Kategorier:
              </label>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={cn(
                    "px-2 py-1 rounded text-xs transition-colors",
                    selectedCategory === "all"
                      ? "bg-teal-500 text-white"
                      : "bg-muted hover:bg-muted/70"
                  )}
                >
                  Alle ({allArticles.length})
                </button>
                {allCategories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={cn(
                      "px-2 py-1 rounded text-xs transition-colors",
                      selectedCategory === category.id
                        ? "bg-teal-500 text-white"
                        : "bg-muted hover:bg-muted/70"
                    )}
                  >
                    {category.name} ({category.articleCount})
                  </button>
                ))}
              </div>
            </div>

            {/* Articles List */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h5 className="text-sm font-semibold">
                  Artikler ({filteredArticles.length}):
                </h5>
                {searchQuery && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSearchQuery("")}
                  >
                    Ryd søgning
                  </Button>
                )}
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {filteredArticles.map(article => (
                  <button
                    key={article.id}
                    onClick={() => onArticleClick?.(article)}
                    className="w-full text-left p-3 rounded-lg bg-background border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {article.title}
                          </span>
                          <Badge className={getCategoryColor(article.category)}>
                            {getCategoryLabel(article.category)}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {article.description}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{article.views} visninger</span>
                          <span>•</span>
                          <span>{article.helpful}% hjalp</span>
                          <span>•</span>
                          <span>{article.lastUpdated}</span>
                        </div>
                        <div className="flex gap-1 mt-2">
                          {article.tags.map((tag, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === "categories" && (
          <div className="space-y-3">
            <h5 className="text-sm font-semibold">Kategorier:</h5>
            <div className="grid grid-cols-2 gap-2">
              {allCategories.map(category => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setActiveTab("articles");
                    }}
                    className="p-3 rounded-lg bg-linear-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-800 dark:hover:to-gray-700 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg bg-linear-to-br flex items-center justify-center text-white",
                          category.color
                        )}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="font-medium text-sm mb-1">
                          {category.name}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {category.description}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {category.articleCount} artikler
                        </Badge>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === "contact" && (
          <div className="space-y-3">
            <h5 className="text-sm font-semibold">Kontakt support:</h5>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onContactSupport?.("chat")}
                className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <MessageSquare className="w-5 h-5 text-blue-600 mb-2" />
                <div className="text-sm font-medium">Live Chat</div>
                <div className="text-xs text-muted-foreground">Få hjælp nu</div>
              </button>

              <button
                onClick={() => onContactSupport?.("email")}
                className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
              >
                <Mail className="w-5 h-5 text-green-600 mb-2" />
                <div className="text-sm font-medium">Email</div>
                <div className="text-xs text-muted-foreground">
                  support@tekup.dk
                </div>
              </button>

              <button
                onClick={() => onContactSupport?.("phone")}
                className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
              >
                <Phone className="w-5 h-5 text-purple-600 mb-2" />
                <div className="text-sm font-medium">Telefon</div>
                <div className="text-xs text-muted-foreground">
                  +45 1234 5678
                </div>
              </button>

              <button
                onClick={() => onContactSupport?.("video")}
                className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
              >
                <Video className="w-5 h-5 text-orange-600 mb-2" />
                <div className="text-sm font-medium">Video Support</div>
                <div className="text-xs text-muted-foreground">
                  Book et møde
                </div>
              </button>
            </div>

            <div className="p-3 rounded-lg bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800">
              <div className="flex items-start gap-2">
                <Users className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div className="text-xs text-teal-700 dark:text-teal-400">
                  <p className="font-semibold mb-1">Support åbningstider:</p>
                  <p>Mandag-Fredag: 09:00 - 17:00</p>
                  <p>Lørdag-Søndag: 10:00 - 14:00</p>
                  <p>
                    Gennemsnitlig svartid: 2 minutter (chat), 4 timer (email)
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Popular Articles */}
        {activeTab === "articles" && !searchQuery && (
          <div className="space-y-2">
            <h5 className="text-sm font-semibold">Populære artikler:</h5>
            <div className="space-y-1">
              {popularArticles.map(article => (
                <button
                  key={article.id}
                  onClick={() => onArticleClick?.(article)}
                  className="w-full text-left p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors flex items-center gap-2"
                >
                  <Book className="w-4 h-4 text-teal-600" />
                  <span className="text-sm">{article.title}</span>
                  <Badge variant="outline" className="text-xs ml-auto">
                    {article.views} visninger
                  </Badge>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Help Stats */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950/20 text-center">
            <p className="font-bold text-teal-700 dark:text-teal-300">
              {allArticles.length}
            </p>
            <p className="text-teal-600 dark:text-teal-400">Artikler</p>
          </div>
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-center">
            <p className="font-bold text-blue-700 dark:text-blue-300">
              {allCategories.length}
            </p>
            <p className="text-blue-600 dark:text-blue-400">Kategorier</p>
          </div>
          <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/20 text-center">
            <p className="font-bold text-green-700 dark:text-green-300">
              {Math.round(
                allArticles.reduce((sum, a) => sum + a.helpful, 0) /
                  allArticles.length
              )}
              %
            </p>
            <p className="text-green-600 dark:text-green-400">Hjalp</p>
          </div>
        </div>

        {/* Quick Help */}
        <div className="p-3 rounded-lg bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800">
          <div className="flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div className="text-xs text-teal-700 dark:text-teal-400">
              <p className="font-semibold mb-1">Hurtig hjælp:</p>
              <ul className="space-y-1">
                <li>
                  • Brug{" "}
                  <kbd className="px-1 py-0.5 bg-white rounded text-xs">
                    Ctrl+?
                  </kbd>{" "}
                  for hurtig adgang
                </li>
                <li>• Søg i artikler for hurtige svar</li>
                <li>• Kontakt support via chat for øjeblikkelig hjælp</li>
                <li>• Find guides i kategorierne</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            onClick={() => setActiveTab("contact")}
            className="flex-1 bg-linear-to-r from-teal-600 to-cyan-600"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Kontakt support
          </Button>
          <Button
            onClick={() => window.open("/docs", "_blank")}
            variant="outline"
            className="flex-1"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Åbn dokumentation
          </Button>
        </div>
      </div>
    </Card>
  );
}

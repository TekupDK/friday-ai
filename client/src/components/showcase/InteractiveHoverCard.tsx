import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Mail, Calendar, DollarSign, Users, Sparkles, Zap } from "lucide-react";

const cards = [
  {
    id: 1,
    icon: Mail,
    title: 'Email Inbox',
    description: 'AI-sorted med prioritering',
    count: '24',
    color: 'from-blue-500/20 to-cyan-500/20',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-500'
  },
  {
    id: 2,
    icon: Calendar,
    title: 'Calendar Events',
    description: 'Dagens møder og tasks',
    count: '8',
    color: 'from-purple-500/20 to-pink-500/20',
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-500'
  },
  {
    id: 3,
    icon: DollarSign,
    title: 'Invoices',
    description: 'Ubetalte fakturaer',
    count: '5',
    color: 'from-green-500/20 to-emerald-500/20',
    iconBg: 'bg-green-500/10',
    iconColor: 'text-green-500'
  },
  {
    id: 4,
    icon: Users,
    title: 'Hot Leads',
    description: 'Prioriterede leads',
    count: '12',
    color: 'from-red-500/20 to-orange-500/20',
    iconBg: 'bg-red-500/10',
    iconColor: 'text-red-500'
  },
  {
    id: 5,
    icon: Sparkles,
    title: 'AI Suggestions',
    description: 'Intelligente forslag',
    count: '6',
    color: 'from-yellow-500/20 to-amber-500/20',
    iconBg: 'bg-yellow-500/10',
    iconColor: 'text-yellow-500'
  },
  {
    id: 6,
    icon: Zap,
    title: 'Quick Actions',
    description: 'Hurtige genveje',
    count: '15',
    color: 'from-indigo-500/20 to-violet-500/20',
    iconBg: 'bg-indigo-500/10',
    iconColor: 'text-indigo-500'
  }
];

export function InteractiveHoverCard() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isHovered = hoveredId === card.id;
        
        return (
          <Card
            key={card.id}
            className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl"
            onMouseEnter={() => setHoveredId(card.id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{
              transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {/* Animated gradient background */}
            <div 
              className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500",
                card.color,
                isHovered && "opacity-100"
              )}
            />

            {/* Content */}
            <div className="relative p-6 space-y-4">
              {/* Icon with rotation animation */}
              <div className="flex items-center justify-between">
                <div
                  className={cn(
                    "w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-500",
                    card.iconBg,
                    isHovered && "scale-110 rotate-6"
                  )}
                >
                  <Icon 
                    className={cn(
                      "w-7 h-7 transition-all duration-300",
                      card.iconColor,
                      isHovered && "scale-125"
                    )} 
                  />
                </div>
                
                {/* Animated count badge */}
                <Badge 
                  className={cn(
                    "transition-all duration-300",
                    isHovered && "scale-110"
                  )}
                  variant="secondary"
                >
                  <span className={cn(
                    "font-bold transition-all duration-300",
                    isHovered && "text-primary"
                  )}>
                    {card.count}
                  </span>
                </Badge>
              </div>

              {/* Title with slide animation */}
              <div className="space-y-1">
                <h3 
                  className={cn(
                    "font-semibold text-lg transition-all duration-300",
                    isHovered && "text-primary translate-x-1"
                  )}
                >
                  {card.title}
                </h3>
                <p 
                  className={cn(
                    "text-sm text-muted-foreground transition-all duration-300",
                    isHovered && "translate-x-1"
                  )}
                >
                  {card.description}
                </p>
              </div>

              {/* Progress bar animation */}
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-1000 ease-out",
                    card.iconColor.replace('text-', 'bg-')
                  )}
                  style={{
                    width: isHovered ? '100%' : '0%'
                  }}
                />
              </div>
            </div>

            {/* Shimmer effect */}
            <div
              className={cn(
                "absolute inset-0 -translate-x-full transition-transform duration-1000",
                "bg-gradient-to-r from-transparent via-white/20 to-transparent",
                isHovered && "translate-x-full"
              )}
            />

            {/* Corner accent */}
            <div
              className={cn(
                "absolute top-0 right-0 w-20 h-20 transition-all duration-500",
                "bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full",
                "opacity-0 scale-0",
                isHovered && "opacity-100 scale-100"
              )}
            />
          </Card>
        );
      })}
    </div>
  );
}

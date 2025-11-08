/**
 * CategoryBadge - Display email category with color coding
 */

import { Badge } from "@/components/ui/badge";
import { 
  Briefcase, 
  User, 
  DollarSign, 
  Mail, 
  AlertCircle,
  Folder 
} from "lucide-react";

interface CategoryBadgeProps {
  category: 'work' | 'personal' | 'finance' | 'marketing' | 'important' | 'other';
  subcategory?: string | null;
  confidence?: number;
  className?: string;
}

const CATEGORY_CONFIG = {
  work: {
    label: 'Arbejde',
    icon: Briefcase,
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  },
  personal: {
    label: 'Personlig',
    icon: User,
    className: 'bg-green-100 text-green-800 hover:bg-green-200',
  },
  finance: {
    label: 'Økonomi',
    icon: DollarSign,
    className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  },
  marketing: {
    label: 'Marketing',
    icon: Mail,
    className: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
  },
  important: {
    label: 'Vigtig',
    icon: AlertCircle,
    className: 'bg-red-100 text-red-800 hover:bg-red-200',
  },
  other: {
    label: 'Andet',
    icon: Folder,
    className: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
  },
};

export function CategoryBadge({ 
  category, 
  subcategory, 
  confidence,
  className = '' 
}: CategoryBadgeProps) {
  const config = CATEGORY_CONFIG[category];
  const Icon = config.icon;

  return (
    <Badge 
      variant="secondary"
      className={`${config.className} ${className} flex items-center gap-1`}
      title={subcategory ? `${config.label} - ${subcategory}` : config.label}
    >
      <Icon className="w-3 h-3" />
      <span>{config.label}</span>
      {confidence && confidence < 0.8 && (
        <span className="text-xs opacity-70">
          ({Math.round(confidence * 100)}%)
        </span>
      )}
    </Badge>
  );
}

/**
 * Apple Icon System
 *
 * Commonly used icons with SF Symbols styling
 */

import {
  Activity,
  // Status
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart,
  Bell,
  Briefcase,
  Building2,
  Calendar,
  Camera,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Copy,
  CreditCard,
  DollarSign,
  Download,
  Edit,
  // UI
  Eye,
  EyeOff,
  File,
  FileText,
  Filter,
  Folder,
  Heart,
  // Navigation
  Home,
  // Media
  Image,
  Info,
  // Communication
  Mail,
  MapPin,
  Menu,
  MessageSquare,
  Minus,
  MoreHorizontal,
  MoreVertical,
  Paperclip,
  Phone,
  PieChart,
  // Actions
  Plus,
  Save,
  Search,
  Send,
  Settings,
  Share2,
  SortAsc,
  SortDesc,
  Star,
  Tag,
  // CRM Specific
  Target,
  Trash2,
  TrendingUp,
  Upload,
  User,
  // Business
  Users,
  Video,
  X,
  XCircle,
} from "lucide-react";

// Export all icons with consistent naming
export const Icons = {
  // Navigation
  home: Home,
  search: Search,
  settings: Settings,
  menu: Menu,
  close: X,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  chevronUp: ChevronUp,
  chevronDown: ChevronDown,
  arrowLeft: ArrowLeft,
  arrowRight: ArrowRight,

  // Actions
  plus: Plus,
  minus: Minus,
  edit: Edit,
  delete: Trash2,
  save: Save,
  download: Download,
  upload: Upload,
  share: Share2,
  copy: Copy,
  check: Check,

  // Communication
  mail: Mail,
  phone: Phone,
  message: MessageSquare,
  send: Send,
  notification: Bell,

  // Business
  users: Users,
  user: User,
  building: Building2,
  briefcase: Briefcase,
  calendar: Calendar,
  clock: Clock,
  currency: DollarSign,
  payment: CreditCard,
  document: FileText,
  folder: Folder,

  // Status
  error: AlertCircle,
  success: CheckCircle,
  cancel: XCircle,
  info: Info,
  warning: AlertTriangle,

  // Media
  image: Image,
  camera: Camera,
  video: Video,
  file: File,
  attachment: Paperclip,

  // UI
  show: Eye,
  hide: EyeOff,
  favorite: Heart,
  star: Star,
  filter: Filter,
  sortAsc: SortAsc,
  sortDesc: SortDesc,
  moreHorizontal: MoreHorizontal,
  moreVertical: MoreVertical,

  // CRM Specific
  lead: Target,
  growth: TrendingUp,
  analytics: BarChart,
  chart: PieChart,
  activity: Activity,
  location: MapPin,
  tag: Tag,
} as const;

export type IconName = keyof typeof Icons;

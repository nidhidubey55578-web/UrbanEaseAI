import React from "react"
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  MapPin,
  Navigation,
  Compass,
  AlertTriangle,
  Shield,
  Bell,
  Check,
  User,
  Search,
  RefreshCw,
  Bookmark,
  Settings,
  Sliders,
  Globe,
  Layers,
  Eye,
  EyeOff,
  Phone,
  Mail,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  X,
  ChevronRight,
  Play,
  Pause,
  FileText,
  Bus,
  Building2,
  Footprints,
  Info,
  Radio,
  Share2,
  Trash2,
  ExternalLink,
  Wifi,
  Sparkles,
  BarChart3,
  Calendar,
  Clock,
  Home,
  CheckCircle2,
  AlertCircle,
  Activity,
  Award,
} from "lucide-react"

export type IconName = "home" | "explore" | "report" | "saved" | "profile" | "route" | "voice" | "signal" | "spark" | "search" | "arrow" | "back" | "pin" | "shield" | "bell" | "check" | "swap" | "close" | "more" | "pause" | "play" | "settings" | "sliders" | "globe" | "help" | "phone" | "mail" | "info" | "trash" | "share" | "analytics" | "iot" | "academic" | "bus" | "building" | "eye" | "eyeOff" | "volume" | "volumeX" | "calendar" | "clock"

interface IconProps {
  name: IconName | string
  size?: number
  className?: string
  color?: string
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 20,
  className = "",
  color,
}) => {
  const props = { size, className: `icon ${className}`, color }

  switch (name) {
    case "home":
      return <Home {...props} />
    case "explore":
      return <Compass {...props} />
    case "report":
      return <AlertTriangle {...props} />
    case "saved":
      return <Bookmark {...props} />
    case "profile":
      return <User {...props} />
    case "route":
      return <Navigation {...props} />
    case "voice":
      return <Mic {...props} />
    case "signal":
      return <Radio {...props} />
    case "spark":
      return <Sparkles {...props} />
    case "search":
      return <Search {...props} />
    case "arrow":
      return <ChevronRight {...props} />
    case "back":
      return <ArrowLeft {...props} />
    case "pin":
      return <MapPin {...props} />
    case "shield":
      return <Shield {...props} />
    case "bell":
      return <Bell {...props} />
    case "check":
      return <Check {...props} />
    case "swap":
      return <RefreshCw {...props} />
    case "close":
      return <X {...props} />
    case "more":
      return <Sliders {...props} />
    case "pause":
      return <Pause {...props} />
    case "play":
      return <Play {...props} />
    case "settings":
      return <Settings {...props} />
    case "sliders":
      return <Sliders {...props} />
    case "globe":
      return <Globe {...props} />
    case "help":
      return <HelpCircle {...props} />
    case "phone":
      return <Phone {...props} />
    case "mail":
      return <Mail {...props} />
    case "info":
      return <Info {...props} />
    case "trash":
      return <Trash2 {...props} />
    case "share":
      return <Share2 {...props} />
    case "analytics":
      return <BarChart3 {...props} />
    case "iot":
      return <Wifi {...props} />
    case "academic":
      return <Award {...props} />
    case "bus":
      return <Bus {...props} />
    case "building":
      return <Building2 {...props} />
    case "eye":
      return <Eye {...props} />
    case "eyeOff":
      return <EyeOff {...props} />
    case "volume":
      return <Volume2 {...props} />
    case "volumeX":
      return <VolumeX {...props} />
    case "calendar":
      return <Calendar {...props} />
    case "clock":
      return <Clock {...props} />
    default:
      return <Activity {...props} />
  }
}

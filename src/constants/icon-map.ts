import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  Link as LinkIcon,
  File,
  Image,
  type LucideProps,
} from "lucide-react"
import type React from "react"

export const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  Link: LinkIcon,
  File,
  Image,
}

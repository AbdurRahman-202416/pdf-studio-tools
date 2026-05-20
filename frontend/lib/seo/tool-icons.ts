/**
 * Tree-shakable icon registry for tool cards.
 *
 * The previous approach (`import * as Icons from "lucide-react"`) pulled the
 * entire icon set into the bundle (~1000 icons). Importing only the icons
 * we actually use cuts ~150KB gzipped from the home + tools bundles.
 */
import type { LucideIcon } from "lucide-react";
import {
  Camera,
  FileText,
  FileType,
  IdCard,
  Image,
  ImagePlus,
  Languages,
  Lock,
  Merge,
  PenTool,
  Sheet,
  Table,
  Target,
  Unlock,
  Wand2,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Camera,
  FileText,
  FileType,
  IdCard,
  Image,
  ImagePlus,
  Languages,
  Lock,
  Merge,
  PenTool,
  Sheet,
  Table,
  Target,
  Unlock,
  Wand2,
};

export function getToolIcon(name: string): LucideIcon | null {
  return ICONS[name] ?? null;
}

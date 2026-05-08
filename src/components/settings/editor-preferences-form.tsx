"use client"

import { toast } from "sonner"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useEditorPreferences } from "@/context/editor-preferences-context"
import {
  FONT_SIZE_OPTIONS,
  TAB_SIZE_OPTIONS,
  THEME_OPTIONS,
  type EditorPreferences,
} from "@/types/editor-preferences"

export function EditorPreferencesForm() {
  const { prefs, updatePref } = useEditorPreferences()

  async function handleChange<K extends keyof EditorPreferences>(
    key: K,
    value: EditorPreferences[K],
  ) {
    await updatePref(key, value)
    toast.success("Editor preferences saved")
  }

  return (
    <div className="space-y-5">
      {/* Theme */}
      <div className="flex items-center justify-between">
        <Label htmlFor="editor-theme" className="text-sm">
          Theme
        </Label>
        <Select
          value={prefs.theme}
          onValueChange={(v) =>
            handleChange("theme", v as EditorPreferences["theme"])
          }
        >
          <SelectTrigger id="editor-theme" className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {THEME_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Font Size */}
      <div className="flex items-center justify-between">
        <Label htmlFor="editor-font-size" className="text-sm">
          Font size
        </Label>
        <Select
          value={String(prefs.fontSize)}
          onValueChange={(v) => handleChange("fontSize", Number(v))}
        >
          <SelectTrigger id="editor-font-size" className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_SIZE_OPTIONS.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}px
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tab Size */}
      <div className="flex items-center justify-between">
        <Label htmlFor="editor-tab-size" className="text-sm">
          Tab size
        </Label>
        <Select
          value={String(prefs.tabSize)}
          onValueChange={(v) => handleChange("tabSize", Number(v))}
        >
          <SelectTrigger id="editor-tab-size" className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TAB_SIZE_OPTIONS.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size} spaces
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Word Wrap */}
      <div className="flex items-center justify-between">
        <Label htmlFor="editor-word-wrap" className="text-sm">
          Word wrap
        </Label>
        <Switch
          id="editor-word-wrap"
          checked={prefs.wordWrap}
          onCheckedChange={(checked) => handleChange("wordWrap", checked)}
        />
      </div>

      {/* Minimap */}
      <div className="flex items-center justify-between">
        <Label htmlFor="editor-minimap" className="text-sm">
          Minimap
        </Label>
        <Switch
          id="editor-minimap"
          checked={prefs.minimap}
          onCheckedChange={(checked) => handleChange("minimap", checked)}
        />
      </div>
    </div>
  )
}

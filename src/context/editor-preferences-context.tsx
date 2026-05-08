"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import { updateEditorPreferences } from "@/actions/editor-preferences"
import {
  DEFAULT_EDITOR_PREFERENCES,
  type EditorPreferences,
} from "@/types/editor-preferences"

interface EditorPreferencesContextValue {
  prefs: EditorPreferences
  updatePref: <K extends keyof EditorPreferences>(
    key: K,
    value: EditorPreferences[K],
  ) => Promise<void>
}

const EditorPreferencesContext = createContext<EditorPreferencesContextValue>({
  prefs: DEFAULT_EDITOR_PREFERENCES,
  updatePref: async () => {},
})

export function EditorPreferencesProvider({
  initial,
  children,
}: {
  initial: EditorPreferences
  children: ReactNode
}) {
  const [prefs, setPrefs] = useState<EditorPreferences>(initial)

  const updatePref = useCallback(
    async <K extends keyof EditorPreferences>(
      key: K,
      value: EditorPreferences[K],
    ) => {
      const updated = { ...prefs, [key]: value }
      setPrefs(updated)
      await updateEditorPreferences({ [key]: value })
    },
    [prefs],
  )

  return (
    <EditorPreferencesContext.Provider value={{ prefs, updatePref }}>
      {children}
    </EditorPreferencesContext.Provider>
  )
}

export function useEditorPreferences() {
  return useContext(EditorPreferencesContext)
}

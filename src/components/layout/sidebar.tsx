"use client"

import { useState } from "react"
import { PanelLeftClose, PanelLeftOpen, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { SidebarContent } from "./sidebar-content"
import { cn } from "@/lib/utils"

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r border-border shrink-0 transition-all duration-200",
        collapsed ? "w-14" : "w-56"
      )}
    >
      <div className={cn("flex items-center px-2 py-2 shrink-0", collapsed ? "justify-center" : "justify-end")}>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setCollapsed((c) => !c)}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>
      </div>
      <SidebarContent collapsed={collapsed} />
    </aside>
  )
}

export function MobileSidebarTrigger() {
  return (
    <Sheet>
      <SheetTrigger
        render={<Button variant="ghost" size="icon-sm" className="md:hidden" />}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Open sidebar</span>
      </SheetTrigger>
      <SheetContent side="left" showCloseButton className="w-64 p-0">
        <SidebarContent />
      </SheetContent>
    </Sheet>
  )
}

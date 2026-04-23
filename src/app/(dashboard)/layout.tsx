import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center gap-4 px-4 h-14 border-b border-border shrink-0">
        <span className="text-sm font-semibold tracking-tight w-40 shrink-0">
          DevStash
        </span>

        <div className="flex-1 max-w-lg">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items, collections, tags..."
              className="pl-8 h-8 bg-muted/40 border-border text-sm"
            />
          </div>
        </div>

        <div className="ml-auto">
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            New Item
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-56 border-r border-border shrink-0 flex items-start justify-center pt-8">
          <h2 className="text-muted-foreground font-medium">Sidebar</h2>
        </aside>

        <main className="flex-1 overflow-auto flex items-start justify-center pt-8">
          {children}
        </main>
      </div>
    </div>
  );
}

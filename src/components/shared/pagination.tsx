import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface PaginationProps {
  page: number
  totalPages: number
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | "...")[] = [1]
  if (current > 3) pages.push("...")
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i)
  }
  if (current < total - 2) pages.push("...")
  pages.push(total)

  return pages
}

export function Pagination({ page, totalPages }: PaginationProps) {
  if (totalPages <= 1) return null

  const pageNumbers = getPageNumbers(page, totalPages)
  const isFirst = page === 1
  const isLast = page === totalPages

  const linkClass =
    "inline-flex items-center justify-center h-8 min-w-8 px-2 rounded-md text-sm transition-colors"
  const activeClass = "bg-primary text-primary-foreground font-medium"
  const inactiveClass = "text-muted-foreground hover:bg-muted hover:text-foreground"
  const disabledClass = "text-muted-foreground/40 pointer-events-none cursor-not-allowed"

  return (
    <nav className="flex items-center justify-center gap-1 mt-8" aria-label="Pagination">
      {isFirst ? (
        <span className={cn(linkClass, disabledClass)}>
          <ChevronLeft className="h-4 w-4" />
        </span>
      ) : (
        <Link href={`?page=${page - 1}`} className={cn(linkClass, inactiveClass)}>
          <ChevronLeft className="h-4 w-4" />
        </Link>
      )}

      {pageNumbers.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className={cn(linkClass, "text-muted-foreground/40")}>
            …
          </span>
        ) : (
          <Link
            key={p}
            href={`?page=${p}`}
            className={cn(linkClass, p === page ? activeClass : inactiveClass)}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </Link>
        ),
      )}

      {isLast ? (
        <span className={cn(linkClass, disabledClass)}>
          <ChevronRight className="h-4 w-4" />
        </span>
      ) : (
        <Link href={`?page=${page + 1}`} className={cn(linkClass, inactiveClass)}>
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </nav>
  )
}

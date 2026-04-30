export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dark min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="w-full max-w-sm px-4">{children}</div>
    </div>
  )
}

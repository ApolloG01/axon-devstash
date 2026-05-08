import Navbar from "@/components/homepage/Navbar";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="flex min-h-screen items-center justify-center pt-[60px] px-4">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}

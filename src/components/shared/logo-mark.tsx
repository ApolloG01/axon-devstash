export function LogoMark({ className }: { className?: string }) {
  return (
    <svg className={className ?? "w-6 h-6 shrink-0"} viewBox="0 0 24 24" fill="none">
      <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="#3b82f6" strokeWidth="1.8" fill="#3b82f615" />
      <path d="M12 8v8M8 10l4-2 4 2" stroke="#3b82f6" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

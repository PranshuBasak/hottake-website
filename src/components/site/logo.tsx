import { cn } from "@/lib/utils";

/** Flame-in-a-controller mark + wordmark. */
export function Logo({ className, withWord = true }: { className?: string; withWord?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg viewBox="0 0 32 32" className="size-7" aria-hidden>
        <defs>
          <linearGradient id="ht-flame" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#FF6B4F" />
            <stop offset="1" stopColor="#FFD35C" />
          </linearGradient>
        </defs>
        <rect x="2" y="9" width="28" height="18" rx="9" fill="#221A17" stroke="#FF6B4F" strokeOpacity=".5" />
        <path
          d="M16 3c1.6 3.2 5.4 5.4 5.4 10.2A5.4 5.4 0 0 1 16 18.6a5.4 5.4 0 0 1-5.4-5.4c0-2.4 1.2-3.6 2.2-4.8.3 1.6 1 2.6 2 3-.4-3.2.4-5.8 1.2-8.4Z"
          fill="url(#ht-flame)"
        />
        <circle cx="8.5" cy="20" r="1.6" fill="#3EC1FF" />
        <circle cx="23.5" cy="20" r="1.6" fill="#FFD23F" />
      </svg>
      {withWord && <span className="font-heading text-xl font-extrabold tracking-tight">HotTake</span>}
    </span>
  );
}

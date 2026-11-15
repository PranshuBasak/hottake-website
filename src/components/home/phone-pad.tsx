import { cn } from "@/lib/utils";

/** A phone showing the HotTake controller, drawn in CSS (decorative). */
export function PhonePad({
  color,
  variant = "dpad",
  className,
}: {
  color: string;
  variant?: "dpad" | "stick" | "buttons";
  className?: string;
}) {
  return (
    <div
      className={cn("aspect-[9/17] rounded-[22%/12%] border border-white/15 bg-[#0b0807] p-[6%] shadow-2xl", className)}
      style={{ boxShadow: `0 30px 60px -20px ${color}66` }}
    >
      <div className="relative flex h-full flex-col overflow-hidden rounded-[16%/9%] bg-bg-2">
        <div className="h-[6%] w-full" style={{ background: color }} />
        <div className="flex flex-1 flex-col items-center justify-evenly">
          {variant === "dpad" && (
            <div className="relative aspect-square w-[62%]">
              <span className="absolute inset-x-[33%] inset-y-0 rounded-[18%] bg-bg-3" />
              <span className="absolute inset-y-[33%] inset-x-0 rounded-[18%] bg-bg-3" />
              <span className="absolute inset-[38%] rounded-full" style={{ background: `${color}55` }} />
            </div>
          )}
          {variant === "stick" && (
            <div className="grid aspect-square w-[62%] place-items-center rounded-full bg-bg-3">
              <span className="aspect-square w-[45%] translate-x-[18%] -translate-y-[12%] rounded-full" style={{ background: color }} />
            </div>
          )}
          {variant === "buttons" && (
            <div className="grid w-[70%] grid-cols-2 gap-[10%]">
              <span className="aspect-square rounded-full bg-bg-3" />
              <span className="aspect-square rounded-full" style={{ background: color }} />
            </div>
          )}
          <div className="flex w-[70%] justify-between">
            <span className="aspect-square w-[42%] rounded-full" style={{ background: color }} />
            <span className="aspect-square w-[42%] rounded-full bg-bg-3 ring-1" style={{ ["--tw-ring-color" as string]: color }} />
          </div>
        </div>
      </div>
    </div>
  );
}

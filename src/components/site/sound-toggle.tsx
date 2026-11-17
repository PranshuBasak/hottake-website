"use client";

import { useSyncExternalStore } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Toggle, ToggleIcon } from "@ui-sdk/react/toggle";
import { isMuted, setMuted, subscribeSound } from "@/lib/sound";

/** Footer switch for interface sounds. Remembered per browser. */
export function SoundToggle() {
  const on = useSyncExternalStore(
    subscribeSound,
    () => !isMuted(),
    () => false,
  );
  return (
    <Toggle
      pressed={on}
      onPressedChange={(p) => setMuted(!p)}
      data-sound="custom"
      className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-white/30 hover:text-foreground data-pressed:text-foreground"
    >
      <ToggleIcon>{on ? <Volume2 className="size-3.5" aria-hidden /> : <VolumeX className="size-3.5" aria-hidden />}</ToggleIcon>
      Sounds
    </Toggle>
  );
}

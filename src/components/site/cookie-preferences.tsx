"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import type { Consent } from "@/lib/consent";

export default function PreferencesDialog({
  open,
  onOpenChange,
  current,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  current: Consent | null;
  onSave: (c: Consent) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {/* keyed so the switch starts from the saved choice each time the dialog opens */}
        {open && <PreferencesBody key={String(current)} current={current} onSave={onSave} />}
      </DialogContent>
    </Dialog>
  );
}

function PreferencesBody({ current, onSave }: { current: Consent | null; onSave: (c: Consent) => void }) {
  const [analytics, setAnalytics] = useState(current === "all");
  return (
    <>
        <DialogHeader>
          <DialogTitle>Cookie preferences</DialogTitle>
          <DialogDescription>Change this any time from the footer. Full list on the cookies page.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4 rounded-xl border border-border p-4">
            <div>
              <p className="font-medium">Essential</p>
              <p className="text-sm text-muted-foreground">Remembers this choice. Always on.</p>
            </div>
            <Switch checked disabled aria-label="Essential cookies (always on)" />
          </div>
          <div className="flex items-start justify-between gap-4 rounded-xl border border-border p-4">
            <div>
              <p className="font-medium">Analytics</p>
              <p className="text-sm text-muted-foreground">
                Visitor and session IDs, IP address, approximate location, device, browser, screen, language, timezone,
                referrer and pages viewed.
              </p>
            </div>
            <Switch checked={analytics} onCheckedChange={setAnalytics} aria-label="Analytics cookies" />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onSave(analytics ? "all" : "essential")}>Save choices</Button>
        </DialogFooter>
    </>
  );
}

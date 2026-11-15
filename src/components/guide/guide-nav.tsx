"use client";

import { ScrollSpy, type ScrollSpySection } from "@/components/interior/scroll-spy";

export function GuideNav({ sections }: { sections: ScrollSpySection[] }) {
  return <ScrollSpy sections={sections} offset={120} label="Guide" />;
}

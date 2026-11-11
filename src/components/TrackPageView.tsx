"use client";

import { useEffect } from "react";
import { trackPageView } from "@/lib/track";

export default function TrackPageView({ slug }: { slug: string }) {
  useEffect(() => {
    trackPageView(slug);
  }, [slug]);
  return null;
}

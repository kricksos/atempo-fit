import { notFound } from "next/navigation";

import { LandingPreview } from "./preview";

export default function LandingPreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <LandingPreview />;
}

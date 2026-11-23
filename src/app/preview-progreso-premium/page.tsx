import { notFound } from "next/navigation";

import { ProgressPremiumPreview } from "./preview";

export default function ProgressPremiumPreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <ProgressPremiumPreview />;
}

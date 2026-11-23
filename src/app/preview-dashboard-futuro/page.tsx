import { notFound } from "next/navigation";

import { FutureDashboardPreview } from "./preview";

export default function FutureDashboardPreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <FutureDashboardPreview />;
}

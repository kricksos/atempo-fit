import { notFound } from "next/navigation";

import { DashboardDesignPreview } from "../preview-dashboard/preview";

export default function DashboardColorPreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <DashboardDesignPreview colorStudy />;
}

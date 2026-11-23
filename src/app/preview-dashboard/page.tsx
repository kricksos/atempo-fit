import { notFound } from "next/navigation";

import { DashboardDesignPreview } from "./preview";

export default function DashboardPreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <DashboardDesignPreview />;
}

import { notFound } from "next/navigation";

import { DashboardLockPreview } from "./preview";

export default function DashboardLockPreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <DashboardLockPreview />;
}

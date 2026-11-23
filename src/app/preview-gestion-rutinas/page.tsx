import { notFound } from "next/navigation";

import { RoutineManagementPreview } from "./preview";

export default function RoutineManagementPreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <RoutineManagementPreview />;
}

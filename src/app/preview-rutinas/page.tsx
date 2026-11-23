import { notFound } from "next/navigation";

import { RoutinePreview } from "./preview";

export default function RoutinePreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <RoutinePreview />;
}

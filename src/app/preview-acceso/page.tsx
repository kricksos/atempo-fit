import { notFound } from "next/navigation";

import { AccessPreview } from "./preview";

export default function AccessPreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <AccessPreview />;
}

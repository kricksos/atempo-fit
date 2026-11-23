import { notFound } from "next/navigation";

import { IllustrationPreview } from "./preview";

export default function IllustrationPreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound();

  return <IllustrationPreview />;
}

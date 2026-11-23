import { notFound } from "next/navigation";

import { PalettePreview } from "./preview";

export default function PalettePreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <PalettePreview />;
}

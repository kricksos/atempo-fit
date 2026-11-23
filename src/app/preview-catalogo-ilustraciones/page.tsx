import { notFound } from "next/navigation";

import { getManualExerciseCatalog } from "@/lib/manual-exercise-catalog-server";
import { getIllustrationTrials } from "@/lib/illustration-trials";
import { CatalogIllustrationPreview } from "./preview";

export default async function CatalogIllustrationPreviewPage({ searchParams }: { searchParams: Promise<{ lote?: string }> }) {
  if (process.env.NODE_ENV !== "development") notFound();

  const { lote } = await searchParams;
  const { catalog } = await getManualExerciseCatalog();
  const initialBatch = lote === "casa" ? "home" : lote === "casa2" ? "home2" : "all";
  return <CatalogIllustrationPreview catalog={getIllustrationTrials(catalog)} initialBatch={initialBatch} />;
}

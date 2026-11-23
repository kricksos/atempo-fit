import { notFound } from "next/navigation";
import { NutritionPreview } from "./preview";

export default function NutritionPreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <NutritionPreview />;
}

import { notFound } from "next/navigation";

import { HeaderMenusPreview } from "./preview";

export default function HeaderMenusPreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <HeaderMenusPreview />;
}

import { Sparkles } from "lucide-react";
import Link from "next/link";

export function GeneratePlanButton() {
  return <Link href="/plans/generate" className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#3d604c] px-5 py-3 text-sm font-semibold text-white"><Sparkles size={17} /> Generar mi plan</Link>;
}

import { readFile } from "node:fs/promises";
import path from "node:path";

import { hasIllustrationPreviewFrame } from "@/lib/illustration-preview";
import { hasIllustrationTrialFrame } from "@/lib/illustration-trials";

type Props = { params: Promise<{ id: string; frame: string }> };

export async function GET(_request: Request, { params }: Props) {
  if (process.env.NODE_ENV !== "development") return new Response(null, { status: 404 });
  const { id, frame: filename } = await params;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || !/^(start|mid|end|hold)\.webp$/.test(filename)) {
    return new Response(null, { status: 404 });
  }
  const frame = filename.slice(0, -5);
  const prepared = hasIllustrationPreviewFrame(id, frame);
  if (!prepared && !hasIllustrationTrialFrame(id, frame)) return new Response(null, { status: 404 });
  const bytes = await readFile(path.join(process.cwd(), "data", "illustration-library", prepared ? "prepared" : "images", id, filename));
  return new Response(new Uint8Array(bytes), {
    headers: { "Content-Type": "image/webp", "Cache-Control": "no-store" },
  });
}

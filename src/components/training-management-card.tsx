import { ArrowRight, Dumbbell } from "lucide-react";
import Link from "next/link";

export function TrainingManagementCard() {
  return (
    <section className="rounded-[1.5rem] border border-[#e1e7eb] bg-white p-6 shadow-[0_12px_36px_rgba(19,43,57,0.05)] sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#e7f6f3] text-[#08786f]"><Dumbbell size={21} aria-hidden="true" /></span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#657985]">Tu rutina</p>
            <h2 className="mt-1 text-base font-semibold text-[#172d32]">Gestiona tu entrenamiento</h2>
            <p className="mt-1 text-sm text-[#526e69]">Edita tu rutina, duplica una anterior, recupera una versión o crea una desde cero.</p>
          </div>
        </div>
        <Link href="/workout/builder" className="group inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[#dae3e8] bg-white px-4 py-2 text-sm font-semibold text-[#294654] transition-colors hover:bg-[#f3f7f8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08786f] motion-safe:transition-[background-color,box-shadow,translate,scale] motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-[0_8px_18px_rgba(24,35,31,0.2)] motion-safe:active:scale-[0.98]">
          Gestionar rutinas <ArrowRight size={16} aria-hidden="true" className="motion-safe:transition-[translate] motion-safe:group-hover:translate-x-0.5" />
        </Link>
      </div>
    </section>
  );
}

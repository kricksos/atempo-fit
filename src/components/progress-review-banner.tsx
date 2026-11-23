import { ArrowRight, LineChart } from "lucide-react";

export function ProgressReviewBanner({ href = "/checkin" }: { href?: string }) {
  return <section className="rounded-[1.5rem] border border-[#e1e7eb] bg-white p-5 shadow-[0_12px_36px_rgba(19,43,57,0.05)] sm:p-7">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex max-w-2xl items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#edf2ff] text-[#375dac]"><LineChart size={21} aria-hidden="true" /></span>
        <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#657985]">Revisión recomendada</p><h2 className="mt-1 text-xl font-semibold">¿Han cambiado tus objetivos o tu semana?</h2><p className="mt-2 text-sm leading-6 text-[#667d88]">Revisa tus datos de entrenamiento, nutrición, disponibilidad y molestias. Con esa información podemos actualizar tu dieta y tu rutina.</p></div>
      </div>
      <a href={href} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#d6e0f5] bg-white px-4 py-2 text-sm font-semibold text-[#375dac] transition-colors hover:bg-[#edf2ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#375dac]">Actualizar mi plan <ArrowRight size={16} aria-hidden="true" /></a>
    </div>
  </section>;
}

import { ArrowLeft } from 'lucide-react'

/* Cabeçalho e rodapé das páginas avulsas (/ruas-novas, /calcamento). */
export function SubpageHeader() {
  return (
    <header className="shell relative z-10 flex items-center justify-between pt-5 sm:pt-7">
      <a href="/" className="flex items-center gap-3" aria-label="Chapa Aquarius Sem Buracos — página inicial">
        <picture>
          <source srcSet="/assets/logo-480.webp" type="image/webp" />
          <img src="/assets/logo-800.png" alt="" width="480" height="370" className="h-20 w-auto drop-shadow-[0_8px_20px_rgba(0,0,0,0.4)] sm:h-28" />
        </picture>
      </a>
      <a
        href="/"
        className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-[0.8rem] font-semibold text-white/85 transition-colors hover:border-gold-400/60 hover:text-white"
      >
        <ArrowLeft size={15} strokeWidth={2.6} aria-hidden="true" />
        Voltar ao site
      </a>
    </header>
  )
}

export function SubpageFooter() {
  return (
    <footer className="bg-sky-950 py-10">
      <div className="shell flex flex-col items-center gap-5 text-center">
        <a
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-gold-400 px-6 py-3 text-[0.88rem] font-bold text-navy-900 transition-colors hover:bg-gold-300"
        >
          Conheça todas as propostas
        </a>
        <p className="text-[0.76rem] leading-relaxed text-white/60">
          Material de campanha da chapa Aquarius Sem Buracos — candidata à administração do Residencial Aquarius.
          <br className="hidden sm:block" /> Conteúdo de responsabilidade da própria chapa.
        </p>
      </div>
    </footer>
  )
}

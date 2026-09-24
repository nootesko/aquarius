import { motion, useReducedMotion } from 'motion/react'
import { ArrowUpRight, ImageOff } from 'lucide-react'
import { instagram } from '../content.js'
import { Reveal } from '../components/Reveal.jsx'
import { SectionHeading } from '../components/SectionHeading.jsx'
import { Carousel } from '../components/Carousel.jsx'
import { SPRING } from '../lib/motion.js'

/* O Lucide não traz mais ícones de marca, então o glifo do Instagram é desenhado aqui. */
function InstagramGlyph({ size = 20, className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x="2" y="2" width="20" height="20" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.6" cy="6.4" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function PostCard({ post }) {
  const reduce = useReducedMotion()

  return (
    <motion.a
      href={post.url || instagram.url}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={reduce ? undefined : { y: -6 }}
      transition={SPRING.soft}
      className="group relative block h-full overflow-hidden rounded-3xl border border-paper-300 bg-paper-50 shadow-[0_18px_40px_-30px_rgba(10,23,48,0.4)]"
    >
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-paper-200 to-paper-300">
        {post.image ? (
          <motion.img
            src={post.image}
            alt={post.caption || 'Publicação da chapa no Instagram'}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
            whileHover={reduce ? undefined : { scale: 1.06 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-ink-500">
            <ImageOff size={30} strokeWidth={1.6} aria-hidden="true" />
          </div>
        )}

        <span className="absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-paper-50/90 text-ink-900 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <ArrowUpRight size={17} strokeWidth={2.4} aria-hidden="true" />
        </span>
      </div>

      {post.caption && (
        <p className="line-clamp-3 p-5 text-[0.9rem] leading-relaxed text-ink-600">{post.caption}</p>
      )}
    </motion.a>
  )
}

export function InstagramFeed() {
  const reduce = useReducedMotion()
  const posts = instagram.posts ?? []

  return (
    <section id="instagram" className="relative scroll-mt-20 overflow-hidden bg-paper-50 py-24 sm:py-32">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(55%_40%_at_15%_0%,rgba(43,143,232,0.1),transparent_60%)]"
      />

      <div className="shell relative">
        <SectionHeading
          overline={instagram.overline}
          title={instagram.title}
          lead={instagram.lead}
          align="center"
          tone="light"
        />

        <Reveal className="mt-8 flex justify-center" delay={0.08}>
          <motion.a
            href={instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={reduce ? undefined : { scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={SPRING.pop}
            className="inline-flex items-center gap-2.5 rounded-full border border-paper-300 bg-paper-50 px-5 py-3 text-[0.88rem] font-semibold text-ink-900 shadow-[0_10px_24px_-16px_rgba(10,23,48,0.5)] transition-colors hover:border-brand-500 hover:text-brand-700"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[linear-gradient(45deg,#feda75_0%,#fa7e1e_25%,#d62976_50%,#962fbf_75%,#4f5bd5_100%)] text-white">
              <InstagramGlyph size={17} />
            </span>
            {instagram.handle}
            <ArrowUpRight size={16} strokeWidth={2.4} aria-hidden="true" className="text-ink-500" />
          </motion.a>
        </Reveal>

        {posts.length > 0 ? (
          <Reveal className="mt-14" delay={0.05}>
            <Carousel
              label="Últimas publicações no Instagram"
              tone="light"
              itemClass="w-[74vw] max-w-[18rem] sm:w-[16.5rem] lg:w-[18rem]"
            >
              {posts.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </Carousel>
          </Reveal>
        ) : (
          <Reveal className="mt-12" delay={0.05}>
            <div className="mx-auto max-w-2xl rounded-3xl border border-dashed border-paper-300 bg-paper-100 p-10 text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[linear-gradient(45deg,#feda75_0%,#fa7e1e_25%,#d62976_50%,#962fbf_75%,#4f5bd5_100%)] text-white">
                <InstagramGlyph size={24} />
              </span>
              <p className="display mt-6 text-[1.2rem] text-ink-900">As publicações aparecem aqui</p>
              <p className="mx-auto mt-3 max-w-md text-[0.94rem] leading-relaxed text-ink-600">
                Assim que as primeiras postagens da chapa forem cadastradas, elas entram neste carrossel. Enquanto
                isso, siga o perfil para acompanhar tudo.
              </p>
              <a
                href={instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-navy-900 px-6 py-3 text-[0.8rem] font-bold tracking-[0.12em] text-white uppercase transition-colors hover:bg-navy-800"
              >
                Seguir no Instagram
                <ArrowUpRight size={16} strokeWidth={2.6} aria-hidden="true" />
              </a>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  )
}

/* Faixa infinita em CSS puro (sem JS por frame) — barata e suave no celular.
   O conteúdo é duplicado e a animação anda -50%, criando o loop perfeito. */
export function Marquee({
  items,
  speed = 34,
  reverse = false,
  className = '',
  itemClassName = '',
  separator = '◆',
}) {
  const row = (
    <div className="flex shrink-0 items-center">
      {items.map((t, i) => (
        <span key={`${t}-${i}`} className={`flex shrink-0 items-center ${itemClassName}`}>
          {t}
          <span aria-hidden="true" className="mx-5 text-[0.5em] opacity-45 sm:mx-7">
            {separator}
          </span>
        </span>
      ))}
    </div>
  )

  return (
    <div className={`relative flex w-full overflow-hidden ${className}`} aria-hidden="true">
      <div
        className="flex w-max"
        style={{
          animation: `marquee-x ${speed}s linear infinite`,
          animationDirection: reverse ? 'reverse' : 'normal',
        }}
      >
        {row}
        {row}
      </div>
    </div>
  )
}

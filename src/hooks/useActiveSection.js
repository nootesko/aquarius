import { useEffect, useState } from 'react'

/* Marca no menu a seção que está sendo lida no momento. */
export function useActiveSection(ids, rootMargin = '-45% 0px -50% 0px') {
  const [active, setActive] = useState(ids[0])

  useEffect(() => {
    const nodes = ids.map((id) => document.getElementById(id)).filter(Boolean)
    if (!nodes.length) return

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActive(visible.target.id)
      },
      { rootMargin, threshold: [0, 0.25, 0.6, 1] },
    )

    nodes.forEach((n) => obs.observe(n))
    return () => obs.disconnect()
  }, [ids, rootMargin])

  return active
}

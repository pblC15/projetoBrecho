import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Product } from '../types'
import ProductCard from './ProductCard'

type Props = {
  products: Product[]
  loading?: boolean
  eyebrow?: string
  title?: string
  className?: string
}

const AUTOPLAY_INTERVAL = 5000

/*
  Vitrine em carrossel com os produtos mais recentes.
  Não exibe filtros de categoria.
*/
export default function RecentProductsCarousel({
  products,
  loading = false,
  eyebrow = 'Acabou de chegar',
  title = 'Novidades no brechó',
  className = '',
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const updateArrows = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    setCanPrev(track.scrollLeft > 4)
    setCanNext(track.scrollLeft + track.clientWidth < track.scrollWidth - 4)
  }, [])

  const scrollByCard = useCallback((direction: 1 | -1, loop = false) => {
    const track = trackRef.current
    if (!track) return

    const card = track.querySelector<HTMLElement>('.recent-carousel-item')
    const gap = parseFloat(getComputedStyle(track).columnGap || '0') || 0
    const step = (card?.offsetWidth || track.clientWidth) + gap
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4

    if (loop && direction === 1 && atEnd) {
      track.scrollTo({ left: 0, behavior: 'smooth' })
      return
    }

    track.scrollBy({ left: step * direction, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    updateArrows()
    window.addEventListener('resize', updateArrows)
    return () => window.removeEventListener('resize', updateArrows)
  }, [products, updateArrows])

  useEffect(() => {
    if (paused || products.length < 2) return
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const id = window.setInterval(() => scrollByCard(1, true), AUTOPLAY_INTERVAL)
    return () => window.clearInterval(id)
  }, [paused, products.length, scrollByCard])

  if (!loading && !products.length) return null

  return (
    <section className={`recent-products ${className}`} aria-label={title}>
      <div className="container section recent-products-shell">
        <div className="recent-products-heading">
          <div>
            <span className="eyebrow">{eyebrow}</span>
            <h2>{title}</h2>
          </div>

          {products.length > 1 && (
            <div className="recent-carousel-controls">
              <button type="button" onClick={() => scrollByCard(-1)} disabled={!canPrev} aria-label="Produtos anteriores">
                <ChevronLeft size={20} />
              </button>
              <button type="button" onClick={() => scrollByCard(1)} disabled={!canNext} aria-label="Próximos produtos">
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <p>Carregando novidades...</p>
        ) : (
          <div
            className="recent-carousel-track"
            ref={trackRef}
            onScroll={updateArrows}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            onTouchStart={() => setPaused(true)}
          >
            {products.map((product) => (
              <div className="recent-carousel-item" key={product.id}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

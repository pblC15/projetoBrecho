import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'

const slides = [
  '/assets/banner1.jpg',
  '/assets/banner2.jpg',
  '/assets/banner3.jpg',
  '/assets/banner4.png',
]

export default function BannerCarousel() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length)
    }, 5000)
    return () => window.clearInterval(id)
  }, [])

  const move = (direction: number) => {
    setIndex((current) => (current + direction + slides.length) % slides.length)
  }

  return (
    <section className="carousel" aria-label="Destaques">
      <img src={slides[index]} alt={`Banner ${index + 1} do Brechó Luz do Luar`} />
      <button className="carousel-button left" onClick={() => move(-1)} aria-label="Banner anterior">
        <ChevronLeft />
      </button>
      <button className="carousel-button right" onClick={() => move(1)} aria-label="Próximo banner">
        <ChevronRight />
      </button>

      <div className="dots">
        {slides.map((_, i) => (
          <button
            key={i}
            className={i === index ? 'dot active' : 'dot'}
            onClick={() => setIndex(i)}
            aria-label={`Ir para banner ${i + 1}`}
          />
        ))}
      </div>
    </section>
  )
}

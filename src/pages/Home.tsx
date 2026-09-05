import { Clock3, Instagram, MapPin } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import BannerCarousel from '../components/BannerCarousel'
import ProductCard from '../components/ProductCard'
import StoreLocation from '../components/StoreLocation'
import { listProducts } from '../lib/products'
import { INSTAGRAM_URL } from '../lib/store'
import type { Product } from '../types'

const categories = [
  'Todos',
  'Vestidos',
  'Blusas',
  'Calças',
  'Casacos',
  'Acessórios',
]

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [category, setCategory] = useState('Todos')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listProducts()
      .then(setProducts)
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    if (category === 'Todos') return products

    return products.filter(
      (p) => p.category === category
    )
  }, [category, products])

  return (
    <>
      <BannerCarousel />

      <section className="intro home-section home-section-intro">
        <div className="container intro-grid">
          <div>
            <span className="eyebrow">
              Brechó Luz do Luar
            </span>

            <h1>
              Estilo com história e uma segunda chance.
            </h1>
          </div>

          <p>
            Curadoria de peças únicas para quem gosta de
            vestir personalidade sem desperdiçar planeta.
            Escolha sua peça e finalize o atendimento
            diretamente com a nossa equipe pelo WhatsApp.
          </p>
        </div>
      </section>

      <section className="quick-info-section" aria-label="Informações rápidas da loja">
        <div className="container quick-info-grid">
          <div className="quick-info-item">
            <Clock3 size={24} />
            <div>
              <strong>Horário da loja física</strong>
              <span>Ter/Qua 10:30–18h • Qui/Sex 10–18h • Sáb 9–13h</span>
            </div>
          </div>

          <a className="quick-info-item" href="/#loja">
            <MapPin size={24} />
            <div>
              <strong>Visite no Catete</strong>
              <span>Rua Bento Lisboa, 151 • Rio de Janeiro</span>
            </div>
          </a>

          <a className="quick-info-item quick-info-instagram" href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
            <Instagram size={24} />
            <div>
              <strong>Novidades no Instagram</strong>
              <span>Siga @brecholuzdoluarrj</span>
            </div>
          </a>
        </div>
      </section>

      <section id="produtos" className="home-products home-section">
        <div className="container section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                Vitrine
              </span>

              <h2>
                Achadinhos esperando por você
              </h2>
            </div>

            <div className="filters">
              {categories.map((item) => (
                <button
                  key={item}
                  className={
                    item === category
                      ? 'filter active'
                      : 'filter'
                  }
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p>Carregando peças...</p>
          ) : (
            <div className="product-grid">
              {filtered.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="sobre" className="sustainability home-section">
        <div className="container sustainability-grid">
          <img
            src="/assets/logo-claro.png"
            alt=""
          />

          <div>
            <span className="eyebrow light">
              Moda circular
            </span>

            <h2>
              Comprar usado é prolongar histórias.
            </h2>

            <p>
              Cada peça que volta a circular economiza
              recursos e reduz descarte. Aqui,
              sustentabilidade ganha cabide, textura e
              um novo look.
            </p>
          </div>
        </div>
      </section>

      <StoreLocation />
    </>
  )
}

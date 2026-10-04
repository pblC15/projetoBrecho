import { Clock3, Instagram, MapPin } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import BannerCarousel from '../components/BannerCarousel'
import CategoryDropdown from '../components/CategoryDropdown'
import ProductCard from '../components/ProductCard'
import RecentProductsCarousel from '../components/RecentProductsCarousel'
import StoreLocation from '../components/StoreLocation'
import { useCatalog } from '../hooks/useCatalog'
import { getRecentProducts } from '../lib/catalog'
import { INSTAGRAM_URL } from '../lib/store'

const ALL = 'Todos'

/* Quantidade de categorias exibidas diretamente na vitrine */
const SHOWCASE_VISIBLE_CATEGORIES = 4

export default function Home() {
  const { products, categories, loading } = useCatalog()
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()

  const category = searchParams.get('categoria') || ALL

  const visibleCategories = categories.slice(0, SHOWCASE_VISIBLE_CATEGORIES)
  const moreCategories = categories.slice(SHOWCASE_VISIBLE_CATEGORIES)

  const recentProducts = useMemo(() => getRecentProducts(products, 5), [products])

  const filtered = useMemo(() => {
    if (category === ALL) return products
    return products.filter((product) => product.category === category)
  }, [category, products])

  /*
    Rola até a seção indicada na URL (ex.: /?categoria=Vestidos#produtos),
    inclusive quando o usuário vem de outra página.
  */
  useEffect(() => {
    if (!location.hash || loading) return
    if ((location.state as { skipScroll?: boolean } | null)?.skipScroll) return
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)))
    if (target) {
      window.requestAnimationFrame(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    }
  }, [location.key, location.hash, location.state, loading])

  function selectCategory(name: string) {
    const params = new URLSearchParams(searchParams)
    if (name === ALL) params.delete('categoria')
    else params.set('categoria', name)
    setSearchParams(params, { replace: true, preventScrollReset: true, state: { skipScroll: true } })
  }

  return (
    <>
      <BannerCarousel />

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

      {/* Nova vitrine: carrossel com os 5 produtos mais recentes */}
      <RecentProductsCarousel
        products={recentProducts}
        loading={loading}
        className="home-section"
      />

      <section id="sobre" className="sustainability home-section">
        <div className="container sustainability-grid">
          <img src="/assets/logo-claro.png" alt="" />

          <div>
            <span className="eyebrow light">Moda circular</span>
            <h2>Comprar usado é prolongar histórias.</h2>
            <p>
              Cada peça que volta a circular economiza
              recursos e reduz descarte. Aqui,
              sustentabilidade ganha cabide, textura e
              um novo look.
            </p>
          </div>
        </div>
      </section>

      {/* Vitrine completa com filtro de categorias (abaixo de "Moda circular") */}
      <section id="produtos" className="home-products home-section">
        <div className="container section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Vitrine</span>
              <h2>Achadinhos esperando por você</h2>
            </div>

            <div className="filters">
              <button
                type="button"
                className={category === ALL ? 'filter active' : 'filter'}
                onClick={() => selectCategory(ALL)}
              >
                {ALL}
              </button>

              {visibleCategories.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={item.name === category ? 'filter active' : 'filter'}
                  onClick={() => selectCategory(item.name)}
                >
                  {item.name}
                </button>
              ))}

              <CategoryDropdown
                variant="filter"
                label="Mais categorias"
                items={moreCategories}
                activeName={category}
                onSelect={selectCategory}
              />
            </div>
          </div>

          {loading ? (
            <p>Carregando peças...</p>
          ) : filtered.length ? (
            <div className="product-grid">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="empty-showcase">Nenhuma peça disponível nesta categoria no momento.</p>
          )}
        </div>
      </section>

      <StoreLocation />
    </>
  )
}

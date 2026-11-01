import Seo from '../components/Seo'
import { onAuthStateChanged } from 'firebase/auth'
import { ArrowLeft, Instagram, MessageCircle, Ruler, Sparkles, ZoomIn, X } from 'lucide-react'
import { useEffect, useMemo, useState, type PointerEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import RecentProductsCarousel from '../components/RecentProductsCarousel'
import { useCatalog } from '../hooks/useCatalog'
import { getRecentProducts } from '../lib/catalog'
import { auth } from '../lib/firebase'
import { getProduct } from '../lib/products'
import { INSTAGRAM_URL } from '../lib/store'
import { whatsappLink } from '../lib/whatsapp'
import type { Product } from '../types'

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export default function ProductPage() {
  const { id } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState('')
  const [zoomOpen, setZoomOpen] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 })
  const [isAdmin, setIsAdmin] = useState(false)
  const { products: catalogProducts, loading: catalogLoading } = useCatalog()

  /* Produtos recentes, sem repetir a peça que está aberta */
  const recentProducts = useMemo(
    () => getRecentProducts(catalogProducts, 5, id),
    [catalogProducts, id]
  )

  useEffect(() => onAuthStateChanged(auth, (user) => setIsAdmin(Boolean(user))), [])

  useEffect(() => {
    /* Ao abrir outra peça (ex.: pelo carrossel), volta ao topo da página */
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    setZoomOpen(false)

    if (!id) {
      setLoading(false)
      return
    }

    setLoading(true)
    getProduct(id)
      .then((found) => {
        setProduct(found)
        if (found) setSelectedImage(found.imageUrls?.[0] || found.imageUrl)
      })
      .finally(() => setLoading(false))
  }, [id])

  const images = useMemo(() => {
    if (!product) return []
    if (product.imageUrls?.length) return product.imageUrls
    return product.imageUrl ? [product.imageUrl] : []
  }, [product])

  function updateZoomPosition(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    setZoomPosition({
      x: Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100)),
      y: Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100)),
    })
  }

  if (loading) return <main className="container section"><p>Carregando produto...</p></main>
  if (!product) return <><Seo title="Produto não encontrado | Brechó Luz do Luar" description="Produto indisponível." noIndex /><main className="container section"><h1>Produto não encontrado.</h1></main></>

  return (
    <main className="product-page">
      <Seo title={`${product.name} | Brechó Luz do Luar`} description={`${product.name}. ${product.description || `Peça selecionada do Brechó Luz do Luar no Catete, Rio de Janeiro.`}`.slice(0, 155)} path={`/produto/${encodeURIComponent(product.id)}`} image={product.imageUrls?.[0] || product.imageUrl} product={{ name: product.name, description: product.description || product.name, image: product.imageUrls?.[0] || product.imageUrl, price: product.price, sold: product.sold }} />
      <div className="container section product-section-shell">
        <div className="product-back-row">
          <Link className="back-link" to="/"><ArrowLeft size={18} />Voltar para a vitrine</Link>
          {isAdmin && <Link className="admin-back-link" to="/admin"><ArrowLeft size={18} />Voltar para a listagem do administrador</Link>}
        </div>

        <div className="product-detail">
          <div className="product-gallery">
            <button
              type="button"
              className="product-detail-image zoom-trigger"
              onClick={() => setZoomOpen(true)}
              aria-label="Ampliar imagem do produto"
            >
              {selectedImage && <img src={selectedImage} alt={product.name} />}
              <span className="zoom-hint"><ZoomIn size={18} /> Clique para ampliar</span>
            </button>

            {images.length > 1 && (
              <div className="product-thumbnails">
                {images.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    className={selectedImage === image ? 'product-thumbnail active' : 'product-thumbnail'}
                    onClick={() => setSelectedImage(image)}
                    aria-label={`Visualizar imagem ${index + 1} de ${product.name}`}
                  >
                    <img src={image} alt={`${product.name} - imagem ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}

            {!!product.videoUrls?.length && (
              <div className="product-videos">
                <div className="product-media-heading"><span className="eyebrow">Vídeos da peça</span><strong>Veja detalhes em movimento</strong></div>
                <div className="product-video-grid">
                  {product.videoUrls.map((url, index) => (
                    <video key={url} src={url} controls preload="metadata" playsInline aria-label={`Vídeo ${index + 1} de ${product.name}`} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="product-detail-content">
            <span className="eyebrow">{product.category}</span>
            <h1>{product.name}</h1>
            <div className="detail-price">{money.format(product.price)}</div>
            <p className="detail-description">{product.description}</p>

            <div className="detail-boxes">
              {product.size && <div className="detail-box"><Sparkles size={20} /><div><small>Tamanho</small><strong>{product.size}</strong></div></div>}
              {product.measurements && <div className="detail-box"><Ruler size={20} /><div><small>Medidas</small><strong>{product.measurements}</strong></div></div>}
              {product.condition && <div className="detail-box"><Sparkles size={20} /><div><small>Estado</small><strong>{product.condition}</strong></div></div>}
            </div>

            <a
              className={`whatsapp-button ${product.sold ? 'disabled' : ''}`}
              href={product.sold ? undefined : whatsappLink(product)}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={22} />
              {product.sold ? 'Produto vendido' : 'Comprar pelo WhatsApp'}
            </a>

            <p className="purchase-note">A compra não é concluída no site. O botão abre uma conversa com a loja já levando os dados desta peça.</p>
          </div>
        </div>
      </div>

      <section className="product-instagram-section">
        <div className="container product-instagram-card">
          <div className="product-instagram-icon"><Instagram size={34} /></div>
          <div>
            <span className="eyebrow light">Mais achadinhos todos os dias</span>
            <h2>Continue o garimpo no Instagram.</h2>
            <p>Novidades, peças recém-chegadas e bastidores da loja aparecem por lá. Siga o Brechó Luz do Luar para não perder os próximos achados.</p>
          </div>
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="instagram-cta"><Instagram size={19} />Seguir @brecholuzdoluarrj</a>
        </div>
      </section>

      <RecentProductsCarousel
        products={recentProducts}
        loading={catalogLoading}
        className="product-recent-products"
      />

      {zoomOpen && selectedImage && (
        <div className="zoom-modal" role="dialog" aria-modal="true" aria-label="Visualização ampliada da imagem">
          <button className="zoom-close" type="button" onClick={() => setZoomOpen(false)} aria-label="Fechar zoom"><X size={24} /></button>
          <div className="zoom-stage" onPointerMove={updateZoomPosition} onClick={() => setZoomOpen(false)}>
            <img
              src={selectedImage}
              alt={`${product.name} ampliado`}
              style={{ transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` }}
            />
            <div className="zoom-lens" style={{ left: `${zoomPosition.x}%`, top: `${zoomPosition.y}%` }}><ZoomIn size={18} /></div>
          </div>
          <p className="zoom-instruction">Mova o cursor sobre a imagem para explorar os detalhes. Clique para fechar.</p>
        </div>
      )}
    </main>
  )
}

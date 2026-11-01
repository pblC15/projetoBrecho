import { useEffect } from 'react'

const BASE = 'https://lojabrecholuzdoluar.com.br'
const DEFAULT_IMAGE = `${BASE}/assets/loja/fachada.jpeg`

type SeoProps = { title: string; description: string; path?: string; image?: string; noIndex?: boolean; product?: { name: string; description: string; image: string; price: number; currency?: string; sold?: boolean } }

function setMeta(key: string, value: string, property = false) {
  const selector = property ? `meta[property="${key}"]` : `meta[name="${key}"]`
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) { el = document.createElement('meta'); el.setAttribute(property ? 'property' : 'name', key); document.head.appendChild(el) }
  el.content = value
}

export default function Seo({ title, description, path = '/', image = DEFAULT_IMAGE, noIndex = false, product }: SeoProps) {
  useEffect(() => {
    const url = new URL(path, BASE).href
    const safeImage = image.startsWith('https://') ? image : DEFAULT_IMAGE
    document.title = title
    setMeta('description', description)
    setMeta('robots', noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large')
    setMeta('og:title', title, true)
    setMeta('og:description', description, true)
    setMeta('og:url', url, true)
    setMeta('og:image', safeImage, true)
    setMeta('og:type', product ? 'product' : 'website', true)
    setMeta('twitter:title', title)
    setMeta('twitter:description', description)
    setMeta('twitter:image', safeImage)
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical) }
    canonical.href = url
    document.getElementById('seo-product-jsonld')?.remove()
    if (product && !noIndex) {
      const script = document.createElement('script')
      script.id = 'seo-product-jsonld'
      script.type = 'application/ld+json'
      script.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Product', name: product.name, description: product.description, image: product.image, url, offers: { '@type': 'Offer', priceCurrency: product.currency || 'BRL', price: product.price, availability: product.sold ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock', url, seller: { '@type': 'Organization', name: 'Brechó Luz do Luar' } } })
      document.head.appendChild(script)
    }
    return () => { document.getElementById('seo-product-jsonld')?.remove() }
  }, [title, description, path, image, noIndex, product?.name, product?.description, product?.image, product?.price, product?.sold])
  return null
}

import { Link } from 'react-router-dom'
import type { Product } from '../types'

const money = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link to={`/produto/${product.id}`} className="product-card">
      <div className="product-image-wrap">
        <img src={product.imageUrl} alt={product.name} loading="lazy" />
        {product.sold && <span className="badge sold">Vendido</span>}
        {!product.sold && product.featured && <span className="badge">Destaque</span>}
      </div>
      <div className="product-info">
        <span className="category">{product.category}</span>
        <h3>{product.name}</h3>
        <div className="product-meta">
          <strong>{money.format(product.price)}</strong>
          {product.size && <span>Tam. {product.size}</span>}
        </div>
      </div>
    </Link>
  )
}

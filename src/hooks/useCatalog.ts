import { useEffect, useState } from 'react'
import { loadCatalog, onCatalogChange, type Catalog } from '../lib/catalog'

const emptyCatalog: Catalog = { products: [], categories: [] }

export function useCatalog() {
  const [catalog, setCatalog] = useState<Catalog>(emptyCatalog)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    function load() {
      loadCatalog()
        .then((data) => {
          if (active) setCatalog(data)
        })
        .catch((error) => console.error('Erro ao carregar catálogo:', error))
        .finally(() => {
          if (active) setLoading(false)
        })
    }

    load()
    const unsubscribe = onCatalogChange(load)

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  return { ...catalog, loading }
}

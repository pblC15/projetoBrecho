import { listCategories } from './categories'
import { listProducts } from './products'
import { toMillis } from './dates'
import type { Category, Product } from '../types'

export type CategoryWithCount = Category & { productCount: number }

export type Catalog = {
  products: Product[]
  categories: CategoryWithCount[]
}

const CATALOG_CHANGED_EVENT = 'catalog:changed'

let catalogPromise: Promise<Catalog> | null = null

/*
  Ordena as categorias pela quantidade de produtos
  (maior para menor). Em caso de empate, ordena pelo nome.
*/
export function sortCategoriesByProductCount(
  categories: Category[],
  products: Product[]
): CategoryWithCount[] {
  const counts = new Map<string, number>()

  products.forEach((product) => {
    counts.set(product.category, (counts.get(product.category) || 0) + 1)
  })

  return categories
    .map((category) => ({
      ...category,
      productCount: counts.get(category.name) || 0,
    }))
    .sort(
      (a, b) =>
        b.productCount - a.productCount ||
        a.name.localeCompare(b.name, 'pt-BR')
    )
}

export function getRecentProducts(products: Product[], limit = 5, excludeId?: string) {
  return [...products]
    .filter((product) => product.id !== excludeId)
    .sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt))
    .slice(0, limit)
}

async function fetchCatalog(): Promise<Catalog> {
  const [products, registeredCategories] = await Promise.all([
    listProducts(),
    listCategories().catch((error) => {
      console.error('Erro ao carregar categorias:', error)
      return []
    }),
  ])

  /*
    Sem categorias cadastradas (ex.: modo demonstração sem Firebase),
    as categorias são montadas a partir dos próprios produtos.
  */
  const categories: Category[] = registeredCategories.length
    ? registeredCategories
    : Array.from(new Set(products.map((product) => product.category)))
        .filter(Boolean)
        .map((name) => ({ id: name, name }))

  return {
    products,
    categories: sortCategoriesByProductCount(categories, products),
  }
}

/*
  Cache compartilhado: cabeçalho, rodapé, home e página de produto
  usam a mesma requisição em vez de buscar os dados várias vezes.
*/
export function loadCatalog(force = false) {
  if (!catalogPromise || force) {
    catalogPromise = fetchCatalog().catch((error) => {
      catalogPromise = null
      throw error
    })
  }

  return catalogPromise
}

/*
  Chamado pela área administrativa após cadastrar, editar ou excluir
  produtos/categorias, para atualizar menus e vitrines imediatamente.
*/
export function invalidateCatalog() {
  catalogPromise = null
  window.dispatchEvent(new Event(CATALOG_CHANGED_EVENT))
}

export function onCatalogChange(callback: () => void) {
  window.addEventListener(CATALOG_CHANGED_EVENT, callback)
  return () => window.removeEventListener(CATALOG_CHANGED_EVENT, callback)
}

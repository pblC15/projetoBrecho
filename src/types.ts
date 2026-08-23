export type Product = {
  id: string
  name: string
  description: string
  category: string
  price: number
  size?: string
  measurements?: string
  condition?: string

  // Imagem principal
  imageUrl: string

  // Galeria, máximo 5
  imageUrls?: string[]

  featured?: boolean
  sold?: boolean

  createdAt?: unknown
  updatedAt?: unknown
}

export type Category = {
  id: string
  name: string
  createdAt?: unknown
  updatedAt?: unknown
}
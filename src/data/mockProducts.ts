import type { Product } from '../types'

export const mockProducts: Product[] = [
  {
    id: 'vestido-floral',
    name: 'Vestido Floral Vintage',
    description: 'Vestido leve com estampa floral, ótimo caimento e acabamento delicado.',
    category: 'Vestidos',
    price: 89.9,
    size: 'M',
    measurements: 'Busto 92 cm • Cintura 76 cm • Comprimento 112 cm',
    condition: 'Excelente',
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=80',
    featured: true
  },
  {
    id: 'jaqueta-jeans',
    name: 'Jaqueta Jeans Clássica',
    description: 'Jaqueta jeans de lavagem média, versátil para compor looks casuais.',
    category: 'Casacos',
    price: 119.9,
    size: 'G',
    measurements: 'Ombro 44 cm • Busto 104 cm • Comprimento 62 cm',
    condition: 'Muito bom',
    imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1000&q=80',
    featured: true
  },
  {
    id: 'bolsa-caramelo',
    name: 'Bolsa Caramelo',
    description: 'Bolsa estruturada em tom caramelo, prática e elegante.',
    category: 'Acessórios',
    price: 69.9,
    measurements: '30 x 22 x 10 cm',
    condition: 'Excelente',
    imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80',
    featured: true
  },
  {
    id: 'camisa-verde',
    name: 'Camisa Verde',
    description: 'Camisa de tecido fluido em verde, peça coringa para looks leves.',
    category: 'Blusas',
    price: 59.9,
    size: 'M',
    measurements: 'Busto 96 cm • Comprimento 67 cm',
    condition: 'Muito bom',
    imageUrl: 'https://images.unsplash.com/photo-1608234807905-4466023792f5?auto=format&fit=crop&w=1000&q=80'
  }
]

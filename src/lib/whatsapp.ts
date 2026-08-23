import type { Product } from '../types'

export function whatsappLink(product: Product) {
  const number = import.meta.env.VITE_WHATSAPP_NUMBER || '5521982202283'
  const text = [
    'Olá! Tenho interesse neste produto do Brechó Luz do Luar:',
    '',
    `Produto: ${product.name}`,
    `Categoria: ${product.category}`,
    `Preço: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}`,
    product.size ? `Tamanho: ${product.size}` : '',
    product.measurements ? `Medidas: ${product.measurements}` : '',
    '',
    `Link: ${window.location.href}`,
    '',
    'Gostaria de saber se ainda está disponível.'
  ].filter(Boolean).join('\n')

  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`
}

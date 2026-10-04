export function categoryUrl(category: string) {
  return `/?categoria=${encodeURIComponent(category)}#produtos`
}

export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

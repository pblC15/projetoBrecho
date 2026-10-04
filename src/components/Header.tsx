import { Instagram, LockKeyhole, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useCatalog } from '../hooks/useCatalog'
import { categoryUrl, scrollToTop } from '../lib/navigation'
import { INSTAGRAM_URL } from '../lib/store'
import CategoryDropdown from './CategoryDropdown'

/* Quantidade de categorias exibidas diretamente no cabeçalho */
const HEADER_VISIBLE_CATEGORIES = 6

export default function Header() {
  const [open, setOpen] = useState(false)
  const { categories } = useCatalog()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const activeCategory = location.pathname === '/' ? searchParams.get('categoria') || '' : ''
  const visibleCategories = categories.slice(0, HEADER_VISIBLE_CATEGORIES)
  const moreCategories = categories.slice(HEADER_VISIBLE_CATEGORIES)

  function goHome() {
    setOpen(false)
    scrollToTop()
  }

  function goToCategory(name: string) {
    setOpen(false)
    navigate(categoryUrl(name))
  }

  return (
    <>
      <div className="topbar">
        <div className="container topbar-inner">
          <span>Moda circular • Peças únicas • Atendimento pelo WhatsApp</span>
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
            <Instagram size={15} />
            @brecholuzdoluarrj
          </a>
        </div>
      </div>

      <header className="header">
        <div className="container header-main">
          <Link to="/" className="brand" aria-label="Ir para a página inicial" onClick={goHome}>
            <img src="/assets/logo-verde-escuro.png" alt="Brechó Luz do Luar" />
          </Link>

          <nav className="desktop-nav" aria-label="Navegação principal">
            <Link to="/" onClick={goHome} className={location.pathname === '/' ? 'active' : ''}>Início</Link>
            <a href="/#produtos">Produtos</a>
            <a href="/#sobre">Sobre</a>
            <a href="/#loja">Loja física</a>
            <a href="/#contato">Contato</a>
            <a className="instagram-nav-link" href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
              <Instagram size={17} />
              Instagram
            </a>
            <Link className="admin-nav-button" to="/admin">
              <LockKeyhole size={17} />
              Admin
            </Link>
          </nav>

          <button className="menu-button" onClick={() => setOpen(!open)} aria-label="Abrir menu">
            {open ? <X /> : <Menu />}
          </button>
        </div>

        {categories.length > 0 && (
          <div className="category-bar">
            <nav className="container categories" aria-label="Categorias">
              {visibleCategories.map((category) => (
                <Link
                  key={category.id}
                  to={categoryUrl(category.name)}
                  className={category.name === activeCategory ? 'active' : ''}
                >
                  {category.name}
                </Link>
              ))}

              <CategoryDropdown
                items={moreCategories}
                activeName={activeCategory}
                onSelect={goToCategory}
              />
            </nav>
          </div>
        )}

        {open && (
          <nav className="mobile-nav container">
            <Link to="/" onClick={goHome}>Início</Link>
            <a href="/#produtos" onClick={() => setOpen(false)}>Produtos</a>
            <a href="/#sobre" onClick={() => setOpen(false)}>Sobre</a>
            <a href="/#loja" onClick={() => setOpen(false)}>Loja física</a>
            <a href="/#contato" onClick={() => setOpen(false)}>Contato</a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" onClick={() => setOpen(false)}>Instagram</a>
            <Link to="/admin" onClick={() => setOpen(false)}>Área administrativa</Link>

            {categories.length > 0 && (
              <div className="mobile-categories">
                <span className="mobile-categories-title">Categorias</span>
                <div className="mobile-categories-list">
                  {visibleCategories.map((category) => (
                    <Link
                      key={category.id}
                      to={categoryUrl(category.name)}
                      className={category.name === activeCategory ? 'active' : ''}
                      onClick={() => setOpen(false)}
                    >
                      {category.name}
                    </Link>
                  ))}
                  <CategoryDropdown
                    items={moreCategories}
                    activeName={activeCategory}
                    onSelect={goToCategory}
                  />
                </div>
              </div>
            )}
          </nav>
        )}
      </header>
    </>
  )
}

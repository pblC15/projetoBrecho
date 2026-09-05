import { Instagram, LockKeyhole, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { INSTAGRAM_URL } from '../lib/store'

const categories = ['Novidades', 'Vestidos', 'Blusas', 'Calças', 'Casacos', 'Acessórios']

export default function Header() {
  const [open, setOpen] = useState(false)

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
          <Link to="/" className="brand" aria-label="Ir para a página inicial">
            <img src="/assets/logo-verde-escuro.png" alt="Brechó Luz do Luar" />
          </Link>

          <nav className="desktop-nav" aria-label="Navegação principal">
            <NavLink to="/">Início</NavLink>
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

        <div className="category-bar">
          <div className="container categories">
            {categories.map((category) => (
              <a key={category} href={`/#produtos?categoria=${encodeURIComponent(category)}`}>{category}</a>
            ))}
          </div>
        </div>

        {open && (
          <nav className="mobile-nav container">
            <Link to="/" onClick={() => setOpen(false)}>Início</Link>
            <a href="/#produtos" onClick={() => setOpen(false)}>Produtos</a>
            <a href="/#sobre" onClick={() => setOpen(false)}>Sobre</a>
            <a href="/#loja" onClick={() => setOpen(false)}>Loja física</a>
            <a href="/#contato" onClick={() => setOpen(false)}>Contato</a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" onClick={() => setOpen(false)}>Instagram</a>
            <Link to="/admin" onClick={() => setOpen(false)}>Área administrativa</Link>
          </nav>
        )}
      </header>
    </>
  )
}

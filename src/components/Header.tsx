import { Link, NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

const categories = ['Novidades', 'Vestidos', 'Blusas', 'Calças', 'Casacos', 'Acessórios']

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="topbar">Moda circular • Peças únicas • Atendimento pelo WhatsApp</div>

      <header className="header">
        <div className="container header-main">
          <Link to="/" className="brand">
            <img src="/assets/logo-verde-escuro.png" alt="Brechó Luz do Luar" />
          </Link>

          <nav className="desktop-nav">
            <NavLink to="/">Início</NavLink>
            <a href="/#produtos">Produtos</a>
            <a href="/#sobre">Sobre</a>
            <a href="/#contato">Contato</a>
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
            <a href="/#contato" onClick={() => setOpen(false)}>Contato</a>
            <Link to="/admin" onClick={() => setOpen(false)}>Admin</Link>
          </nav>
        )}
      </header>
    </>
  )
}

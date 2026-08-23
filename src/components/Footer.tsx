import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer" id="contato">
      <div className="container footer-grid">
        <div>
          <img className="footer-logo" src="/assets/logo-claro.png" alt="Brechó Luz do Luar" />
          <p className="footer-copy">
            Peças com história, novas histórias para vestir. Reutilize, reinvente e faça a moda circular girar.
          </p>
        </div>

        <div>
          <h3>Menu</h3>
          <a href="/">Início</a>
          <a href="/#produtos">Produtos</a>
          <a href="/#sobre">Sobre</a>
          <Link to="/admin">Área administrativa</Link>
        </div>

        <div>
          <h3>Categorias</h3>
          <a href="/#produtos">Vestidos</a>
          <a href="/#produtos">Blusas</a>
          <a href="/#produtos">Calças</a>
          <a href="/#produtos">Casacos</a>
          <a href="/#produtos">Acessórios</a>
        </div>

        <div>
          <h3>Atendimento</h3>
          <p>WhatsApp: (21) 98220-2283</p>
          <p>Copacabana • Catete</p>
          <p>Rio de Janeiro, RJ</p>
        </div>
      </div>
      <div className="copyright">© {new Date().getFullYear()} Brechó Luz do Luar.</div>
    </footer>
  )
}

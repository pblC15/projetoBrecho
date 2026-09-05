import { Clock3, Instagram, MapPin, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { INSTAGRAM_URL, STORE_HOURS, WHATSAPP_URL } from '../lib/store'

export default function Footer() {
  return (
    <footer className="footer" id="contato">
      <div className="container footer-grid">
        <div className="footer-brand-block">
          <img className="footer-logo" src="/assets/logo-anexo-transparente.png" alt="Brechó Luz do Luar" />
          <p className="footer-copy">
            Peças com história, novas histórias para vestir. Reutilize, reinvente e faça a moda circular girar.
          </p>
          <a className="footer-social" href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
            <Instagram size={18} />
            Siga @brecholuzdoluarrj
          </a>
        </div>

        <div>
          <h3>Menu</h3>
          <a href="/">Início</a>
          <a href="/#produtos">Produtos</a>
          <a href="/#sobre">Sobre</a>
          <a href="/#loja">Loja física</a>
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

        <div className="footer-service">
          <h3>Atendimento</h3>
          <a href={WHATSAPP_URL} target="_blank" rel="noreferrer"><MessageCircle size={16} /> WhatsApp: (21) 98220-2283</a>
          <p><MapPin size={16} /> Rua Bento Lisboa, 151 • Catete</p>
          <div className="footer-hours-title"><Clock3 size={16} /> Horário da loja física</div>
          <div className="footer-hours">
            {STORE_HOURS.map(([day, hours]) => (
              <div key={day}><span>{day}</span><strong>{hours}</strong></div>
            ))}
          </div>
        </div>
      </div>
      <div className="copyright">© {new Date().getFullYear()} Brechó Luz do Luar.</div>
    </footer>
  )
}

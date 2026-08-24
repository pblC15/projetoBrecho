const storePhotos = [
  {
    src: '/assets/loja/interior-01.jpeg',
    alt: 'Interior do Brechó Luz do Luar com diversas peças selecionadas',
  },
  {
    src: '/assets/loja/interior-02.jpeg',
    alt: 'Araras com roupas disponíveis no Brechó Luz do Luar',
  },
  {
    src: '/assets/loja/interior-03.jpeg',
    alt: 'Bolsas, acessórios e calçados disponíveis no brechó',
  },
  {
    src: '/assets/loja/interior-04.jpeg',
    alt: 'Seleção de roupas do Brechó Luz do Luar',
  },
]

const address =
  'R. Bento Lisboa, 151 - Catete, Rio de Janeiro - RJ, 22221-010, Brasil'

const mapsUrl =
  'https://www.google.com/maps/search/?api=1&query=' +
  encodeURIComponent(address)

export default function StoreLocation() {
  return (
    <section id="loja" className="store-location">
      <div className="container">
        <div className="store-location-heading">
          <div>
            <span className="eyebrow">Venha nos visitar</span>

            <h2>
              Seu próximo achadinho pode estar esperando por você aqui.
            </h2>
          </div>

          <p>
            Algumas peças precisam ser vistas de perto, tocadas, experimentadas
            e descobertas sem pressa. Venha conhecer o Brechó Luz do Luar e
            garimpar pessoalmente nossas novidades.
          </p>
        </div>

        <div className="store-hero">
          <div className="store-hero-image">
            <img
              src="/assets/loja/fachada.jpeg"
              alt="Fachada onde está localizado o Brechó Luz do Luar no Catete"
            />

            <div className="store-hero-badge">
              <span>📍</span>

              <div>
                <strong>Estamos no Catete</strong>
                <small>Rio de Janeiro • RJ</small>
              </div>
            </div>
          </div>

          <div className="store-info">
            <span className="store-kicker">Loja física</span>

            <h3>Brechó Luz do Luar</h3>

            <p className="store-address">
              Rua Bento Lisboa, 151
              <br />
              Catete, Rio de Janeiro - RJ
              <br />
              CEP 22221-010
            </p>

            <p className="store-description">
              Entre, garimpe e descubra peças únicas, roupas, bolsas,
              acessórios, calçados e muitos achados que nem sempre chegam
              primeiro ao site.
            </p>

            <div className="store-benefits">
              <div>
                <span>✦</span>
                <p>
                  <strong>Peças únicas</strong>
                  <small>Achados que podem aparecer uma única vez.</small>
                </p>
              </div>

              <div>
                <span>♡</span>
                <p>
                  <strong>Experimente pessoalmente</strong>
                  <small>Veja o caimento, detalhes e acabamento.</small>
                </p>
              </div>

              <div>
                <span>☾</span>
                <p>
                  <strong>Garimpo presencial</strong>
                  <small>Sempre pode existir uma surpresa nova na arara.</small>
                </p>
              </div>
            </div>

            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="store-route-button"
            >
              <span>📍</span>
              Traçar rota até a loja
            </a>
          </div>
        </div>

        <div className="store-gallery-heading">
          <div>
            <span className="eyebrow">Por dentro do brechó</span>
            <h3>Um pouco do que você vai encontrar por aqui</h3>
          </div>

          <p>
            Nosso estoque muda constantemente. O melhor achado pode ter acabado
            de chegar.
          </p>
        </div>

        <div className="store-gallery">
          {storePhotos.map((photo, index) => (
            <div
              key={photo.src}
              className={`store-gallery-item store-gallery-item-${index + 1}`}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                loading="lazy"
              />
            </div>
          ))}
        </div>

        <div className="store-map-section">
          <div className="store-map-content">
            <span className="eyebrow">Como chegar</span>

            <h3>Coloque o Luz do Luar na sua rota.</h3>

            <p>
              Estamos na Rua Bento Lisboa, 151, no Catete, Rio de Janeiro.
              Use o mapa ao lado para localizar a loja e abrir a navegação
              diretamente no seu celular.
            </p>

            <div className="store-map-address">
              <span>📍</span>

              <div>
                <strong>R. Bento Lisboa, 151</strong>
                <p>
                  Catete, Rio de Janeiro - RJ
                  <br />
                  22221-010
                </p>
              </div>
            </div>

            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="store-map-link"
            >
              Abrir no Google Maps
              <span>↗</span>
            </a>
          </div>

          <div className="store-map">
            <iframe
              title="Localização do Brechó Luz do Luar"
              src={`https://www.google.com/maps?q=${encodeURIComponent(
                address
              )}&output=embed`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>

        <div className="store-visit-cta">
          <div>
            <span>✦ Brechó Luz do Luar</span>
            <h3>Venha garimpar com a gente.</h3>

            <p>
              No brechó, cada arara guarda uma história diferente. Talvez a
              próxima seja sua.
            </p>
          </div>

          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Quero conhecer a loja
            <span>→</span>
          </a>
        </div>
      </div>
    </section>
  )
}
import {
  ArrowLeft,
  MessageCircle,
  Ruler,
  Sparkles,
} from 'lucide-react'

import {
  Link,
  useParams,
} from 'react-router-dom'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  listProducts,
} from '../lib/products'

import {
  whatsappLink,
} from '../lib/whatsapp'

import type {
  Product,
} from '../types'


const money =
  new Intl.NumberFormat(
    'pt-BR',
    {
      style: 'currency',
      currency: 'BRL',
    }
  )


export default function ProductPage() {
  const { id } =
    useParams()

  const [
    product,
    setProduct,
  ] =
    useState<Product | null>(
      null
    )

  const [
    loading,
    setLoading,
  ] =
    useState(true)

  const [
    selectedImage,
    setSelectedImage,
  ] =
    useState('')


  useEffect(() => {
    listProducts()
      .then((items) => {
        const found =
          items.find(
            (product) =>
              product.id === id
          ) || null

        setProduct(found)

        if (found) {
          const firstImage =
            found.imageUrls?.[0] ||
            found.imageUrl

          setSelectedImage(
            firstImage
          )
        }
      })
      .finally(() =>
        setLoading(false)
      )
  }, [id])


  const images =
    useMemo(() => {
      if (!product) {
        return []
      }

      /*
        Produtos novos:
        usa imageUrls.

        Produtos antigos:
        usa imageUrl.
      */
      if (
        product.imageUrls &&
        product.imageUrls.length > 0
      ) {
        return product.imageUrls
      }

      if (product.imageUrl) {
        return [
          product.imageUrl,
        ]
      }

      return []
    }, [product])


  if (loading) {
    return (
      <main className="container section">
        <p>
          Carregando produto...
        </p>
      </main>
    )
  }


  if (!product) {
    return (
      <main className="container section">
        <h1>
          Produto não encontrado.
        </h1>
      </main>
    )
  }


  return (
    <main className="container section">

      <Link
        className="back-link"
        to="/"
      >
        <ArrowLeft size={18} />

        Voltar para a vitrine
      </Link>


      <div className="product-detail">

        <div className="product-gallery">

          <div className="product-detail-image">

            {selectedImage && (
              <img
                src={selectedImage}
                alt={product.name}
              />
            )}

          </div>


          {images.length > 1 && (

            <div className="product-thumbnails">

              {images.map(
                (
                  image,
                  index
                ) => (

                  <button
                    key={image}
                    type="button"
                    className={
                      selectedImage ===
                      image
                        ? 'product-thumbnail active'
                        : 'product-thumbnail'
                    }
                    onClick={
                      () =>
                        setSelectedImage(
                          image
                        )
                    }
                    aria-label={
                      `Visualizar imagem ${index + 1} de ${product.name}`
                    }
                  >

                    <img
                      src={image}
                      alt={
                        `${product.name} - imagem ${index + 1}`
                      }
                    />

                  </button>

                )
              )}

            </div>

          )}

        </div>


        <div className="product-detail-content">

          <span className="eyebrow">
            {product.category}
          </span>

          <h1>
            {product.name}
          </h1>

          <div className="detail-price">
            {money.format(
              product.price
            )}
          </div>

          <p className="detail-description">
            {product.description}
          </p>


          <div className="detail-boxes">

            {product.size && (

              <div className="detail-box">

                <Sparkles
                  size={20}
                />

                <div>

                  <small>
                    Tamanho
                  </small>

                  <strong>
                    {product.size}
                  </strong>

                </div>

              </div>

            )}


            {product.measurements && (

              <div className="detail-box">

                <Ruler
                  size={20}
                />

                <div>

                  <small>
                    Medidas
                  </small>

                  <strong>
                    {
                      product.measurements
                    }
                  </strong>

                </div>

              </div>

            )}


            {product.condition && (

              <div className="detail-box">

                <Sparkles
                  size={20}
                />

                <div>

                  <small>
                    Estado
                  </small>

                  <strong>
                    {
                      product.condition
                    }
                  </strong>

                </div>

              </div>

            )}

          </div>


          <a
            className={
              `whatsapp-button ${
                product.sold
                  ? 'disabled'
                  : ''
              }`
            }
            href={
              product.sold
                ? undefined
                : whatsappLink(
                    product
                  )
            }
            target="_blank"
            rel="noreferrer"
          >

            <MessageCircle
              size={22}
            />

            {
              product.sold
                ? 'Produto vendido'
                : 'Comprar pelo WhatsApp'
            }

          </a>


          <p className="purchase-note">
            A compra não é concluída
            no site. O botão abre uma
            conversa com a loja já
            levando os dados desta
            peça.
          </p>

        </div>

      </div>

    </main>
  )
}
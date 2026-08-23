import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from 'react'

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'

import {
  Edit,
  Plus,
  Trash2,
  X,
} from 'lucide-react'

import { 
  Link 
} from 'react-router-dom'

import {
  auth,
  firebaseEnabled,
} from '../lib/firebase'

import {
  createProduct,
  deleteProduct,
  listProducts,
  updateProduct,
} from '../lib/products'

import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from '../lib/categories'

import type {
  Category,
  Product,
} from '../types'

type AdminTab =
  | 'products'
  | 'categories'


type ProductMode =
  | 'list'
  | 'create'
  | 'edit'


type PreviewImage = {
  file: File
  url: string
}


const MAX_IMAGES = 5


const money =
  new Intl.NumberFormat(
    'pt-BR',
    {
      style: 'currency',
      currency: 'BRL',
    }
  )


export default function Admin() {

  const [
    user,
    setUser,
  ] =
    useState<User | null>(
      null
    )


  const [
    email,
    setEmail,
  ] =
    useState('')


  const [
    password,
    setPassword,
  ] =
    useState('')


  const [
    message,
    setMessage,
  ] =
    useState('')


  const [
    loading,
    setLoading,
  ] =
    useState(false)


  const [
    saving,
    setSaving,
  ] =
    useState(false)


  const [
    adminTab,
    setAdminTab,
  ] =
    useState<AdminTab>(
      'products'
    )


  const [
    productMode,
    setProductMode,
  ] =
    useState<ProductMode>(
      'list'
    )


  const [
    products,
    setProducts,
  ] =
    useState<Product[]>([])


  const [
    categories,
    setCategories,
  ] =
    useState<Category[]>([])


  const [
    editingProduct,
    setEditingProduct,
  ] =
    useState<Product | null>(
      null
    )


  /*
    Imagens NOVAS ainda
    não enviadas.
  */
  const [
    images,
    setImages,
  ] =
    useState<PreviewImage[]>(
      []
    )


  /*
    URLs das imagens que
    já existem no Cloudinary.
  */
  const [
    existingImages,
    setExistingImages,
  ] =
    useState<string[]>([])


  /*
    CRUD categorias
  */
  const [
    categoryName,
    setCategoryName,
  ] =
    useState('')


  const [
    editingCategory,
    setEditingCategory,
  ] =
    useState<Category | null>(
      null
    )


  /*
    LOGIN
  */
  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(
        auth,
        setUser
      )

    return unsubscribe

  }, [])


  /*
    Ao autenticar,
    carrega dados.
  */
  useEffect(() => {

    if (user) {
      loadData()
    }

  }, [user])


  async function loadData() {

    setLoading(true)

    try {

      const [
        productData,
        categoryData,
      ] =
        await Promise.all([
          listProducts(),
          listCategories(),
        ])

      setProducts(
        productData
      )

      setCategories(
        categoryData
      )

    } catch (error) {

      console.error(
        'Erro ao carregar painel:',
        error
      )

      setMessage(
        'Não foi possível carregar os dados.'
      )

    } finally {

      setLoading(false)

    }
  }


  async function login(
    e: FormEvent<HTMLFormElement>
  ) {

    e.preventDefault()

    setMessage('')

    try {

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      )

    } catch (error) {

      console.error(
        error
      )

      setMessage(
        'Não foi possível entrar. Verifique e-mail e senha.'
      )
    }
  }


  /*
    ================================
    IMAGENS
    ================================
  */

  function handleImages(
    e: ChangeEvent<HTMLInputElement>
  ) {

    const selectedFiles =
      Array.from(
        e.target.files || []
      )


    const currentTotal =
      existingImages.length +
      images.length


    const availableSlots =
      MAX_IMAGES -
      currentTotal


    if (
      selectedFiles.length >
      availableSlots
    ) {

      setMessage(
        `Você pode adicionar apenas mais ${availableSlots} imagem${availableSlots === 1 ? '' : 's'}.`
      )

      e.target.value = ''

      return
    }


    const invalidFile =
      selectedFiles.find(
        (file) =>
          !file.type.startsWith(
            'image/'
          )
      )


    if (invalidFile) {

      setMessage(
        'Selecione apenas arquivos de imagem.'
      )

      e.target.value = ''

      return
    }


    const previews =
      selectedFiles.map(
        (file) => ({
          file,

          url:
            URL.createObjectURL(
              file
            ),
        })
      )


    setImages(
      (current) => [
        ...current,
        ...previews,
      ]
    )


    setMessage('')

    e.target.value = ''
  }


  function removeNewImage(
    index: number
  ) {

    setImages(
      (current) => {

        const image =
          current[index]

        if (image) {

          URL.revokeObjectURL(
            image.url
          )

        }


        return current.filter(
          (_, currentIndex) =>
            currentIndex !==
            index
        )
      }
    )
  }


  function removeExistingImage(
    index: number
  ) {

    setExistingImages(
      (current) =>
        current.filter(
          (_, currentIndex) =>
            currentIndex !==
            index
        )
    )
  }


  function clearNewImages() {

    images.forEach(
      (image) => {

        URL.revokeObjectURL(
          image.url
        )

      }
    )

    setImages([])
  }


  /*
    ================================
    NOVO PRODUTO
    ================================
  */

  function openNewProduct() {

    clearNewImages()

    setExistingImages([])

    setEditingProduct(
      null
    )

    setProductMode(
      'create'
    )

    setMessage('')
  }


  /*
    ================================
    EDITAR PRODUTO
    ================================
  */

  function openEditProduct(
    product: Product
  ) {

    clearNewImages()

    setEditingProduct(
      product
    )


    /*
      Compatibilidade com
      produtos antigos.
    */
    const urls =
      product.imageUrls &&
      product.imageUrls.length > 0
        ? product.imageUrls
        : product.imageUrl
          ? [
              product.imageUrl
            ]
          : []


    setExistingImages(
      urls
    )

    setProductMode(
      'edit'
    )

    setMessage('')
  }


  function cancelProductForm() {

    clearNewImages()

    setExistingImages([])

    setEditingProduct(
      null
    )

    setProductMode(
      'list'
    )

    setMessage('')
  }


  /*
    ================================
    SALVAR PRODUTO
    ================================
  */

  async function submitProduct(
    e: FormEvent<HTMLFormElement>
  ) {

    e.preventDefault()

    const form =
      e.currentTarget


    const data =
      new FormData(
        form
      )


    const totalImages =
      existingImages.length +
      images.length


    if (
      totalImages === 0
    ) {

      setMessage(
        'Selecione pelo menos uma imagem.'
      )

      return
    }


    if (
      totalImages >
      MAX_IMAGES
    ) {

      setMessage(
        'O produto pode ter no máximo 5 imagens.'
      )

      return
    }


    const price =
      Number(
        data.get(
          'price'
        )
      )


    if (
      Number.isNaN(
        price
      ) ||
      price < 0
    ) {

      setMessage(
        'Informe um preço válido.'
      )

      return
    }


    const productData = {

      name:
        String(
          data.get(
            'name'
          )
        ).trim(),

      description:
        String(
          data.get(
            'description'
          )
        ).trim(),

      category:
        String(
          data.get(
            'category'
          )
        ),

      price,

      size:
        String(
          data.get(
            'size'
          ) || ''
        ).trim(),

      measurements:
        String(
          data.get(
            'measurements'
          ) || ''
        ).trim(),

      condition:
        String(
          data.get(
            'condition'
          ) || ''
        ).trim(),

      featured:
        data.get(
          'featured'
        ) === 'on',

      sold:
        data.get(
          'sold'
        ) === 'on',

    }


    const files =
      images.map(
        (image) =>
          image.file
      )


    setSaving(true)

    setMessage('')


    try {

      if (
        productMode ===
          'edit' &&
        editingProduct
      ) {

        await updateProduct(

          editingProduct.id,

          productData,

          existingImages,

          files
        )


        setMessage(
          'Produto atualizado com sucesso.'
        )

      } else {

        await createProduct(

          productData,

          files
        )


        setMessage(
          'Produto cadastrado com sucesso.'
        )

      }


      clearNewImages()

      setExistingImages([])

      setEditingProduct(
        null
      )


      await loadData()


      setProductMode(
        'list'
      )


    } catch (error) {

      console.error(
        'Erro ao salvar produto:',
        error
      )


      setMessage(
        error instanceof Error
          ? error.message
          : 'Erro ao salvar produto.'
      )


    } finally {

      setSaving(false)

    }
  }


  /*
    ================================
    EXCLUIR PRODUTO
    ================================
  */

  async function handleDeleteProduct(
    product: Product
  ) {

    const confirmed =
      window.confirm(
        `Deseja realmente excluir "${product.name}"?`
      )


    if (!confirmed) {
      return
    }


    try {

      await deleteProduct(
        product.id
      )


      setProducts(
        (current) =>
          current.filter(
            (item) =>
              item.id !==
              product.id
          )
      )


      setMessage(
        'Produto excluído com sucesso.'
      )

    } catch (error) {

      console.error(
        error
      )

      setMessage(
        'Não foi possível excluir o produto.'
      )
    }
  }


  /*
    ================================
    SALVAR CATEGORIA
    ================================
  */

  async function submitCategory(
    e: FormEvent<HTMLFormElement>
  ) {

    e.preventDefault()

    setMessage('')

    setSaving(true)


    try {

      if (
        editingCategory
      ) {

        await updateCategory(
          editingCategory.id,
          categoryName
        )


        setMessage(
          'Categoria atualizada com sucesso.'
        )

      } else {

        await createCategory(
          categoryName
        )


        setMessage(
          'Categoria cadastrada com sucesso.'
        )

      }


      setCategoryName('')

      setEditingCategory(
        null
      )


      const data =
        await listCategories()


      setCategories(
        data
      )


    } catch (error) {

      console.error(
        error
      )


      setMessage(
        error instanceof Error
          ? error.message
          : 'Erro ao salvar categoria.'
      )


    } finally {

      setSaving(false)

    }
  }


  /*
    ================================
    EDITAR CATEGORIA
    ================================
  */

  function handleEditCategory(
    category: Category
  ) {

    setEditingCategory(
      category
    )

    setCategoryName(
      category.name
    )

    setMessage('')
  }


  /*
    ================================
    EXCLUIR CATEGORIA
    ================================
  */

  async function handleDeleteCategory(
    category: Category
  ) {

    const productsUsingCategory =
      products.some(
        (product) =>
          product.category ===
          category.name
      )


    if (
      productsUsingCategory
    ) {

      setMessage(
        `A categoria "${category.name}" não pode ser excluída porque existem produtos usando ela.`
      )

      return
    }


    const confirmed =
      window.confirm(
        `Excluir a categoria "${category.name}"?`
      )


    if (!confirmed) {
      return
    }


    try {

      await deleteCategory(
        category.id
      )


      setCategories(
        (current) =>
          current.filter(
            (item) =>
              item.id !==
              category.id
          )
      )


      setMessage(
        'Categoria excluída com sucesso.'
      )


    } catch (error) {

      console.error(
        error
      )

      setMessage(
        'Não foi possível excluir a categoria.'
      )
    }
  }


  /*
    ================================
    LOGIN
    ================================
  */

  if (!firebaseEnabled) {

    return (

      <main className="container section narrow">

        <h1>
          Área administrativa
        </h1>

        <div className="notice">

          Configure as variáveis
          do Firebase.

        </div>

      </main>
    )
  }


  if (!user) {

    return (

      <main className="container section narrow">

        <span className="eyebrow">
          Admin
        </span>

        <h1>
          Entrar
        </h1>


        <form
          className="admin-form"
          onSubmit={
            login
          }
        >

          <label>

            E-mail

            <input
              type="email"
              value={
                email
              }
              onChange={
                (e) =>
                  setEmail(
                    e.target.value
                  )
              }
              required
            />

          </label>


          <label>

            Senha

            <input
              type="password"
              value={
                password
              }
              onChange={
                (e) =>
                  setPassword(
                    e.target.value
                  )
              }
              required
            />

          </label>


          <button
            className="primary-button"
          >

            Entrar

          </button>


          {
            message && (

              <p className="form-message">
                {message}
              </p>

            )
          }

        </form>

      </main>
    )
  }


  /*
    ================================
    PAINEL
    ================================
  */

  return (

    <main className="container section admin-page">


      <div className="admin-title">

        <div>

          <span className="eyebrow">
            Administração
          </span>

          <h1>
            Painel do Brechó
          </h1>

        </div>


        <button
          type="button"
          className="text-button"
          onClick={
            () =>
              signOut(
                auth
              )
          }
        >

          Sair

        </button>

      </div>


      <div className="admin-tabs">

        <button
          type="button"
          className={
            adminTab ===
            'products'
              ? 'admin-tab active'
              : 'admin-tab'
          }
          onClick={
            () => {
              setAdminTab(
                'products'
              )

              setProductMode(
                'list'
              )

              setMessage('')
            }
          }
        >

          Produtos

        </button>


        <button
          type="button"
          className={
            adminTab ===
            'categories'
              ? 'admin-tab active'
              : 'admin-tab'
          }
          onClick={
            () => {

              setAdminTab(
                'categories'
              )

              setMessage('')

            }
          }
        >

          Categorias

        </button>

      </div>


      {
        message && (

          <div className="admin-message">
            {message}
          </div>

        )
      }


      {
        loading ? (

          <p>
            Carregando...
          </p>

        ) : adminTab ===
          'products' ? (

          /* =========================
             PRODUTOS
          ========================== */

          <>

            {
              productMode ===
              'list' && (

                <section>

                  <div className="admin-section-header">

                    <div>

                      <h2>
                        Produtos
                      </h2>

                      <p>
                        {products.length}{' '}
                        produto
                        {
                          products.length ===
                          1
                            ? ''
                            : 's'
                        }
                      </p>

                    </div>


                    <button
                      type="button"
                      className="primary-button"
                      onClick={
                        openNewProduct
                      }
                    >

                      <Plus
                        size={
                          18
                        }
                      />

                      Novo produto

                    </button>

                  </div>


                  {
                    products.length ===
                    0 ? (

                      <div className="notice">

                        Nenhum produto
                        cadastrado.

                      </div>

                    ) : (

                      <div className="admin-product-list">

                        {
                          products.map(
                            (
                              product
                            ) => (

                            <div
                              key={product.id}
                              className="admin-product-card"
                            >

                              <Link
                                to={`/produto/${product.id}`}
                                className="admin-product-clickable"
                                title={`Ver ${product.name}`}
                              >

                                <img
                                  src={product.imageUrl}
                                  alt={product.name}
                                />

                                <div className="admin-product-info">

                                  <span>
                                    {product.category}
                                  </span>

                                  <strong>
                                    {product.name}
                                  </strong>

                                  <small>
                                    {money.format(
                                      product.price
                                    )}
                                  </small>

                                </div>

                                <div className="admin-product-status">

                                  {product.sold ? (

                                    <span className="admin-status sold">
                                      Vendido
                                    </span>

                                  ) : (

                                    <span className="admin-status available">
                                      Disponível
                                    </span>

                                  )}

                                </div>

                              </Link>


                              <div className="admin-product-actions">

                                <button
                                  type="button"
                                  className="admin-action-button"
                                  onClick={() =>
                                    openEditProduct(
                                      product
                                    )
                                  }
                                >

                                  <Edit size={17} />

                                  Editar

                                </button>


                                <button
                                  type="button"
                                  className="admin-action-button danger"
                                  onClick={() =>
                                    handleDeleteProduct(
                                      product
                                    )
                                  }
                                >

                                  <Trash2 size={17} />

                                  Excluir

                                </button>

                              </div>

                            </div>

                            )
                          )
                        }

                      </div>

                    )
                  }

                </section>

              )
            }


            {
              (
                productMode ===
                'create' ||
                productMode ===
                'edit'
              ) && (

                <section>

                  <div className="admin-section-header">

                    <h2>

                      {
                        productMode ===
                        'edit'
                          ? 'Editar produto'
                          : 'Cadastrar produto'
                      }

                    </h2>


                    <button
                      type="button"
                      className="text-button"
                      onClick={
                        cancelProductForm
                      }
                    >

                      Voltar

                    </button>

                  </div>


                  <form
                    className="admin-form"
                    onSubmit={
                      submitProduct
                    }
                  >

                    <label>

                      Nome do produto

                      <input
                        name="name"
                        defaultValue={
                          editingProduct?.name ||
                          ''
                        }
                        required
                      />

                    </label>


                    <label>

                      Categoria

                      <select
                        name="category"
                        defaultValue={
                          editingProduct?.category ||
                          categories[0]?.name ||
                          ''
                        }
                        required
                      >

                        <option
                          value=""
                          disabled
                        >

                          Selecione

                        </option>


                        {
                          categories.map(
                            (
                              category
                            ) => (

                              <option
                                key={
                                  category.id
                                }
                                value={
                                  category.name
                                }
                              >

                                {
                                  category.name
                                }

                              </option>

                            )
                          )
                        }

                      </select>

                    </label>


                    <label>

                      Preço (R$)

                      <input
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        defaultValue={
                          editingProduct?.price ??
                          ''
                        }
                        required
                      />

                    </label>


                    <label>

                      Tamanho

                      <input
                        name="size"
                        defaultValue={
                          editingProduct?.size ||
                          ''
                        }
                      />

                    </label>


                    <label>

                      Medidas

                      <textarea
                        name="measurements"
                        defaultValue={
                          editingProduct?.measurements ||
                          ''
                        }
                      />

                    </label>


                    <label>

                      Estado da peça

                      <input
                        name="condition"
                        defaultValue={
                          editingProduct?.condition ||
                          ''
                        }
                      />

                    </label>


                    <label>

                      Descrição

                      <textarea
                        name="description"
                        rows={
                          5
                        }
                        defaultValue={
                          editingProduct?.description ||
                          ''
                        }
                        required
                      />

                    </label>


                    <div className="image-upload-section">

                      <div className="image-upload-header">

                        <div>

                          <strong>
                            Imagens
                          </strong>

                          <small>
                            Até 5 imagens.
                            A primeira é
                            a capa.
                          </small>

                        </div>


                        <span className="image-counter">

                          {
                            existingImages.length +
                            images.length
                          }

                          /5

                        </span>

                      </div>


                      <label className="image-upload-button">

                        + Adicionar imagens

                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={
                            handleImages
                          }
                        />

                      </label>


                      <div className="image-preview-grid">

                        {
                          existingImages.map(
                            (
                              url,
                              index
                            ) => (

                              <div
                                key={
                                  url
                                }
                                className="image-preview-item"
                              >

                                <img
                                  src={
                                    url
                                  }
                                  alt=""
                                />


                                {
                                  index ===
                                  0 && (

                                    <span className="image-cover-badge">
                                      Capa
                                    </span>

                                  )
                                }


                                <button
                                  type="button"
                                  className="remove-image-button"
                                  onClick={
                                    () =>
                                      removeExistingImage(
                                        index
                                      )
                                  }
                                >

                                  <X
                                    size={
                                      16
                                    }
                                  />

                                </button>

                              </div>

                            )
                          )
                        }


                        {
                          images.map(
                            (
                              image,
                              index
                            ) => {

                              const absoluteIndex =
                                existingImages.length +
                                index

                              return (

                                <div
                                  key={
                                    `${image.file.name}-${index}`
                                  }
                                  className="image-preview-item"
                                >

                                  <img
                                    src={
                                      image.url
                                    }
                                    alt=""
                                  />


                                  {
                                    absoluteIndex ===
                                    0 && (

                                      <span className="image-cover-badge">
                                        Capa
                                      </span>

                                    )
                                  }


                                  <button
                                    type="button"
                                    className="remove-image-button"
                                    onClick={
                                      () =>
                                        removeNewImage(
                                          index
                                        )
                                    }
                                  >

                                    <X
                                      size={
                                        16
                                      }
                                    />

                                  </button>

                                </div>

                              )
                            }
                          )
                        }

                      </div>

                    </div>


                    <label className="check">

                      <input
                        name="featured"
                        type="checkbox"
                        defaultChecked={
                          editingProduct?.featured ??
                          false
                        }
                      />

                      Destacar
                      na vitrine

                    </label>


                    {
                      productMode ===
                      'edit' && (

                        <label className="check">

                          <input
                            name="sold"
                            type="checkbox"
                            defaultChecked={
                              editingProduct?.sold ??
                              false
                            }
                          />

                          Marcar
                          como vendido

                        </label>

                      )
                    }


                    <button
                      className="primary-button"
                      disabled={
                        saving
                      }
                    >

                      {
                        saving
                          ? 'Salvando...'
                          : productMode ===
                            'edit'
                            ? 'Salvar alterações'
                            : 'Cadastrar produto'
                      }

                    </button>

                  </form>

                </section>

              )
            }

          </>

        ) : (

          /* =========================
             CATEGORIAS
          ========================== */

          <section>

            <div className="admin-section-header">

              <div>

                <h2>
                  Categorias
                </h2>

                <p>
                  Organize os
                  produtos da loja.
                </p>

              </div>

            </div>


            <form
              className="category-form"
              onSubmit={
                submitCategory
              }
            >

              <input
                value={
                  categoryName
                }
                onChange={
                  (e) =>
                    setCategoryName(
                      e.target.value
                    )
                }
                placeholder="Nome da categoria"
                required
              />


              <button
                className="primary-button"
                disabled={
                  saving
                }
              >

                {
                  editingCategory
                    ? 'Salvar'
                    : 'Adicionar'
                }

              </button>


              {
                editingCategory && (

                  <button
                    type="button"
                    className="text-button"
                    onClick={
                      () => {

                        setEditingCategory(
                          null
                        )

                        setCategoryName(
                          ''
                        )

                      }
                    }
                  >

                    Cancelar

                  </button>

                )
              }

            </form>


            <div className="category-list">

              {
                categories.map(
                  (
                    category
                  ) => (

                    <div
                      key={
                        category.id
                      }
                      className="category-item"
                    >

                      <strong>
                        {
                          category.name
                        }
                      </strong>


                      <div>

                        <button
                          type="button"
                          className="admin-action-button"
                          onClick={
                            () =>
                              handleEditCategory(
                                category
                              )
                          }
                        >

                          <Edit
                            size={
                              16
                            }
                          />

                          Editar

                        </button>


                        <button
                          type="button"
                          className="admin-action-button danger"
                          onClick={
                            () =>
                              handleDeleteCategory(
                                category
                              )
                          }
                        >

                          <Trash2
                            size={
                              16
                            }
                          />

                          Excluir

                        </button>

                      </div>

                    </div>

                  )
                )
              }

            </div>

          </section>

        )
      }

    </main>
  )
}
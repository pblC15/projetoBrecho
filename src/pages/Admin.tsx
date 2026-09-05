import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth'
import { ArrowDown, ArrowUp, Edit, GripVertical, Plus, Trash2, Video, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { auth, firebaseEnabled } from '../lib/firebase'
import { createProduct, deleteProduct, listProducts, updateProduct, type ProductImageInput } from '../lib/products'
import { createCategory, deleteCategory, listCategories, updateCategory } from '../lib/categories'
import type { Category, Product } from '../types'

type AdminTab = 'products' | 'categories'
type ProductMode = 'list' | 'create' | 'edit'
type ImageItem = {
  id: string
  url: string
  source: 'existing' | 'new'
  file?: File
}
type VideoPreview = { file: File; url: string }

const MAX_IMAGES = 5
const MAX_VIDEOS = 2
const MAX_VIDEO_SIZE = 50 * 1024 * 1024
const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export default function Admin() {
  const [user, setUser] = useState<User | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [adminTab, setAdminTab] = useState<AdminTab>('products')
  const [productMode, setProductMode] = useState<ProductMode>('list')
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [imageItems, setImageItems] = useState<ImageItem[]>([])
  const [existingVideos, setExistingVideos] = useState<string[]>([])
  const [videos, setVideos] = useState<VideoPreview[]>([])
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null)
  const [categoryName, setCategoryName] = useState('')
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  useEffect(() => onAuthStateChanged(auth, setUser), [])
  useEffect(() => { if (user) void loadData() }, [user])

  async function loadData() {
    setLoading(true)
    try {
      const [productData, categoryData] = await Promise.all([listProducts(), listCategories()])
      setProducts(productData)
      setCategories(categoryData)
    } catch (error) {
      console.error('Erro ao carregar painel:', error)
      setMessage('Não foi possível carregar os dados.')
    } finally {
      setLoading(false)
    }
  }

  async function login(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage('')
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      console.error(error)
      setMessage('Não foi possível entrar. Verifique e-mail e senha.')
    }
  }

  function revokeNewMedia() {
    imageItems.forEach((item) => {
      if (item.source === 'new') URL.revokeObjectURL(item.url)
    })
    videos.forEach((item) => URL.revokeObjectURL(item.url))
  }

  function resetMedia() {
    revokeNewMedia()
    setImageItems([])
    setExistingVideos([])
    setVideos([])
    setDraggedImageIndex(null)
  }

  function handleImages(e: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || [])
    const available = MAX_IMAGES - imageItems.length

    if (selected.length > available) {
      setMessage(`Você pode adicionar apenas mais ${available} imagem${available === 1 ? '' : 's'}.`)
      e.target.value = ''
      return
    }

    if (selected.some((file) => !file.type.startsWith('image/'))) {
      setMessage('Selecione apenas arquivos de imagem.')
      e.target.value = ''
      return
    }

    setImageItems((current) => [
      ...current,
      ...selected.map((file) => ({
        id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
        file,
        url: URL.createObjectURL(file),
        source: 'new' as const,
      })),
    ])
    setMessage('')
    e.target.value = ''
  }

  function handleVideos(e: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || [])
    const available = MAX_VIDEOS - existingVideos.length - videos.length

    if (selected.length > available) {
      setMessage(`Você pode adicionar apenas mais ${available} vídeo${available === 1 ? '' : 's'}.`)
      e.target.value = ''
      return
    }

    if (selected.some((file) => !file.type.startsWith('video/'))) {
      setMessage('Selecione apenas arquivos de vídeo.')
      e.target.value = ''
      return
    }

    if (selected.some((file) => file.size > MAX_VIDEO_SIZE)) {
      setMessage('Cada vídeo deve ter no máximo 50 MB.')
      e.target.value = ''
      return
    }

    setVideos((current) => [
      ...current,
      ...selected.map((file) => ({ file, url: URL.createObjectURL(file) })),
    ])
    setMessage('')
    e.target.value = ''
  }

  function removeImage(index: number) {
    setImageItems((current) => {
      const item = current[index]
      if (item?.source === 'new') URL.revokeObjectURL(item.url)
      return current.filter((_, currentIndex) => currentIndex !== index)
    })
  }

  function moveImage(from: number, to: number) {
    if (to < 0 || to >= imageItems.length || from === to) return
    setImageItems((current) => {
      const copy = [...current]
      const [moved] = copy.splice(from, 1)
      copy.splice(to, 0, moved)
      return copy
    })
  }

  function dropImage(to: number) {
    if (draggedImageIndex === null) return
    moveImage(draggedImageIndex, to)
    setDraggedImageIndex(null)
  }

  function removeExistingVideo(index: number) {
    setExistingVideos((current) => current.filter((_, currentIndex) => currentIndex !== index))
  }

  function removeNewVideo(index: number) {
    setVideos((current) => {
      const item = current[index]
      if (item) URL.revokeObjectURL(item.url)
      return current.filter((_, currentIndex) => currentIndex !== index)
    })
  }

  function openNewProduct() {
    resetMedia()
    setEditingProduct(null)
    setProductMode('create')
    setMessage('')
  }

  function openEditProduct(product: Product) {
    resetMedia()
    setEditingProduct(product)
    const urls = product.imageUrls?.length ? product.imageUrls : product.imageUrl ? [product.imageUrl] : []
    setImageItems(urls.map((url, index) => ({ id: `existing-${index}-${url}`, url, source: 'existing' })))
    setExistingVideos(product.videoUrls || [])
    setProductMode('edit')
    setMessage('')
  }

  function cancelProductForm() {
    resetMedia()
    setEditingProduct(null)
    setProductMode('list')
    setMessage('')
  }

  async function submitProduct(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)

    if (!imageItems.length) {
      setMessage('Selecione pelo menos uma imagem.')
      return
    }

    const price = Number(data.get('price'))
    if (Number.isNaN(price) || price < 0) {
      setMessage('Informe um preço válido.')
      return
    }

    const productData = {
      name: String(data.get('name')).trim(),
      description: String(data.get('description')).trim(),
      category: String(data.get('category')),
      price,
      size: String(data.get('size') || '').trim(),
      measurements: String(data.get('measurements') || '').trim(),
      condition: String(data.get('condition') || '').trim(),
      featured: data.get('featured') === 'on',
      sold: data.get('sold') === 'on',
    }

    const orderedImages: ProductImageInput[] = imageItems.map((item) =>
      item.source === 'existing' ? item.url : item.file!
    )

    setSaving(true)
    setMessage('')
    try {
      if (productMode === 'edit' && editingProduct) {
        await updateProduct(
          editingProduct.id,
          productData,
          orderedImages,
          existingVideos,
          videos.map((item) => item.file)
        )
        setMessage('Produto atualizado com sucesso.')
      } else {
        await createProduct(
          productData,
          imageItems.map((item) => item.file!).filter(Boolean),
          videos.map((item) => item.file)
        )
        setMessage('Produto cadastrado com sucesso.')
      }

      resetMedia()
      setEditingProduct(null)
      await loadData()
      setProductMode('list')
    } catch (error) {
      console.error('Erro ao salvar produto:', error)
      setMessage(error instanceof Error ? error.message : 'Erro ao salvar produto.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteProduct(product: Product) {
    if (!window.confirm(`Deseja realmente excluir "${product.name}"?`)) return
    try {
      await deleteProduct(product.id)
      setProducts((current) => current.filter((item) => item.id !== product.id))
      setMessage('Produto excluído com sucesso.')
    } catch (error) {
      console.error(error)
      setMessage('Não foi possível excluir o produto.')
    }
  }

  async function submitCategory(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage('')
    setSaving(true)
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryName)
        setMessage('Categoria atualizada com sucesso.')
      } else {
        await createCategory(categoryName)
        setMessage('Categoria cadastrada com sucesso.')
      }
      setCategoryName('')
      setEditingCategory(null)
      setCategories(await listCategories())
    } catch (error) {
      console.error(error)
      setMessage(error instanceof Error ? error.message : 'Erro ao salvar categoria.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteCategory(category: Category) {
    if (products.some((product) => product.category === category.name)) {
      setMessage(`A categoria "${category.name}" não pode ser excluída porque existem produtos usando ela.`)
      return
    }
    if (!window.confirm(`Excluir a categoria "${category.name}"?`)) return
    try {
      await deleteCategory(category.id)
      setCategories((current) => current.filter((item) => item.id !== category.id))
      setMessage('Categoria excluída com sucesso.')
    } catch (error) {
      console.error(error)
      setMessage('Não foi possível excluir a categoria.')
    }
  }

  if (!firebaseEnabled) {
    return <main className="container section narrow"><h1>Área administrativa</h1><div className="notice">Configure as variáveis do Firebase.</div></main>
  }

  if (!user) {
    return (
      <main className="container section narrow">
        <span className="eyebrow">Admin</span>
        <h1>Entrar</h1>
        <form className="admin-form" onSubmit={login}>
          <label>E-mail<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
          <label>Senha<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
          <button className="primary-button">Entrar</button>
          {message && <p className="form-message">{message}</p>}
        </form>
      </main>
    )
  }

  return (
    <main className="container section admin-page">
      <div className="admin-title">
        <div><span className="eyebrow">Administração</span><h1>Painel do Brechó</h1></div>
        <button type="button" className="text-button" onClick={() => signOut(auth)}>Sair</button>
      </div>

      <div className="admin-tabs">
        <button type="button" className={adminTab === 'products' ? 'admin-tab active' : 'admin-tab'} onClick={() => { setAdminTab('products'); setProductMode('list'); setMessage('') }}>Produtos</button>
        <button type="button" className={adminTab === 'categories' ? 'admin-tab active' : 'admin-tab'} onClick={() => { setAdminTab('categories'); setMessage('') }}>Categorias</button>
      </div>

      {message && <div className="admin-message">{message}</div>}

      {loading ? <p>Carregando...</p> : adminTab === 'products' ? (
        <>
          {productMode === 'list' && (
            <section>
              <div className="admin-section-header">
                <div><h2>Produtos</h2><p>{products.length} produto{products.length === 1 ? '' : 's'}</p></div>
                <button type="button" className="primary-button" onClick={openNewProduct}><Plus size={18} />Novo produto</button>
              </div>

              {!products.length ? <div className="notice">Nenhum produto cadastrado.</div> : (
                <div className="admin-product-list">
                  {products.map((product) => (
                    <div key={product.id} className="admin-product-card">
                      <Link to={`/produto/${product.id}`} className="admin-product-clickable" title={`Ver ${product.name}`}>
                        <img src={product.imageUrl} alt={product.name} />
                        <div className="admin-product-info"><span>{product.category}</span><strong>{product.name}</strong><small>{money.format(product.price)}</small></div>
                        <div className="admin-product-status"><span className={`admin-status ${product.sold ? 'sold' : 'available'}`}>{product.sold ? 'Vendido' : 'Disponível'}</span></div>
                      </Link>
                      <div className="admin-product-actions">
                        <button type="button" className="admin-action-button" onClick={() => openEditProduct(product)}><Edit size={17} />Editar</button>
                        <button type="button" className="admin-action-button danger" onClick={() => handleDeleteProduct(product)}><Trash2 size={17} />Excluir</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {(productMode === 'create' || productMode === 'edit') && (
            <section>
              <div className="admin-section-header"><h2>{productMode === 'edit' ? 'Editar produto' : 'Cadastrar produto'}</h2><button type="button" className="text-button" onClick={cancelProductForm}>Voltar</button></div>

              <form className="admin-form" onSubmit={submitProduct}>
                <label>Nome do produto<input name="name" defaultValue={editingProduct?.name || ''} required /></label>
                <label>Categoria<select name="category" defaultValue={editingProduct?.category || categories[0]?.name || ''} required><option value="" disabled>Selecione</option>{categories.map((category) => <option key={category.id} value={category.name}>{category.name}</option>)}</select></label>
                <label>Preço (R$)<input name="price" type="number" min="0" step="0.01" defaultValue={editingProduct?.price ?? ''} required /></label>
                <label>Tamanho<input name="size" defaultValue={editingProduct?.size || ''} /></label>
                <label>Medidas<textarea name="measurements" defaultValue={editingProduct?.measurements || ''} /></label>
                <label>Estado da peça<input name="condition" defaultValue={editingProduct?.condition || ''} /></label>
                <label>Descrição<textarea name="description" rows={5} defaultValue={editingProduct?.description || ''} required /></label>

                <div className="image-upload-section">
                  <div className="image-upload-header">
                    <div><strong>Imagens</strong><small>Até 5 imagens. Arraste ou use as setas para definir a ordem. A primeira é a capa.</small></div>
                    <span className={`image-counter ${imageItems.length === MAX_IMAGES ? 'full' : ''}`}>{imageItems.length}/5</span>
                  </div>
                  <label className={`image-upload-button ${imageItems.length === MAX_IMAGES ? 'disabled' : ''}`}>+ Adicionar imagens<input type="file" accept="image/*" multiple disabled={imageItems.length === MAX_IMAGES} onChange={handleImages} /></label>

                  <div className="image-preview-grid sortable-image-grid">
                    {imageItems.map((item, index) => (
                      <div
                        key={item.id}
                        className="image-preview-item sortable-image-item"
                        draggable
                        onDragStart={() => setDraggedImageIndex(index)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => dropImage(index)}
                      >
                        <img src={item.url} alt={`Imagem ${index + 1}`} />
                        <span className="image-drag-handle"><GripVertical size={16} /></span>
                        {index === 0 && <span className="image-cover-badge">Capa</span>}
                        <button type="button" className="remove-image-button" onClick={() => removeImage(index)} aria-label="Remover imagem"><X size={16} /></button>
                        <div className="image-order-controls">
                          <button type="button" onClick={() => moveImage(index, index - 1)} disabled={index === 0} aria-label="Mover imagem para trás"><ArrowUp size={15} /></button>
                          <button type="button" onClick={() => moveImage(index, index + 1)} disabled={index === imageItems.length - 1} aria-label="Mover imagem para frente"><ArrowDown size={15} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="video-upload-section">
                  <div className="image-upload-header">
                    <div><strong>Vídeos curtos</strong><small>Até 2 vídeos de 50 MB cada. Formatos aceitos pelo navegador, como MP4 e WebM.</small></div>
                    <span className="image-counter">{existingVideos.length + videos.length}/{MAX_VIDEOS}</span>
                  </div>
                  <label className={`image-upload-button video-upload-button ${existingVideos.length + videos.length >= MAX_VIDEOS ? 'disabled' : ''}`}><Video size={21} />+ Adicionar vídeos<input type="file" accept="video/*" multiple disabled={existingVideos.length + videos.length >= MAX_VIDEOS} onChange={handleVideos} /></label>
                  <div className="video-preview-grid">
                    {existingVideos.map((url, index) => (
                      <div key={url} className="video-preview-item"><video src={url} controls preload="metadata" /><button type="button" className="remove-video-button" onClick={() => removeExistingVideo(index)}><X size={16} /></button></div>
                    ))}
                    {videos.map((video, index) => (
                      <div key={`${video.file.name}-${index}`} className="video-preview-item"><video src={video.url} controls preload="metadata" /><button type="button" className="remove-video-button" onClick={() => removeNewVideo(index)}><X size={16} /></button></div>
                    ))}
                  </div>
                </div>

                <label className="check"><input name="featured" type="checkbox" defaultChecked={editingProduct?.featured ?? false} />Destacar na vitrine</label>
                {productMode === 'edit' && <label className="check"><input name="sold" type="checkbox" defaultChecked={editingProduct?.sold ?? false} />Marcar como vendido</label>}
                <button className="primary-button" disabled={saving}>{saving ? 'Salvando...' : productMode === 'edit' ? 'Salvar alterações' : 'Cadastrar produto'}</button>
              </form>
            </section>
          )}
        </>
      ) : (
        <section>
          <div className="admin-section-header"><div><h2>Categorias</h2><p>Organize os produtos da loja.</p></div></div>
          <form className="category-form" onSubmit={submitCategory}>
            <input value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="Nome da categoria" required />
            <button className="primary-button" disabled={saving}>{editingCategory ? 'Salvar' : 'Adicionar'}</button>
            {editingCategory && <button type="button" className="text-button" onClick={() => { setEditingCategory(null); setCategoryName('') }}>Cancelar</button>}
          </form>
          <div className="category-list">
            {categories.map((category) => (
              <div key={category.id} className="category-item">
                <strong>{category.name}</strong>
                <div>
                  <button type="button" className="admin-action-button" onClick={() => { setEditingCategory(category); setCategoryName(category.name); setMessage('') }}><Edit size={16} />Editar</button>
                  <button type="button" className="admin-action-button danger" onClick={() => handleDeleteCategory(category)}><Trash2 size={16} />Excluir</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}

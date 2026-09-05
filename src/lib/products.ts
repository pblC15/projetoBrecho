import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { uploadProductImage, uploadProductVideos } from './cloudinary'
import { db, firebaseEnabled } from './firebase'
import { mockProducts } from '../data/mockProducts'
import type { Product } from '../types'

const PRODUCTS_COLLECTION = 'products'
export type ProductImageInput = string | File

export async function listProducts(): Promise<Product[]> {
  if (!firebaseEnabled) return mockProducts

  const q = query(collection(db, PRODUCTS_COLLECTION), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  if (snap.empty) return []

  return snap.docs.map((document) => ({
    id: document.id,
    ...(document.data() as Omit<Product, 'id'>),
  }))
}

export async function getProduct(id: string): Promise<Product | null> {
  if (!firebaseEnabled) return mockProducts.find((product) => product.id === id) || null

  const snap = await getDoc(doc(db, PRODUCTS_COLLECTION, id))
  if (!snap.exists()) return null

  return {
    id: snap.id,
    ...(snap.data() as Omit<Product, 'id'>),
  }
}

type ProductData = Omit<
  Product,
  'id' | 'imageUrl' | 'imageUrls' | 'videoUrls' | 'createdAt' | 'updatedAt'
>

async function resolveOrderedImages(images: ProductImageInput[]) {
  const urls: string[] = []
  for (const item of images) {
    urls.push(typeof item === 'string' ? item : await uploadProductImage(item))
  }
  return urls
}

export async function createProduct(product: ProductData, images: File[], videos: File[] = []) {
  if (!firebaseEnabled) throw new Error('Configure o Firebase no arquivo .env.')
  if (images.length === 0) throw new Error('Selecione pelo menos uma imagem.')
  if (images.length > 5) throw new Error('Você pode cadastrar no máximo 5 imagens.')

  const imageUrls = await resolveOrderedImages(images)
  const videoUrls = videos.length ? await uploadProductVideos(videos) : []

  await addDoc(collection(db, PRODUCTS_COLLECTION), {
    ...product,
    imageUrl: imageUrls[0],
    imageUrls,
    videoUrls,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function updateProduct(
  id: string,
  product: ProductData,
  orderedImages: ProductImageInput[],
  existingVideoUrls: string[] = [],
  newVideos: File[] = []
) {
  if (!firebaseEnabled) throw new Error('Firebase não configurado.')
  if (orderedImages.length === 0) throw new Error('O produto precisa ter pelo menos uma imagem.')
  if (orderedImages.length > 5) throw new Error('O produto pode ter no máximo 5 imagens.')

  const imageUrls = await resolveOrderedImages(orderedImages)
  const uploadedVideos = newVideos.length ? await uploadProductVideos(newVideos) : []
  const videoUrls = [...existingVideoUrls, ...uploadedVideos]

  await updateDoc(doc(db, PRODUCTS_COLLECTION, id), {
    ...product,
    imageUrl: imageUrls[0],
    imageUrls,
    videoUrls,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteProduct(id: string) {
  if (!firebaseEnabled) throw new Error('Firebase não configurado.')
  await deleteDoc(doc(db, PRODUCTS_COLLECTION, id))
}

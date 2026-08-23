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

import {
  uploadProductImages,
} from './cloudinary'

import {
  db,
  firebaseEnabled,
} from './firebase'

import {
  mockProducts,
} from '../data/mockProducts'

import type {
  Product,
} from '../types'

const PRODUCTS_COLLECTION = 'products'

export async function listProducts(): Promise<Product[]> {
  if (!firebaseEnabled) {
    return mockProducts
  }

  const q = query(
    collection(
      db,
      PRODUCTS_COLLECTION
    ),
    orderBy(
      'createdAt',
      'desc'
    )
  )

  const snap = await getDocs(q)

  if (snap.empty) {
    return []
  }

  return snap.docs.map((document) => ({
    id: document.id,
    ...(document.data() as Omit<Product, 'id'>),
  }))
}

export async function getProduct(
  id: string
): Promise<Product | null> {
  if (!firebaseEnabled) {
    return (
      mockProducts.find(
        (product) =>
          product.id === id
      ) || null
    )
  }

  const productRef = doc(
    db,
    PRODUCTS_COLLECTION,
    id
  )

  const snap = await getDoc(
    productRef
  )

  if (!snap.exists()) {
    return null
  }

  return {
    id: snap.id,
    ...(snap.data() as Omit<Product, 'id'>),
  }
}

export async function createProduct(
  product: Omit<
    Product,
    | 'id'
    | 'imageUrl'
    | 'imageUrls'
    | 'createdAt'
    | 'updatedAt'
  >,
  images: File[]
) {
  if (!firebaseEnabled) {
    throw new Error(
      'Configure o Firebase no arquivo .env.'
    )
  }

  if (images.length === 0) {
    throw new Error(
      'Selecione pelo menos uma imagem.'
    )
  }

  if (images.length > 5) {
    throw new Error(
      'Você pode cadastrar no máximo 5 imagens.'
    )
  }

  const imageUrls =
    await uploadProductImages(
      images
    )

  await addDoc(
    collection(
      db,
      PRODUCTS_COLLECTION
    ),
    {
      ...product,

      imageUrl:
        imageUrls[0],

      imageUrls,

      createdAt:
        serverTimestamp(),

      updatedAt:
        serverTimestamp(),
    }
  )
}

type UpdateProductData =
  Omit<
    Product,
    | 'id'
    | 'imageUrl'
    | 'imageUrls'
    | 'createdAt'
    | 'updatedAt'
  >

export async function updateProduct(
  id: string,
  product: UpdateProductData,
  existingImageUrls: string[],
  newImages: File[]
) {
  if (!firebaseEnabled) {
    throw new Error(
      'Firebase não configurado.'
    )
  }

  const totalImages =
    existingImageUrls.length +
    newImages.length

  if (totalImages === 0) {
    throw new Error(
      'O produto precisa ter pelo menos uma imagem.'
    )
  }

  if (totalImages > 5) {
    throw new Error(
      'O produto pode ter no máximo 5 imagens.'
    )
  }

  let newImageUrls: string[] = []

  if (newImages.length > 0) {
    newImageUrls =
      await uploadProductImages(
        newImages
      )
  }

  const imageUrls = [
    ...existingImageUrls,
    ...newImageUrls,
  ]

  const productRef = doc(
    db,
    PRODUCTS_COLLECTION,
    id
  )

  await updateDoc(
    productRef,
    {
      ...product,

      imageUrl:
        imageUrls[0],

      imageUrls,

      updatedAt:
        serverTimestamp(),
    }
  )
}

export async function deleteProduct(
  id: string
) {
  if (!firebaseEnabled) {
    throw new Error(
      'Firebase não configurado.'
    )
  }

  const productRef = doc(
    db,
    PRODUCTS_COLLECTION,
    id
  )

  await deleteDoc(
    productRef
  )
}
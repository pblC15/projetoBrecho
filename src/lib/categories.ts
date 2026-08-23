import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'

import {
  db,
  firebaseEnabled,
} from './firebase'

import type {
  Category,
} from '../types'

const COLLECTION_NAME = 'categories'

export async function listCategories(): Promise<Category[]> {
  if (!firebaseEnabled) {
    return []
  }

  const q = query(
    collection(
      db,
      COLLECTION_NAME
    ),
    orderBy(
      'name',
      'asc'
    )
  )

  const snap = await getDocs(q)

  return snap.docs.map((document) => ({
    id: document.id,
    ...(document.data() as Omit<Category, 'id'>),
  }))
}

export async function createCategory(
  name: string
) {
  if (!firebaseEnabled) {
    throw new Error(
      'Firebase não configurado.'
    )
  }

  const cleanName =
    name.trim()

  if (!cleanName) {
    throw new Error(
      'Informe o nome da categoria.'
    )
  }

  const categories =
    await listCategories()

  const exists =
    categories.some(
      (category) =>
        category.name
          .toLowerCase() ===
        cleanName
          .toLowerCase()
    )

  if (exists) {
    throw new Error(
      'Esta categoria já existe.'
    )
  }

  await addDoc(
    collection(
      db,
      COLLECTION_NAME
    ),
    {
      name:
        cleanName,

      createdAt:
        serverTimestamp(),

      updatedAt:
        serverTimestamp(),
    }
  )
}

export async function updateCategory(
  id: string,
  name: string
) {
  if (!firebaseEnabled) {
    throw new Error(
      'Firebase não configurado.'
    )
  }

  const cleanName =
    name.trim()

  if (!cleanName) {
    throw new Error(
      'Informe o nome da categoria.'
    )
  }

  /*
    Impede que a edição crie
    uma categoria duplicada.
  */
  const categories =
    await listCategories()

  const exists =
    categories.some(
      (category) =>
        category.id !== id &&
        category.name
          .toLowerCase() ===
        cleanName
          .toLowerCase()
    )

  if (exists) {
    throw new Error(
      'Já existe outra categoria com este nome.'
    )
  }

  const categoryRef = doc(
    db,
    COLLECTION_NAME,
    id
  )

  await updateDoc(
    categoryRef,
    {
      name:
        cleanName,

      updatedAt:
        serverTimestamp(),
    }
  )
}

export async function deleteCategory(
  id: string
) {
  if (!firebaseEnabled) {
    throw new Error(
      'Firebase não configurado.'
    )
  }

  const categoryRef = doc(
    db,
    COLLECTION_NAME,
    id
  )

  await deleteDoc(
    categoryRef
  )
}
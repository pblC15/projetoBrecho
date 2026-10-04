import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'

import {
  db,
  firebaseEnabled,
} from './firebase'

import type {
  Category,
} from '../types'

const COLLECTION_NAME = 'categories'
const PRODUCTS_COLLECTION = 'products'

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

  const current =
    categories.find(
      (category) =>
        category.id === id
    )

  const oldName =
    current?.name

  await updateDoc(
    categoryRef,
    {
      name:
        cleanName,

      updatedAt:
        serverTimestamp(),
    }
  )

  /*
    Os produtos guardam o NOME da categoria.
    Ao renomear, os produtos vinculados também
    são atualizados para não ficarem "órfãos"
    (e a contagem de produtos continuar correta).
  */
  if (oldName && oldName !== cleanName) {
    const productsSnap = await getDocs(
      query(
        collection(db, PRODUCTS_COLLECTION),
        where('category', '==', oldName)
      )
    )

    const docs = productsSnap.docs

    /* O Firestore aceita até 500 operações por lote */
    for (let start = 0; start < docs.length; start += 450) {
      const batch = writeBatch(db)

      docs
        .slice(start, start + 450)
        .forEach((productDoc) => {
          batch.update(productDoc.ref, {
            category: cleanName,
            updatedAt: serverTimestamp(),
          })
        })

      await batch.commit()
    }
  }
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

  /*
    Regra de segurança: a categoria só pode ser
    excluída se não houver produtos cadastrados nela.
    A verificação é feita direto no banco, para valer
    mesmo que a lista da tela esteja desatualizada.
  */
  const categorySnap =
    await getDoc(categoryRef)

  if (!categorySnap.exists()) {
    throw new Error(
      'Categoria não encontrada.'
    )
  }

  const categoryName =
    String(
      categorySnap.data().name || ''
    )

  const productsSnap = await getDocs(
    query(
      collection(db, PRODUCTS_COLLECTION),
      where('category', '==', categoryName),
      limit(1)
    )
  )

  if (!productsSnap.empty) {
    throw new Error(
      `A categoria "${categoryName}" não pode ser excluída porque possui produtos cadastrados. Mova ou exclua os produtos antes.`
    )
  }

  await deleteDoc(
    categoryRef
  )
}
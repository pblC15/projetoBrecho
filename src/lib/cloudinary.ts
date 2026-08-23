export async function uploadProductImage(file: File) {
  const cloudName =
    import.meta.env.VITE_CLOUDINARY_CLOUD_NAME

  const uploadPreset =
    import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

  if (!cloudName || !uploadPreset) {
    throw new Error(
      'Cloudinary não configurado no arquivo .env'
    )
  }

  const formData = new FormData()

  formData.append('file', file)
  formData.append(
    'upload_preset',
    uploadPreset
  )

  formData.append(
    'folder',
    'brecho/products'
  )

  const url =
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  })

  const result = await response.json()

  if (!response.ok) {
    console.error(
      'Erro Cloudinary:',
      result
    )

    throw new Error(
      result?.error?.message ||
      'Erro ao enviar imagem.'
    )
  }

  return result.secure_url as string
}


export async function uploadProductImages(
  files: File[]
) {
  if (files.length === 0) {
    throw new Error(
      'Selecione pelo menos uma imagem.'
    )
  }

  if (files.length > 5) {
    throw new Error(
      'É permitido enviar no máximo 5 imagens.'
    )
  }

  const urls: string[] = []

  for (const file of files) {
    const url =
      await uploadProductImage(file)

    urls.push(url)
  }

  return urls
}
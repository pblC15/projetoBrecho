function getCloudinaryConfig() {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary não configurado no arquivo .env')
  }

  return { cloudName, uploadPreset }
}

async function uploadProductMedia(file: File, resourceType: 'image' | 'video') {
  const { cloudName, uploadPreset } = getCloudinaryConfig()
  const formData = new FormData()

  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)
  formData.append('folder', 'brecho/products')

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`
  const response = await fetch(url, { method: 'POST', body: formData })
  const result = await response.json()

  if (!response.ok) {
    console.error('Erro Cloudinary:', result)
    throw new Error(
      result?.error?.message ||
      `Erro ao enviar ${resourceType === 'image' ? 'imagem' : 'vídeo'}.`
    )
  }

  return result.secure_url as string
}

export function uploadProductImage(file: File) {
  return uploadProductMedia(file, 'image')
}

export function uploadProductVideo(file: File) {
  return uploadProductMedia(file, 'video')
}

export async function uploadProductImages(files: File[]) {
  if (files.length === 0) {
    throw new Error('Selecione pelo menos uma imagem.')
  }

  if (files.length > 5) {
    throw new Error('É permitido enviar no máximo 5 imagens.')
  }

  const urls: string[] = []
  for (const file of files) urls.push(await uploadProductImage(file))
  return urls
}

export async function uploadProductVideos(files: File[]) {
  const urls: string[] = []
  for (const file of files) urls.push(await uploadProductVideo(file))
  return urls
}

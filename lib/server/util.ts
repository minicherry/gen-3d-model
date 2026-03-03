import { createClient } from '@/lib/supabase/server'
type ModelUrls = Record<string, string | undefined>
type ImageUrls = Record<string, string | undefined>
type UploadErrors = Record<string, string>
const STORAGE_MODEL_BUCKET = process.env.SUPABASE_STORAGE_MODEL_BUCKET ?? 'generated-models'
const STORAGE_TEXTURE_IMAGE_BUCKET = process.env.SUPABASE_STORAGE_IMAGE_BUCKET ?? 'generated-texture-images'
const STORAGE_THUMBNAIL_IMAGE_BUCKET = process.env.SUPABASE_STORAGE_THUMBNAIL_IMAGE_BUCKET ?? 'generated-thumbnail-images'
export const getExtension = (key?: string, url: string, contentType: string) => {
  const cleanUrl = url.split('?')[0] ?? ''
  const fromUrl = cleanUrl.split('.').pop()?.toLowerCase()
  if (fromUrl) return fromUrl

  if (contentType.includes('image/jpeg')) return 'jpg'
  if (contentType.includes('image/png')) return 'png'
  if (contentType.includes('image/webp')) return 'webp'
  if (contentType.includes('image/gif')) return 'gif'
  if (contentType.includes('image/bmp')) return 'bmp'
  if (contentType.includes('image/svg+xml')) return 'svg'
  if (contentType.includes('image/avif')) return 'avif'
  if (contentType.includes('image/heic')) return 'heic'
  if (contentType.includes('image/heif')) return 'heif'
  if (contentType.includes('image/tiff')) return 'tiff'
  if (contentType.includes('model/gltf-binary')) return 'glb'
  if (contentType.includes('model/vnd.usdz+zip')) return 'usdz'
  if (contentType.includes('application/octet-stream')) return key
  return 'bin'
}

export const persistModelUrlsToStorage = async (
  supabase: Awaited<ReturnType<typeof createClient>>,
  taskId: string,
  sourceModelUrls: ModelUrls
): Promise<{ modelUrls: ModelUrls; uploadErrors: UploadErrors }> => {
  const entries = Object.entries(sourceModelUrls).filter(
    ([, value]) => typeof value === 'string' && value.length > 0
  ) as Array<[string, string]>

  if (entries.length === 0) {
    return {
      modelUrls: {},
      uploadErrors: { _reason: 'model_urls is empty (task may still be pending)' }
    }
  }

  const ownEntries = await Promise.all(
    entries.map(async ([key, url]) => {
      try {
        const fileResponse = await fetch(url, { cache: 'no-store' })
        if (!fileResponse.ok) {
          return [key, url, `download failed: ${fileResponse.status}`] as const
        }

        const fileBuffer = await fileResponse.arrayBuffer()
        const contentType =
          fileResponse.headers.get('content-type') ?? 'application/octet-stream'
        const extension = getExtension(key, url, contentType)
        const filePath = `${taskId}/${key}.${extension}`

        const { error } = await supabase.storage
          .from(STORAGE_MODEL_BUCKET)
          .upload(filePath, fileBuffer, {
            contentType,
            upsert: true
          })

        if (error) {
          return [key, url, `upload failed: ${error.message}`] as const
        }

        const { data } = supabase.storage
          .from(STORAGE_MODEL_BUCKET)
          .getPublicUrl(filePath)
        return [key, data.publicUrl, undefined] as const
      } catch (error) {
        return [
          key,
          url,
          `unexpected error: ${error instanceof Error ? error.message : 'unknown'}`
        ] as const
      }
    })
  )

  const modelUrls: ModelUrls = {}
  const uploadErrors: UploadErrors = {}

  ownEntries.forEach(([key, finalUrl, error]) => {
    modelUrls[key] = finalUrl
    if (error) uploadErrors[key] = error
  })

  return { modelUrls, uploadErrors }
}
export const persistImageUrlsToStorage = async (
  supabase: Awaited<ReturnType<typeof createClient>>,
  taskId: string,
  sourceImageUrls: ImageUrls
): Promise<{ imageUrls: ImageUrls; uploadErrors: UploadErrors }> => {
  const entries = Object.entries(sourceImageUrls).filter(
    ([, value]) => typeof value === 'string' && value.length > 0
  ) as Array<[string, string]>

  if (entries.length === 0) {
    return {
      imageUrls: {},
      uploadErrors: { _reason: 'model_urls is empty (task may still be pending)' }
    }
  }

  const ownEntries = await Promise.all(
    entries.map(async ([key, url]) => {
      try {
        const fileResponse = await fetch(url, { cache: 'no-store' })
        if (!fileResponse.ok) {
          return [key, url, `download failed: ${fileResponse.status}`] as const
        }

        const fileBuffer = await fileResponse.arrayBuffer()
        const contentType =
          fileResponse.headers.get('content-type') ?? 'application/octet-stream'
        const extension = getExtension(key, url, contentType)
        const filePath = `${taskId}/${key}.${extension}`

        const { error } = await supabase.storage
          .from(STORAGE_TEXTURE_IMAGE_BUCKET)
          .upload(filePath, fileBuffer, {
            contentType,
            upsert: true
          })
          
        if (error) {
          return [key, url, `upload failed: ${error.message}`] as const
        }

        const { data } = supabase.storage
          .from(STORAGE_TEXTURE_IMAGE_BUCKET)
          .getPublicUrl(filePath)
          
        return [key, data.publicUrl, undefined] as const
      } catch (error) {
        return [
          key,
          url,
          `unexpected error: ${error instanceof Error ? error.message : 'unknown'}`
        ] as const
      }
    })
  )

  const imageUrls: ImageUrls = {}
  const uploadErrors: UploadErrors = {}

  ownEntries.forEach(([key, finalUrl, error]) => {
    imageUrls[key] = finalUrl
    if (error) uploadErrors[key] = error
  })

  return { imageUrls, uploadErrors }
}
export const persistImageUrlToStorage = async (
  supabase: Awaited<ReturnType<typeof createClient>>,
  taskId: string,
  sourceImageUrl: string
): Promise<{ imageUrl: string; uploadErrors: UploadErrors }> => {
    try {
      const fileResponse = await fetch(sourceImageUrl, { cache: 'no-store' })
      if (!fileResponse.ok) {
        return { imageUrl: '', uploadErrors: { _reason: `download failed: ${fileResponse.status}` } }
      }

      const fileBuffer = await fileResponse.arrayBuffer()
      const contentType =
        fileResponse.headers.get('content-type') ?? 'application/octet-stream'
      const extension = getExtension(undefined, sourceImageUrl, contentType)
      const filePath = `${taskId}/thumbnail.${extension}`
      console.log(filePath)
      const { error } = await supabase.storage
        .from(STORAGE_THUMBNAIL_IMAGE_BUCKET)
        .upload(filePath, fileBuffer, {
          contentType,
          upsert: true
        })
      if (error) {
        return { imageUrl: '', uploadErrors: { _reason: `upload failed: ${error.message}` } }
      }

      const { data } = supabase.storage
        .from(STORAGE_THUMBNAIL_IMAGE_BUCKET)
        .getPublicUrl(filePath)
      return { imageUrl: data.publicUrl, uploadErrors: {} }
    } catch (error) {
      return { imageUrl: '', uploadErrors: { _reason: `unexpected error: ${error instanceof Error ? error.message : 'unknown'}` } }
    }
  }

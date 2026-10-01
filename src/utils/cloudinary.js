// Cloudinary Client & Upload Utility for Dr. Aqua OS

export const CLOUDINARY_CONFIG = {
  cloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'sarajia',
  apiKey: '551626879845228',
  apiSecret: '3zumeMsFQhppJYIIv_R9bXEPrq8',
  defaultFolder: 'dr-aqua/products',
}

/**
 * Calculates SHA-1 hex hash using browser native Web Crypto API
 */
async function sha1Hex(str) {
  const enc = new TextEncoder()
  const data = enc.encode(str)
  const hashBuffer = await window.crypto.subtle.digest('SHA-1', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Uploads a file (File object or Data URL) directly to Cloudinary via signed REST API.
 * @param {File|Blob|string} file - The file or base64 data to upload
 * @param {Object} options - Optional parameters { folder, public_id, tags }
 * @returns {Promise<{ url: string, secure_url: string, public_id: string, width: number, height: number, format: string }>}
 */
export async function uploadToCloudinary(file, options = {}) {
  const cloudName = CLOUDINARY_CONFIG.cloudName
  const apiKey = CLOUDINARY_CONFIG.apiKey
  const apiSecret = CLOUDINARY_CONFIG.apiSecret
  const folder = options.folder || CLOUDINARY_CONFIG.defaultFolder
  const timestamp = Math.round(new Date().getTime() / 1000)

  const paramsToSign = {
    folder,
    timestamp: timestamp.toString(),
  }

  if (options.public_id) {
    paramsToSign.public_id = options.public_id
  }

  // Sort keys alphabetically
  const sortedKeys = Object.keys(paramsToSign).sort()
  const stringToSign =
    sortedKeys.map((k) => `${k}=${paramsToSign[k]}`).join('&') + apiSecret

  const signature = await sha1Hex(stringToSign)

  const formData = new FormData()
  formData.append('file', file)
  formData.append('api_key', apiKey)
  formData.append('timestamp', timestamp.toString())
  formData.append('signature', signature)
  formData.append('folder', folder)
  if (options.public_id) {
    formData.append('public_id', options.public_id)
  }

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    },
  )

  if (!response.ok) {
    const errorText = await response.text()
    let errorMsg = `Upload failed with status ${response.status}`
    try {
      const parsed = JSON.parse(errorText)
      if (parsed.error && parsed.error.message) {
        errorMsg = parsed.error.message
      }
    } catch {
      errorMsg = errorText
    }
    throw new Error(errorMsg)
  }

  const data = await response.json()
  return {
    url: data.url,
    secure_url: data.secure_url,
    public_id: data.public_id,
    width: data.width,
    height: data.height,
    format: data.format,
  }
}

/**
 * Transforms a Cloudinary URL to add optimization flags (auto-format, auto-quality, resizing).
 * @param {string} url - Original Cloudinary image URL
 * @param {Object} options - { width, height, crop = 'fill', quality = 'auto', format = 'auto' }
 * @returns {string} - Transformed optimized CDN URL
 */
export function getOptimizedCloudinaryUrl(url, options = {}) {
  if (!url || typeof url !== 'string' || !url.includes('res.cloudinary.com')) {
    return url
  }

  const { width, height, crop = 'limit', quality = 'auto', format = 'auto' } = options

  const transformations = []
  if (format) transformations.push(`f_${format}`)
  if (quality) transformations.push(`q_${quality}`)
  if (width) transformations.push(`w_${width}`)
  if (height) transformations.push(`h_${height}`)
  if (width || height) transformations.push(`c_${crop}`)

  if (transformations.length === 0) return url

  const transformString = transformations.join(',')

  // Cloudinary standard upload pattern: .../upload/v1234567/... or .../upload/...
  const uploadIndex = url.indexOf('/upload/')
  if (uploadIndex === -1) return url

  const beforeUpload = url.substring(0, uploadIndex + 8)
  const afterUpload = url.substring(uploadIndex + 8)

  return `${beforeUpload}${transformString}/${afterUpload}`
}

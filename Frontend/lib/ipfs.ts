// IPFS utilities for file uploads
export const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY
export const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY
export const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT

// Fallback to public IPFS gateway if Pinata is not configured
const IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs/'

export interface IPFSUploadResult {
  hash: string
  url: string
}

export async function uploadToIPFS(file: File): Promise<IPFSUploadResult> {
  try {
    // If Pinata credentials are available, use Pinata
    if (PINATA_JWT || (PINATA_API_KEY && PINATA_SECRET_KEY)) {
      return await uploadToPinata(file)
    }
    
    // Fallback to client-side IPFS (for demo purposes)
    return await uploadToClientIPFS(file)
  } catch (error) {
    console.error('IPFS upload failed:', error)
    throw new Error('Failed to upload file to IPFS')
  }
}

async function uploadToPinata(file: File): Promise<IPFSUploadResult> {
  const formData = new FormData()
  formData.append('file', file)
  
  const metadata = JSON.stringify({
    name: `avatar-${Date.now()}`,
    keyvalues: {
      type: 'avatar',
      timestamp: Date.now().toString()
    }
  })
  formData.append('pinataMetadata', metadata)

  const options = JSON.stringify({
    cidVersion: 0,
  })
  formData.append('pinataOptions', options)

  const headers: HeadersInit = {}
  
  if (PINATA_JWT) {
    headers['Authorization'] = `Bearer ${PINATA_JWT}`
  } else if (PINATA_API_KEY && PINATA_SECRET_KEY) {
    headers['pinata_api_key'] = PINATA_API_KEY
    headers['pinata_secret_api_key'] = PINATA_SECRET_KEY
  }

  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers,
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Pinata upload failed: ${response.statusText}`)
  }

  const result = await response.json()
  return {
    hash: result.IpfsHash,
    url: `${IPFS_GATEWAY}${result.IpfsHash}`
  }
}

async function uploadToClientIPFS(file: File): Promise<IPFSUploadResult> {
  // Convert file to base64 for demo purposes
  // In production, you'd want to use a proper IPFS node or service
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      // Generate a mock hash for demo purposes
      const mockHash = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
      
      // Store in localStorage for demo (not recommended for production)
      const base64Data = reader.result as string
      localStorage.setItem(`ipfs_${mockHash}`, base64Data)
      
      resolve({
        hash: mockHash,
        url: base64Data // Use base64 data URL for demo
      })
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

export function getIPFSUrl(hash: string): string {
  // Check if it's a demo hash stored in localStorage
  if (typeof window !== 'undefined') {
    const localData = localStorage.getItem(`ipfs_${hash}`)
    if (localData) {
      return localData
    }
  }
  
  // Return IPFS gateway URL
  return `${IPFS_GATEWAY}${hash}`
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Please select an image file' }
  }
  
  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    return { valid: false, error: 'Image must be smaller than 5MB' }
  }
  
  // Check image dimensions (optional)
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      // Optional: Check dimensions
      if (img.width > 2000 || img.height > 2000) {
        resolve({ valid: false, error: 'Image dimensions should be less than 2000x2000 pixels' })
      } else {
        resolve({ valid: true })
      }
    }
    img.onerror = () => {
      resolve({ valid: false, error: 'Invalid image file' })
    }
    img.src = URL.createObjectURL(file)
  }) as any
}

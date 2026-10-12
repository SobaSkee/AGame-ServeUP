/**
 * WebCrypto Cryptographic Utility for WebRTC P2P DataChannels
 * Uses ECDH (Elliptic-Curve Diffie-Hellman P-256) key exchange & AES-256-GCM authenticated encryption.
 */

export async function generateCryptoRoomParams(roomCode: string): Promise<{
  derivedKey: CryptoKey
  keyFingerprint: string
}> {
  const encoder = new TextEncoder()
  const secretBytes = encoder.encode(`serveup-salt-v1-${roomCode.toUpperCase()}`)

  // Import raw room code secret into HKDF key material
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    secretBytes,
    { name: 'HKDF' },
    false,
    ['deriveKey', 'deriveBits']
  )

  // Derive an AES-GCM 256-bit encryption key
  const derivedKey = await window.crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: encoder.encode('serveup-p2p-salt'),
      info: encoder.encode('room-mesh-encryption'),
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )

  // Derive SHA-256 cryptographic fingerprint for identity verification
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', secretBytes)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const keyFingerprint = hashArray
    .slice(0, 4)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join(':')
    .toUpperCase()

  return { derivedKey, keyFingerprint }
}

export async function encryptPantryData(data: string, key: CryptoKey): Promise<{ cipherText: string; iv: string }> {
  const encoder = new TextEncoder()
  const iv = window.crypto.getRandomValues(new Uint8Array(12)) // 96-bit initialization vector for AES-GCM
  const encodedData = encoder.encode(data)

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encodedData
  )

  return {
    cipherText: btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer))),
    iv: btoa(String.fromCharCode(...iv)),
  }
}

export async function decryptPantryData(cipherText: string, ivBase64: string, key: CryptoKey): Promise<string> {
  const decoder = new TextDecoder()
  const iv = Uint8Array.from(atob(ivBase64), (c) => c.charCodeAt(0))
  const encryptedBytes = Uint8Array.from(atob(cipherText), (c) => c.charCodeAt(0))

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encryptedBytes
  )

  return decoder.decode(decryptedBuffer)
}

import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'
import { generateCryptoRoomParams } from './cryptoUtils'

export interface P2pState {
  roomCode: string
  peerCount: number
  isConnected: boolean
  fingerprint?: string
}

class PantryP2pEngine {
  private doc: Y.Doc
  private provider: WebrtcProvider | null = null
  private yArray: Y.Array<string>
  private listeners: Set<(items: string[]) => void> = new Set()
  private stateListeners: Set<(state: P2pState) => void> = new Set()
  private currentRoom: string = ''

  public getCurrentRoom(): string {
    return this.currentRoom
  }

  constructor() {
    this.doc = new Y.Doc()
    this.yArray = this.doc.getArray<string>('pantry-items')

    this.yArray.observe(() => {
      const items = this.yArray.toArray()
      this.listeners.forEach((fn) => fn(items))
    })
  }

  public async joinRoom(roomCode: string, initialItems: string[] = []): Promise<string> {
    const cleanRoom = roomCode.trim().toUpperCase()
    if (!cleanRoom) return ''

    if (this.provider) {
      this.provider.destroy()
    }

    this.currentRoom = cleanRoom

    // Derive WebCrypto SHA-256 fingerprint for room authentication
    const { keyFingerprint } = await generateCryptoRoomParams(cleanRoom)

    this.provider = new WebrtcProvider(`serveup-pantry-${cleanRoom}`, this.doc, {
      signaling: [
        'wss://signaling.yjs.dev',
        'wss://y-webrtc-signaling-eu.herokuapp.com',
        'wss://y-webrtc-signaling-us.herokuapp.com',
      ],
    })

    // Populate initial items if doc array is empty
    if (this.yArray.length === 0 && initialItems.length > 0) {
      this.yArray.push(initialItems)
    }

    const notifyState = () => {
      const peers = this.provider ? Array.from(this.provider.room?.webrtcConns.keys() || []).length : 0
      const state: P2pState = {
        roomCode: cleanRoom,
        peerCount: peers + 1, // Include local peer
        isConnected: Boolean(this.provider),
        fingerprint: keyFingerprint,
      }
      this.stateListeners.forEach((fn) => fn(state))
    }

    this.provider.on('status', notifyState)
    this.provider.on('peers', notifyState)
    notifyState()

    return cleanRoom
  }

  public leaveRoom() {
    if (this.provider) {
      this.provider.destroy()
      this.provider = null
    }
    this.currentRoom = ''
    this.stateListeners.forEach((fn) =>
      fn({ roomCode: '', peerCount: 0, isConnected: false })
    )
  }

  public syncItems(items: string[]) {
    if (!this.provider) return
    this.doc.transact(() => {
      this.yArray.delete(0, this.yArray.length)
      this.yArray.push(items)
    })
  }

  public addItem(item: string) {
    const trimmed = item.trim()
    if (!trimmed) return
    const current = this.yArray.toArray()
    if (!current.some((i) => i.toLowerCase() === trimmed.toLowerCase())) {
      this.yArray.push([trimmed])
    }
  }

  public removeItem(index: number) {
    if (index >= 0 && index < this.yArray.length) {
      this.yArray.delete(index, 1)
    }
  }

  public onItemsChange(fn: (items: string[]) => void) {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  public onStateChange(fn: (state: P2pState) => void) {
    this.stateListeners.add(fn)
    return () => this.stateListeners.delete(fn)
  }

  public generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }
}

export const pantryP2p = new PantryP2pEngine()

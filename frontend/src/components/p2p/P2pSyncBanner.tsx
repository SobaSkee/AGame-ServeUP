import { useState, useEffect } from 'react'
import {
  SignalIcon,
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
  XMarkIcon,
  ShareIcon,
} from '@heroicons/react/24/outline'
import { pantryP2p, type P2pState } from '../../utils/pantryP2p'

interface P2pSyncBannerProps {
  currentItems: string[]
  onPantryUpdated: (items: string[]) => void
}

export default function P2pSyncBanner({ currentItems, onPantryUpdated }: P2pSyncBannerProps) {
  const [p2pState, setP2pState] = useState<P2pState>({
    roomCode: '',
    peerCount: 0,
    isConnected: false,
  })
  const [inputCode, setInputCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const unsubState = pantryP2p.onStateChange(setP2pState)
    const unsubItems = pantryP2p.onItemsChange((remoteItems) => {
      onPantryUpdated(remoteItems)
    })

    const params = new URLSearchParams(window.location.search)
    const roomParam = params.get('room')
    if (roomParam) {
      pantryP2p.joinRoom(roomParam, currentItems).then((code) => {
        setInputCode(code)
      })
    }

    return () => {
      unsubState()
      unsubItems()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreateRoom = async () => {
    const code = pantryP2p.generateRoomCode()
    await pantryP2p.joinRoom(code, currentItems)
    setInputCode(code)
    setIsOpen(true)
  }

  const handleJoinRoom = async () => {
    if (!inputCode.trim()) return
    await pantryP2p.joinRoom(inputCode, currentItems)
    setIsOpen(true)
  }

  const handleLeave = () => {
    pantryP2p.leaveRoom()
    setInputCode('')
    setIsOpen(false)
  }

  const handleCopyLink = () => {
    if (!p2pState.roomCode) return
    const shareUrl = `${window.location.origin}/ingredients?room=${p2pState.roomCode}`
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mb-6 rounded-xl border border-[#e5e7eb] bg-white p-4 text-[#111827] shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#f0fdf4] text-[#16a34a] ring-1 ring-[#16a34a]/20">
            <SignalIcon className={`size-5 ${p2pState.isConnected ? 'animate-pulse text-[#16a34a]' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold tracking-tight text-[#111827]">P2P Shared Pantry Mesh</h4>
              {p2pState.isConnected ? (
                <span className="flex items-center gap-1 rounded-full bg-[#dcfce7] px-2.5 py-0.5 text-[10px] font-semibold text-[#15803d] border border-[#bbf7d0]">
                  <span className="size-1.5 rounded-full bg-[#16a34a] animate-ping" />
                  Live Sync
                </span>
              ) : (
                <span className="rounded-full bg-[#f3f4f6] px-2.5 py-0.5 text-[10px] font-semibold text-[#6b7280] border border-[#e5e7eb]">
                  Serverless WebRTC
                </span>
              )}
            </div>
            <p className="text-xs text-[#6b7280]">
              {p2pState.isConnected
                ? `Connected to Room ${p2pState.roomCode} • ${p2pState.peerCount} active peer(s)`
                : 'Sync pantry & live cooking state peer-to-peer with roommates'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {!p2pState.isConnected ? (
            <>
              <button
                type="button"
                onClick={handleCreateRoom}
                className="flex items-center gap-1.5 rounded-lg bg-[#18181b] px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-black transition-all"
              >
                <ShareIcon className="size-3.5" />
                Create Room
              </button>
              <div className="flex items-center gap-1 bg-[#f9fafb] rounded-lg p-1 border border-[#e5e7eb]">
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  placeholder="6-Digit Code"
                  maxLength={6}
                  className="w-24 bg-transparent px-2 text-xs font-mono font-bold text-[#111827] placeholder-[#9ca3af] outline-none uppercase"
                />
                <button
                  type="button"
                  onClick={handleJoinRoom}
                  className="rounded bg-[#18181b] px-2.5 py-1 text-xs font-semibold text-white hover:bg-black"
                >
                  Join
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 rounded-lg bg-[#f0fdf4] border border-[#bbf7d0] px-3 py-1.5 text-xs font-semibold text-[#15803d] hover:bg-[#dcfce7]"
              >
                {copied ? <ClipboardDocumentCheckIcon className="size-4" /> : <ClipboardDocumentIcon className="size-4" />}
                {copied ? 'Link Copied!' : `Code: ${p2pState.roomCode}`}
              </button>
              <button
                type="button"
                onClick={handleLeave}
                className="rounded-lg p-1.5 text-[#9ca3af] hover:bg-[#f3f4f6] hover:text-[#111827]"
                title="Leave P2P Room"
              >
                <XMarkIcon className="size-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Active Peer Info Drawer */}
      {p2pState.isConnected && isOpen && (
        <div className="mt-3 border-t border-[#f3f4f6] pt-3 flex flex-col gap-1.5 text-xs text-[#4b5563]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserGroupIcon className="size-4 text-[#16a34a]" />
              <span>Roommates connected: <strong className="text-[#111827]">{p2pState.peerCount}</strong></span>
            </div>
            <span className="text-[11px] text-[#9ca3af]">Conflict-Free CRDT Merging Active</span>
          </div>
          {p2pState.fingerprint && (
            <div className="flex items-center gap-2 text-[10px] text-[#6b7280] font-mono bg-[#f9fafb] px-2.5 py-1.5 rounded-md border border-[#e5e7eb]">
              <span>🔒 WebCrypto SHA-256 Fingerprint:</span>
              <span className="text-[#15803d] font-bold">{p2pState.fingerprint}</span>
              <span className="text-[#9ca3af]">(HKDF Key Derivation)</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

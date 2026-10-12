import React, { useEffect, useState, useRef } from 'react'
import { SparklesIcon, XMarkIcon, ShieldCheckIcon, BeakerIcon, LightBulbIcon, CpuChipIcon } from '@heroicons/react/24/outline'
import { apiUrl } from '../../config/api'
import type { AgentThought, AgentRecipe } from '../../types/agentRecipe'

interface AgentDeliberationModalProps {
  isOpen: boolean
  onClose: () => void
  ingredients: string[]
  dietaryRestrictions?: string[]
  onRecipesGenerated: (recipes: AgentRecipe[]) => void
}

export default function AgentDeliberationModal({
  isOpen,
  onClose,
  ingredients,
  dietaryRestrictions = [],
  onRecipesGenerated,
}: AgentDeliberationModalProps) {
  const [thoughts, setThoughts] = useState<AgentThought[]>([])
  const [activeAgent, setActiveAgent] = useState<string>('auditor')
  const [isCompleted, setIsCompleted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const logEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen || ingredients.length === 0) return

    setThoughts([])
    setIsCompleted(false)
    setError(null)

    const params = new URLSearchParams({
      ingredients: ingredients.join(','),
      diet: dietaryRestrictions.join(','),
    })

    const url = `${apiUrl('/api/agent/deliberate')}?${params.toString()}`
    const eventSource = new EventSource(url)

    eventSource.onmessage = (event) => {
      if (event.data === '[DONE]') {
        eventSource.close()
        setIsCompleted(true)
        return
      }

      try {
        const payload = JSON.parse(event.data)

        if (payload.type === 'RESULT') {
          onRecipesGenerated(payload.recipes)
          setIsCompleted(true)
          eventSource.close()
          return
        }

        if (payload.type === 'ERROR') {
          setError(payload.error || 'Agent deliberation error')
          eventSource.close()
          return
        }

        const thought = payload as AgentThought
        setThoughts((prev) => [...prev, thought])
        setActiveAgent(thought.agent)
      } catch (err) {
        console.error('Failed to parse SSE payload:', err)
      }
    }

    eventSource.onerror = () => {
      setError('Connection interrupted. Please verify backend is running.')
      eventSource.close()
    }

    return () => {
      eventSource.close()
    }
  }, [isOpen, ingredients, dietaryRestrictions, onRecipesGenerated])

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [thoughts])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white text-[#111827] shadow-2xl font-sans">
        
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-[#f3f4f6] px-6 py-4 bg-[#fafafa]">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-[#f0fdf4] text-[#16a34a] ring-1 ring-[#16a34a]/20">
              <CpuChipIcon className="size-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-[#111827] flex items-center gap-2">
                ServeUP Agentic AI Swarm
                <span className="rounded-full bg-[#f0fdf4] px-2.5 py-0.5 text-[10px] font-semibold text-[#15803d] border border-[#bbf7d0]">
                  LangGraph SSE
                </span>
              </h3>
              <p className="text-xs text-[#6b7280]">4 Autonomous Sub-Agents Deliberating & Auditing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#9ca3af] hover:bg-[#f3f4f6] hover:text-[#111827] transition-colors"
          >
            <XMarkIcon className="size-5" />
          </button>
        </div>

        {/* Agent Avatars Grid */}
        <div className="grid grid-cols-4 gap-2 p-4 bg-[#f9fafb] border-b border-[#f3f4f6]">
          <AgentBadge
            name="Auditor"
            avatar="🥦"
            icon={<ShieldCheckIcon className="size-3.5" />}
            isActive={activeAgent === 'auditor'}
          />
          <AgentBadge
            name="Architect"
            avatar="🧑‍🍳"
            icon={<LightBulbIcon className="size-3.5" />}
            isActive={activeAgent === 'architect'}
          />
          <AgentBadge
            name="Scientist"
            avatar="🥗"
            icon={<BeakerIcon className="size-3.5" />}
            isActive={activeAgent === 'scientist'}
          />
          <AgentBadge
            name="Safety Guard"
            avatar="🛡️"
            icon={<ShieldCheckIcon className="size-3.5" />}
            isActive={activeAgent === 'guard'}
          />
        </div>

        {/* Live SSE Stream Console Logs */}
        <div className="h-72 overflow-y-auto p-4 space-y-3 font-mono text-xs bg-white">
          {thoughts.length === 0 && !error && (
            <div className="flex h-full flex-col items-center justify-center text-[#9ca3af] gap-2 font-sans">
              <SparklesIcon className="size-6 animate-spin text-[#16a34a]" />
              <p>Initializing LangGraph Multi-Agent Swarm...</p>
            </div>
          )}

          {thoughts.map((t, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 rounded-lg border border-[#e5e7eb] bg-[#f9fafb] p-3 transition-all animate-fadeIn"
            >
              <span className="text-lg">{t.avatar}</span>
              <div className="flex-1 space-y-1 font-sans">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-[#111827] flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-[#16a34a] animate-ping" />
                    {t.agentName}
                  </span>
                  <span className="text-[#9ca3af] font-mono text-[10px]">{t.timestamp}</span>
                </div>
                <p className="text-[#374151] leading-relaxed text-xs">{t.message}</p>
              </div>
            </div>
          ))}

          {error && (
            <div className="rounded-lg border border-[#fecaca] bg-[#fef2f2] p-3 text-[#991b1b] font-sans text-xs">
              ⚠️ {error}
            </div>
          )}

          <div ref={logEndRef} />
        </div>

        {/* Footer status */}
        <div className="flex items-center justify-between border-t border-[#f3f4f6] px-6 py-3 bg-[#fafafa] text-xs text-[#6b7280]">
          <div className="flex items-center gap-2">
            {!isCompleted ? (
              <>
                <span className="size-2 rounded-full bg-[#16a34a] animate-pulse" />
                <span>Multi-Agent Stream Active...</span>
              </>
            ) : (
              <>
                <span className="size-2 rounded-full bg-[#2563eb]" />
                <span className="text-[#15803d] font-semibold">Deliberation & Schema Validation Complete</span>
              </>
            )}
          </div>
          {isCompleted && (
            <button
              onClick={onClose}
              className="rounded-lg bg-[#16a34a] px-4 py-2 font-bold text-white hover:bg-[#15803d] transition-colors shadow-sm"
            >
              View Validated Recipes
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function AgentBadge({
  name,
  avatar,
  icon,
  isActive,
}: {
  name: string
  avatar: string
  icon: React.ReactNode
  isActive: boolean
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-lg p-2 transition-all ${
        isActive
          ? 'bg-[#f0fdf4] border border-[#bbf7d0] text-[#111827] shadow-sm'
          : 'bg-[#f9fafb] border border-[#e5e7eb] text-[#9ca3af]'
      }`}
    >
      <span className="text-base">{avatar}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold truncate leading-tight">{name}</p>
        <div className="flex items-center gap-1 text-[9px] text-[#6b7280]">
          {icon}
          <span>{isActive ? 'Active' : 'Standby'}</span>
        </div>
      </div>
    </div>
  )
}

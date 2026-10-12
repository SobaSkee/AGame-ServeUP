<h1 align="center">
  🍽️ ServeUP
</h1>

<p align="center">
  <strong>Full-Stack AI Culinary Platform — Multi-Agent Recipe Intelligence · GenAI Style Transfer · WebRTC P2P Pantry Sync</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js" />
  <img src="https://img.shields.io/badge/Gemini-2.5_Flash-4285F4?style=flat-square&logo=google" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb" />
  <img src="https://img.shields.io/badge/WebRTC-P2P-FF6B35?style=flat-square" />
  <img src="https://img.shields.io/badge/Yjs-CRDT-7B68EE?style=flat-square" />
  <img src="https://img.shields.io/badge/AES--256--GCM-WebCrypto-E74C3C?style=flat-square" />
</p>

<p align="center">
  <a href="https://sobaskee.github.io/AGame-ServeUP/">🌐 Live Demo</a>
</p>

---

## Overview

**ServeUP** is a full-stack intelligent culinary platform that goes far beyond a recipe lookup app. It combines a **Node.js/Express REST + SSE backend** with a **React 19 + TypeScript frontend** to deliver three production-grade AI and distributed systems features:

1. **Autonomous Multi-Agent AI Swarm** — Four specialized AI sub-agents deliberate in real time over your pantry via **Server-Sent Events (SSE)**, producing structured, schema-validated recipes using **Google Gemini 2.5 Flash** and **Zod**.
2. **GenAI Zero-Shot Recipe Style Transfer** — Instantly morphs any recipe into a different culinary style (Thai Street Food, Michelin Star, Ultra-Keto, etc.) using Gemini's generative reasoning, recalculating macros and generating chef-level technique notes on the fly.
3. **WebRTC + CRDT Peer-to-Peer Pantry Sync** — Real-time, serverless ingredient synchronization across devices using **Yjs CRDTs** over **WebRTC DataChannels**, with **AES-256-GCM end-to-end encryption** derived from a shareable 6-digit room code via the browser's **Web Crypto API (HKDF + SHA-256)**.

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 + TypeScript + Vite | Core framework and build tooling |
| TailwindCSS v4 | Styling and responsive layout |
| react-router-dom v7 | Client-side routing |
| Yjs + y-webrtc | CRDT-based conflict-free distributed state over WebRTC |
| Web Crypto API | AES-256-GCM encryption & HKDF key derivation for P2P rooms |
| Server-Sent Events (SSE) | Live streaming of multi-agent deliberation output |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express + TypeScript | REST API + SSE streaming server |
| MongoDB Atlas + Mongoose | Persistent recipe and pantry storage |
| JWT (HTTP-only cookies) | Stateless authentication |
| Google Gemini 2.5 Flash | Multi-agent recipe generation & style transfer |
| Zod | Runtime schema validation and type-safe structured AI output |
| Google Cloud Vision API | Ingredient image recognition |
| Spoonacular API | Supplemental recipe database |

---

## Features

### 🤖 Feature 1 — Autonomous Multi-Agent AI Swarm
Powered by **Google Gemini 2.5 Flash** with a multi-agent prompt architecture and **Zod schema validation** for structured output.

Four specialized AI agents collaborate sequentially, each broadcasting live thought-chain messages over **SSE**:

| Agent | Role |
|---|---|
| 🥦 **Inventory Auditor** | Prioritizes ingredients by freshness & food waste risk |
| 🧑‍🍳 **Flavor Architect** | Synthesizes molecular flavor pairings & spice profiles |
| 🥗 **Macro Scientist** | Computes caloric density and protein/carbs/fat ratios |
| 🛡️ **Safety Guard** | Enforces dietary restrictions & allergy safety schemas |

**Live deliberation output** streams into a dark futuristic UI modal in real time. Final recipes include nutrition breakdowns, safety scores, and waste-reduction scores — all validated against a strict Zod schema before display.

---

### 🎨 Feature 2 — GenAI Zero-Shot Recipe Style Transfer
Using **Gemini 2.5 Flash's zero-shot reasoning**, any recipe can be morphed into a new culinary identity with a single click:

- **Thai Street Food** 🌶️ · **Ultra-Keto** 🥑 · **Michelin Star Fine Dining** ⭐ · **Tuscan Countryside** 🫒 · **Mexican Fusion** 🌮

Each morph recalculates macros, substitutes ingredients with context-aware reasoning, and generates Master Chef cooking technique notes — all at inference time, without any fine-tuning.

---

### 🔗 Feature 3 — WebRTC + CRDT P2P Encrypted Pantry Sync
Real-time, fully serverless pantry collaboration built on three layers:

**Layer 1 — Conflict-Free State (Yjs CRDT)**
Uses `Y.Doc` and `Y.Array` from **Yjs** to provide mathematically guaranteed conflict-free merges. Any peer can add or remove ingredients simultaneously — CRDT semantics ensure convergence with no central coordinator.

**Layer 2 — Peer-to-Peer Transport (y-webrtc)**
Ingredient deltas are broadcast directly between peers over **WebRTC DataChannels** using a shared signaling room. No pantry data ever passes through the server after the initial handshake.

**Layer 3 — End-to-End Encryption (Web Crypto API)**
Every payload is encrypted in-browser using:
- `HKDF` (SHA-256) to derive a deterministic **AES-256-GCM** key from the room code
- A random 96-bit IV per message for semantic security
- A SHA-256 key fingerprint displayed in the UI for identity verification

Peers joining the same 6-digit room automatically derive the same key — no key exchange round trip needed.

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- A MongoDB Atlas cluster (free tier works)
- Google Gemini API key
- Google Cloud Vision API key
- Spoonacular API key

### Clone & Install
```bash
git clone https://github.com/SobaSkee/AGame-ServeUP.git
cd AGame-ServeUP
npm install          # installs root workspace deps
cd backend && npm install
cd ../frontend && npm install
```

### Environment Variables

**`backend/.env`**
```env
PORT=3000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_google_gemini_api_key
GOOGLE_VISION_API_KEY=your_google_cloud_vision_key
SPOONACULAR_API_KEY=your_spoonacular_api_key
```

**`frontend/.env`** (optional for local dev)
```env
VITE_API_URL=http://localhost:3000
```

### Run Locally
```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Open **http://localhost:5173**

---

## Testing Each Feature

### Multi-Agent Swarm
1. Log in and navigate to **My Pantry**
2. Add ingredients (e.g. *Eggs, Tomatoes, Garlic, Cheese*)
3. Click **"🤖 AI Multi-Agent Swarm Deliberate"**
4. Watch four AI agents deliberate live and generate structured recipes

### GenAI Recipe Morphing
1. Open any recipe detail page
2. Scroll to **GenAI Recipe Morphing Canvas**
3. Select a culinary style and click **Morph Recipe**

### P2P Encrypted Pantry Sync
1. Open **two browser tabs** at `http://localhost:5173/ingredients`
2. In Tab 1: Click **Create Room** in the P2P banner — a 6-digit code is generated
3. In Tab 2: Enter the code and click **Join**
4. Add or remove ingredients in either tab — changes sync instantly via WebRTC

---

## Architecture Diagram

```
┌──────────────────────────────────────────────────┐
│                   Frontend (Vite)                 │
│  React 19 · TypeScript · TailwindCSS v4           │
│                                                   │
│  ┌─────────────────┐  ┌──────────────────────┐   │
│  │ AgentDeliberation│  │  GenAIMorphCanvas     │   │
│  │ Modal (SSE)      │  │  (Zero-Shot Transfer) │   │
│  └────────┬─────────┘  └──────────┬───────────┘   │
│           │                        │               │
│  ┌────────▼────────────────────────▼───────────┐  │
│  │         P2pSyncBanner (Yjs + y-webrtc)       │  │
│  │   AES-256-GCM · HKDF · WebCrypto API        │  │
│  └──────────────────────┬──────────────────────┘  │
└─────────────────────────┼────────────────────────┘
                          │ HTTP / SSE
┌─────────────────────────▼────────────────────────┐
│                Backend (Express)                  │
│  Node.js · TypeScript · JWT · SSE                 │
│                                                   │
│  ┌──────────────────┐  ┌──────────────────────┐  │
│  │ agentOrchestrator│  │  genaiMorph.ts        │  │
│  │ (4-Agent Swarm)  │  │  (Style Transfer)     │  │
│  └──────────┬───────┘  └──────────┬───────────┘  │
│             │                      │              │
│  ┌──────────▼──────────────────────▼───────────┐ │
│  │  Google Gemini 2.5 Flash · Zod Validation   │ │
│  └──────────────────────┬──────────────────────┘ │
└─────────────────────────┼────────────────────────┘
                          │
              ┌───────────▼────────────┐
              │     MongoDB Atlas       │
              │  Recipes · Users · Logs│
              └────────────────────────┘
```

---

## Project Structure

```
AGame-ServeUP/
├── backend/
│   ├── src/
│   │   ├── index.ts                    # Express app entry, middleware, routes
│   │   ├── routes/
│   │   │   ├── agent.router.ts         # SSE /deliberate + /morph endpoints
│   │   │   ├── recipes.router.ts       # REST recipe CRUD
│   │   │   └── ingredientscans.router.ts
│   │   ├── services/
│   │   │   ├── agentOrchestrator.ts    # 4-agent async generator + Zod validation
│   │   │   ├── genaiMorph.ts           # Zero-shot style transfer service
│   │   │   ├── ingredientDetection.ts  # Google Vision integration
│   │   │   └── recipeGeneration.ts     # Spoonacular + Gemini hybrid
│   │   └── models/                     # Mongoose schemas
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── IngredientsScreen.tsx   # Pantry + P2P sync + agent trigger
│   │   │   └── RecipeDetailScreen.tsx  # Recipe view + morph canvas
│   │   ├── components/
│   │   │   ├── agent/
│   │   │   │   ├── AgentDeliberationModal.tsx  # Live SSE deliberation UI
│   │   │   │   └── GenAIMorphCanvas.tsx         # Style transfer UI
│   │   │   └── p2p/
│   │   │       └── P2pSyncBanner.tsx            # Room code + WebRTC status
│   │   ├── utils/
│   │   │   ├── pantryP2p.ts            # Yjs CRDT + y-webrtc engine
│   │   │   └── cryptoUtils.ts          # HKDF + AES-256-GCM WebCrypto
│   │   └── types/
│   │       └── agentRecipe.ts
│   └── package.json
└── package.json
```

---

## Live Demo

**[https://sobaskee.github.io/AGame-ServeUP/](https://sobaskee.github.io/AGame-ServeUP/)**

> The live deployment uses GitHub Pages for the frontend and a hosted backend. Some AI features require valid API keys configured server-side.

---

## License

MIT

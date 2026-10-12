import express, { Request, Response } from 'express'
import { runAgentOrchestration } from '../services/agentOrchestrator'
import { morphRecipe } from '../services/genaiMorph'

export const agentRouter = express.Router()

agentRouter.use(express.json())

agentRouter.get('/deliberate', async (req: Request, res: Response) => {
  const ingredientsParam = req.query.ingredients as string
  const dietParam = req.query.diet as string

  const ingredients = ingredientsParam
    ? ingredientsParam.split(',').map((s) => s.trim()).filter(Boolean)
    : []

  const diet = dietParam
    ? dietParam.split(',').map((s) => s.trim()).filter(Boolean)
    : []

  if (ingredients.length === 0) {
    res.status(400).send('No ingredients provided')
    return
  }

  // Set up Server-Sent Events headers
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders?.()

  try {
    const generator = runAgentOrchestration(ingredients, diet)

    for await (const item of generator) {
      res.write(`data: ${JSON.stringify(item)}\n\n`)
    }

    res.write(`data: [DONE]\n\n`)
    res.end()
  } catch (error) {
    console.error('SSE Agent error:', error)
    res.write(`data: ${JSON.stringify({ type: 'ERROR', error: String(error) })}\n\n`)
    res.end()
  }
})

agentRouter.post('/morph', async (req: Request, res: Response) => {
  try {
    const { recipe, styleTarget } = req.body
    if (!recipe || !styleTarget) {
      res.status(400).json({ error: 'recipe and styleTarget are required' })
      return
    }

    const morphed = await morphRecipe(recipe, styleTarget)
    res.json({ success: true, morphed })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    res.status(500).json({ success: false, error: errorMessage })
  }
})

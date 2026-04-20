import express, { Request, Response } from 'express'
import cors from 'cors'
import multer from 'multer'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { ObjectId } from 'mongodb'
import 'dotenv/config'
import { detectIngredientsFromImage } from './services/ingredientDetection.js'
import { generateRecipesFromIngredients } from './services/recipeGeneration.js'
import { collections, connectToDatabase } from "./services/database.service.js"
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.router";
import { savedRecipesRouter } from "./routes/savedrecipes.router.ts"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = Number(process.env.PORT) || 3001

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
)
app.use(express.json())
app.use(cookieParser())

// Setup multer for file uploads
const uploadDir = path.join(__dirname, '..', 'uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({ storage })

function publicApiBaseUrl(): string {
	const raw = process.env.API_PUBLIC_URL?.trim()
	if (raw) return raw.replace(/\/$/, '')
	return `http://localhost:${PORT}`
}

app.use('/uploads', express.static(uploadDir))
app.use("/api/auth", authRoutes)

// Routes

/**
 * Health check endpoint
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' })
})
app.use('/uploads', express.static(uploadDir))

/**
 * Upload and analyze pantry image
 * POST /api/pantry/detect
 * Multipart: field "image" (file). Optional field "userId" (24-char hex Mongo ObjectId) — when set and DB is connected, scan is saved to ingredientScans.
 */
app.post('/api/pantry/detect', upload.single('image'), async (req: Request, res: Response) => {
  const imagePath = req.file?.path
  const deleteFile = (p: string) => {
    fs.unlink(p, (err) => {
      if (err) console.warn('Could not delete temp file:', err)
    })
  }

  try {
    if (!req.file || !imagePath) {
      res.status(400).json({
        success: false,
        error: 'No image file provided',
      })
      return
    }

    const result = await detectIngredientsFromImage(imagePath)

    if (!result.success) {
      deleteFile(imagePath)
      res.json(result)
      return
    }

    const ingredientsDetected = result.ingredients
      .map((i) => i.name.trim())
      .filter((n) => n.length > 0)

    const userIdRaw = typeof req.body?.userId === 'string' ? req.body.userId.trim() : ''
    const scans = collections.ingredient_scans;
    const shouldPersist = Boolean(scans && userIdRaw && ObjectId.isValid(userIdRaw))

    if (!shouldPersist) {
      deleteFile(imagePath)
      res.json({
        ...result,
        persisted: false,
      })
      return
    }

    const filename = req.file.filename
    const imageUrl = `${publicApiBaseUrl()}/uploads/${encodeURIComponent(filename)}`
    const createdAt = new Date()

    const insertDoc = {
      user_id: new ObjectId(userIdRaw),
      image_url: imageUrl,
      ingredients_detected: ingredientsDetected,
      created_at: createdAt,
    }

    const insertResult = await scans!.insertOne(insertDoc)

    res.json({
      ...result,
      persisted: true,
      scanId: insertResult.insertedId.toString(),
      imageUrl,
    })
  } catch (error) {
    if (imagePath) deleteFile(imagePath)
    const errorMessage = error instanceof Error ? error.message : String(error)
    res.status(500).json({
      success: false,
      error: errorMessage,
    })
  }
})

/**
 * Get detected ingredients with recipes
 * GET /api/ingredients/suggest-recipes
 */
app.get('/api/ingredients/suggest-recipes', async (req: Request, res: Response) => {
  try {
    const ingredients = req.query.ingredients as string | undefined
    if (!ingredients) {
      res.status(400).json({
        success: false,
        error: 'No ingredients provided',
      })
      return
    }

    const ingredientList = ingredients.split(',').map((i) => i.trim())

    const result = await generateRecipesFromIngredients(ingredientList)

    res.json(result)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    res.status(500).json({
      success: false,
      error: errorMessage,
    })
  }
})

/**
 * Start server
 */
const HOST = '0.0.0.0'
connectToDatabase().then(() => {
	if (collections.scan_recipes) { app.use("/api/recipes", savedRecipesRouter); }
	app.listen(PORT, HOST, () => {
		console.log(`🍽️  ServeUP Backend on http://localhost:${PORT} (LAN: all interfaces)`);
		console.log(`📝 API Docs: http://localhost:${PORT}/api/pantry/detect (POST with image)`,);
	});
});

export default app

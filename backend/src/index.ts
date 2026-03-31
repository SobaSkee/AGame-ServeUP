import express, { Request, Response } from 'express'
import cors from 'cors'
import multer from 'multer'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import 'dotenv/config'
import { detectIngredientsFromImage } from './services/ingredientDetection.js'
import { generateRecipesFromIngredients } from './services/recipeGeneration.js'
import { connectToDatabase } from "./services/database.service.ts"
import { recipesRouter } from "./routes/recipes.router.ts"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = Number(process.env.PORT) || 3001

// Middleware
app.use(cors())
app.use(express.json())

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



// Routes

/**
 * Health check endpoint
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' })
})

/**
 * Upload and analyze pantry image
 * POST /api/pantry/detect
 */
app.post('/api/pantry/detect', upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'No image file provided',
      })
      return
    }

    const imagePath = req.file.path

    // Analyze the image using Gemini Vision
    const result = await detectIngredientsFromImage(imagePath)

    // Clean up the uploaded file
    fs.unlink(imagePath, (err) => {
      if (err) console.warn('Could not delete temp file:', err)
    })

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

    // Generate recipes using Gemini AI
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
connectToDatabase()
	.then(() => {
		app.use("/recipes", recipesRouter);
		app.listen(PORT, HOST, () => {
			console.log(`🍽️  ServeUP Backend on http://localhost:${PORT} (LAN: all interfaces)`);
			console.log(`📝 API Docs: http://localhost:${PORT}/api/pantry/detect (POST with image)`,);
		});
	})
	.catch((error: Error) => {
		console.error("Database connection failed", error);
		process.exit();
	});

export default app

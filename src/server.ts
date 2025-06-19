import dotenv from "dotenv"
import express from "express"
import cors from "cors"
import morgan from "morgan"
import { connectDB } from "./config/db"
import { corsConfig } from "./config/cors"
import authRouters from "./routes/authRoutes"
import projectRoutes from "./routes/projectRoutes"

dotenv.config()

connectDB()


const app = express()

app.use(cors(corsConfig))

// logging
app.use(morgan('dev'))

// Leer datos del formulario
app.use(express.json())

// Routes
app.use('/api/auth', authRouters)
app.use('/api/projects', projectRoutes)



export default app
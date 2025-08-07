import express, {Response} from "express"
import morgan from "morgan"
import cors from "cors"
import cookieParser from "cookie-parser";
import dotenv from 'dotenv';
import authRoutes from "./routes/auth"
import volunteerRoutes from "./routes/volunteer"
import './workers/childRegistrationWorker';
import { prisma } from "./utils/prisma";
import childRegistrationRoutes from './routes/childRegistration'
import Redis from 'ioredis';




export const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  maxRetriesPerRequest: null,
});



dotenv.config()

const PORT = process.env.PORT || 8000;
const NODE_ENV = process.env.NODE_ENV || 'development';




async function connectDB() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to MongoDB (via Prisma)');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}



const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(morgan("tiny"));
app.use(
    cors({
        origin: '*',
        credentials: false
    })
)
app.use(cookieParser())

// app.get("/api", (_, res: Response) => {
//     return res.status(200).json({
//         status: "healthy"
//     })
// })


app.use('/api/auth', authRoutes)
app.use('/api/volunteer', volunteerRoutes);
app.use('/api/register', childRegistrationRoutes)


async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT} (${NODE_ENV})`);
  });
}

startServer();

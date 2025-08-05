import express, {Response} from "express"
import morgan from "morgan"
import cors from "cors"
import cookieParser from "cookie-parser";
import { PrismaClient } from "@prisma/client";
import dotenv from 'dotenv';
import authRoutes from "./routes/auth"
import volunteerRoutes from "./routes/volunteer"
import { registerVolunteer } from "./controllers/volunteerController";

dotenv.config()

const PORT = process.env.PORT || 8000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const prisma = new PrismaClient({
  log: NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

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


async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT} (${NODE_ENV})`);
  });
}

startServer();

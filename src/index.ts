import "dotenv/config";
import express, {  Response } from "express"
import morgan from "morgan"
import { APP_ORIGIN, NODE_ENV, PORT } from "./constants/env";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/auth.route";
import authenticate from "./middleware/authenticate";
import userRoutes from "./routes/user.route";
import sessionRoutes from "./routes/session.route";
import errorHandler from "./middleware/errorHandler";
import connectToDatabase from "./config/db";
import labRoutes from "./routes/lab.route";

const server = express();



// add middleware
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(morgan("tiny"));
server.use(
  cors({
    origin: '*',
    credentials: false, // must be false when using '*' as origin
  })
);
// server.use(
//   cors({
//     origin: APP_ORIGIN,
//     credentials: true,
//   })
// );
server.use(cookieParser());

// health check
//@ts-ignore
server.get("/api", (_, res: Response) => {
    return res.status(200).json({
      status: "healthy",
    });
  });


// auth routes
server.use("/api/auth", authRoutes);

// protected routes
server.use("/api/user", authenticate, userRoutes);
server.use("/api/sessions", authenticate, sessionRoutes);
server.use("/api/lab", authenticate, labRoutes);

// error handler
server.use(errorHandler);


server.listen(PORT, async () => {
    console.log(`Server listening on port ${PORT} in ${NODE_ENV} environment`);
    await connectToDatabase();
  });



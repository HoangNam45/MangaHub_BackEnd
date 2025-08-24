import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import passport from "./config/passport";
import routes from "./routes";
import { errorHandler } from "./middlewares/errorHandler";

const app: Application = express();

// 1. Helmet để bảo mật HTTP header
app.use(helmet());

// 2. CORS (cho phép FE gọi API từ domain khác)
app.use(
  cors({
    origin: `${process.env.FRONTEND_URL}`,
    credentials: true,
  })
);

// 3. Logger
app.use(morgan("dev"));

// 4. Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 5. Passport initialization
app.use(passport.initialize());

// 6. Health check endpoint (before API routes)
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

app.use("/api/v1", routes);

// 7. Error handler (global)
app.use(errorHandler);

export default app;

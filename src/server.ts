import "dotenv/config";
import http from "http";
import app from "./app";
import connectDB from "./config/db";
import { connectRedis } from "./config/redis";

const PORT = process.env.PORT;

const server = http.createServer(app);

// Khởi động server
const startServer = async () => {
  await connectDB();
  await connectRedis();
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();

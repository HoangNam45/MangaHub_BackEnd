import mongoose from "mongoose";
import "dotenv/config";

const connectDB = async (): Promise<void> => {
  const PORT = `${process.env.MONGO_URI}`;
  try {
    const uri = PORT;
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", (error as Error).message);
    process.exit(1);
  }
};

export default connectDB;

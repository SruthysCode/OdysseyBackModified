
import mongoose from "mongoose";

const DB_URI = process.env.mongoDB_Link || "";

const connectDB = async () => {
  try {
    await mongoose.connect(DB_URI);
    console.log("Database connected")
  } catch (error: any) {
    throw error;
  }
};

export default connectDB;

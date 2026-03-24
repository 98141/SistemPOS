import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB conectado: ${conn.connection.name}`);
  } catch (error) {
    console.error("Error conectando a MongoDB:", error.message);
    console.log("MONGODB_URI:", process.env.MONGODB_URI);
    process.exit(1);
  }
};

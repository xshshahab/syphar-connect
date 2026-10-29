import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MONGO DB connected successfully!");
  } catch (error) {
    console.error(`ERROR: could not connect to MongoDB: ${error.message}`);
    console.error(
      "Check MONGO_URI in backend/.env, the database user/password, and that the database accepts connections from this server."
    );
  }
};

import mongoose from "mongoose";

const connectToDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!, {
      dbName: "visionary",
      bufferCommands: false,
    });
  } catch (error) {
    console.error("Error connecting to database: ", error);
  }
};

export default connectToDB;

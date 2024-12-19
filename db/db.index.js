import mongoose from "mongoose";
const connectDB = async () => {
  try {
    // console.log(process.env.MONGODB_URI);
    const connectioninstance = await mongoose.connect(
      `${process.env.MONGODB_URI}`
    );
    console.log(
      `\n MongoDB connected ! DB host : ${connectioninstance.connection.host}`
    );
  } catch (error) {
    console.log("MongoDB connection error", error);
  }
};

// Database connection events
mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to DB");
});

mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose disconnected");
});

export default connectDB;

import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config()

const connectDB = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI as string)
		console.log("MongoDB connected successfully")
	} catch (err) {
		console.error("MongoDB connection failed:", err)
		process.exit(1) // Exit the process with failure
	}
}

export default connectDB

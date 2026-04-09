import mongoose from "mongoose";


const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Payment Service database connection success...");
    } catch (error) {
        console.log("Payment Service database connection error:", error);
        process.exit(0);
    }
}

export default connectDB;
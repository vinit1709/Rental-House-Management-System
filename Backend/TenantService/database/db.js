import mongoose from "mongoose";


const connectDB = async() => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Tenant Service database connection success...");
    } catch (error) {
        console.log("Tenant Service database connection error:", error);
        process.exit(0);
    }
}

export default connectDB;
import mongoose from "mongoose";


const connectDB = async() => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Database connection success...");
    } catch (error) {
        console.log("Database connection failed..!!");
        process.exit(0);
    }
}

export default connectDB;
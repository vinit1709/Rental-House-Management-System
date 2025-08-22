import mongoose from "mongoose";


const connectDB = async() => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Auth Service database connection success...");
    } catch (error) {
        console.log("Auth Service database connection failed..!!");
        process.exit(0);
    }
}

export default connectDB;
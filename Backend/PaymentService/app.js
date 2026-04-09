import express from "express";
import dotenv from "dotenv";
dotenv.config();
const app = express();
import cookieParser from "cookie-parser";
import cors from "cors";
import bodyParser from "body-parser";
import paymentRoutes from './routes/payment.routes.js';

const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    process.env.ADMIN_URL || 'http://localhost:5174'
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD']
};

app.use(cors(corsOptions));
// Add the limit option here
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static('uploads')); // Serve uploaded files statically

app.use("/", paymentRoutes);

app.get('/health');
export default app;

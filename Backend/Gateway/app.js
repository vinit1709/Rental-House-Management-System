import express from 'express';
import expressProxy from 'express-http-proxy';
import cors from 'cors';

const app = express();

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
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/auth', expressProxy(process.env.AUTH_SERVICE_URL || 'http://localhost:3001', { limit: '50mb' }));
app.use('/notification', expressProxy(process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3002', { limit: '50mb' }));
app.use('/properties', expressProxy(process.env.PROPERTY_SERVICE_URL || 'http://localhost:3003', { limit: '50mb' }));
app.use('/uploads', expressProxy(process.env.PROPERTY_SERVICE_URL || 'http://localhost:3003', { limit: '50mb' }));
app.use('/tenants', expressProxy(process.env.TENANT_SERVICE_URL || 'http://localhost:3004', { limit: '50mb' }));
app.use('/leases', expressProxy(process.env.LEASE_SERVICE_URL || 'http://localhost:3005', { limit: '50mb' }));
app.use('/payments', expressProxy(process.env.PAYMENT_SERVICE_URL || 'http://localhost:3006', { limit: '50mb' }));
app.use('/maintenance', expressProxy(process.env.MAINTENANCE_SERVICE_URL || 'http://localhost:3007', { limit: '50mb' }));
app.use('/ai', expressProxy(process.env.AI_SERVICE_URL || 'http://localhost:3008', { limit: '50mb' }));

app.listen(3000, () => {
    console.log('🚪 Gateway is running on http://localhost:3000');
});
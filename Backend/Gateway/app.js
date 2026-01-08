import express from 'express';
import expressProxy from 'express-http-proxy';
import cors from 'cors';

const app = express();

const corsOptions = {
    origin: "*" || "http://localhost:5173",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD']
}

app.use(cors(corsOptions));

app.use('/auth', expressProxy('http://localhost:3001',));
app.use('/notification', expressProxy('http://localhost:3002',));

app.listen(3000, () => {
    console.log('🚪 Gateway is running on http://localhost:3000');
});
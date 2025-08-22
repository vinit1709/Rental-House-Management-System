import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
const app = express();
import cors from 'cors';
import bodyParser from 'body-parser';
import emailRoutes from './routes/email.routes.js';

const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', emailRoutes);

app.listen(PORT, () => {
  console.log(`📨 Notification service running on http://localhost:${PORT}`);
});

export default app;
import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import connectDB from './config/mongodb.js';

const app = express();
const port = process.env.PORT || 4000;

connectDB();

app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.get('/', (req,res) => {
  res.send('Api is running successfully');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
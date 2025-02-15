import express, { json } from 'express';
import collegeRoutes from './routes/college.routes.js';
import cutoffRoutes from './routes/cutoff.routes.js';
import cors from "cors"

const app = express();
app.use(json());
app.use(cors());
// Use college routes
app.use('/api/colleges', collegeRoutes);
app.use('/api/cutoffs', cutoffRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
import express, { json } from 'express';
import collegeRoutes from './routes/college.routes.js';
import cutoffRoutes from './routes/cutoff.routes.js';
import cors from "cors"
import errorHandler from './middleware/errorHandler.js';

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// Add a simple logging middleware for debugging routes
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use(errorHandler);


// Use college routes
app.get("/", (req, res) => {
  res.send("Welcome to the college-cutoff API")
})

app.use('/api/colleges', collegeRoutes);
app.use('/api/cutoffs', cutoffRoutes);


// 404 handler - must be before the error handler

app.use((req, res) => {
  res.status(404).json({ 
    message: `Cannot ${req.method} ${req.url}`,
    hint: "Try restarting the server to load updated routes."
  });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
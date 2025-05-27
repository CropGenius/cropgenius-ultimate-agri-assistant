import express from 'express';
import cors from 'cors';
import { marketDataRouter } from './api/market-data';
import { marketTrendsRouter } from './api/market-trends';
import { cropSuggestionsRouter } from './api/crop-suggestions';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use('/api/market-data', marketDataRouter);
app.use('/api/market-trends', marketTrendsRouter);
app.use('/api/crop-suggestions', cropSuggestionsRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;

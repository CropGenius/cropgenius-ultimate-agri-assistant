import { Router } from 'express';
import { PricingIntelligenceService } from '@/services/pricing-intelligence/pricing-intelligence.service';

const router = Router();
const pricingService = new PricingIntelligenceService();

// GET /market-trends?crop=...&location=...
router.get('/', async (req, res) => {
  try {
    const { crop, location } = req.query;

    if (!crop || !location) {
      return res.status(400).json({ 
        error: 'Missing required query parameters: crop and location are required' 
      });
    }

    const trends = await pricingService.getMarketTrends({
      crop: crop as string,
      location: location as string,
    });

    res.json(trends);
  } catch (error) {
    console.error('Error in market-trends API:', error);
    res.status(500).json({ 
      error: 'Failed to fetch market trends',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export const marketTrendsRouter = router;

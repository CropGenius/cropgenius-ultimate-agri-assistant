import { Router } from 'express';
import { PricingIntelligenceService } from '@/services/pricing-intelligence/pricing-intelligence.service';
import type { Language } from '@/services/pricing-intelligence/models/types';

const router = Router();
const pricingService = new PricingIntelligenceService();

// GET /market-data?crop=...&location=...&currency=...&mode=...&language=...
router.get('/', async (req, res) => {
  try {
    const { crop, location, currency = 'USD', mode = 'retail', language = 'en' } = req.query;

    if (!crop || !location) {
      return res.status(400).json({ 
        error: 'Missing required query parameters: crop and location are required' 
      });
    }

    const data = await pricingService.getMarketData({
      crop: crop as string,
      location: location as string,
      currency: currency as string,
      mode: mode as 'retail' | 'wholesale',
      language: language as Language
    });

    res.json(data);
  } catch (error) {
    console.error('Error in market-data API:', error);
    res.status(500).json({ 
      error: 'Failed to fetch market data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export const marketDataRouter = router;

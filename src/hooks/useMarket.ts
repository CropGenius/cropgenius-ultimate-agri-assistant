import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { marketService } from '@/services/marketService';
import { CropListing, MyCrop, Buyer, BulkDeal, AIInsights, PostTradeFormData } from '@/types/market';

export const useMarket = () => {
  const [marketListings, setMarketListings] = useState<CropListing[]>([]);
  const [myCrops, setMyCrops] = useState<MyCrop[]>([]);
  const [topBuyers, setTopBuyers] = useState<Buyer[]>([]);
  const [bulkDeals, setBulkDeals] = useState<BulkDeal[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsights>({
    lastUpdated: "5 minutes ago",
    marketOverview: "Market prices for maize and rice are trending upward. Tomato prices are falling due to increased supply. Best time to sell beans and soybeans.",
    topOpportunities: []
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Load initial data
  useEffect(() => {
    loadMarketData();
  }, []);

  const loadMarketData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [listings, crops, buyers, deals] = await Promise.all([
        marketService.fetchMarketListings(),
        marketService.fetchMyCrops(),
        marketService.fetchTopBuyers(),
        marketService.fetchBulkDeals()
      ]);

      setMarketListings(listings);
      setMyCrops(crops);
      setTopBuyers(buyers);
      setBulkDeals(deals);
      setLastUpdated(new Date());
      
      // Update AI insights
      const insights = await marketService.getAIInsights();
      setAiInsights(insights);
    } catch (error) {
      console.error('Error loading market data:', error);
      setError(error instanceof Error ? error : new Error('Failed to load market data'));
      toast.error('Failed to load market data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshMarket = useCallback(async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      await loadMarketData();
      
      toast.success("Market data updated with latest AI analysis", {
        description: "Analyzing crop prices, buyer demand, and market trends",
      });
    } catch (error) {
      console.error('Error refreshing market:', error);
      setError(error instanceof Error ? error : new Error('Failed to refresh market data'));
      toast.error('Failed to refresh market data. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const handlePostTrade = useCallback(async (formData: PostTradeFormData) => {
    try {
      const newListing = await marketService.createListing(formData);
      setMarketListings(prev => [newListing, ...prev]);
      
      toast.success(`Your ${formData.cropType} listing has been posted successfully!`, {
        description: `Listed ${formData.quantity} ${formData.unit} at ${formData.price} per ${formData.unit}`,
      });
    } catch (error) {
      console.error('Error posting trade:', error);
      toast.error("Failed to post trade. Please try again.");
      throw error;
    }
  }, []);

  const handleContactSeller = useCallback(async (listingId: number) => {
    try {
      const listing = marketListings.find(l => l.id === listingId);
      if (!listing) {
        throw new Error("Listing not found");
      }

      if (listing.isMine) {
        throw new Error("You cannot contact yourself");
      }

      await marketService.contactSeller(listingId);
      toast.success(`Contact request sent to ${listing.seller.name}`, {
        description: "They'll receive your details and contact you directly",
      });
    } catch (error) {
      console.error('Error contacting seller:', error);
      toast.error("Failed to send contact request. Please try again.");
      throw error;
    }
  }, [marketListings]);

  const listCrop = useCallback(async (cropId: number) => {
    try {
      const crop = myCrops.find(c => c.id === cropId);
      if (!crop) {
        throw new Error("Crop not found");
      }

      const formData: PostTradeFormData = {
        cropType: crop.cropType,
        quantity: crop.quantity,
        unit: crop.unit,
        quality: crop.quality,
        location: crop.location || "Central Region",
        price: crop.suggestedPrice
      };

      await handlePostTrade(formData);
      
      // Update crop as listed
      setMyCrops(prev => prev.map(c => 
        c.id === cropId ? { ...c, isListed: true } : c
      ));
    } catch (error) {
      console.error('Error listing crop:', error);
      toast.error("Failed to list crop. Please try again.");
      throw error;
    }
  }, [myCrops, handlePostTrade]);

  const joinBulkDeal = useCallback(async (dealId: number) => {
    try {
      const deal = bulkDeals.find(d => d.id === dealId);
      if (!deal) {
        throw new Error("Deal not found");
      }

      await marketService.joinBulkDeal(dealId);
      
      setBulkDeals(prev => prev.map(d => 
        d.id === dealId ? { ...d, farmersJoined: d.farmersJoined + 1, isNew: false } : d
      ));
      
      toast.success(`You've joined the ${deal.cropType} bulk selling group!`, {
        description: `You'll get ${deal.priceBonus}% above market price when the group target is reached`,
      });
    } catch (error) {
      console.error('Error joining bulk deal:', error);
      toast.error("Failed to join bulk deal. Please try again.");
      throw error;
    }
  }, [bulkDeals]);

  const contactBuyer = useCallback(async (buyerId: number) => {
    try {
      const buyer = topBuyers.find(b => b.id === buyerId);
      if (!buyer) {
        throw new Error("Buyer not found");
      }

      await marketService.contactBuyer(buyerId);
      
      toast.success(`Contact request sent to ${buyer.name}`, {
        description: "They'll receive your crop details and contact you directly",
      });
    } catch (error) {
      console.error('Error contacting buyer:', error);
      toast.error("Failed to contact buyer. Please try again.");
      throw error;
    }
  }, [topBuyers]);

  const withdrawListing = useCallback(async (listingId: number) => {
    try {
      const listing = marketListings.find(l => l.id === listingId);
      if (!listing || !listing.isMine) {
        throw new Error("Cannot withdraw this listing");
      }

      await marketService.withdrawListing(listingId);
      
      setMarketListings(prev => prev.filter(l => l.id !== listingId));
      
      setMyCrops(prev => prev.map(c => 
        c.cropType === listing.cropType ? { ...c, isListed: false } : c
      ));
      
      toast.success(`Your ${listing.cropType} listing has been removed`, {
        description: "Your crop is no longer available for sale",
      });
    } catch (error) {
      console.error('Error withdrawing listing:', error);
      toast.error("Failed to withdraw listing. Please try again.");
      throw error;
    }
  }, [marketListings]);

  const sellNow = useCallback(async (listingId: number) => {
    try {
      const listing = marketListings.find(l => l.id === listingId);
      if (!listing || !listing.isMine) {
        throw new Error("Cannot sell this listing");
      }

      await marketService.sellNow(listingId);
      
      setMarketListings(prev => prev.filter(l => l.id !== listingId));
      setMyCrops(prev => prev.filter(c => c.cropType !== listing.cropType));
      
      toast.success(`Your ${listing.cropType} has been sold!`, {
        description: `Payment of ${listing.price * listing.quantity} has been processed securely`,
      });
    } catch (error) {
      console.error('Error selling listing:', error);
      toast.error("Failed to complete sale. Please try again.");
      throw error;
    }
  }, [marketListings]);

  return {
    // State
    marketListings,
    myCrops,
    topBuyers,
    bulkDeals,
    aiInsights,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    
    // Actions
    refreshMarket,
    handlePostTrade,
    handleContactSeller,
    listCrop,
    joinBulkDeal,
    contactBuyer,
    withdrawListing,
    sellNow
  };
};
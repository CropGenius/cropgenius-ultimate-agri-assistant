import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  Check, 
  ChevronRight,
  Clock,
  Coins, 
  DollarSign, 
  FileCheck, 
  HandCoins, 
  LineChart, 
  Package,
  ShieldCheck,
  ShoppingCart, 
  Star,
  ThumbsUp,
  Truck,
  Users,
  Zap
} from "lucide-react";

interface CropListing {
  id: number;
  cropType: string;
  quantity: number;
  unit: string;
  quality: string;
  location: string;
  price: number;
  marketPrice: number;
  expiresIn: string;
  priceStatus: 'rising' | 'falling' | 'stable';
  priceChange: number;
  holdRecommendation: {
    recommend: boolean;
    days: number;
    expectedIncrease: number;
  };
  seller: {
    name: string;
    rating: number;
    verified: boolean;
    transactions: number;
  };
  isMine?: boolean;
  photo?: string;
  bulkDeal?: {
    farmersJoined: number;
    targetFarmers: number;
    bonusPercentage: number;
  };
}

interface Buyer {
  id: number;
  name: string;
  location: string;
  lookingFor: string[];
  verified: boolean;
  rating: number;
  transactions: number;
  offersAboveMarket: number;
  paymentMethods: string[];
  dealSize: 'small' | 'medium' | 'large';
  paysFast: boolean;
}

interface MyCrop {
  id: number;
  cropType: string;
  readyToSell: boolean;
  harvestDate: string;
  quantity: number;
  unit: string;
  quality: string;
  isListed: boolean;
  currentPrice: number;
  suggestedPrice: number;
  marketTrend: {
    status: 'rising' | 'falling' | 'stable';
    forecast: string;
    changePercent: number;
  };
}

interface BulkDeal {
  id: number;
  cropType: string;
  organizer: string;
  farmersJoined: number;
  targetFarmers: number;
  priceBonus: number;
  deadline: string;
  location: string;
  minQuantity: number;
  buyer: string;
  isNew: boolean;
}

const Market = () => {
  const [marketListings, setMarketListings] = useState<CropListing[]>([
    {
      id: 1,
      cropType: "Maize",
      quantity: 2500,
      unit: "kg",
      quality: "Premium",
      location: "Central Region",
      price: 175,
      marketPrice: 150,
      expiresIn: "3 days",
      priceStatus: "rising",
      priceChange: 8,
      holdRecommendation: {
        recommend: true,
        days: 7,
        expectedIncrease: 15
      },
      seller: {
        name: "Thomas N.",
        rating: 4.8,
        verified: true,
        transactions: 26
      }
    },
    {
      id: 2,
      cropType: "Tomatoes",
      quantity: 850,
      unit: "kg",
      quality: "Standard",
      location: "Western Region",
      price: 120,
      marketPrice: 125,
      expiresIn: "2 days",
      priceStatus: "falling",
      priceChange: 4,
      holdRecommendation: {
        recommend: false,
        days: 0,
        expectedIncrease: 0
      },
      seller: {
        name: "Martha K.",
        rating: 4.2,
        verified: true,
        transactions: 14
      },
      bulkDeal: {
        farmersJoined: 8,
        targetFarmers: 10,
        bonusPercentage: 12
      }
    },
    {
      id: 3,
      cropType: "Cassava",
      quantity: 3200,
      unit: "kg",
      quality: "Premium",
      location: "Eastern Region",
      price: 90,
      marketPrice: 85,
      expiresIn: "5 days",
      priceStatus: "stable",
      priceChange: 0,
      holdRecommendation: {
        recommend: false,
        days: 0,
        expectedIncrease: 0
      },
      seller: {
        name: "Joseph M.",
        rating: 4.9,
        verified: true,
        transactions: 41
      }
    },
    {
      id: 4,
      cropType: "Rice",
      quantity: 1200,
      unit: "kg",
      quality: "Premium",
      location: "Central Region",
      price: 210,
      marketPrice: 200,
      expiresIn: "7 days",
      priceStatus: "rising",
      priceChange: 5,
      holdRecommendation: {
        recommend: true,
        days: 14,
        expectedIncrease: 18
      },
      seller: {
        name: "Grace O.",
        rating: 4.7,
        verified: true,
        transactions: 22
      }
    },
  ]);
  
  const [myCrops, setMyCrops] = useState<MyCrop[]>([
    {
      id: 1,
      cropType: "Maize",
      readyToSell: true,
      harvestDate: "Last week",
      quantity: 1800,
      unit: "kg",
      quality: "Premium",
      isListed: false,
      currentPrice: 150,
      suggestedPrice: 175,
      marketTrend: {
        status: "rising",
        forecast: "Prices expected to increase by 15% in the next 7 days",
        changePercent: 15
      }
    },
    {
      id: 2,
      cropType: "Tomatoes",
      readyToSell: true,
      harvestDate: "Yesterday",
      quantity: 350,
      unit: "kg",
      quality: "Standard",
      isListed: false,
      currentPrice: 120,
      suggestedPrice: 120,
      marketTrend: {
        status: "falling",
        forecast: "Prices expected to drop by 8% in the next 3 days. Sell now.",
        changePercent: -8
      }
    },
    {
      id: 3,
      cropType: "Beans",
      readyToSell: false,
      harvestDate: "In 2 weeks",
      quantity: 450,
      unit: "kg",
      quality: "Premium",
      isListed: false,
      currentPrice: 195,
      suggestedPrice: 205,
      marketTrend: {
        status: "stable",
        forecast: "Prices expected to remain stable for the next month",
        changePercent: 1
      }
    }
  ]);
  
  const [topBuyers, setTopBuyers] = useState<Buyer[]>([
    {
      id: 1,
      name: "National Food Processors",
      location: "Central Region",
      lookingFor: ["Maize", "Rice", "Soybeans"],
      verified: true,
      rating: 4.9,
      transactions: 372,
      offersAboveMarket: 8,
      paymentMethods: ["Mobile Money", "Bank Transfer"],
      dealSize: "large",
      paysFast: true
    },
    {
      id: 2,
      name: "Fresh Grocers Ltd",
      location: "Western Region",
      lookingFor: ["Tomatoes", "Onions", "Peppers"],
      verified: true,
      rating: 4.7,
      transactions: 156,
      offersAboveMarket: 12,
      paymentMethods: ["Mobile Money"],
      dealSize: "medium",
      paysFast: true
    },
    {
      id: 3,
      name: "Eastern Exporters Co.",
      location: "Eastern Region",
      lookingFor: ["Cassava", "Cocoa", "Yams"],
      verified: true,
      rating: 4.8,
      transactions: 203,
      offersAboveMarket: 15,
      paymentMethods: ["Bank Transfer", "Mobile Money"],
      dealSize: "large",
      paysFast: false
    }
  ]);
  
  const [bulkDeals, setBulkDeals] = useState<BulkDeal[]>([
    {
      id: 1,
      cropType: "Maize",
      organizer: "Regional Cooperative",
      farmersJoined: 28,
      targetFarmers: 50,
      priceBonus: 25,
      deadline: "4 days",
      location: "Central Region",
      minQuantity: 500,
      buyer: "National Food Processors",
      isNew: true
    },
    {
      id: 2,
      cropType: "Tomatoes",
      organizer: "Western Farmers Alliance",
      farmersJoined: 8,
      targetFarmers: 10,
      priceBonus: 12,
      deadline: "2 days",
      location: "Western Region",
      minQuantity: 200,
      buyer: "Fresh Grocers Ltd",
      isNew: false
    },
    {
      id: 3,
      cropType: "Cassava",
      organizer: "Eastern Growers Association",
      farmersJoined: 35,
      targetFarmers: 40,
      priceBonus: 18,
      deadline: "6 days",
      location: "Eastern Region",
      minQuantity: 400,
      buyer: "Eastern Exporters Co.",
      isNew: false
    }
  ]);
  
  const [selectedTab, setSelectedTab] = useState("marketplace");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [aiInsights, setAiInsights] = useState({
    lastUpdated: "5 minutes ago",
    marketOverview: "Market prices for maize and rice are trending upward. Tomato prices are falling due to increased supply. Best time to sell beans and soybeans.",
    topOpportunities: [
      {
        crop: "Maize",
        action: "Hold for 7-10 days",
        reason: "Prices expected to rise by 15% due to regional shortages"
      },
      {
        crop: "Rice",
        action: "Join bulk selling group",
        reason: "25% above-market prices for bulk sellers"
      },
      {
        crop: "Tomatoes",
        action: "Sell immediately",
        reason: "Prices falling due to oversupply"
      }
    ]
  });

  const refreshMarket = () => {
    setIsRefreshing(true);
    
    setTimeout(() => {
      toast.success("Market data updated with latest AI analysis", {
        description: "Analyzing crop prices, buyer demand, and market trends",
      });
      
      setIsRefreshing(false);
    }, 2000);
  };

  const listCrop = (cropId: number) => {
    const crop = myCrops.find(c => c.id === cropId);
    if (!crop) return;
    
    const newListing: CropListing = {
      id: marketListings.length + 1,
      cropType: crop.cropType,
      quantity: crop.quantity,
      unit: crop.unit,
      quality: crop.quality,
      location: "Central Region",
      price: crop.suggestedPrice,
      marketPrice: crop.currentPrice,
      expiresIn: "7 days",
      priceStatus: crop.marketTrend.status,
      priceChange: Math.abs(crop.marketTrend.changePercent),
      holdRecommendation: {
        recommend: crop.marketTrend.status === "rising",
        days: crop.marketTrend.status === "rising" ? 7 : 0,
        expectedIncrease: crop.marketTrend.status === "rising" ? Math.abs(crop.marketTrend.changePercent) : 0
      },
      seller: {
        name: "Emmanuel",
        rating: 4.6,
        verified: true,
        transactions: 15
      },
      isMine: true
    };
    
    setMarketListings([newListing, ...marketListings]);
    setMyCrops(myCrops.map(c => 
      c.id === cropId ? { ...c, isListed: true } : c
    ));
    
    toast.success(`Your ${crop.cropType} is now listed for sale!`, {
      description: "Buyers can now see and purchase your crop",
    });
  };

  const joinBulkDeal = (dealId: number) => {
    const deal = bulkDeals.find(d => d.id === dealId);
    if (!deal) return;
    
    setBulkDeals(bulkDeals.map(d => 
      d.id === dealId ? { ...d, farmersJoined: d.farmersJoined + 1, isNew: false } : d
    ));
    
    toast.success(`You've joined the ${deal.cropType} bulk selling group!`, {
      description: `You'll get ${deal.priceBonus}% above market price when the group target is reached`,
    });
  };

  const contactBuyer = (buyerId: number) => {
    const buyer = topBuyers.find(b => b.id === buyerId);
    if (!buyer) return;
    
    toast.success(`Contact request sent to ${buyer.name}`, {
      description: "They'll receive your crop details and contact you directly",
    });
  };

  const withdrawListing = (listingId: number) => {
    const listing = marketListings.find(l => l.id === listingId);
    if (!listing || !listing.isMine) return;
    
    setMarketListings(marketListings.filter(l => l.id !== listingId));
    
    setMyCrops(myCrops.map(c => 
      c.cropType === listing.cropType ? { ...c, isListed: false } : c
    ));
    
    toast.success(`Your ${listing.cropType} listing has been removed`, {
      description: "Your crop is no longer available for sale",
    });
  };

  const sellNow = (listingId: number) => {
    const listing = marketListings.find(l => l.id === listingId);
    if (!listing || !listing.isMine) return;
    
    toast.info("Completing Sale", {
      description: "Processing your sale securely...",
    });
    
    setTimeout(() => {
      setMarketListings(marketListings.filter(l => l.id !== listingId));
      
      setMyCrops(myCrops.filter(c => c.cropType !== listing.cropType));
      
      toast.success(`Your ${listing.cropType} has been sold!`, {
        description: `Payment of ${listing.price * listing.quantity} has been processed securely`,
      });
    }, 2000);
  };

  const handlePostTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const form = e.target as HTMLFormElement;
    const cropType = form.cropType.value;
    const quantity = parseInt(form.quantity.value);
    const unit = form.unit.value;
    const quality = form.quality.value;
    const location = form.location.value;
    const price = parseInt(form.price.value);
    const marketPrice = parseInt(form.marketPrice.value);
    const expiresIn = form.expiresIn.value;
    const priceStatus = form.priceStatus.value;
    const priceChange = parseInt(form.priceChange.value);
    const holdRecommendation = {
      recommend: form.holdRecommendation.value === "true",
      days: parseInt(form.holdRecommendationDays.value),
      expectedIncrease: parseInt(form.holdRecommendationExpectedIncrease.value)
    };
    const seller = {
      name: form.sellerName.value,
      rating: parseInt(form.sellerRating.value),
      verified: form.sellerVerified.value === "true",
      transactions: parseInt(form.sellerTransactions.value)
    };
    const isMine = form.isMine.value === "true";
    const photo = form.photo.value;
    const bulkDeal = {
      farmersJoined: parseInt(form.bulkDealFarmersJoined.value),
      targetFarmers: parseInt(form.bulkDealTargetFarmers.value),
      bonusPercentage: parseInt(form.bulkDealBonusPercentage.value)
    };
    
    setMarketListings(marketListings.map(l => 
      l.id === listingId ? {
        ...l,
        cropType,
        quantity,
        unit,
        quality,
        location,
        price,
        marketPrice,
        expiresIn,
        priceStatus,
        priceChange,
        holdRecommendation,
        seller,
        isMine
      } : l
    ));
    
    toast({
      variant: "default",
      description: "Trade posted successfully!"
    });
  };

  const handleContactSeller = () => {
    const seller = marketListings.find(l => l.id === selectedTab);
    if (!seller) return;
    
    toast({
      variant: "default",
      description: "Contact request sent to seller!"
    });
  };

  return (
    <Layout>
      <div className="p-5 pb-20 animate-fade-in">
        <div className="mb-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-crop-green-700">AI Smart Market</h1>
              <p className="text-gray-600">AI-powered trading platform for maximum profits</p>
            </div>
            <Button 
              onClick={refreshMarket} 
              className="bg-crop-green-600 hover:bg-crop-green-700 text-white flex items-center"
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <>
                  <LineChart className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <LineChart className="h-4 w-4 mr-2" />
                  Update Market AI
                </>
              )}
            </Button>
          </div>
          
          <Card className="mt-4 border-crop-green-200 bg-crop-green-50">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg text-crop-green-700">AI Market Intelligence</CardTitle>
                <p className="text-xs text-gray-500">Last updated: {aiInsights.lastUpdated}</p>
              </div>
              <CardDescription>{aiInsights.marketOverview}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">Top AI Recommendations:</p>
                {aiInsights.topOpportunities.map((opportunity, index) => (
                  <div key={index} className="flex items-start gap-3 bg-white p-3 rounded-lg border border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-crop-green-100 flex items-center justify-center flex-shrink-0">
                      <Zap className="w-5 h-5 text-crop-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">{opportunity.crop}: {opportunity.action}</h4>
                      <p className="text-sm text-gray-600">{opportunity.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
          <TabsList className="w-full bg-muted grid grid-cols-4">
            <TabsTrigger value="marketplace" className="text-xs sm:text-sm">
              <ShoppingCart className="h-4 w-4 mr-1 hidden sm:inline" />
              Marketplace
            </TabsTrigger>
            <TabsTrigger value="mycrops" className="text-xs sm:text-sm">
              <Package className="h-4 w-4 mr-1 hidden sm:inline" />
              My Crops
            </TabsTrigger>
            <TabsTrigger value="bulkdeals" className="text-xs sm:text-sm">
              <Users className="h-4 w-4 mr-1 hidden sm:inline" />
              Bulk Deals
            </TabsTrigger>
            <TabsTrigger value="buyers" className="text-xs sm:text-sm">
              <HandCoins className="h-4 w-4 mr-1 hidden sm:inline" />
              Top Buyers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="marketplace" className="mt-4">
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2 text-crop-green-600" />
                Available Crop Listings
              </h2>
              
              {marketListings.map(listing => (
                <Card key={listing.id} className={`overflow-hidden ${listing.isMine ? 'border-crop-green-400 bg-crop-green-50' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      <div className="flex-grow">
                        <div className="flex items-center mb-1">
                          <h3 className="font-semibold text-lg mr-2">{listing.cropType}</h3>
                          <Badge className={`${
                            listing.priceStatus === 'rising' 
                              ? 'bg-green-100 text-green-800 border-green-200' 
                              : listing.priceStatus === 'falling' 
                                ? 'bg-red-100 text-red-800 border-red-200' 
                                : 'bg-gray-100 text-gray-800 border-gray-200'
                          }`}>
                            {listing.priceStatus === 'rising' ? '↑' : listing.priceStatus === 'falling' ? '↓' : '→'} 
                            {listing.priceChange}% {listing.priceStatus}
                          </Badge>
                          {listing.isMine && (
                            <Badge className="ml-2 bg-crop-green-100 text-crop-green-700 border-0">
                              Your Listing
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div>
                            <p className="text-sm text-gray-600">Quantity</p>
                            <p className="font-medium">{listing.quantity} {listing.unit}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Quality</p>
                            <p className="font-medium">{listing.quality}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Location</p>
                            <p className="font-medium">{listing.location}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Expires In</p>
                            <p className="font-medium">{listing.expiresIn}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row justify-between sm:items-end">
                          <div>
                            <p className="text-sm text-gray-600">Price per {listing.unit}</p>
                            <div className="flex items-end">
                              <p className="text-2xl font-bold text-crop-green-700">{listing.price}</p>
                              <p className="text-sm ml-1 mb-1 text-gray-500">
                                ({listing.price > listing.marketPrice ? '+' : ''}{Math.round((listing.price / listing.marketPrice - 1) * 100)}% vs market)
                              </p>
                            </div>
                            <p className="text-xs text-gray-600">Total value: {listing.price * listing.quantity}</p>
                          </div>
                          
                          <div className="flex items-center mt-2 sm:mt-0">
                            <div className="flex items-center bg-gray-100 px-2 py-1 rounded-full mr-2">
                              <Star className="h-3 w-3 text-amber-500 mr-1" />
                              <span className="text-xs font-medium">{listing.seller.rating}</span>
                            </div>
                            {listing.seller.verified && (
                              <div className="flex items-center bg-sky-blue-100 px-2 py-1 rounded-full">
                                <ShieldCheck className="h-3 w-3 text-sky-blue-500 mr-1" />
                                <span className="text-xs font-medium">Verified</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {listing.bulkDeal && (
                          <div className="mt-3 bg-amber-50 p-3 rounded-lg border border-amber-100">
                            <p className="flex items-center text-sm font-medium text-amber-800">
                              <Users className="h-4 w-4 mr-1 text-amber-600" />
                              Bulk Deal Opportunity!
                            </p>
                            <p className="text-xs text-amber-700 mt-1">
                              {listing.bulkDeal.farmersJoined}/{listing.bulkDeal.targetFarmers} farmers joined for {listing.bulkDeal.bonusPercentage}% bonus pricing
                            </p>
                            <div className="mt-1 h-1.5 w-full bg-amber-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-amber-500 rounded-full" 
                                style={{ width: `${(listing.bulkDeal.farmersJoined / listing.bulkDeal.targetFarmers) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                        
                        {listing.holdRecommendation.recommend && (
                          <div className="mt-3 bg-crop-green-50 p-3 rounded-lg border border-crop-green-100">
                            <p className="flex items-center text-sm font-medium text-crop-green-800">
                              <Zap className="h-4 w-4 mr-1 text-crop-green-600" />
                              AI Recommendation:
                            </p>
                            <p className="text-xs text-crop-green-700 mt-1">
                              Hold for {listing.holdRecommendation.days} more days for a potential {listing.holdRecommendation.expectedIncrease}% price increase
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-4 space-x-2">
                      {listing.isMine ? (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => withdrawListing(listing.id)}
                            className="text-gray-600"
                          >
                            Withdraw
                          </Button>
                          <Button 
                            size="sm" 
                            className="bg-crop-green-600 hover:bg-crop-green-700 text-white"
                            onClick={() => sellNow(listing.id)}
                          >
                            Sell Now
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-gray-600"
                          >
                            Contact Seller
                          </Button>
                          <Button 
                            size="sm" 
                            className="bg-crop-green-600 hover:bg-crop-green-700 text-white"
                          >
                            Buy Now
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="mycrops" className="mt-4">
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center">
                <Package className="h-5 w-5 mr-2 text-crop-green-600" />
                Your Crops
              </h2>
              
              {myCrops.map(crop => (
                <Card key={crop.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      <div className="flex-grow">
                        <div className="flex items-center mb-1">
                          <h3 className="font-semibold text-lg mr-2">{crop.cropType}</h3>
                          {crop.readyToSell ? (
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              Ready to Sell
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                              Not Ready Yet
                            </Badge>
                          )}
                          {crop.isListed && (
                            <Badge className="ml-2 bg-crop-green-100 text-crop-green-700 border-0">
                              Listed
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div>
                            <p className="text-sm text-gray-600">Harvest Date</p>
                            <p className="font-medium">{crop.harvestDate}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Quantity</p>
                            <p className="font-medium">{crop.quantity} {crop.unit}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Quality</p>
                            <p className="font-medium">{crop.quality}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Current Market Price</p>
                            <p className="font-medium">{crop.currentPrice} per {crop.unit}</p>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <p className="text-sm text-gray-600">AI Suggested Price</p>
                          <div className="flex items-end">
                            <p className="text-2xl font-bold text-crop-green-700">{crop.suggestedPrice}</p>
                            <p className="text-sm ml-1 mb-1 text-gray-500">
                              ({crop.suggestedPrice > crop.currentPrice ? '+' : ''}{Math.round((crop.suggestedPrice / crop.currentPrice - 1) * 100)}% vs market)
                            </p>
                          </div>
                          <p className="text-xs text-gray-600">Total value: {crop.suggestedPrice * crop.quantity}</p>
                        </div>
                        
                        <div className={`mt-3 p-3 rounded-lg border ${
                          crop.marketTrend.status === 'rising'
                            ? 'bg-green-50 border-green-100'
                            : crop.marketTrend.status === 'falling'
                              ? 'bg-red-50 border-red-100'
                              : 'bg-gray-50 border-gray-100'
                        }`}>
                          <p className="flex items-center text-sm font-medium text-gray-800">
                            <LineChart className={`h-4 w-4 mr-1 ${
                              crop.marketTrend.status === 'rising'
                                ? 'text-green-600'
                                : crop.marketTrend.status === 'falling'
                                  ? 'text-red-600'
                                  : 'text-gray-600'
                            }`} />
                            Market Trend:
                          </p>
                          <p className={`text-xs mt-1 ${
                            crop.marketTrend.status === 'rising'
                              ? 'text-green-700'
                              : crop.marketTrend.status === 'falling'
                                ? 'text-red-700'
                                : 'text-gray-700'
                          }`}>
                            {crop.marketTrend.forecast}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-4 space-x-2">
                      {!crop.isListed && crop.readyToSell && (
                        <Button 
                          size="sm" 
                          className="bg-crop-green-600 hover:bg-crop-green-700 text-white"
                          onClick={() => listCrop(crop.id)}
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          List for Sale
                        </Button>
                      )}
                      {crop.isListed && (
                        <Button 
                          variant="outline"
                          size="sm" 
                          className="text-gray-600"
                          onClick={() => {
                            const listing = marketListings.find(l => l.cropType === crop.cropType && l.isMine);
                            if (listing) {
                              withdrawListing(listing.id);
                            }
                          }}
                        >
                          Remove Listing
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="bulkdeals" className="mt-4">
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center">
                <Users className="h-5 w-5 mr-2 text-crop-green-600" />
                Bulk Deals
              </h2>
              
              {bulkDeals.map(deal => (
                <Card key={deal.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      <div className="flex-grow">
                        <div className="flex items-center mb-1">
                          <h3 className="font-semibold text-lg mr-2">{deal.cropType}</h3>
                          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                            {deal.isNew ? "New" : "Existing"}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div>
                            <p className="text-sm text-gray-600">Organizer</p>
                            <p className="font-medium">{deal.organizer}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Target Farmers</p>
                            <p className="font-medium">{deal.targetFarmers}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Bonus Percentage</p>
                            <p className="font-medium">{deal.priceBonus}%</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Deadline</p>
                            <p className="font-medium">{deal.deadline}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row justify-between sm:items-end">
                          <div>
                            <p className="text-sm text-gray-600">Min Quantity</p>
                            <p className="font-medium">{deal.minQuantity}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Buyer</p>
                            <p className="font-medium">{deal.buyer}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-4 space-x-2">
                      <Button 
                        size="sm" 
                        className="bg-crop-green-600 hover:bg-crop-green-700 text-white"
                        onClick={() => joinBulkDeal(deal.id)}
                      >
                        Join Group
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="buyers" className="mt-4">
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center">
                <HandCoins className="h-5 w-5 mr-2 text-crop-green-600" />
                Top Buyers
              </h2>
              
              {topBuyers.map(buyer => (
                <Card key={buyer.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      <div className="flex-grow">
                        <div className="flex items-center mb-1">
                          <h3 className="font-semibold text-lg mr-2">{buyer.name}</h3>
                          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                            {buyer.verified ? "Verified" : "Unverified"}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div>
                            <p className="text-sm text-gray-600">Location</p>
                            <p className="font-medium">{buyer.location}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Deal Size</p>
                            <p className="font-medium">{buyer.dealSize}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Pays Fast</p>
                            <p className="font-medium">{buyer.paysFast ? "Yes" : "No"}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row justify-between sm:items-end">
                          <div>
                            <p className="text-sm text-gray-600">Looking For</p>
                            <p className="font-medium">{buyer.lookingFor.join(", ")}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Transactions</p>
                            <p className="font-medium">{buyer.transactions}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-4 space-x-2">
                      <Button 
                        size="sm" 
                        className="bg-crop-green-600 hover:bg-crop-green-700 text-white"
                        onClick={() => contactBuyer(buyer.id)}
                      >
                        Contact
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Market;

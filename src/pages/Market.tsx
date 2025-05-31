import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PostTradeForm from "@/components/market/PostTradeForm";
import { useMarket } from "@/hooks/useMarket";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  HandCoins,
  LineChart,
  Package,
  ShieldCheck,
  ShoppingCart,
  Star,
  Users,
  Zap,
  AlertCircle
} from "lucide-react";
import ErrorBoundary from "@/components/error/ErrorBoundary.tsx";
import { Skeleton } from "@/components/ui/skeleton";

const Market = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("marketplace");
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const {
    marketListings,
    myCrops,
    topBuyers,
    bulkDeals,
    aiInsights,
    isLoading,
    isRefreshing,
    error,
    refreshMarket,
    handlePostTrade,
    handleContactSeller,
    listCrop,
    joinBulkDeal,
    contactBuyer,
    withdrawListing,
    sellNow
  } = useMarket();

  // Handle errors
  const handleError = useCallback((error: Error) => {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive"
    });
  }, [toast]);

  if (error) {
    return (
      <Layout>
        <div className="p-5 pb-20 animate-fade-in">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
              <p className="text-gray-600">Failed to load market data</p>
              <Button 
                onClick={refreshMarket}
                className="mt-4"
                variant="outline"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="p-5 pb-20 animate-fade-in">
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-5 pb-20 animate-fade-in">
        <div className="mb-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-crop-green-700">AI Smart Market</h1>
              <p className="text-gray-600">AI-powered trading platform for maximum profits</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                className="bg-white hover:bg-gray-50 text-crop-green-700 border-crop-green-300 flex items-center"
                onClick={() => navigate('/market/intelligence')}
              >
                <LineChart className="h-4 w-4 mr-2" />
                Market Intelligence
              </Button>
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
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800 flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2 text-crop-green-600" />
                  Available Crop Listings
                </h2>
                <PostTradeForm onSubmit={handlePostTrade} />
              </div>
              
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
                              <div className="flex items-center bg-blue-100 px-2 py-1 rounded-full">
                                <ShieldCheck className="h-3 w-3 text-blue-500 mr-1" />
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
                            onClick={() => handleContactSeller(listing.id)}
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

// Wrap the component with error boundary
export default function MarketWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <Market />
    </ErrorBoundary>
  );
}

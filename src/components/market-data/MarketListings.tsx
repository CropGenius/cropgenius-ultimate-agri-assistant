/**
 * MarketListings Component
 * INFINITY GOD MODE implementation for comprehensive market listings with advanced filtering,
 * sorting, distance calculation, and interactive features for 100M African farmers
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Search, 
  Filter, 
  MapPin, 
  Phone, 
  Calendar, 
  Star,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Plus,
  MessageSquare,
  Share2,
  Bookmark,
  AlertTriangle,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  Eye,
  Heart,
  Clock,
  DollarSign,
  Package,
  User,
  Navigation
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface MarketListing {
  id: string;
  created_at: string;
  crop_name: string;
  price: number;
  quantity?: number;
  unit?: string;
  location?: string;
  seller_id?: string;
  seller_name?: string;
  contact_info?: string;
  description?: string;
  listing_type?: 'sell' | 'buy' | 'trade';
  status?: 'active' | 'pending' | 'completed' | 'expired';
  expiry_date?: string;
  image_url?: string;
  latitude?: number;
  longitude?: number;
  quality_grade?: 'A' | 'B' | 'C' | 'unknown';
  currency?: string;
}

interface MarketListingsProps {
  listings?: MarketListing[];
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onCreateListing?: () => void;
  onContactSeller?: (listing: MarketListing) => void;
  onViewDetails?: (listing: MarketListing) => void;
  onSaveListing?: (listing: MarketListing) => void;
  userLocation?: { lat: number; lng: number };
  className?: string;
}

type ViewMode = 'grid' | 'list';
type SortBy = 'date' | 'price' | 'distance' | 'quality';
type SortOrder = 'asc' | 'desc';

export const MarketListings: React.FC<MarketListingsProps> = ({
  listings = [],
  isLoading = false,
  error = null,
  onRefresh,
  onCreateListing,
  onContactSeller,
  onViewDetails,
  onSaveListing,
  userLocation,
  className
}) => {
  // State management with INFINITY IQ optimization
  const [searchQuery, setSearchQuery] = useState('');
  const [cropFilter, setCropFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [listingTypeFilter, setListingTypeFilter] = useState('all');
  const [qualityFilter, setQualityFilter] = useState('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedListing, setSelectedListing] = useState<MarketListing | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [savedListings, setSavedListings] = useState<Set<string>>(new Set());

  // GENIUS IQ filter options generation
  const filterOptions = useMemo(() => {
    const crops = new Set(listings.map(listing => listing.crop_name));
    const locations = new Set(listings.map(listing => listing.location).filter(Boolean));
    const listingTypes = new Set(listings.map(listing => listing.listing_type).filter(Boolean));
    const qualities = new Set(listings.map(listing => listing.quality_grade).filter(Boolean));

    return {
      crops: Array.from(crops).sort(),
      locations: Array.from(locations).sort(),
      listingTypes: Array.from(listingTypes),
      qualities: Array.from(qualities).sort()
    };
  }, [listings]);

  // INFINITY GOD MODE distance calculation
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 9999;
    
    const R = 6371; // Earth's radius in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  const deg2rad = (deg: number): number => deg * (Math.PI/180);

  // SUPREME filtering and sorting logic
  const filteredAndSortedListings = useMemo(() => {
    let filtered = [...listings];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(listing => 
        listing.crop_name.toLowerCase().includes(query) ||
        listing.description?.toLowerCase().includes(query) ||
        listing.seller_name?.toLowerCase().includes(query) ||
        listing.location?.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (cropFilter !== 'all') {
      filtered = filtered.filter(listing => listing.crop_name === cropFilter);
    }
    if (locationFilter !== 'all') {
      filtered = filtered.filter(listing => listing.location === locationFilter);
    }
    if (listingTypeFilter !== 'all') {
      filtered = filtered.filter(listing => listing.listing_type === listingTypeFilter);
    }
    if (qualityFilter !== 'all') {
      filtered = filtered.filter(listing => listing.quality_grade === qualityFilter);
    }

    // Apply sorting with GENIUS logic
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'distance':
          if (userLocation) {
            const distanceA = calculateDistance(
              userLocation.lat, userLocation.lng,
              a.latitude || 0, a.longitude || 0
            );
            const distanceB = calculateDistance(
              userLocation.lat, userLocation.lng,
              b.latitude || 0, b.longitude || 0
            );
            comparison = distanceA - distanceB;
          }
          break;
        case 'quality':
          const qualityOrder = { 'A': 3, 'B': 2, 'C': 1, 'unknown': 0 };
          comparison = (qualityOrder[a.quality_grade || 'unknown'] || 0) - 
                      (qualityOrder[b.quality_grade || 'unknown'] || 0);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [listings, searchQuery, cropFilter, locationFilter, listingTypeFilter, qualityFilter, sortBy, sortOrder, userLocation, calculateDistance]);

  // INFINITY IQ helper functions
  const getDistanceText = useCallback((listing: MarketListing): string => {
    if (!userLocation || !listing.latitude || !listing.longitude) return '';
    
    const distance = calculateDistance(
      userLocation.lat, userLocation.lng,
      listing.latitude, listing.longitude
    );
    
    if (distance < 1) return `${Math.round(distance * 1000)}m away`;
    return `${Math.round(distance)}km away`;
  }, [userLocation, calculateDistance]);

  const getCropEmoji = (cropName: string): string => {
    const cropEmojis: Record<string, string> = {
      maize: '🌽', corn: '🌽', beans: '🫘', tomato: '🍅', tomatoes: '🍅',
      rice: '🌾', wheat: '🌾', potato: '🥔', potatoes: '🥔', cassava: '🍠',
      yam: '🍠', onion: '🧅', onions: '🧅', cabbage: '🥬', carrot: '🥕',
      carrots: '🥕', pepper: '🌶️', peppers: '🌶️', banana: '🍌', bananas: '🍌',
      coffee: '☕', tea: '🍵', sugarcane: '🎋', cotton: '🧶', soybean: '🌱',
      soybeans: '🌱', groundnut: '🥜', groundnuts: '🥜', peanut: '🥜', peanuts: '🥜'
    };
    return cropEmojis[cropName.toLowerCase()] || '🌱';
  };

  const renderListingTypeBadge = (type?: string) => {
    const configs = {
      sell: { color: 'bg-green-100 text-green-800 hover:bg-green-200', label: 'Selling', icon: DollarSign },
      buy: { color: 'bg-blue-100 text-blue-800 hover:bg-blue-200', label: 'Buying', icon: Package },
      trade: { color: 'bg-purple-100 text-purple-800 hover:bg-purple-200', label: 'Trading', icon: RefreshCw }
    };
    
    const config = configs[type as keyof typeof configs];
    if (!config) return <Badge variant=\"outline\">Unknown</Badge>;
    
    const Icon = config.icon;
    return (
      <Badge className={cn('gap-1', config.color)}>
        <Icon className=\"h-3 w-3\" />
        {config.label}
      </Badge>
    );
  };

  const renderQualityBadge = (grade?: string) => {
    const configs = {
      A: { stars: 3, label: 'Premium', color: 'text-amber-600' },
      B: { stars: 2, label: 'Standard', color: 'text-amber-600' },
      C: { stars: 1, label: 'Basic', color: 'text-amber-600' }
    };
    
    const config = configs[grade as keyof typeof configs];
    if (!config) return null;
    
    return (
      <div className={cn('flex items-center gap-1', config.color)}>
        {Array.from({ length: config.stars }).map((_, i) => (
          <Star key={i} className=\"h-3 w-3 fill-amber-500\" />
        ))}
        <span className=\"text-xs font-medium\">{config.label}</span>
      </div>
    );
  };

  // GENIUS event handlers
  const handleSortChange = (value: SortBy) => {
    if (sortBy === value) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(value);
      setSortOrder('desc');
    }
  };

  const handleSaveListing = (listing: MarketListing) => {
    const newSaved = new Set(savedListings);
    if (newSaved.has(listing.id)) {
      newSaved.delete(listing.id);
      toast.success('Listing removed from saved');
    } else {
      newSaved.add(listing.id);
      toast.success('Listing saved successfully');
    }
    setSavedListings(newSaved);
    onSaveListing?.(listing);
  };

  const handleContactSeller = (listing: MarketListing) => {
    if (!listing.contact_info) {
      toast.error('No contact information available');
      return;
    }
    onContactSeller?.(listing);
    toast.success('Opening contact information');
  };

  const handleShareListing = (listing: MarketListing) => {
    if (navigator.share) {
      navigator.share({
        title: `${listing.crop_name} - ${listing.currency || 'KES'} ${listing.price}`,
        text: `Check out this ${listing.crop_name} listing on CropGenius`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Listing link copied to clipboard');
    }
  };

  // INFINITY GOD MODE grid view renderer
  const renderGridView = () => (
    <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4\">
      {filteredAndSortedListings.map(listing => (
        <Card key={listing.id} className=\"overflow-hidden h-full flex flex-col hover:shadow-lg transition-all duration-200 group\">
          {/* Image/Emoji Header */}
          <div className=\"relative h-48 overflow-hidden bg-gradient-to-br from-green-50 to-blue-50\">
            {listing.image_url ? (
              <img 
                src={listing.image_url} 
                alt={listing.crop_name} 
                className=\"w-full h-full object-cover group-hover:scale-105 transition-transform duration-200\"
              />
            ) : (
              <div className=\"w-full h-full flex items-center justify-center\">
                <div className=\"text-6xl\">{getCropEmoji(listing.crop_name)}</div>
              </div>
            )}
            
            {/* Overlay badges */}
            <div className=\"absolute top-2 left-2\">
              {renderListingTypeBadge(listing.listing_type)}
            </div>
            <div className=\"absolute top-2 right-2\">
              <Button
                variant=\"ghost\"
                size=\"icon\"
                className=\"h-8 w-8 bg-white/80 hover:bg-white\"
                onClick={() => handleSaveListing(listing)}
              >
                <Heart className={cn('h-4 w-4', savedListings.has(listing.id) && 'fill-red-500 text-red-500')} />
              </Button>
            </div>
            
            {/* Status indicator */}
            {listing.status && listing.status !== 'active' && (
              <div className=\"absolute bottom-2 left-2\">
                <Badge variant={listing.status === 'expired' ? 'destructive' : 'secondary'}>
                  {listing.status}
                </Badge>
              </div>
            )}
          </div>
          
          <CardContent className=\"pt-4 flex-1 space-y-3\">
            {/* Title and Price */}
            <div className=\"flex items-start justify-between\">
              <div>
                <h3 className=\"font-semibold capitalize text-lg\">{listing.crop_name}</h3>
                {listing.quantity && listing.unit && (
                  <p className=\"text-sm text-muted-foreground\">{listing.quantity} {listing.unit}</p>
                )}
              </div>
              <div className=\"text-right\">
                <div className=\"font-bold text-xl text-green-600\">
                  {listing.currency || 'KES'} {listing.price.toFixed(2)}
                </div>
                {listing.unit && (
                  <div className=\"text-xs text-muted-foreground\">per {listing.unit}</div>
                )}
              </div>
            </div>
            
            {/* Quality badge */}
            {renderQualityBadge(listing.quality_grade)}
            
            {/* Location and distance */}
            {listing.location && (
              <div className=\"flex items-center text-sm text-muted-foreground\">
                <MapPin className=\"h-4 w-4 mr-1 flex-shrink-0\" />
                <span className=\"truncate\">{listing.location}</span>
                {userLocation && listing.latitude && listing.longitude && (
                  <span className=\"ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full\">
                    {getDistanceText(listing)}
                  </span>
                )}
              </div>
            )}
            
            {/* Seller info */}
            {listing.seller_name && (
              <div className=\"flex items-center text-sm\">
                <Avatar className=\"h-6 w-6 mr-2\">
                  <AvatarFallback className=\"text-xs\">
                    {listing.seller_name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className=\"truncate\">{listing.seller_name}</span>
              </div>
            )}
            
            {/* Time info */}
            <div className=\"flex items-center text-xs text-muted-foreground\">
              <Clock className=\"h-3 w-3 mr-1\" />
              <span>Listed {formatDistanceToNow(new Date(listing.created_at), { addSuffix: true })}</span>
            </div>
            
            {/* Description preview */}
            {listing.description && (
              <p className=\"text-sm text-muted-foreground line-clamp-2\">{listing.description}</p>
            )}
          </CardContent>
          
          <CardFooter className=\"border-t pt-4 flex justify-between gap-2\">
            <Button 
              variant=\"outline\" 
              size=\"sm\"
              onClick={() => {
                setSelectedListing(listing);
                onViewDetails?.(listing);
              }}
              className=\"flex-1\"
            >
              <Eye className=\"h-4 w-4 mr-2\" />
              View Details
            </Button>
            
            <div className=\"flex gap-1\">
              {listing.contact_info && (
                <Button 
                  variant=\"ghost\" 
                  size=\"icon\"
                  onClick={() => handleContactSeller(listing)}
                >
                  <Phone className=\"h-4 w-4\" />
                </Button>
              )}
              
              <Button 
                variant=\"ghost\" 
                size=\"icon\"
                onClick={() => handleShareListing(listing)}
              >
                <Share2 className=\"h-4 w-4\" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  // SUPREME list view renderer
  const renderListView = () => (
    <div className=\"space-y-3\">
      {filteredAndSortedListings.map(listing => (
        <Card key={listing.id} className=\"overflow-hidden hover:shadow-md transition-shadow duration-200\">
          <div className=\"flex flex-col md:flex-row\">
            {/* Image/Emoji */}
            <div className=\"relative h-32 md:w-32 md:h-auto overflow-hidden bg-gradient-to-br from-green-50 to-blue-50\">
              {listing.image_url ? (
                <img 
                  src={listing.image_url} 
                  alt={listing.crop_name} 
                  className=\"w-full h-full object-cover\"
                />
              ) : (
                <div className=\"w-full h-full flex items-center justify-center\">
                  <div className=\"text-4xl\">{getCropEmoji(listing.crop_name)}</div>
                </div>
              )}
            </div>
            
            {/* Content */}
            <div className=\"flex-1 p-4\">
              <div className=\"flex items-start justify-between mb-3\">
                <div className=\"flex items-center gap-3\">
                  <div>
                    <div className=\"flex items-center gap-2 mb-1\">
                      <h3 className=\"font-semibold capitalize text-lg\">{listing.crop_name}</h3>
                      {renderListingTypeBadge(listing.listing_type)}
                    </div>
                    <div className=\"flex items-center gap-4 text-sm text-muted-foreground\">
                      {listing.quantity && listing.unit && (
                        <span>{listing.quantity} {listing.unit}</span>
                      )}
                      {renderQualityBadge(listing.quality_grade)}
                    </div>
                  </div>
                </div>
                
                <div className=\"text-right\">
                  <div className=\"font-bold text-xl text-green-600\">
                    {listing.currency || 'KES'} {listing.price.toFixed(2)}
                  </div>
                  {listing.unit && (
                    <div className=\"text-xs text-muted-foreground\">per {listing.unit}</div>
                  )}
                </div>
              </div>
              
              {/* Details row */}
              <div className=\"flex flex-wrap gap-x-6 gap-y-2 mb-3\">
                {listing.location && (
                  <div className=\"flex items-center text-sm text-muted-foreground\">
                    <MapPin className=\"h-4 w-4 mr-1\" />
                    <span>{listing.location}</span>
                    {userLocation && listing.latitude && listing.longitude && (
                      <span className=\"ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full\">
                        {getDistanceText(listing)}
                      </span>
                    )}
                  </div>
                )}
                
                {listing.seller_name && (
                  <div className=\"flex items-center text-sm\">
                    <User className=\"h-4 w-4 mr-1\" />
                    <span>{listing.seller_name}</span>
                  </div>
                )}
                
                <div className=\"flex items-center text-sm text-muted-foreground\">
                  <Clock className=\"h-4 w-4 mr-1\" />
                  <span>Listed {formatDistanceToNow(new Date(listing.created_at), { addSuffix: true })}</span>
                </div>
              </div>
              
              {/* Description */}
              {listing.description && (
                <p className=\"text-sm text-muted-foreground line-clamp-2 mb-3\">{listing.description}</p>
              )}
            </div>
            
            {/* Actions */}
            <div className=\"flex md:flex-col justify-between p-4 border-t md:border-t-0 md:border-l bg-gray-50/50\">
              <div className=\"flex md:flex-col gap-2\">
                <Button 
                  variant=\"outline\" 
                  size=\"sm\"
                  onClick={() => {
                    setSelectedListing(listing);
                    onViewDetails?.(listing);
                  }}
                  className=\"w-full\"
                >
                  <Eye className=\"h-4 w-4 mr-2\" />
                  View Details
                </Button>
                
                {listing.contact_info && (
                  <Button 
                    size=\"sm\"
                    onClick={() => handleContactSeller(listing)}
                    className=\"w-full\"
                  >
                    <Phone className=\"h-4 w-4 mr-2\" />
                    Contact
                  </Button>
                )}
              </div>
              
              <div className=\"flex md:flex-col gap-1 mt-2\">
                <Button 
                  variant=\"ghost\" 
                  size=\"icon\"
                  onClick={() => handleSaveListing(listing)}
                >
                  <Heart className={cn('h-4 w-4', savedListings.has(listing.id) && 'fill-red-500 text-red-500')} />
                </Button>
                
                <Button 
                  variant=\"ghost\" 
                  size=\"icon\"
                  onClick={() => handleShareListing(listing)}
                >
                  <Share2 className=\"h-4 w-4\" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  // INFINITY GOD MODE loading state
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className=\"flex items-center justify-between\">
            <div>
              <Skeleton className=\"h-8 w-48\" />
              <Skeleton className=\"h-4 w-64 mt-2\" />
            </div>
            <Skeleton className=\"h-10 w-32\" />
          </div>
        </CardHeader>
        <CardContent>
          <div className=\"flex items-center justify-between mb-6\">
            <div className=\"flex gap-2\">
              <Skeleton className=\"h-10 w-48\" />
              <Skeleton className=\"h-10 w-32\" />
              <Skeleton className=\"h-10 w-32\" />
            </div>
            <Skeleton className=\"h-10 w-32\" />
          </div>
          
          <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4\">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className=\"overflow-hidden\">
                <Skeleton className=\"h-48 w-full\" />
                <CardContent className=\"pt-4 space-y-3\">
                  <div className=\"flex justify-between\">
                    <Skeleton className=\"h-6 w-24\" />
                    <Skeleton className=\"h-6 w-20\" />
                  </div>
                  <Skeleton className=\"h-4 w-32\" />
                  <Skeleton className=\"h-4 w-40\" />
                  <Skeleton className=\"h-4 w-36\" />
                </CardContent>
                <CardFooter className=\"border-t pt-4\">
                  <Skeleton className=\"h-9 w-full\" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={className}>
        <CardContent className=\"flex items-center justify-center h-64\">
          <div className=\"text-center\">
            <AlertTriangle className=\"h-12 w-12 text-red-500 mx-auto mb-4\" />
            <p className=\"text-red-600 font-medium mb-2\">Failed to load market listings</p>
            <p className=\"text-sm text-muted-foreground mb-4\">{error}</p>
            {onRefresh && (
              <Button onClick={onRefresh}>
                <RefreshCw className=\"h-4 w-4 mr-2\" />
                Try Again
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className=\"flex items-center justify-between\">
          <div>
            <CardTitle className=\"flex items-center gap-2\">
              <Package className=\"h-6 w-6 text-green-600\" />
              Market Listings
              <Badge variant=\"outline\" className=\"ml-2\">
                {filteredAndSortedListings.length} listings
              </Badge>
            </CardTitle>
            <CardDescription>
              Browse active crop listings from farmers and buyers across Africa
            </CardDescription>
          </div>
          
          <div className=\"flex items-center gap-2\">
            {onCreateListing && (
              <Button onClick={onCreateListing} size=\"sm\">
                <Plus className=\"h-4 w-4 mr-2\" />
                Create Listing
              </Button>
            )}
            
            {onRefresh && (
              <Button
                variant=\"outline\"
                size=\"sm\"
                onClick={onRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* SUPREME filter controls */}
        <div className=\"space-y-4 mb-6\">
          {/* Search and view toggle */}
          <div className=\"flex items-center gap-4\">
            <div className=\"relative flex-1 max-w-md\">
              <Search className=\"absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground\" />
              <Input
                placeholder=\"Search crops, sellers, locations...\"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className=\"pl-10\"
              />
            </div>
            
            <div className=\"flex items-center gap-1 border rounded-md p-1\">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size=\"sm\"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className=\"h-4 w-4\" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size=\"sm\"
                onClick={() => setViewMode('list')}
              >
                <List className=\"h-4 w-4\" />
              </Button>
            </div>
          </div>
          
          {/* Filters row */}
          <div className=\"flex flex-wrap items-center gap-3\">
            <Select value={cropFilter} onValueChange={setCropFilter}>
              <SelectTrigger className=\"w-40\">
                <SelectValue placeholder=\"All Crops\" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=\"all\">All Crops</SelectItem>
                {filterOptions.crops.map(crop => (
                  <SelectItem key={crop} value={crop}>
                    {getCropEmoji(crop)} {crop}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className=\"w-40\">
                <SelectValue placeholder=\"All Locations\" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=\"all\">All Locations</SelectItem>
                {filterOptions.locations.map(location => (
                  <SelectItem key={location} value={location}>
                    <MapPin className=\"h-3 w-3 mr-1\" />
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={listingTypeFilter} onValueChange={setListingTypeFilter}>
              <SelectTrigger className=\"w-32\">
                <SelectValue placeholder=\"Type\" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=\"all\">All Types</SelectItem>
                <SelectItem value=\"sell\">Selling</SelectItem>
                <SelectItem value=\"buy\">Buying</SelectItem>
                <SelectItem value=\"trade\">Trading</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={qualityFilter} onValueChange={setQualityFilter}>
              <SelectTrigger className=\"w-32\">
                <SelectValue placeholder=\"Quality\" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=\"all\">All Quality</SelectItem>
                <SelectItem value=\"A\">Premium (A)</SelectItem>
                <SelectItem value=\"B\">Standard (B)</SelectItem>
                <SelectItem value=\"C\">Basic (C)</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Sort controls */}
            <div className=\"flex items-center gap-1 border rounded-md p-1\">
              <Button
                variant={sortBy === 'date' ? 'default' : 'ghost'}
                size=\"sm\"
                onClick={() => handleSortChange('date')}
              >
                <Calendar className=\"h-4 w-4 mr-1\" />
                Date
                {sortBy === 'date' && (
                  sortOrder === 'asc' ? <SortAsc className=\"h-3 w-3 ml-1\" /> : <SortDesc className=\"h-3 w-3 ml-1\" />
                )}
              </Button>
              
              <Button
                variant={sortBy === 'price' ? 'default' : 'ghost'}
                size=\"sm\"
                onClick={() => handleSortChange('price')}
              >
                <DollarSign className=\"h-4 w-4 mr-1\" />
                Price
                {sortBy === 'price' && (
                  sortOrder === 'asc' ? <SortAsc className=\"h-3 w-3 ml-1\" /> : <SortDesc className=\"h-3 w-3 ml-1\" />
                )}
              </Button>
              
              {userLocation && (
                <Button
                  variant={sortBy === 'distance' ? 'default' : 'ghost'}
                  size=\"sm\"
                  onClick={() => handleSortChange('distance')}
                >
                  <Navigation className=\"h-4 w-4 mr-1\" />
                  Distance
                  {sortBy === 'distance' && (
                    sortOrder === 'asc' ? <SortAsc className=\"h-3 w-3 ml-1\" /> : <SortDesc className=\"h-3 w-3 ml-1\" />
                  )}
                </Button>
              )}
              
              <Button
                variant={sortBy === 'quality' ? 'default' : 'ghost'}
                size=\"sm\"
                onClick={() => handleSortChange('quality')}
              >
                <Star className=\"h-4 w-4 mr-1\" />
                Quality
                {sortBy === 'quality' && (
                  sortOrder === 'asc' ? <SortAsc className=\"h-3 w-3 ml-1\" /> : <SortDesc className=\"h-3 w-3 ml-1\" />
                )}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Results */}
        {filteredAndSortedListings.length === 0 ? (
          <div className=\"text-center py-12\">
            <Package className=\"h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50\" />
            <h3 className=\"text-lg font-medium mb-2\">No listings found</h3>
            <p className=\"text-muted-foreground mb-4\">
              {searchQuery || cropFilter !== 'all' || locationFilter !== 'all' || listingTypeFilter !== 'all' || qualityFilter !== 'all'
                ? 'Try adjusting your filters or search terms'
                : 'Be the first to create a listing in your area'
              }
            </p>
            {onCreateListing && (
              <Button onClick={onCreateListing}>
                <Plus className=\"h-4 w-4 mr-2\" />
                Create First Listing
              </Button>
            )}
          </div>
        ) : (
          viewMode === 'grid' ? renderGridView() : renderListView()
        )}
      </CardContent>
      
      {/* GENIUS listing detail modal */}
      {selectedListing && (
        <Dialog open={!!selectedListing} onOpenChange={() => setSelectedListing(null)}>
          <DialogContent className=\"max-w-4xl max-h-[90vh] overflow-y-auto\">
            <DialogHeader>
              <DialogTitle className=\"flex items-center gap-3\">
                <span className=\"text-3xl\">{getCropEmoji(selectedListing.crop_name)}</span>
                <div>
                  <div className=\"flex items-center gap-2\">
                    <span className=\"capitalize text-xl\">{selectedListing.crop_name}</span>
                    {renderListingTypeBadge(selectedListing.listing_type)}
                  </div>
                  <div className=\"text-sm text-muted-foreground font-normal\">
                    Listed {format(new Date(selectedListing.created_at), 'MMMM d, yyyy')}
                  </div>
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6\">
              {/* Image and description */}
              <div className=\"space-y-4\">
                {selectedListing.image_url ? (
                  <div className=\"rounded-lg overflow-hidden border\">
                    <img 
                      src={selectedListing.image_url} 
                      alt={selectedListing.crop_name} 
                      className=\"w-full h-64 object-cover\"
                    />
                  </div>
                ) : (
                  <div className=\"h-64 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg flex items-center justify-center border\">
                    <div className=\"text-8xl\">{getCropEmoji(selectedListing.crop_name)}</div>
                  </div>
                )}

                <div>
                  <h3 className=\"font-medium mb-2\">Description</h3>
                  <p className=\"text-sm text-muted-foreground\">
                    {selectedListing.description || 'No description provided by the seller.'}
                  </p>
                </div>

                {renderQualityBadge(selectedListing.quality_grade) && (
                  <div>
                    <h3 className=\"font-medium mb-2\">Quality Grade</h3>
                    {renderQualityBadge(selectedListing.quality_grade)}
                  </div>
                )}
              </div>

              {/* Details */}
              <div className=\"space-y-6\">
                {/* Price */}
                <div>
                  <h3 className=\"font-medium mb-2\">Price</h3>
                  <div className=\"flex items-baseline gap-2\">
                    <span className=\"text-3xl font-bold text-green-600\">
                      {selectedListing.currency || 'KES'} {selectedListing.price.toFixed(2)}
                    </span>
                    {selectedListing.unit && (
                      <span className=\"text-muted-foreground\">per {selectedListing.unit}</span>
                    )}
                  </div>
                </div>

                {/* Quantity */}
                {selectedListing.quantity && (
                  <div>
                    <h3 className=\"font-medium mb-2\">Quantity Available</h3>
                    <p className=\"text-lg\">
                      {selectedListing.quantity} {selectedListing.unit || 'units'}
                    </p>
                  </div>
                )}

                {/* Location */}
                {selectedListing.location && (
                  <div>
                    <h3 className=\"font-medium mb-2\">Location</h3>
                    <div className=\"flex items-center gap-2\">
                      <MapPin className=\"h-4 w-4 text-muted-foreground\" />
                      <span>{selectedListing.location}</span>
                    </div>
                    {userLocation && selectedListing.latitude && selectedListing.longitude && (
                      <p className=\"text-sm text-muted-foreground mt-1\">
                        {getDistanceText(selectedListing)} from your location
                      </p>
                    )}
                  </div>
                )}

                {/* Seller */}
                {selectedListing.seller_name && (
                  <div>
                    <h3 className=\"font-medium mb-2\">Seller</h3>
                    <div className=\"flex items-center gap-3\">
                      <Avatar className=\"h-8 w-8\">
                        <AvatarFallback>
                          {selectedListing.seller_name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{selectedListing.seller_name}</span>
                    </div>
                  </div>
                )}

                {/* Expiry */}
                {selectedListing.expiry_date && (
                  <div>
                    <h3 className=\"font-medium mb-2\">Listing Expires</h3>
                    <div className=\"flex items-center gap-2\">
                      <Calendar className=\"h-4 w-4 text-muted-foreground\" />
                      <span>{format(new Date(selectedListing.expiry_date), 'MMMM d, yyyy')}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className=\"flex-col sm:flex-row gap-3\">
              <div className=\"flex gap-2 w-full\">
                {selectedListing.contact_info && (
                  <Button 
                    onClick={() => {
                      handleContactSeller(selectedListing);
                      setSelectedListing(null);
                    }}
                    className=\"flex-1\"
                  >
                    <Phone className=\"h-4 w-4 mr-2\" />
                    Contact Seller
                  </Button>
                )}
                
                <Button 
                  variant=\"outline\"
                  onClick={() => {
                    handleSaveListing(selectedListing);
                  }}
                  className=\"flex-1\"
                >
                  <Heart className={cn('h-4 w-4 mr-2', savedListings.has(selectedListing.id) && 'fill-red-500 text-red-500')} />
                  {savedListings.has(selectedListing.id) ? 'Saved' : 'Save Listing'}
                </Button>
                
                <Button 
                  variant=\"outline\"
                  onClick={() => handleShareListing(selectedListing)}
                  className=\"flex-1\"
                >
                  <Share2 className=\"h-4 w-4 mr-2\" />
                  Share
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};
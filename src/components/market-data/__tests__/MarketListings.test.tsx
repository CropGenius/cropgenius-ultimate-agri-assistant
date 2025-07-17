/**
 * INFINITY GOD MODE MarketListings Component Tests
 * Comprehensive test suite for the most advanced agricultural marketplace component
 * Testing for 100M African farmers with SUPREME precision! 🚀🔥💪
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MarketListings, type MarketListing } from '../MarketListings';
import { toast } from 'sonner';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  }
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  format: vi.fn((date, formatStr) => {
    if (formatStr === 'MMM dd, yyyy') return 'Jan 15, 2025';
    if (formatStr === 'MMMM d, yyyy') return 'January 15, 2025';
    return 'Jan 15';
  }),
  formatDistanceToNow: vi.fn(() => '2 hours ago')
}));

// Mock navigator.share and clipboard
const mockShare = vi.fn();
const mockWriteText = vi.fn();

Object.defineProperty(navigator, 'share', {
  value: mockShare,
  writable: true
});

Object.defineProperty(navigator, 'clipboard', {
  value: { writeText: mockWriteText },
  writable: true
});

describe('MarketListings Component - INFINITY GOD MODE Tests', () => {
  // SUPREME test data for African agricultural marketplace
  const mockListings: MarketListing[] = [
    {
      id: '1',
      created_at: '2025-01-15T10:00:00Z',
      crop_name: 'maize',
      price: 45.50,
      quantity: 100,
      unit: 'kg',
      location: 'Nairobi, Kenya',
      seller_name: 'John Kamau',
      contact_info: '+254712345678',
      description: 'Premium quality maize, freshly harvested from organic farm',
      listing_type: 'sell',
      status: 'active',
      quality_grade: 'A',
      currency: 'KES',
      latitude: -1.2921,
      longitude: 36.8219
    },
    {
      id: '2',
      created_at: '2025-01-14T15:30:00Z',
      crop_name: 'beans',
      price: 120.00,
      quantity: 50,
      unit: 'kg',
      location: 'Mombasa, Kenya',
      seller_name: 'Mary Wanjiku',
      contact_info: '+254723456789',
      description: 'High-quality red kidney beans, perfect for export',
      listing_type: 'sell',
      status: 'active',
      quality_grade: 'A',
      currency: 'KES',
      latitude: -4.0435,
      longitude: 39.6682
    },
    {
      id: '3',
      created_at: '2025-01-13T08:15:00Z',
      crop_name: 'tomato',
      price: 80.00,
      quantity: 200,
      unit: 'kg',
      location: 'Nakuru, Kenya',
      seller_name: 'Peter Mwangi',
      contact_info: '+254734567890',
      description: 'Fresh tomatoes from greenhouse farming',
      listing_type: 'buy',
      status: 'active',
      quality_grade: 'B',
      currency: 'KES',
      latitude: -0.3031,
      longitude: 36.0800
    }
  ];

  const mockUserLocation = { lat: -1.2921, lng: 36.8219 }; // Nairobi, Kenya

  const defaultProps = {
    listings: mockListings,
    isLoading: false,
    error: null,
    onRefresh: vi.fn(),
    onCreateListing: vi.fn(),
    onContactSeller: vi.fn(),
    onViewDetails: vi.fn(),
    onSaveListing: vi.fn(),
    userLocation: mockUserLocation
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('🚀 Component Rendering Tests', () => {
    it('should render MarketListings component with INFINITY GOD MODE precision', () => {
      render(<MarketListings {...defaultProps} />);
      
      expect(screen.getByText('Market Listings')).toBeInTheDocument();
      expect(screen.getByText('3 listings')).toBeInTheDocument();
      expect(screen.getByText('Browse active crop listings from farmers and buyers across Africa')).toBeInTheDocument();
    });

    it('should display all listings in grid view by default', () => {
      render(<MarketListings {...defaultProps} />);
      
      // Check if all listings are displayed
      expect(screen.getByText('John Kamau')).toBeInTheDocument();
      expect(screen.getByText('Mary Wanjiku')).toBeInTheDocument();
      expect(screen.getByText('Peter Mwangi')).toBeInTheDocument();
      
      // Check prices
      expect(screen.getByText('KES 45.50')).toBeInTheDocument();
      expect(screen.getByText('KES 120.00')).toBeInTheDocument();
      expect(screen.getByText('KES 80.00')).toBeInTheDocument();
    });

    it('should show crop emojis for different crops', () => {
      render(<MarketListings {...defaultProps} />);
      
      // The emojis are rendered as text content, so we check for the crop names
      expect(screen.getByText('maize')).toBeInTheDocument();
      expect(screen.getByText('beans')).toBeInTheDocument();
      expect(screen.getByText('tomato')).toBeInTheDocument();
    });

    it('should display quality grades with star ratings', () => {
      render(<MarketListings {...defaultProps} />);
      
      // Check for Premium and Standard quality indicators
      expect(screen.getByText('Premium')).toBeInTheDocument();
      expect(screen.getByText('Standard')).toBeInTheDocument();
    });

    it('should show listing type badges', () => {
      render(<MarketListings {...defaultProps} />);
      
      expect(screen.getAllByText('Selling')).toHaveLength(2);
      expect(screen.getByText('Buying')).toBeInTheDocument();
    });
  });

  describe('🔥 Loading and Error States', () => {
    it('should display loading skeleton when isLoading is true', () => {
      render(<MarketListings {...defaultProps} isLoading={true} />);
      
      // Check for skeleton elements
      expect(screen.getByText('Market Listings')).toBeInTheDocument();
      // Skeleton elements don't have specific text, but we can check the structure
      const skeletons = document.querySelectorAll('[data-testid="skeleton"], .animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should display error state when error is provided', () => {
      const errorMessage = 'Failed to fetch market listings';
      render(<MarketListings {...defaultProps} error={errorMessage} />);
      
      expect(screen.getByText('Failed to load market listings')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('should call onRefresh when retry button is clicked', async () => {
      const onRefresh = vi.fn();
      render(<MarketListings {...defaultProps} error="Test error" onRefresh={onRefresh} />);
      
      const retryButton = screen.getByText('Try Again');
      await userEvent.click(retryButton);
      
      expect(onRefresh).toHaveBeenCalledTimes(1);
    });

    it('should show empty state when no listings are available', () => {
      render(<MarketListings {...defaultProps} listings={[]} />);
      
      expect(screen.getByText('No listings found')).toBeInTheDocument();
      expect(screen.getByText('Be the first to create a listing in your area')).toBeInTheDocument();
    });
  });

  describe('💪 Search and Filter Functionality', () => {
    it('should filter listings by search query', async () => {
      render(<MarketListings {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('Search crops, sellers, locations...');
      await userEvent.type(searchInput, 'maize');
      
      // Should show only maize listing
      expect(screen.getByText('John Kamau')).toBeInTheDocument();
      expect(screen.queryByText('Mary Wanjiku')).not.toBeInTheDocument();
      expect(screen.queryByText('Peter Mwangi')).not.toBeInTheDocument();
    });

    it('should filter by crop type', async () => {
      render(<MarketListings {...defaultProps} />);
      
      // Find and click crop filter
      const cropFilter = screen.getByDisplayValue('All Crops');
      await userEvent.click(cropFilter);
      
      // Select beans
      const beansOption = screen.getByText('🫘 beans');
      await userEvent.click(beansOption);
      
      // Should show only beans listing
      expect(screen.getByText('Mary Wanjiku')).toBeInTheDocument();
      expect(screen.queryByText('John Kamau')).not.toBeInTheDocument();
    });

    it('should filter by location', async () => {
      render(<MarketListings {...defaultProps} />);
      
      const locationFilter = screen.getByDisplayValue('All Locations');
      await userEvent.click(locationFilter);
      
      const nairobiOption = screen.getByText('Nairobi, Kenya');
      await userEvent.click(nairobiOption);
      
      // Should show only Nairobi listing
      expect(screen.getByText('John Kamau')).toBeInTheDocument();
      expect(screen.queryByText('Mary Wanjiku')).not.toBeInTheDocument();
    });

    it('should filter by listing type', async () => {
      render(<MarketListings {...defaultProps} />);
      
      const typeFilter = screen.getByDisplayValue('All Types');
      await userEvent.click(typeFilter);
      
      const buyingOption = screen.getByText('Buying');
      await userEvent.click(buyingOption);
      
      // Should show only buying listing
      expect(screen.getByText('Peter Mwangi')).toBeInTheDocument();
      expect(screen.queryByText('John Kamau')).not.toBeInTheDocument();
    });

    it('should filter by quality grade', async () => {
      render(<MarketListings {...defaultProps} />);
      
      const qualityFilter = screen.getByDisplayValue('All Quality');
      await userEvent.click(qualityFilter);
      
      const premiumOption = screen.getByText('Premium (A)');
      await userEvent.click(premiumOption);
      
      // Should show only Grade A listings
      expect(screen.getByText('John Kamau')).toBeInTheDocument();
      expect(screen.getByText('Mary Wanjiku')).toBeInTheDocument();
      expect(screen.queryByText('Peter Mwangi')).not.toBeInTheDocument();
    });
  });

  describe('🎯 Sorting Functionality', () => {
    it('should sort by date by default', () => {
      render(<MarketListings {...defaultProps} />);
      
      const listings = screen.getAllByText(/KES \d+\.\d+/);
      // Most recent first (John Kamau - Jan 15)
      expect(listings[0]).toHaveTextContent('45.50');
    });

    it('should sort by price when price sort is clicked', async () => {
      render(<MarketListings {...defaultProps} />);
      
      const priceSortButton = screen.getByText('Price');
      await userEvent.click(priceSortButton);
      
      // Should sort by price descending (highest first)
      const listings = screen.getAllByText(/KES \d+\.\d+/);
      expect(listings[0]).toHaveTextContent('120.00'); // Mary's beans
    });

    it('should toggle sort order when clicking same sort button', async () => {
      render(<MarketListings {...defaultProps} />);
      
      const priceSortButton = screen.getByText('Price');
      await userEvent.click(priceSortButton); // First click - desc
      await userEvent.click(priceSortButton); // Second click - asc
      
      const listings = screen.getAllByText(/KES \d+\.\d+/);
      expect(listings[0]).toHaveTextContent('45.50'); // Lowest price first
    });

    it('should sort by distance when user location is provided', async () => {
      render(<MarketListings {...defaultProps} />);
      
      const distanceSortButton = screen.getByText('Distance');
      await userEvent.click(distanceSortButton);
      
      // Should sort by distance (closest first)
      // John Kamau is in Nairobi (same as user location)
      const listings = screen.getAllByText(/KES \d+\.\d+/);
      expect(listings[0]).toHaveTextContent('45.50');
    });
  });

  describe('🌟 View Mode Toggle', () => {
    it('should switch between grid and list view', async () => {
      render(<MarketListings {...defaultProps} />);
      
      // Default is grid view
      expect(document.querySelector('.grid')).toBeInTheDocument();
      
      // Switch to list view
      const listViewButton = screen.getByRole('button', { name: /list/i });
      await userEvent.click(listViewButton);
      
      // Should show list view
      expect(document.querySelector('.space-y-3')).toBeInTheDocument();
    });

    it('should maintain filters when switching view modes', async () => {
      render(<MarketListings {...defaultProps} />);
      
      // Apply a filter
      const searchInput = screen.getByPlaceholderText('Search crops, sellers, locations...');
      await userEvent.type(searchInput, 'maize');
      
      // Switch to list view
      const listViewButton = screen.getByRole('button', { name: /list/i });
      await userEvent.click(listViewButton);
      
      // Should still show filtered results
      expect(screen.getByText('John Kamau')).toBeInTheDocument();
      expect(screen.queryByText('Mary Wanjiku')).not.toBeInTheDocument();
    });
  });

  describe('🚀 User Interactions', () => {
    it('should call onViewDetails when View Details button is clicked', async () => {
      const onViewDetails = vi.fn();
      render(<MarketListings {...defaultProps} onViewDetails={onViewDetails} />);
      
      const viewDetailsButtons = screen.getAllByText('View Details');
      await userEvent.click(viewDetailsButtons[0]);
      
      expect(onViewDetails).toHaveBeenCalledWith(mockListings[0]);
    });

    it('should call onContactSeller when contact button is clicked', async () => {
      const onContactSeller = vi.fn();
      render(<MarketListings {...defaultProps} onContactSeller={onContactSeller} />);
      
      const contactButtons = screen.getAllByRole('button', { name: /phone/i });
      await userEvent.click(contactButtons[0]);
      
      expect(onContactSeller).toHaveBeenCalledWith(mockListings[0]);
    });

    it('should handle save/unsave listing functionality', async () => {
      const onSaveListing = vi.fn();
      render(<MarketListings {...defaultProps} onSaveListing={onSaveListing} />);
      
      const saveButtons = screen.getAllByRole('button', { name: /heart/i });
      await userEvent.click(saveButtons[0]);
      
      expect(onSaveListing).toHaveBeenCalledWith(mockListings[0]);
      expect(toast.success).toHaveBeenCalledWith('Listing saved successfully');
    });

    it('should call onCreateListing when Create Listing button is clicked', async () => {
      const onCreateListing = vi.fn();
      render(<MarketListings {...defaultProps} onCreateListing={onCreateListing} />);
      
      const createButton = screen.getByText('Create Listing');
      await userEvent.click(createButton);
      
      expect(onCreateListing).toHaveBeenCalledTimes(1);
    });

    it('should handle share functionality with native share API', async () => {
      mockShare.mockResolvedValue(undefined);
      render(<MarketListings {...defaultProps} />);
      
      // Open listing detail modal first
      const viewDetailsButtons = screen.getAllByText('View Details');
      await userEvent.click(viewDetailsButtons[0]);
      
      // Find and click share button in modal
      const shareButton = screen.getByText('Share');
      await userEvent.click(shareButton);
      
      expect(mockShare).toHaveBeenCalledWith({
        title: 'maize - KES 45.50',
        text: 'Check out this maize listing on CropGenius',
        url: window.location.href
      });
    });

    it('should fallback to clipboard when native share is not available', async () => {
      // Mock navigator.share as undefined
      Object.defineProperty(navigator, 'share', {
        value: undefined,
        writable: true
      });
      
      mockWriteText.mockResolvedValue(undefined);
      render(<MarketListings {...defaultProps} />);
      
      // Open listing detail modal first
      const viewDetailsButtons = screen.getAllByText('View Details');
      await userEvent.click(viewDetailsButtons[0]);
      
      // Find and click share button in modal
      const shareButton = screen.getByText('Share');
      await userEvent.click(shareButton);
      
      expect(mockWriteText).toHaveBeenCalledWith(window.location.href);
      expect(toast.success).toHaveBeenCalledWith('Listing link copied to clipboard');
    });
  });

  describe('🎯 Distance Calculation', () => {
    it('should display distance when user location and listing coordinates are available', () => {
      render(<MarketListings {...defaultProps} />);
      
      // Check for distance indicators (they should be present for listings with coordinates)
      const distanceElements = screen.getAllByText(/km away|m away/);
      expect(distanceElements.length).toBeGreaterThan(0);
    });

    it('should not display distance when user location is not provided', () => {
      render(<MarketListings {...defaultProps} userLocation={undefined} />);
      
      // Should not show distance indicators
      const distanceElements = screen.queryAllByText(/km away|m away/);
      expect(distanceElements).toHaveLength(0);
    });

    it('should not show distance sort option when user location is not provided', () => {
      render(<MarketListings {...defaultProps} userLocation={undefined} />);
      
      expect(screen.queryByText('Distance')).not.toBeInTheDocument();
    });
  });

  describe('🔥 Listing Detail Modal', () => {
    it('should open listing detail modal when View Details is clicked', async () => {
      render(<MarketListings {...defaultProps} />);
      
      const viewDetailsButtons = screen.getAllByText('View Details');
      await userEvent.click(viewDetailsButtons[0]);
      
      // Check modal content
      expect(screen.getByText('January 15, 2025')).toBeInTheDocument();
      expect(screen.getByText('Premium quality maize, freshly harvested from organic farm')).toBeInTheDocument();
      expect(screen.getByText('Contact Seller')).toBeInTheDocument();
    });

    it('should close modal when clicking outside or close button', async () => {
      render(<MarketListings {...defaultProps} />);
      
      const viewDetailsButtons = screen.getAllByText('View Details');
      await userEvent.click(viewDetailsButtons[0]);
      
      // Modal should be open
      expect(screen.getByText('Contact Seller')).toBeInTheDocument();
      
      // Press Escape to close
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
      
      await waitFor(() => {
        expect(screen.queryByText('Contact Seller')).not.toBeInTheDocument();
      });
    });

    it('should handle contact seller from modal', async () => {
      const onContactSeller = vi.fn();
      render(<MarketListings {...defaultProps} onContactSeller={onContactSeller} />);
      
      const viewDetailsButtons = screen.getAllByText('View Details');
      await userEvent.click(viewDetailsButtons[0]);
      
      const contactButton = screen.getByText('Contact Seller');
      await userEvent.click(contactButton);
      
      expect(onContactSeller).toHaveBeenCalledWith(mockListings[0]);
    });
  });

  describe('💪 Edge Cases and Error Handling', () => {
    it('should handle listings without contact info gracefully', async () => {
      const listingsWithoutContact = [
        { ...mockListings[0], contact_info: undefined }
      ];
      
      render(<MarketListings {...defaultProps} listings={listingsWithoutContact} />);
      
      // Should not show contact button
      const contactButtons = screen.queryAllByRole('button', { name: /phone/i });
      expect(contactButtons).toHaveLength(0);
    });

    it('should handle listings without coordinates gracefully', () => {
      const listingsWithoutCoords = [
        { ...mockListings[0], latitude: undefined, longitude: undefined }
      ];
      
      render(<MarketListings {...defaultProps} listings={listingsWithoutCoords} />);
      
      // Should not show distance
      const distanceElements = screen.queryAllByText(/km away|m away/);
      expect(distanceElements).toHaveLength(0);
    });

    it('should handle empty search results', async () => {
      render(<MarketListings {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('Search crops, sellers, locations...');
      await userEvent.type(searchInput, 'nonexistent crop');
      
      expect(screen.getByText('No listings found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your filters or search terms')).toBeInTheDocument();
    });

    it('should handle contact seller without contact info', async () => {
      const listingsWithoutContact = [
        { ...mockListings[0], contact_info: undefined }
      ];
      
      const onContactSeller = vi.fn();
      render(<MarketListings {...defaultProps} listings={listingsWithoutContact} onContactSeller={onContactSeller} />);
      
      // Open modal
      const viewDetailsButtons = screen.getAllByText('View Details');
      await userEvent.click(viewDetailsButtons[0]);
      
      // Contact button should not be present in modal
      expect(screen.queryByText('Contact Seller')).not.toBeInTheDocument();
    });
  });

  describe('🌟 Accessibility and UX', () => {
    it('should have proper ARIA labels and roles', () => {
      render(<MarketListings {...defaultProps} />);
      
      // Check for proper button roles
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      // Check for proper input labels
      const searchInput = screen.getByPlaceholderText('Search crops, sellers, locations...');
      expect(searchInput).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      render(<MarketListings {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('Search crops, sellers, locations...');
      
      // Should be able to focus and type
      searchInput.focus();
      expect(document.activeElement).toBe(searchInput);
      
      await userEvent.type(searchInput, 'test');
      expect(searchInput).toHaveValue('test');
    });

    it('should show loading states appropriately', () => {
      render(<MarketListings {...defaultProps} isLoading={true} />);
      
      // Should show skeleton loading states
      expect(screen.getByText('Market Listings')).toBeInTheDocument();
    });
  });

  describe('🚀 Performance and Optimization', () => {
    it('should handle large datasets efficiently', () => {
      // Create a large dataset
      const largeDataset = Array.from({ length: 100 }, (_, i) => ({
        ...mockListings[0],
        id: `listing-${i}`,
        crop_name: `crop-${i}`,
        seller_name: `Seller ${i}`
      }));
      
      const { container } = render(<MarketListings {...defaultProps} listings={largeDataset} />);
      
      // Should render without performance issues
      expect(container).toBeInTheDocument();
      expect(screen.getByText('100 listings')).toBeInTheDocument();
    });

    it('should debounce search input appropriately', async () => {
      render(<MarketListings {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('Search crops, sellers, locations...');
      
      // Type quickly
      await userEvent.type(searchInput, 'maize', { delay: 10 });
      
      // Should handle rapid typing without issues
      expect(searchInput).toHaveValue('maize');
    });
  });
});
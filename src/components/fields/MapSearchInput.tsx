
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Loader2 } from 'lucide-react';
import { useErrorLogging } from '@/hooks/use-error-logging';

interface MapSearchInputProps {
  onSearch: (query: string) => void;
  onLocationSelect: (location: { lat: number; lng: number; name: string }) => void;
  isSearching: boolean;
  className?: string;
}

export default function MapSearchInput({ 
  onSearch, 
  onLocationSelect,
  isSearching,
  className 
}: MapSearchInputProps) {
  const { logError } = useErrorLogging('MapSearchInput');
  const [searchInput, setSearchInput] = useState<string>("");
  
  const handleSearch = () => {
    if (!searchInput.trim()) return;
    
    try {
      console.log("🔍 [MapSearchInput] Searching for:", searchInput);
      onSearch(searchInput.trim());
    } catch (error: any) {
      logError(error, { context: 'handleSearch' });
    }
  };

  const handleClear = () => {
    setSearchInput("");
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div className="relative flex-1">
        <Search 
          className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" 
        />
        <Input
          type="text"
          placeholder="Search for a village, city, or landmark..."
          className="pl-8 pr-8 h-10"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleInputKeyDown}
          disabled={isSearching}
        />
        {searchInput && (
          <button 
            className="absolute right-2 top-2.5"
            onClick={handleClear}
            type="button"
          >
            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>
      <Button
        type="button"
        variant="secondary"
        className="ml-2 h-10"
        onClick={handleSearch}
        disabled={isSearching || !searchInput.trim()}
      >
        {isSearching ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <span>Search</span>
        )}
      </Button>
    </div>
  );
}

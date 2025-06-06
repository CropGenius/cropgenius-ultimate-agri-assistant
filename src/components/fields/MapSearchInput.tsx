import { useState, useRef, useEffect, FormEvent } from 'react';
import { Search, Loader2, MapPin, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useErrorLogging } from '@/hooks/use-error-logging';

interface MapSearchInputProps {
  onSearch: (query: string) => void;
  onLocationSelect?: (location: {
    lat: number;
    lng: number;
    name: string;
  }) => void;
  isSearching?: boolean;
  className?: string;
  placeholder?: string;
  recentSearches?: Array<{ name: string; lat: number; lng: number }>;
}

export default function MapSearchInput({
  onSearch,
  onLocationSelect,
  isSearching = false,
  className = '',
  placeholder = 'Search for your location or village',
  recentSearches = [],
}: MapSearchInputProps) {
  const { logError } = useErrorLogging('MapSearchInput');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRecent, setShowRecent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowRecent(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());
    }
  };

  const handleRecentSelect = (recent: {
    name: string;
    lat: number;
    lng: number;
  }) => {
    if (onLocationSelect) {
      onLocationSelect(recent);
    }
    setSearchTerm(recent.name);
    setShowRecent(false);
  };

  const handleClear = () => {
    setSearchTerm('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative flex items-center">
        <Input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (e.target.value.length > 0) {
              setShowRecent(true);
            } else {
              setShowRecent(false);
            }
          }}
          onFocus={() => recentSearches.length > 0 && setShowRecent(true)}
          placeholder={placeholder}
          className="pr-16 pl-10"
          disabled={isSearching}
        />
        <MapPin className="absolute left-3 h-4 w-4 text-muted-foreground" />

        {searchTerm && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-8 h-7 w-7 p-0"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear</span>
          </Button>
        )}

        <Button
          type="submit"
          size="sm"
          variant="ghost"
          className="absolute right-0 h-full px-3 text-muted-foreground hover:text-foreground"
          disabled={isSearching || !searchTerm.trim()}
        >
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          <span className="sr-only">Search</span>
        </Button>
      </div>

      {showRecent && recentSearches.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-10 mt-1 w-full bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          <div className="p-1 text-xs text-muted-foreground">
            Recent searches
          </div>
          {recentSearches.map((recent, index) => (
            <div
              key={index}
              className="p-2 hover:bg-accent cursor-pointer flex items-center gap-2 text-sm"
              onClick={() => handleRecentSelect(recent)}
            >
              <MapPin className="h-3 w-3 text-muted-foreground" />
              {recent.name}
            </div>
          ))}
        </div>
      )}
    </form>
  );
}

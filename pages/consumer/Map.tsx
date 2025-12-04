import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { CountryGlobe, LocationData, MarkerData } from '../../components/CountryGlobe';
import { Card, Button } from '../../components/UI';
import { MapPin, Layers, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Vendor, SurpriseBag } from '../../types';

// Singapore configuration
const SINGAPORE_CONFIG = {
  center: [103.8198, 1.3521] as [number, number], // Singapore center
  zoom: 11,
  maxBounds: [
    [103.6, 1.22], // Southwest
    [104.1, 1.48]  // Northeast
  ] as [[number, number], [number, number]],
};

const THEMES = [
  { value: 'satellite-streets-v12', label: 'Satellite Streets' },
  { value: 'satellite-v9', label: 'Satellite' },
  { value: 'streets-v12', label: 'Streets' },
  { value: 'outdoors-v12', label: 'Outdoors' },
  { value: 'light-v11', label: 'Light' },
  { value: 'dark-v11', label: 'Dark' },
];

const Map: React.FC = () => {
  const [selectedTheme, setSelectedTheme] = useState('satellite-streets-v12');
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  // Fetch vendors and bags
  const { data: vendors = [] } = useQuery({
    queryKey: ['vendors'],
    queryFn: api.getVendors,
  });

  const { data: bags = [] } = useQuery({
    queryKey: ['bags'],
    queryFn: api.getBags,
  });

  // Create markers from vendors with active bags
  const markers: MarkerData[] = useMemo(() => {
    return vendors
      .filter((vendor: Vendor) => 
        bags.some((bag: SurpriseBag) => 
          bag.vendorId === vendor.id && bag.status === 'active'
        )
      )
      .map((vendor: Vendor) => {
        const vendorBags = bags.filter(
          (bag: SurpriseBag) => bag.vendorId === vendor.id && bag.status === 'active'
        );
        const bagCount = vendorBags.length;
        const minPrice = Math.min(...vendorBags.map(b => b.price));

        return {
          id: vendor.id,
          lng: vendor.lng,
          lat: vendor.lat,
          title: `${vendor.name} - ${bagCount} bag${bagCount > 1 ? 's' : ''} from $${minPrice.toFixed(2)}`,
          color: '#dc2626', // Red theme color
        };
      });
  }, [vendors, bags]);

  const handleLocationClick = (location: LocationData) => {
    setSelectedLocation(location);
    toast.success(`Clicked: ${location.name}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Explore on Globe</h1>
          <p className="text-gray-600 mt-1">Click anywhere on the globe to see location details</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowThemeSelector(!showThemeSelector)}
            className="flex items-center gap-2"
          >
            <Layers size={18} />
            Theme
          </Button>
        </div>
      </div>

      {/* Theme Selector */}
      {showThemeSelector && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Map Theme</h3>
            <button
              onClick={() => setShowThemeSelector(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {THEMES.map((theme) => (
              <button
                key={theme.value}
                onClick={() => {
                  setSelectedTheme(theme.value);
                  setShowThemeSelector(false);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedTheme === theme.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {theme.label}
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Globe Container */}
      <Card className="p-0 overflow-hidden">
        <div className="h-[600px] md:h-[700px]">
          <CountryGlobe
            countryCenter={SINGAPORE_CONFIG.center}
            countryZoom={SINGAPORE_CONFIG.zoom}
            maxBounds={SINGAPORE_CONFIG.maxBounds}
            theme={selectedTheme}
            onLocationClick={handleLocationClick}
            markers={markers}
          />
        </div>
      </Card>

      {/* Selected Location Info */}
      {selectedLocation && (
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <div className="bg-primary-100 p-2 rounded-lg">
              <MapPin className="text-primary-600" size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Selected Location</h3>
              <p className="text-gray-600 mt-1">{selectedLocation.name}</p>
              <p className="text-sm text-gray-500 mt-1">
                Coordinates: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
              </p>
            </div>
            <button
              onClick={() => setSelectedLocation(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          </div>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600">Active Vendors</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{markers.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Available Bags</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {bags.filter((b: SurpriseBag) => b.status === 'active').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Total Vendors</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{vendors.length}</div>
        </Card>
      </div>
    </div>
  );
};

export default Map;


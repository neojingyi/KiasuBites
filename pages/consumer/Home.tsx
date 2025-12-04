import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Card, Badge, Button, Input } from '../../components/UI';
import { MapPin, Clock, Filter, Star, Search, Map as MapIcon, List, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SurpriseBag, Vendor } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const SINGAPORE_BOUNDS = { minLat: 1.22, maxLat: 1.48, minLng: 103.6, maxLng: 104.1 };

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const projectToSingapore = (lat: number, lng: number) => {
  const x = ((lng - SINGAPORE_BOUNDS.minLng) / (SINGAPORE_BOUNDS.maxLng - SINGAPORE_BOUNDS.minLng)) * 100;
  const y = (1 - ((lat - SINGAPORE_BOUNDS.minLat) / (SINGAPORE_BOUNDS.maxLat - SINGAPORE_BOUNDS.minLat))) * 100;
  return { x: clamp(x, 4, 96), y: clamp(y, 4, 96) };
};

type MapPoint = {
  bag: SurpriseBag;
  vendor: Vendor;
  position: { x: number; y: number };
};

const SingaporeMapView: React.FC<{ bags: SurpriseBag[]; vendors: Vendor[] }> = ({ bags, vendors }) => {
  const points: MapPoint[] = bags
    .map((bag) => {
      const vendor = vendors.find((v) => v.id === bag.vendorId);
      if (!vendor) return null;
      return { bag, vendor, position: projectToSingapore(vendor.lat, vendor.lng) };
    })
    .filter(Boolean) as MapPoint[];

  if (!vendors.length) {
    return (
      <div className="bg-gray-50 rounded-xl h-[600px] border border-gray-200 flex items-center justify-center text-gray-500">
        Loading Singapore map...
      </div>
    );
  }

  if (!points.length) {
    return (
      <div className="bg-gray-50 rounded-xl h-[600px] border border-gray-200 flex items-center justify-center text-gray-500">
        No bags match the filters on the map.
      </div>
    );
  }

  return (
    <div className="relative bg-gradient-to-br from-sky-50 via-white to-emerald-50 rounded-2xl border border-gray-200 shadow-inner h-[600px] overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute -left-16 top-8 h-64 w-64 rounded-full bg-emerald-200/50 blur-3xl" />
        <div className="absolute right-2 -bottom-10 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute inset-4 rounded-[28px] border border-white/60 bg-white/40 backdrop-blur-sm shadow-inner shadow-emerald-900/5" />
        <div
          className="absolute inset-8 rounded-[28px] border border-emerald-100/60 shadow-lg shadow-emerald-900/5"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, rgba(16,185,129,0.12), transparent 40%), radial-gradient(circle at 70% 60%, rgba(59,130,246,0.12), transparent 38%), radial-gradient(circle at 45% 80%, rgba(16,185,129,0.08), transparent 42%)',
          }}
        />
      </div>

      <div className="absolute left-6 top-6 z-10 bg-white/85 backdrop-blur-sm px-4 py-2 rounded-full text-xs font-semibold text-emerald-900 border border-emerald-100 shadow-sm">
        Singapore
      </div>
      <div className="absolute right-6 top-6 z-10 flex items-center gap-2 bg-white/85 backdrop-blur-sm px-4 py-2 rounded-full text-[11px] text-slate-700 border border-slate-100 shadow-sm">
        <MapPin className="h-3.5 w-3.5 text-emerald-600" />
        <span>Central & East clusters</span>
      </div>

      {points.map((point) => (
        <Link
          key={`${point.vendor.id}-${point.bag.id}`}
          to={`/consumer/bags/${point.bag.id}`}
          className="group absolute z-10"
          style={{ left: `${point.position.x}%`, top: `${point.position.y}%`, transform: 'translate(-50%, -50%)' }}
        >
          <div className="relative">
            <div className="absolute -inset-4 rounded-full bg-emerald-500/10 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute -left-1 -top-1 h-3 w-3 rounded-full bg-emerald-600 ring-4 ring-white shadow-md shadow-emerald-900/20" />
            <div className="flex items-center gap-3 bg-white/95 backdrop-blur-sm border border-emerald-100 rounded-2xl px-3 py-2 shadow-lg shadow-emerald-900/10 min-w-[200px] max-w-[260px]">
              <div className="h-11 w-11 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-900/30">
                <ShoppingBag size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-500 truncate">{point.vendor.address}</p>
                <p className="text-sm font-semibold text-emerald-900 truncate">{point.bag.title}</p>
                <p className="text-[11px] text-slate-600 font-semibold truncate">
                  ${point.bag.price.toFixed(2)} · {point.vendor.name}
                </p>
              </div>
            </div>
          </div>
        </Link>
      ))}

      <div className="absolute left-6 bottom-6 z-10 bg-white/85 backdrop-blur-sm rounded-xl px-4 py-3 border border-slate-100 shadow-lg text-xs text-slate-600 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
          <span>Active bags around Singapore</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-sky-500" />
          <span>Closer to downtown core</span>
        </div>
      </div>
    </div>
  );
};

const ConsumerHome: React.FC = () => {
  const { user } = useAuth();
  const { data: bags, isLoading } = useQuery({
    queryKey: ['bags'],
    queryFn: api.getBags
  });
  const { data: vendors, isLoading: vendorsLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: api.getVendors
  });

  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    categories: [] as string[],
    dietary: [] as string[],
    time: 'all' as 'all' | 'now' | 'today' | 'tomorrow'
  });
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Filtering Logic
  const filteredBags = bags?.filter(bag => {
    const matchesSearch = bag.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          bag.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filters.categories.length === 0 || 
                            (bag.category && filters.categories.includes(bag.category));
    
    const matchesDietary = filters.dietary.length === 0 || 
                           bag.dietaryTags.some(tag => filters.dietary.includes(tag));
    
    // Simple time logic (mock)
    let matchesTime = true;
    if (filters.time === 'now') {
       // Mock check: pickupStart is soon?
    }

    return matchesSearch && matchesCategory && matchesDietary && matchesTime;
  });

  const toggleFilter = (type: 'categories' | 'dietary', value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value) 
        ? prev[type].filter(i => i !== value)
        : [...prev[type], value]
    }));
  };

  const isFavorite = (vendorId: string) => user?.favorites?.includes(vendorId);

  if (isLoading || vendorsLoading) return <div className="text-center py-10">Finding delicious deals...</div>;

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative flex-grow max-w-lg">
             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
             <input 
               className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
               placeholder="Search for bags, vendors, or areas..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${showFilterPanel ? 'bg-primary-50 border-primary-500 text-primary-700' : 'border-gray-300 bg-white hover:bg-gray-50'}`}
            >
              <Filter size={18} /> Filters
            </button>
            <div className="border border-gray-300 rounded-lg flex overflow-hidden">
               <button 
                 onClick={() => setViewMode('list')}
                 className={`px-4 py-2 flex items-center gap-2 ${viewMode === 'list' ? 'bg-gray-100 font-medium' : 'bg-white hover:bg-gray-50'}`}
               >
                 <List size={18} /> List
               </button>
               <button 
                 onClick={() => setViewMode('map')}
                 className={`px-4 py-2 flex items-center gap-2 ${viewMode === 'map' ? 'bg-gray-100 font-medium' : 'bg-white hover:bg-gray-50'}`}
               >
                 <MapIcon size={18} /> Map
               </button>
            </div>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilterPanel && (
          <div className="pt-4 border-t border-gray-100 grid md:grid-cols-3 gap-6 animate-in slide-in-from-top-2">
            <div>
               <h4 className="font-medium mb-2 text-sm text-gray-700">Category</h4>
               <div className="flex flex-wrap gap-2">
                 {['Meals', 'Bread & Pastries', 'Groceries', 'Dessert'].map(c => (
                   <button 
                     key={c}
                     onClick={() => toggleFilter('categories', c)}
                     className={`text-xs px-3 py-1 rounded-full border ${filters.categories.includes(c) ? 'bg-primary-600 text-white border-primary-600' : 'bg-white border-gray-300 text-gray-600'}`}
                   >
                     {c}
                   </button>
                 ))}
               </div>
            </div>
            <div>
               <h4 className="font-medium mb-2 text-sm text-gray-700">Dietary</h4>
               <div className="flex flex-wrap gap-2">
                 {['Vegetarian', 'Vegan', 'Halal-Friendly', 'Gluten-Free'].map(d => (
                   <button 
                     key={d}
                     onClick={() => toggleFilter('dietary', d)}
                     className={`text-xs px-3 py-1 rounded-full border ${filters.dietary.includes(d) ? 'bg-primary-600 text-white border-primary-600' : 'bg-white border-gray-300 text-gray-600'}`}
                   >
                     {d}
                   </button>
                 ))}
               </div>
            </div>
            <div>
               <h4 className="font-medium mb-2 text-sm text-gray-700">Collection Time</h4>
               <select 
                 value={filters.time}
                 onChange={(e: any) => setFilters({...filters, time: e.target.value})}
                 className="w-full text-sm border-gray-300 rounded-md"
               >
                 <option value="all">Any time</option>
                 <option value="today">Collect Today</option>
                 <option value="tomorrow">Collect Tomorrow</option>
               </select>
            </div>
          </div>
        )}
      </div>

      {/* Content Area */}
      {viewMode === 'list' ? (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          layout
        >
          <AnimatePresence mode="popLayout">
            {filteredBags?.map((bag: SurpriseBag, index: number) => {
              const vendor = vendors?.find((v: Vendor) => v.id === bag.vendorId);
              const savings = ((bag.originalPrice - bag.price) / bag.originalPrice * 100).toFixed(0);
              return (
                <motion.div
                  key={bag.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  transition={{ 
                    duration: 0.3,
                    delay: index * 0.05,
                    layout: { duration: 0.3 }
                  }}
                >
                  <Link to={`/consumer/bags/${bag.id}`}>
                    <Card className="h-full flex flex-col overflow-hidden" hover>
                      <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                        <motion.img 
                          src={vendor?.photoUrl || `https://picsum.photos/seed/${bag.vendorId}/500/300`} 
                          alt={bag.title} 
                          className="w-full h-full object-cover"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.4 }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        <div className="absolute top-4 left-4 flex gap-2">
                          {bag.quantity < 3 && (
                            <Badge variant="warning">Only {bag.quantity} left</Badge>
                          )}
                        </div>
                        <div className="absolute top-4 right-4">
                          <Badge variant="success">{savings}% off</Badge>
                        </div>
                      </div>
                      <div className="p-5 flex flex-col flex-grow">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-lg text-gray-900 line-clamp-1 mb-1">{bag.vendorName}</h3>
                            <p className="text-sm text-gray-500 font-medium">{bag.vendorCategory}</p>
                          </div>
                          <div className="flex items-center bg-gradient-to-br from-green-50 to-green-100 px-2.5 py-1 rounded-lg text-xs font-bold text-green-700 border border-green-200 ml-2">
                            4.8 <Star size={10} className="ml-1 fill-current" />
                          </div>
                        </div>
                        
                        <h4 className="font-semibold text-gray-800 mb-3 text-base line-clamp-2">{bag.title}</h4>
                        
                        <div className="flex items-center gap-2 mb-4 text-xs text-gray-500">
                          <Clock size={14} className="text-gray-400" />
                          <span className="font-medium">Pickup {bag.pickupStart} - {bag.pickupEnd}</span>
                        </div>

                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                          <div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-bold text-primary-700">${bag.price.toFixed(2)}</span>
                              <span className="text-sm text-gray-400 line-through">${bag.originalPrice.toFixed(2)}</span>
                            </div>
                            <p className="text-xs text-green-600 font-semibold mt-1">Save ${(bag.originalPrice - bag.price).toFixed(2)}</p>
                          </div>
                          <Button size="sm" variant="secondary">View</Button>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredBags?.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="col-span-full text-center py-20"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <ShoppingBag className="text-gray-400" size={32} />
              </div>
              <p className="text-lg font-semibold text-gray-900 mb-2">No bags found</p>
              <p className="text-gray-500">Try adjusting your filters to see more options.</p>
            </motion.div>
          )}
        </motion.div>
      ) : (
        <SingaporeMapView bags={filteredBags || []} vendors={vendors || []} />
      )}
    </div>
  );
};

export default ConsumerHome;

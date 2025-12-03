import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card, Button, Badge } from '../../components/UI';
import { Link } from 'react-router-dom';
import { Heart, Star, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const ConsumerFavorites: React.FC = () => {
  const { user } = useAuth();
  
  const { data: favorites, isLoading, refetch } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: () => api.getFavoriteVendors(user!.id),
    enabled: !!user
  });

  const handleUnfavorite = async (vendorId: string) => {
    try {
      await api.toggleFavorite(vendorId);
      refetch();
      toast.success('Removed from favorites');
    } catch (e) {
      toast.error('Failed to update');
    }
  };

  if (isLoading) return <div>Loading favorites...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Your Favorite Places</h1>
      
      {favorites?.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
           <Heart size={48} className="mx-auto text-gray-300 mb-4" />
           <h3 className="text-lg font-medium text-gray-900">No favorites yet</h3>
           <p className="text-gray-500 mb-6">Heart places you love to quickly find their surplus bags.</p>
           <Link to="/consumer/home">
             <Button>Explore Nearby</Button>
           </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
           {favorites?.map(({ vendor, bags }) => (
             <Card key={vendor.id} className="p-0 overflow-hidden">
                <div className="p-4 bg-white border-b border-gray-100 flex justify-between items-start">
                   <div className="flex gap-4">
                      <img src={vendor.photoUrl} alt={vendor.name} className="w-16 h-16 rounded-lg object-cover bg-gray-200" />
                      <div>
                         <h3 className="font-bold text-lg">{vendor.name}</h3>
                         <div className="flex items-center text-sm text-gray-500 mb-1">
                            <span className="bg-green-50 text-green-700 px-1.5 rounded font-bold text-xs flex items-center mr-2">
                               {vendor.rating} <Star size={10} className="ml-0.5 fill-current" />
                            </span>
                            <span>{vendor.category}</span>
                         </div>
                         <div className="flex items-center text-xs text-gray-400">
                            <MapPin size={12} className="mr-1" /> {vendor.address}
                         </div>
                      </div>
                   </div>
                   <button onClick={() => handleUnfavorite(vendor.id)} className="text-red-500 hover:text-red-600 p-1">
                      <Heart size={20} fill="currentColor" />
                   </button>
                </div>
                
                <div className="p-4 bg-gray-50 space-y-3">
                   {bags.length > 0 ? (
                      bags.map(bag => (
                        <div key={bag.id} className="bg-white p-3 rounded border border-gray-200 flex justify-between items-center shadow-sm">
                           <div>
                              <p className="font-medium text-sm">{bag.title}</p>
                              <p className="text-xs text-gray-500">Pickup {bag.pickupStart}-{bag.pickupEnd}</p>
                           </div>
                           <div className="flex items-center gap-3">
                              <span className="font-bold text-primary-700">${bag.price.toFixed(2)}</span>
                              <Link to={`/consumer/bags/${bag.id}`}>
                                <Button size="sm" variant="outline" className="h-8 text-xs">View</Button>
                              </Link>
                           </div>
                        </div>
                      ))
                   ) : (
                      <p className="text-sm text-gray-500 italic text-center py-2">No active bags today.</p>
                   )}
                </div>
             </Card>
           ))}
        </div>
      )}
    </div>
  );
};

export default ConsumerFavorites;

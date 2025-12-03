import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Button, Card, Badge, Modal } from '../../components/UI';
import { Clock, MapPin, ShieldCheck, ChevronLeft, Heart } from 'lucide-react';
import toast from 'react-hot-toast';

const BagDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const { data: bag, isLoading } = useQuery({
    queryKey: ['bag', id],
    queryFn: () => api.getBagById(id!),
    enabled: !!id
  });

  const reserveMutation = useMutation({
    mutationFn: () => api.createOrder(bag!.id, quantity, user!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bags'] });
      setIsConfirmOpen(false);
      toast.success('Bag reserved successfully!');
      navigate('/consumer/orders');
    },
    onError: () => {
      toast.error('Failed to reserve bag. It might be sold out.');
    }
  });

  const isFavorite = user?.favorites?.includes(bag?.vendorId || '');
  
  const toggleFavMutation = useMutation({
    mutationFn: () => api.toggleFavorite(bag!.vendorId),
    onSuccess: () => {
       // In a real app we'd invalidate user query, here we rely on page reload or optimistic UI for simplicity in mock
       toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
       // Reload user context would be needed here normally
    }
  });

  if (isLoading) return <div>Loading...</div>;
  if (!bag) return <div>Bag not found</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-gray-900 mb-4">
        <ChevronLeft size={20} /> Back to Browse
      </button>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div className="h-64 bg-gray-200 relative">
          <img 
            src={`https://picsum.photos/seed/${bag.vendorId}/800/400`} 
            alt={bag.title} 
            className="w-full h-full object-cover"
          />
           <div className="absolute bottom-4 left-4 bg-white px-3 py-1 rounded-full text-sm font-bold shadow-sm">
             {bag.vendorCategory}
           </div>
           <button 
             onClick={() => toggleFavMutation.mutate()}
             className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md hover:scale-110 transition-transform"
           >
             <Heart className={isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"} size={24} />
           </button>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{bag.title}</h1>
              <p className="text-lg text-gray-600 font-medium">{bag.vendorName}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary-600">${bag.price.toFixed(2)}</div>
              <div className="text-gray-400 line-through text-sm">Value ${bag.originalPrice.toFixed(2)}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {bag.dietaryTags.map(tag => (
              <Badge key={tag} variant="success">{tag}</Badge>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
             <div className="flex items-start gap-3">
               <Clock className="text-gray-400 mt-1" />
               <div>
                 <p className="font-semibold text-gray-900">Pickup Today</p>
                 <p className="text-gray-600">{bag.pickupStart} - {bag.pickupEnd}</p>
               </div>
             </div>
             <div className="flex items-start gap-3">
               <MapPin className="text-gray-400 mt-1" />
               <div>
                 <p className="font-semibold text-gray-900">Location</p>
                 <p className="text-gray-600">123 Mockingbird Lane, Singapore</p>
               </div>
             </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-gray-900">What's inside?</h3>
            <p className="text-gray-600 leading-relaxed">{bag.description}</p>
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-blue-50 p-3 rounded-lg text-blue-700">
              <ShieldCheck size={16} />
              <span>Contents depend on today's surplus. It's a surprise!</span>
            </div>
          </div>
          
          <div className="pt-6 border-t border-gray-100 flex flex-col md:flex-row items-center gap-4 justify-between">
            <div className="flex items-center gap-4">
              <span className="font-medium text-gray-700">Quantity:</span>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button 
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >-</button>
                <span className="px-3 font-medium">{quantity}</span>
                <button 
                   className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                   onClick={() => setQuantity(Math.min(bag.quantity, quantity + 1))}
                   disabled={quantity >= bag.quantity}
                >+</button>
              </div>
            </div>
            
            <Button 
              size="lg" 
              className="w-full md:w-auto px-10"
              onClick={() => setIsConfirmOpen(true)}
              disabled={bag.quantity === 0}
            >
              {bag.quantity === 0 ? 'Sold Out' : `Reserve for $${(bag.price * quantity).toFixed(2)}`}
            </Button>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={isConfirmOpen} 
        onClose={() => setIsConfirmOpen(false)}
        title="Confirm Reservation"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            You are reserving <strong>{quantity}x {bag.title}</strong> from <strong>{bag.vendorName}</strong>.
          </p>
          <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-700">
            <p className="flex justify-between"><span>Total Price:</span> <span className="font-bold">${(bag.price * quantity).toFixed(2)}</span></p>
            <p className="flex justify-between mt-1"><span>Pickup:</span> <span>{bag.pickupStart} - {bag.pickupEnd}</span></p>
          </div>
          <p className="text-xs text-gray-500">
            Payment will be collected at the store. Please show your confirmation code upon arrival.
          </p>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)} className="flex-1">Cancel</Button>
            <Button 
              onClick={() => reserveMutation.mutate()} 
              isLoading={reserveMutation.isPending} 
              className="flex-1"
            >
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BagDetails;

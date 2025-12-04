import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Button, Card, Badge, Modal } from '../../components/UI';
import { Clock, MapPin, ShieldCheck, ChevronLeft, Heart, TrendingDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

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

  const { data: vendor } = useQuery({
    queryKey: ['vendor', bag?.vendorId],
    queryFn: () => api.getVendorById(bag!.vendorId),
    enabled: !!bag?.vendorId
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

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bag details...</p>
        </div>
      </div>
    );
  }
  if (!bag) return <div className="max-w-3xl mx-auto text-center py-20">Bag not found</div>;

  const savings = bag.originalPrice - bag.price;
  const savingsPercent = ((savings / bag.originalPrice) * 100).toFixed(0);

  return (
    <motion.div 
      className="max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6 font-medium group"
        whileHover={{ x: -4 }}
        whileTap={{ scale: 0.95 }}
      >
        <ChevronLeft size={20} className="mr-1 group-hover:-translate-x-1 transition-transform" /> 
        Back to Browse
      </motion.button>

      <Card className="overflow-hidden">
        <div className="h-80 md:h-96 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
          <motion.img 
            src={vendor?.photoUrl || `https://picsum.photos/seed/${bag.vendorId}/800/400`} 
            alt={bag.title} 
            className="w-full h-full object-cover"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
          <div className="absolute bottom-6 left-6">
            <Badge variant="neutral" size="md">{bag.vendorCategory}</Badge>
          </div>
          <motion.button 
            onClick={() => toggleFavMutation.mutate()}
            className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-colors"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
          >
            <Heart className={isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"} size={24} />
          </motion.button>
        </div>

        <div className="p-6 md:p-10 space-y-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 tracking-tight">{bag.title}</h1>
              <p className="text-xl text-gray-600 font-semibold">{bag.vendorName}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl md:text-5xl font-bold text-primary-700">${bag.price.toFixed(2)}</span>
                <span className="text-xl text-gray-400 line-through">${bag.originalPrice.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2 bg-gradient-to-br from-green-50 to-green-100 px-4 py-2 rounded-xl border border-green-200">
                <TrendingDown className="text-green-700" size={18} />
                <span className="text-green-800 font-bold">Save ${savings.toFixed(2)} ({savingsPercent}% off)</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {bag.dietaryTags.map(tag => (
              <Badge key={tag} variant="success">{tag}</Badge>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <motion.div 
              className="bg-gradient-to-br from-primary-50 to-primary-100 p-5 rounded-2xl border border-primary-200"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center flex-shrink-0">
                  <Clock className="text-white" size={24} />
                </div>
                <div>
                  <p className="font-bold text-gray-900 mb-1">Pickup Window</p>
                  <p className="text-lg text-gray-700 font-semibold">{bag.pickupStart} - {bag.pickupEnd}</p>
                  <p className="text-sm text-gray-500 mt-1">Today</p>
                </div>
              </div>
            </motion.div>
            <motion.div 
              className="bg-gradient-to-br from-accent-50 to-accent-100 p-5 rounded-2xl border border-accent-200"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent-600 flex items-center justify-center flex-shrink-0">
                  <MapPin className="text-white" size={24} />
                </div>
                <div>
                  <p className="font-bold text-gray-900 mb-1">Location</p>
                  <p className="text-lg text-gray-700 font-semibold">{vendor?.address || '123 Mockingbird Lane'}</p>
                  <p className="text-sm text-gray-500 mt-1">Singapore</p>
                </div>
              </div>
            </motion.div>
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
      </Card>

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
    </motion.div>
  );
};

export default BagDetails;

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card, Badge, Modal, Button } from '../../components/UI';
import { QrCode, Clock, MapPin, Star, DollarSign } from 'lucide-react';
import { Order } from '../../types';
import toast from 'react-hot-toast';

const ConsumerOrders: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: () => api.getConsumerOrders(user!.id),
    enabled: !!user
  });

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [ratingModalOrder, setRatingModalOrder] = useState<Order | null>(null);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');

  const rateMutation = useMutation({
    mutationFn: (data: {id: string, rating: number, review: string}) => api.rateOrder(data.id, data.rating, data.review),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setRatingModalOrder(null);
      toast.success('Review submitted!');
    }
  });

  if (isLoading) return <div>Loading orders...</div>;

  const activeOrders = orders?.filter(o => o.status === 'reserved');
  const pastOrders = orders?.filter(o => o.status !== 'reserved');
  
  const totalSaved = orders?.filter(o => o.status === 'picked_up').reduce((acc, curr) => acc + (curr.estimatedValue - curr.totalPrice), 0) || 0;
  // Kopi equivalent: Assume $1.50 per kopi
  const kopiCount = Math.floor(totalSaved / 1.5);

  return (
    <div className="space-y-8">
      {/* Money Saved Indicator */}
      {totalSaved > 0 && (
         <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-2xl border border-green-100 flex items-center justify-between shadow-sm">
            <div>
               <h2 className="text-xl font-bold text-green-800">You've saved ${totalSaved.toFixed(2)} so far!</h2>
               <p className="text-green-700 mt-1">That's like getting <strong>{kopiCount} free Kopi Pengs</strong> ☕️</p>
            </div>
            <div className="hidden md:flex h-12 w-12 bg-white rounded-full items-center justify-center text-green-600 shadow-sm">
               <DollarSign />
            </div>
         </div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Active Orders</h2>
        <div className="grid gap-4">
          {activeOrders?.length === 0 ? (
            <div className="text-gray-500 py-4">No active orders. Go rescue some food!</div>
          ) : (
            activeOrders?.map(order => (
              <Card key={order.id} className="p-5 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                     <h3 className="font-bold text-lg">{order.vendorName}</h3>
                     <Badge variant="success">Active</Badge>
                  </div>
                  <p className="text-gray-600 font-medium">{order.bagTitle} (x{order.quantity})</p>
                  <div className="flex gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Clock size={14}/> {order.pickupStart} - {order.pickupEnd}</span>
                    <span className="font-semibold text-primary-600">${order.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
                <Button onClick={() => setSelectedOrder(order)}>View Ticket</Button>
              </Card>
            ))
          )}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Past Orders</h2>
        <div className="grid gap-4">
          {pastOrders?.map(order => (
            <Card key={order.id} className="p-5">
               <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div className="opacity-75">
                     <h3 className="font-bold text-gray-800">{order.vendorName}</h3>
                     <p className="text-gray-600 text-sm">{order.bagTitle} (x{order.quantity})</p>
                     <p className="text-xs text-gray-400 mt-1">
                       {order.status === 'picked_up' ? 'Picked up' : 'Cancelled/No-show'} • {new Date(order.createdAt).toLocaleDateString()}
                     </p>
                  </div>
                  <div className="flex items-center gap-3">
                     <Badge variant={order.status === 'picked_up' ? 'neutral' : 'error'}>
                        {order.status === 'picked_up' ? 'Completed' : order.status}
                     </Badge>
                     {order.status === 'picked_up' && (
                       order.rating ? (
                         <div className="flex items-center text-yellow-500 text-sm font-bold">
                           <Star size={16} fill="currentColor" className="mr-1"/> {order.rating}
                         </div>
                       ) : (
                         <Button size="sm" variant="outline" onClick={() => {
                            setRating(5);
                            setReview('');
                            setRatingModalOrder(order);
                         }}>
                           Rate Order
                         </Button>
                       )
                     )}
                  </div>
               </div>
               {/* Show Review if exists */}
               {order.review && (
                 <div className="mt-3 bg-gray-50 p-3 rounded text-sm text-gray-600 italic">
                   "{order.review}"
                 </div>
               )}
            </Card>
          ))}
        </div>
      </div>

      {/* Ticket Modal */}
      <Modal 
        isOpen={!!selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
        title="Pickup Ticket"
      >
        {selectedOrder && (
          <div className="text-center space-y-6 pb-2">
            <div className="bg-gray-100 p-6 rounded-xl inline-block mx-auto">
               <QrCode size={120} className="text-gray-800" />
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wide">Confirmation Code</p>
              <p className="text-3xl font-mono font-bold text-gray-900 tracking-wider">{selectedOrder.confirmationCode}</p>
            </div>
            <div className="text-left bg-green-50 p-4 rounded-lg border border-green-100">
              <h4 className="font-bold text-green-800 flex items-center gap-2"><MapPin size={16}/> Pickup Instructions</h4>
              <p className="text-green-700 text-sm mt-1">Please show this code to the staff at the counter to collect your surprise bag.</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Rating Modal */}
      <Modal
        isOpen={!!ratingModalOrder}
        onClose={() => setRatingModalOrder(null)}
        title="Rate your experience"
      >
         <div className="space-y-4">
           <div className="text-center py-2">
             <p className="text-gray-600 mb-2">How was your <strong>{ratingModalOrder?.bagTitle}</strong>?</p>
             <div className="flex justify-center gap-2">
               {[1,2,3,4,5].map(star => (
                 <button key={star} onClick={() => setRating(star)} className="focus:outline-none transition-transform hover:scale-110">
                   <Star size={32} className={star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"} />
                 </button>
               ))}
             </div>
           </div>
           
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Review (Optional)</label>
             <textarea 
               className="w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-primary-500 focus:border-primary-500"
               rows={3}
               value={review}
               onChange={(e) => setReview(e.target.value)}
               placeholder="What did you get? Was it fresh?"
             />
           </div>
           
           <div className="flex justify-end gap-2 pt-2">
             <Button variant="ghost" onClick={() => setRatingModalOrder(null)}>Cancel</Button>
             <Button onClick={() => ratingModalOrder && rateMutation.mutate({ id: ratingModalOrder.id, rating, review })}>Submit Review</Button>
           </div>
         </div>
      </Modal>
    </div>
  );
};

export default ConsumerOrders;

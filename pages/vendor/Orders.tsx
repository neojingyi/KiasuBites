import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card, Button, Badge } from '../../components/UI';
import { Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

const VendorOrders: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['vendorOrders', user?.id],
    queryFn: () => api.getVendorOrders(user!.id),
    enabled: !!user,
    refetchInterval: 10000 // Poll every 10s
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: 'picked_up' | 'no_show' }) => 
      api.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorOrders'] });
      toast.success('Order updated');
    }
  });

  if (isLoading) return <div>Loading orders...</div>;

  const activeOrders = orders?.filter(o => o.status === 'reserved');
  const pastOrders = orders?.filter(o => o.status !== 'reserved');

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          Active Orders <Badge variant="warning">{activeOrders?.length || 0}</Badge>
        </h2>
        <div className="space-y-3">
          {activeOrders?.length === 0 ? <p className="text-gray-500">No pending orders.</p> : activeOrders?.map(order => (
             <Card key={order.id} className="p-4 border-l-4 border-l-primary-500">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg text-gray-900">Code: {order.confirmationCode}</span>
                    </div>
                    <p className="text-gray-700 font-medium mt-1">{order.bagTitle} x{order.quantity}</p>
                    <p className="text-sm text-gray-500">Pickup: {order.pickupStart} - {order.pickupEnd}</p>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <Button 
                      onClick={() => statusMutation.mutate({ id: order.id, status: 'picked_up' })}
                      disabled={statusMutation.isPending}
                      className="flex-1 md:flex-none"
                    >
                      <Check size={16} className="mr-1" /> Picked Up
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => statusMutation.mutate({ id: order.id, status: 'no_show' })}
                      disabled={statusMutation.isPending}
                      className="flex-1 md:flex-none"
                    >
                      <X size={16} className="mr-1" /> No Show
                    </Button>
                  </div>
               </div>
             </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Past Orders Today</h2>
        <div className="opacity-70 space-y-2">
           {pastOrders?.map(order => (
             <div key={order.id} className="bg-white p-3 rounded border border-gray-100 flex justify-between items-center">
                <div>
                   <span className="font-mono font-bold text-gray-600 mr-2">{order.confirmationCode}</span>
                   <span className="text-gray-800">{order.bagTitle} (x{order.quantity})</span>
                </div>
                <Badge variant={order.status === 'picked_up' ? 'success' : 'error'}>{order.status}</Badge>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default VendorOrders;
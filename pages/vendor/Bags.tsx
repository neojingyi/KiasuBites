import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card, Button, Input, Badge, Modal } from '../../components/UI';
import { Plus, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';

const VendorBags: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '', price: '', originalPrice: '', quantity: '', pickupStart: '18:00', pickupEnd: '19:00', description: ''
  });

  const [editingBag, setEditingBag] = useState<any>(null);

  const { data: bags, isLoading } = useQuery({
    queryKey: ['vendorBags', user?.id],
    queryFn: () => api.getVendorBags(user!.id),
    enabled: !!user
  });

  const createBagMutation = useMutation({
    mutationFn: (newBag: any) => api.createBag({
      ...newBag,
      vendorId: user!.id,
      vendorName: user!.name,
      vendorCategory: 'Bakery', // Mock
      dietaryTags: ['Vegetarian'], // Mock
      status: 'active'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorBags'] });
      setIsModalOpen(false);
      setEditingBag(null);
      toast.success('Bag created successfully');
      setFormData({ title: '', price: '', originalPrice: '', quantity: '', pickupStart: '18:00', pickupEnd: '19:00', description: '' });
    }
  });

  const deactivateBagMutation = useMutation({
    mutationFn: (bagId: string) => {
      // In a real app, this would call an API endpoint
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorBags'] });
      toast.success('Bag deactivated');
    },
    onError: () => {
      toast.error('Failed to deactivate bag');
    }
  });

  const handleEdit = (bag: any) => {
    setEditingBag(bag);
    setFormData({
      title: bag.title,
      price: bag.price.toString(),
      originalPrice: bag.originalPrice.toString(),
      quantity: bag.quantity.toString(),
      pickupStart: bag.pickupStart,
      pickupEnd: bag.pickupEnd,
      description: bag.description
    });
    setIsModalOpen(true);
  };

  const handleDeactivate = (bagId: string) => {
    if (window.confirm('Are you sure you want to deactivate this bag?')) {
      deactivateBagMutation.mutate(bagId);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createBagMutation.mutate({
      ...formData,
      price: parseFloat(formData.price),
      originalPrice: parseFloat(formData.originalPrice),
      quantity: parseInt(formData.quantity)
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Bags</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={18} className="mr-2" /> New Bag
        </Button>
      </div>

      {isLoading ? <div>Loading...</div> : (
        <div className="space-y-4">
          {bags?.map(bag => (
            <Card key={bag.id} className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex-grow">
                <div className="flex items-center gap-2">
                   <h3 className="font-bold text-lg">{bag.title}</h3>
                   <Badge variant={bag.status === 'active' ? 'success' : 'neutral'}>{bag.status}</Badge>
                </div>
                <p className="text-gray-500 text-sm">
                  {bag.quantity} remaining • ${bag.price} (Value ${bag.originalPrice}) • Pickup {bag.pickupStart}-{bag.pickupEnd}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(bag)}><Edit2 size={14} className="mr-1"/> Edit</Button>
                {bag.status === 'active' && (
                  <Button variant="danger" size="sm" onClick={() => handleDeactivate(bag.id)}>Deactivate</Button>
                )}
              </div>
            </Card>
          ))}
          {bags?.length === 0 && <p className="text-gray-500 text-center py-8">No bags created yet.</p>}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => {
        setIsModalOpen(false);
        setEditingBag(null);
        setFormData({ title: '', price: '', originalPrice: '', quantity: '', pickupStart: '18:00', pickupEnd: '19:00', description: '' });
      }} title={editingBag ? "Edit Surprise Bag" : "Create New Surprise Bag"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Title" 
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
            placeholder="e.g. End of Day Bakery Bag"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Price ($)" 
              type="number" step="0.01"
              value={formData.price}
              onChange={e => setFormData({...formData, price: e.target.value})}
              required
            />
            <Input 
              label="Original Value ($)" 
              type="number" step="0.01"
              value={formData.originalPrice}
              onChange={e => setFormData({...formData, originalPrice: e.target.value})}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <Input 
              label="Quantity" 
              type="number"
              value={formData.quantity}
              onChange={e => setFormData({...formData, quantity: e.target.value})}
              required
            />
             <Input 
              label="Description" 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="What might be inside?"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <Input 
              label="Pickup Start" 
              type="time"
              value={formData.pickupStart}
              onChange={e => setFormData({...formData, pickupStart: e.target.value})}
              required
            />
             <Input 
              label="Pickup End" 
              type="time"
              value={formData.pickupEnd}
              onChange={e => setFormData({...formData, pickupEnd: e.target.value})}
              required
            />
          </div>
          <div className="pt-2">
            <Button type="submit" className="w-full" isLoading={createBagMutation.isPending}>
              {editingBag ? 'Update Bag' : 'Create Bag'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default VendorBags;
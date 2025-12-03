import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Button, Card, Input } from '../../components/UI';
import { WeeklyAvailability } from '../../types';
import toast from 'react-hot-toast';
import { useQuery, useMutation } from '@tanstack/react-query';

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const LABELS: {[key: string]: string} = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' };

const VendorAvailability: React.FC = () => {
  const { user } = useAuth();
  
  // Initialize with default or empty
  const [schedule, setSchedule] = useState<WeeklyAvailability>(
    DAYS.reduce((acc, day) => ({ 
      ...acc, 
      [day]: { available: true, pickupStart: '18:00', pickupEnd: '19:00', defaultQuantity: 5 } 
    }), {})
  );

  // In a real app, fetch existing schedule first
  const mutation = useMutation({
    mutationFn: (data: WeeklyAvailability) => api.updateVendorAvailability(user!.id, data),
    onSuccess: () => toast.success('Weekly schedule updated!')
  });

  const handleChange = (day: string, field: string, value: any) => {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  const handleSave = () => {
    if (!user) return;
    mutation.mutate(schedule);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Weekly Availability</h1>
          <p className="text-gray-600">Set your default pickup times and quantities for recurring surprise bags.</p>
        </div>
        <Button onClick={handleSave} isLoading={mutation.isPending}>Save Changes</Button>
      </div>

      <Card className="overflow-hidden">
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 grid grid-cols-12 gap-4 font-medium text-gray-500 text-sm">
          <div className="col-span-2">Day</div>
          <div className="col-span-2 text-center">Active</div>
          <div className="col-span-3">Pickup Start</div>
          <div className="col-span-3">Pickup End</div>
          <div className="col-span-2">Quantity</div>
        </div>
        <div className="divide-y divide-gray-100">
          {DAYS.map(day => (
            <div key={day} className={`px-6 py-4 grid grid-cols-12 gap-4 items-center ${!schedule[day].available ? 'bg-gray-50 opacity-60' : ''}`}>
               <div className="col-span-2 font-medium text-gray-900">{LABELS[day]}</div>
               <div className="col-span-2 flex justify-center">
                 <input 
                   type="checkbox" 
                   checked={schedule[day].available}
                   onChange={(e) => handleChange(day, 'available', e.target.checked)}
                   className="h-5 w-5 text-primary-600 rounded focus:ring-primary-500"
                 />
               </div>
               <div className="col-span-3">
                 <input 
                   type="time" 
                   value={schedule[day].pickupStart}
                   onChange={(e) => handleChange(day, 'pickupStart', e.target.value)}
                   disabled={!schedule[day].available}
                   className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm disabled:bg-gray-100 border p-2"
                 />
               </div>
               <div className="col-span-3">
                 <input 
                   type="time" 
                   value={schedule[day].pickupEnd}
                   onChange={(e) => handleChange(day, 'pickupEnd', e.target.value)}
                   disabled={!schedule[day].available}
                   className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm disabled:bg-gray-100 border p-2"
                 />
               </div>
               <div className="col-span-2">
                 <input 
                   type="number"
                   min="0"
                   value={schedule[day].defaultQuantity}
                   onChange={(e) => handleChange(day, 'defaultQuantity', parseInt(e.target.value))}
                   disabled={!schedule[day].available}
                   className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm disabled:bg-gray-100 border p-2"
                 />
               </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default VendorAvailability;

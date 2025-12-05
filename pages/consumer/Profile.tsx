import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, Button, Input, Badge } from '../../components/UI';
import toast from 'react-hot-toast';

const ConsumerProfile: React.FC = () => {
  const { user } = useAuth();
  const [searchRadius, setSearchRadius] = useState(5);

  const handleSave = () => {
    toast.success('Preferences saved successfully!');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Profile & Settings</h1>
      
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 text-2xl font-bold">
            {user?.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold">{user?.name}</h2>
            <p className="text-gray-500">{user?.email}</p>
            <Badge variant="neutral">Consumer</Badge>
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-6">
        <h3 className="text-lg font-bold border-b pb-2">Preferences</h3>
        
        <div className="space-y-4">
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Preferences</label>
             <div className="flex gap-2">
                <Badge variant="success">Vegetarian</Badge>
                <button className="text-xs text-primary-600 hover:underline" onClick={() => toast.info('Feature coming soon!')}>+ Add</button>
             </div>
           </div>

           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">Search Radius</label>
             <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="1" 
                  max="20" 
                  value={searchRadius}
                  onChange={(e) => setSearchRadius(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" 
                />
                <span className="text-sm font-bold w-12 text-right">{searchRadius} km</span>
             </div>
           </div>
        </div>

        <div className="flex justify-end">
           <Button variant="outline" onClick={handleSave}>Save Changes</Button>
        </div>
      </Card>
    </div>
  );
};

export default ConsumerProfile;
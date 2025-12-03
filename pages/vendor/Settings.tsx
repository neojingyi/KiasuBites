import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Button, Card, Input } from '../../components/UI';
import { VendorSettings } from '../../types';
import toast from 'react-hot-toast';
import { MapPin, Info, AlertTriangle } from 'lucide-react';

const VendorSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<VendorSettings>({
    instructions: 'Level 1, near the main entrance next to the fountain.',
    collectionInfo: 'Show your confirmation code to the cashier.',
    storageInfo: 'Best consumed within 24 hours.',
    showAllergens: true
  });

  const handleSave = async () => {
    if(!user) return;
    try {
      await api.updateVendorSettings(user.id, settings);
      toast.success('Instructions updated successfully');
    } catch (e) {
      toast.error('Failed to save');
    }
  };

  return (
    <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Customer Instructions</h1>
           <p className="text-gray-600">Manage how customers find you and what they need to know.</p>
        </div>

        <Card className="p-6 space-y-5">
           <Input 
             label="How to find us"
             value={settings.instructions}
             onChange={e => setSettings({...settings, instructions: e.target.value})}
             placeholder="e.g. Near MRT Exit A"
           />
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Collection Instructions</label>
             <textarea 
               className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 min-h-[80px]"
               value={settings.collectionInfo}
               onChange={e => setSettings({...settings, collectionInfo: e.target.value})}
             />
           </div>
           <Input 
             label="Storage & Allergens Note"
             value={settings.storageInfo}
             onChange={e => setSettings({...settings, storageInfo: e.target.value})}
           />
           <div className="flex items-center gap-2">
             <input 
               type="checkbox" 
               id="allergens"
               checked={settings.showAllergens}
               onChange={e => setSettings({...settings, showAllergens: e.target.checked})}
               className="h-4 w-4 text-primary-600 rounded"
             />
             <label htmlFor="allergens" className="text-sm text-gray-700">Display allergen warning prominently</label>
           </div>
           <div className="pt-2">
             <Button onClick={handleSave}>Save Settings</Button>
           </div>
        </Card>
      </div>

      {/* Preview */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-gray-500 uppercase tracking-wide">Live Preview</h2>
        <div className="border-4 border-gray-200 rounded-3xl p-4 bg-gray-50 max-w-sm mx-auto shadow-inner">
           <div className="bg-white rounded-xl shadow-sm overflow-hidden pb-4">
              <div className="h-40 bg-gray-200 w-full relative">
                 <div className="absolute inset-0 flex items-center justify-center text-gray-400">Bag Image</div>
              </div>
              <div className="p-4 space-y-4">
                 <h3 className="font-bold text-lg">Surprise Bag</h3>
                 
                 <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
                    <div className="flex gap-2">
                       <MapPin size={16} className="text-gray-400 shrink-0" />
                       <span className="text-gray-700">{settings.instructions || "Address..."}</span>
                    </div>
                    <div className="flex gap-2">
                       <Info size={16} className="text-gray-400 shrink-0" />
                       <span className="text-gray-700">{settings.collectionInfo || "Collection info..."}</span>
                    </div>
                 </div>

                 {settings.showAllergens && (
                    <div className="flex gap-2 text-xs bg-orange-50 text-orange-800 p-2 rounded border border-orange-100">
                       <AlertTriangle size={14} />
                       <span>{settings.storageInfo || "Contains allergens."}</span>
                    </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default VendorSettingsPage;

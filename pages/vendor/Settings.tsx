import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Button, Card, Input, Badge } from '../../components/UI';
import { VendorSettings } from '../../types';
import toast from 'react-hot-toast';
import { MapPin, Info, AlertTriangle, User, Mail, Building2, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VendorSettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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
      toast.success('Settings updated successfully');
    } catch (e) {
      toast.error('Failed to save');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Profile Section */}
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-white text-2xl font-bold">
            {user?.name.charAt(0)}
          </div>
          <div className="flex-grow">
            <h2 className="text-xl font-bold">{user?.name}</h2>
            <p className="text-gray-500 flex items-center gap-2 mt-1">
              <Mail size={14} />
              {user?.email}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={user?.isVerified ? 'success' : 'warning'}>
                {user?.isVerified ? 'Verified' : 'Unverified'}
              </Badge>
              <Badge variant="neutral">Vendor</Badge>
            </div>
          </div>
          <Button
            variant="danger"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut size={18} />
            Logout
          </Button>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Profile & Settings</h1>
           <p className="text-gray-600">Manage your account and customer instructions.</p>
        </div>

        {/* Account Information */}
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-bold border-b pb-2 flex items-center gap-2">
            <User size={20} />
            Account Information
          </h3>
          <div className="space-y-4">
            <Input 
              label="Business Name" 
              value={user?.name || ''}
              disabled
              className="bg-gray-50"
            />
            <Input 
              label="Email Address" 
              type="email"
              value={user?.email || ''}
              disabled
              className="bg-gray-50"
            />
            {!user?.isVerified && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-sm text-orange-800 mb-2">
                  <strong>Verify your business</strong> to start listing surprise bags.
                </p>
                <Button
                  variant="outline"
                  onClick={() => navigate('/vendor/verification')}
                  className="text-sm"
                >
                  Go to Verification
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Customer Instructions */}
        <Card className="p-6 space-y-5">
          <h3 className="text-lg font-bold border-b pb-2 flex items-center gap-2">
            <Building2 size={20} />
            Customer Instructions
          </h3>
          <p className="text-sm text-gray-600 mb-4">Manage how customers find you and what they need to know.</p>
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
    </div>
  );
};

export default VendorSettingsPage;

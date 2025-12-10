import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Button, Card, Input, Badge } from '../../components/UI';
import { VendorSettings } from '../../types';
import toast from 'react-hot-toast';
import { MapPin, Info, AlertTriangle, User, Mail, Building2, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import profilePic1 from '../../assets/1.png';
import profilePic2 from '../../assets/2.png';
import profilePic3 from '../../assets/3.png';
import profilePic4 from '../../assets/4.png';
import profilePic5 from '../../assets/5.png';
import profilePic6 from '../../assets/6.png';
import profilePic7 from '../../assets/7.png';
import profilePic8 from '../../assets/8.png';

const profilePictures = [
  { id: 1, src: profilePic1 },
  { id: 2, src: profilePic2 },
  { id: 3, src: profilePic3 },
  { id: 4, src: profilePic4 },
  { id: 5, src: profilePic5 },
  { id: 6, src: profilePic6 },
  { id: 7, src: profilePic7 },
  { id: 8, src: profilePic8 },
];

const VendorSettingsPage: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<VendorSettings>({
    instructions: 'Level 1, near the main entrance next to the fountain.',
    collectionInfo: 'Show your confirmation code to the cashier.',
    storageInfo: 'Best consumed within 24 hours.',
    showAllergens: true
  });
  const [selectedProfilePic, setSelectedProfilePic] = useState<number>(1);
  const [showProfilePicSelector, setShowProfilePicSelector] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const selectedProfileSrc =
    profilePictures.find((pic) => pic.id === selectedProfilePic)?.src ||
    user?.profilePictureUrl;

  useEffect(() => {
    if (user?.profilePictureUrl) {
      const currentPic = profilePictures.find(pic => pic.src === user.profilePictureUrl);
      if (currentPic) {
        setSelectedProfilePic(currentPic.id);
      }
    }
  }, [user]);

  const handleSave = async () => {
    if(!user) return;
    try {
      await api.updateVendorSettings(user.id, settings);
      toast.success('Settings updated successfully');
    } catch (e) {
      toast.error('Failed to save');
    }
  };

  const handleSaveProfilePicture = async () => {
    if (!user) return;
    setIsSavingProfile(true);
    try {
      const selectedPic = profilePictures.find(pic => pic.id === selectedProfilePic);
      const profilePictureUrl = selectedPic?.src || profilePictures[0].src;

      await updateUser({
        profilePictureUrl,
      });

      toast.success('Profile picture updated successfully!');
      setShowProfilePicSelector(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile picture');
    } finally {
      setIsSavingProfile(false);
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
          <div className="relative">
            {selectedProfileSrc ? (
              <img
                key={`vendor-profile-${user?.id}-${selectedProfileSrc}`}
                src={selectedProfileSrc}
                alt={user?.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-primary-600"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-white text-2xl font-bold">
                {user?.name.charAt(0)}
              </div>
            )}
            <button
              onClick={() => setShowProfilePicSelector(!showProfilePicSelector)}
              className="absolute bottom-0 right-0 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs hover:bg-primary-700 transition-colors border-2 border-white"
              title="Change profile picture"
            >
              ✎
            </button>
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

        {/* Profile Picture Selector */}
        {showProfilePicSelector && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-4 border-t border-gray-200"
          >
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Choose Your Profile Picture
            </label>
            <div className="grid grid-cols-4 gap-3 mb-4">
              {profilePictures.map((pic) => (
                <motion.button
                  key={pic.id}
                  type="button"
                  onClick={() => setSelectedProfilePic(pic.id)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                    selectedProfilePic === pic.id
                      ? 'border-primary-600 ring-2 ring-primary-200 ring-offset-2'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <img
                    src={pic.src}
                    alt={`Profile ${pic.id}`}
                    className="w-full h-full object-cover"
                  />
                  {selectedProfilePic === pic.id && (
                    <motion.div
                      className="absolute inset-0 bg-primary-600/20 flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowProfilePicSelector(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveProfilePicture}
                isLoading={isSavingProfile}
              >
                Save Picture
              </Button>
            </div>
          </motion.div>
        )}
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

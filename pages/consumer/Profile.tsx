import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, Button, Input, Badge } from '../../components/UI';
import toast from 'react-hot-toast';
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

const ConsumerProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phoneNumber || '',
    address: user?.address || '',
  });
  const [selectedProfilePic, setSelectedProfilePic] = useState<number>(1);
  const [isSaving, setIsSaving] = useState(false);
  const [showProfilePicSelector, setShowProfilePicSelector] = useState(false);
  const selectedProfileSrc =
    profilePictures.find((pic) => pic.id === selectedProfilePic)?.src ||
    user?.profilePictureUrl;

  useEffect(() => {
    if (user) {
      console.log('Profile page: User loaded:', user);
      console.log('Profile page: Profile picture URL:', user.profilePictureUrl);
      console.log('Profile page: Has profile picture?', !!user.profilePictureUrl);
      
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phoneNumber || '',
        address: user.address || '',
      });
      
      // Find which profile picture is currently selected
      if (user.profilePictureUrl) {
        console.log('Profile page: Looking for matching profile picture...');
        console.log('Profile page: User profile picture URL:', user.profilePictureUrl);
        console.log('Profile page: Available profile pictures:', profilePictures.map(p => ({ id: p.id, src: p.src })));
        
        // Try exact match first
        let currentPic = profilePictures.find(pic => pic.src === user.profilePictureUrl);
        // If no exact match, try comparing string representations
        if (!currentPic) {
          currentPic = profilePictures.find(pic => String(pic.src) === String(user.profilePictureUrl));
        }
        // If still no match, try checking if URLs contain similar paths
        if (!currentPic && user.profilePictureUrl) {
          const urlStr = String(user.profilePictureUrl);
          currentPic = profilePictures.find(pic => {
            const picStr = String(pic.src);
            // Check if URLs match by comparing paths (ignoring query params/hashes)
            const picPath = picStr.split('?')[0].split('#')[0];
            const urlPath = urlStr.split('?')[0].split('#')[0];
            return picPath === urlPath || picStr.includes(urlStr) || urlStr.includes(picStr);
          });
        }
        if (currentPic) {
          console.log('Profile page: Found matching picture:', currentPic.id);
          setSelectedProfilePic(currentPic.id);
        } else {
          console.log('Profile page: No matching picture found, using default');
          console.log('Profile page: User URL:', user.profilePictureUrl);
          console.log('Profile page: Available URLs:', profilePictures.map(p => String(p.src)));
          setSelectedProfilePic(1);
        }
      } else {
        console.log('Profile page: No profile picture URL, using default');
        setSelectedProfilePic(1);
      }
    }
  }, [user, user?.profilePictureUrl]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const selectedPic = profilePictures.find(pic => pic.id === selectedProfilePic);
      const profilePictureUrl = selectedPic?.src || profilePictures[0].src;

      await updateUser({
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phone,
        address: formData.address,
        profilePictureUrl,
      });

      toast.success('Profile updated successfully!', {
        style: {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          color: '#1d1d1f',
          borderRadius: '16px',
          padding: '14px 20px',
          fontSize: '15px',
          fontWeight: '500',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
          border: '0.5px solid rgba(0, 0, 0, 0.08)',
        },
        iconTheme: {
          primary: '#dc2626',
          secondary: '#ffffff',
        },
      });
      setShowProfilePicSelector(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Profile & Settings</h1>
      
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            {selectedProfileSrc ? (
              <img
                key={`profile-pic-${user?.id}-${selectedProfileSrc}`} // Force re-render when URL changes
                src={selectedProfileSrc}
                alt={user?.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-primary-600"
                onError={(e) => {
                  console.error('Profile picture failed to load in Profile page:', selectedProfileSrc);
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) {
                    fallback.style.display = 'flex';
                  }
                }}
                onLoad={() => {
                  console.log('✅ Profile picture loaded successfully in Profile page:', selectedProfileSrc);
                }}
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 text-2xl font-bold">
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
          <div className="flex-1">
            <h2 className="text-xl font-bold">{user?.name}</h2>
            <p className="text-gray-500">{user?.email}</p>
          </div>
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
            <div className="grid grid-cols-4 gap-3">
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
          </motion.div>
        )}
      </Card>

      <Card className="p-6 space-y-6">
        <h3 className="text-lg font-bold border-b pb-2">Personal Information</h3>
        
        <div className="space-y-4">
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Enter your full name"
          />

          <Input
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="Enter your email address"
          />

          <Input
            label="Phone Number"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="Enter your phone number"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Enter your address"
              rows={3}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-base placeholder-gray-400 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Preferences</label>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="success">Vegetarian</Badge>
              <button className="text-xs text-primary-600 hover:underline" onClick={() => toast.info('Feature coming soon!')}>+ Add</button>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={handleSave} isLoading={isSaving}>
            Save Changes
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ConsumerProfile;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Button, Input, Card } from '../../components/UI';
import { CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { VendorBusinessInfo } from '../../types';

const VendorVerification: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<VendorBusinessInfo>({
    companyName: '',
    brandName: '',
    uen: '',
    businessType: 'Restaurant',
    directorName: '',
    nric: '',
    address: '',
    phone: '',
    email: '',
    openingHours: '10am - 10pm daily'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    
    try {
      await api.verifyVendorBusiness(user.id, formData);
      toast.success('Verification submitted! Your business is now verified for this demo.');
      navigate('/vendor/dashboard');
      // Force reload to update context/banner (in a real app, context would update automatically via socket or re-fetch)
      window.location.reload(); 
    } catch (error) {
      toast.error('Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Verify Your Business</h1>
        <p className="text-gray-600">We need a few details to ensure Kiasu<span className="text-primary-600">Bites</span> remains a trusted marketplace.</p>
      </div>

      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
             <Input 
               label="Legal Company Name" 
               name="companyName" 
               value={formData.companyName} 
               onChange={handleChange} 
               required 
               placeholder="e.g. Delicious Food Pte Ltd"
             />
             <Input 
               label="Brand / Display Name" 
               name="brandName" 
               value={formData.brandName} 
               onChange={handleChange} 
               placeholder="If different from company name"
             />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
             <Input 
               label="ACRA / UEN Number" 
               name="uen" 
               value={formData.uen} 
               onChange={handleChange} 
               required 
               placeholder="e.g. 202312345K"
             />
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
               <select 
                 name="businessType"
                 value={formData.businessType}
                 onChange={handleChange}
                 className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
               >
                 <option>Hawker Stall</option>
                 <option>Bakery</option>
                 <option>Café</option>
                 <option>Restaurant</option>
                 <option>Supermarket</option>
                 <option>Other</option>
               </select>
             </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100">
             <h3 className="font-medium text-gray-900">Director Information</h3>
             <div className="grid md:grid-cols-2 gap-6">
                <Input 
                  label="Director Name" 
                  name="directorName" 
                  value={formData.directorName} 
                  onChange={handleChange} 
                  required 
                  placeholder="Full name as per NRIC"
                />
                 <Input 
                  label="NRIC" 
                  name="nric" 
                  value={formData.nric} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g. S1234567A"
                />
             </div>
             <Input 
                label="Business Address" 
                name="address" 
                value={formData.address} 
                onChange={handleChange} 
                required 
                placeholder="Full business address"
              />
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100">
             <h3 className="font-medium text-gray-900">Contact Details</h3>
             <div className="grid md:grid-cols-2 gap-6">
                 <Input 
                  label="Phone Number" 
                  name="phone" 
                  type="tel"
                  value={formData.phone} 
                  onChange={handleChange} 
                  required 
                />
                 <Input 
                  label="Business Email" 
                  name="email" 
                  type="email"
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                />
             </div>
          </div>

          <div className="pt-2">
             <Input 
               label="Standard Opening Hours" 
               name="openingHours" 
               value={formData.openingHours} 
               onChange={handleChange} 
               placeholder="e.g. Mon-Fri 9am-6pm"
               required 
             />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
             <Button type="button" variant="ghost" onClick={() => navigate('/vendor/dashboard')}>Cancel</Button>
             <Button type="submit" isLoading={isSubmitting}>Submit Verification</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default VendorVerification;

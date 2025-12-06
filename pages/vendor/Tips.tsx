import React from 'react';
import { Card } from '../../components/UI';
import { DollarSign, ShoppingBag, TrendingUp, HelpCircle } from 'lucide-react';

const VendorTips: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Vendor Help Center</h1>
        <p className="text-gray-600">Tips and guides to help you save more food and increase sales.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
         <Card className="p-6">
           <div className="flex items-center gap-3 mb-4">
             <div className="p-2 bg-green-100 text-green-600 rounded-lg"><DollarSign /></div>
             <h2 className="text-xl font-bold">Platform Fees & Payouts</h2>
           </div>
           <ul className="space-y-3 text-gray-700 text-sm list-disc pl-5">
             <li>Kiasu<span className="text-primary-600">Bites</span> charges a flat commission of <strong>10%</strong> on each bag sold.</li>
             <li>Payouts are processed weekly on Mondays for the previous week's sales.</li>
             <li>Funds are transferred directly to your registered bank account via GIRO/PayNow.</li>
             <li>You can view detailed payout history in your Dashboard under the "Financials" tab.</li>
           </ul>
         </Card>

         <Card className="p-6">
           <div className="flex items-center gap-3 mb-4">
             <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><ShoppingBag /></div>
             <h2 className="text-xl font-bold">What goes in a bag?</h2>
           </div>
           <ul className="space-y-3 text-gray-700 text-sm list-disc pl-5">
             <li><strong>Bakery Bags:</strong> Usually contain ~$15 worth of bread, pastries, or cakes. Mix items that are still fresh but won't sell tomorrow.</li>
             <li><strong>Meal Bags:</strong> A full meal box or multiple side dishes. Ensure food safety guidelines are met.</li>
             <li><strong>Variety is key:</strong> Customers love the "surprise" element, but consistency in value ensures repeat buyers.</li>
           </ul>
         </Card>

         <Card className="p-6">
           <div className="flex items-center gap-3 mb-4">
             <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><TrendingUp /></div>
             <h2 className="text-xl font-bold">Listing Effectively</h2>
           </div>
           <ul className="space-y-3 text-gray-700 text-sm list-disc pl-5">
             <li><strong>Set realistic pickup windows:</strong> Give customers at least 1-2 hours to collect.</li>
             <li><strong>Use Recurring Schedules:</strong> Use the Availability tool to set bags to auto-list every day. You can always adjust quantity in the morning.</li>
             <li><strong>Update early:</strong> If you know you have extra surplus, increase bag quantity by 2pm to catch the dinner rush.</li>
           </ul>
         </Card>

         <Card className="p-6">
           <div className="flex items-center gap-3 mb-4">
             <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><HelpCircle /></div>
             <h2 className="text-xl font-bold">Handling Issues</h2>
           </div>
           <ul className="space-y-3 text-gray-700 text-sm list-disc pl-5">
             <li><strong>No-shows:</strong> If a customer doesn't show up by the end of the window, you can mark it as "No Show" in Orders. The food is yours to dispose of or donate.</li>
             <li><strong>Sold out early?</strong> You can pause or delete bags for the day from the "Bags" tab instantly.</li>
             <li><strong>Complaint?</strong> Contact support immediately if there was an issue with food quality or collection.</li>
           </ul>
         </Card>
      </div>
    </div>
  );
};

export default VendorTips;

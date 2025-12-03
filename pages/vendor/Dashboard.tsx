import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card, Badge, Button } from '../../components/UI';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { DollarSign, ShoppingBag, Leaf, ArrowRight, TrendingUp, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

const VendorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'financials'>('overview');

  const { data: stats, isLoading } = useQuery({
    queryKey: ['vendorStats', user?.id],
    queryFn: () => api.getVendorStats(user!.id),
    enabled: !!user
  });

  if (isLoading) return <div>Loading dashboard...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="text-sm text-gray-500">Welcome back, {user?.name}</div>
        </div>
        <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
           <button 
             onClick={() => setActiveTab('overview')}
             className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'overview' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}
           >
             Overview
           </button>
           <button 
             onClick={() => setActiveTab('financials')}
             className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'financials' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}
           >
             Financials
           </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Today's Sales</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.todaySales}</p>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
                  <ShoppingBag />
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pickup Rate</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.pickupRate}%</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <TrendingUp />
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Avg Rating</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.avgRating}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                  <DollarSign />
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Meals Saved</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.totalMealsSaved}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                  <Leaf />
                </div>
              </div>
            </Card>
          </div>

          {/* Chart */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Sales History (Last 7 Days)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats?.salesHistory}>
                      <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        itemStyle={{ color: '#0d9488' }}
                      />
                      <Line type="monotone" dataKey="amount" stroke="#0d9488" strokeWidth={3} dot={{r: 4, strokeWidth: 0}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
             <Card className="md:col-span-1 p-6">
               <h3 className="text-lg font-bold text-gray-900 mb-6">Bags Sold vs Offered</h3>
               <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.salesHistory}>
                      <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Bar dataKey="bagsSold" fill="#f97316" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
               </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link to="/vendor/bags">
              <Card className="p-6 hover:border-primary-500 transition-colors group h-full">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">Manage Bags</h3>
                  <ArrowRight className="text-gray-400 group-hover:text-primary-500 transition-colors"/>
                </div>
                <p className="text-gray-500 mt-2">Update quantity or add new surprise bags for today.</p>
              </Card>
            </Link>
            <Link to="/vendor/orders">
              <Card className="p-6 hover:border-primary-500 transition-colors group h-full">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">Incoming Orders</h3>
                  <ArrowRight className="text-gray-400 group-hover:text-primary-500 transition-colors"/>
                </div>
                <p className="text-gray-500 mt-2">Check customer pickups and verify confirmation codes.</p>
              </Card>
            </Link>
          </div>
        </>
      )}

      {activeTab === 'financials' && (
        <div className="space-y-6">
           <div className="grid md:grid-cols-3 gap-6">
             <Card className="p-6 bg-green-50 border-green-100">
               <p className="text-green-700 font-medium">Total Revenue (YTD)</p>
               <p className="text-3xl font-bold text-green-900 mt-2">$2,450.00</p>
             </Card>
             <Card className="p-6 bg-red-50 border-red-100">
               <p className="text-red-700 font-medium">Platform Fees (20%)</p>
               <p className="text-3xl font-bold text-red-900 mt-2">$490.00</p>
             </Card>
             <Card className="p-6 bg-blue-50 border-blue-100">
               <p className="text-blue-700 font-medium">Net Payouts</p>
               <p className="text-3xl font-bold text-blue-900 mt-2">$1,960.00</p>
             </Card>
           </div>

           <Card className="overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
               <h3 className="font-bold text-gray-900">Payout History</h3>
               <Button variant="outline" size="sm">Download CSV</Button>
             </div>
             <table className="w-full text-sm text-left">
               <thead className="bg-gray-50 text-gray-500 font-medium">
                 <tr>
                   <th className="px-6 py-3">Date</th>
                   <th className="px-6 py-3">Period</th>
                   <th className="px-6 py-3 text-right">Gross</th>
                   <th className="px-6 py-3 text-right">Fees</th>
                   <th className="px-6 py-3 text-right">Net</th>
                   <th className="px-6 py-3 text-center">Status</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                 {stats?.payouts.map((payout, i) => (
                   <tr key={i} className="hover:bg-gray-50">
                     <td className="px-6 py-4">{payout.date}</td>
                     <td className="px-6 py-4">{payout.period}</td>
                     <td className="px-6 py-4 text-right">${payout.gross.toFixed(2)}</td>
                     <td className="px-6 py-4 text-right text-red-600">-${payout.fees.toFixed(2)}</td>
                     <td className="px-6 py-4 text-right font-bold">${payout.net.toFixed(2)}</td>
                     <td className="px-6 py-4 text-center">
                       <Badge variant={payout.status === 'Paid' ? 'success' : 'warning'}>{payout.status}</Badge>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </Card>
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;

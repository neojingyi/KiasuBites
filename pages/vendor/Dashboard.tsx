import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card, Badge, Button } from '../../components/UI';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { DollarSign, ShoppingBag, Leaf, ArrowRight, TrendingUp, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const VendorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'financials'>('overview');

  const { data: stats, isLoading } = useQuery({
    queryKey: ['vendorStats', user?.id],
    queryFn: () => api.getVendorStats(user!.id),
    enabled: !!user
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">Dashboard</h1>
          <p className="text-lg text-gray-600 font-medium">Welcome back, {user?.name}</p>
        </div>
        <div className="flex bg-white/80 backdrop-blur-sm p-1.5 rounded-xl border border-gray-200 shadow-sm">
           <motion.button 
             onClick={() => setActiveTab('overview')}
             className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all border ${
               activeTab === 'overview' 
                 ? 'bg-primary-600 text-white border-primary-600' 
                 : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
             }`}
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
           >
             Overview
           </motion.button>
           <motion.button 
             onClick={() => setActiveTab('financials')}
             className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all border ${
               activeTab === 'financials' 
                 ? 'bg-primary-600 text-white border-primary-600' 
                 : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
             }`}
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
           >
             Financials
           </motion.button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                label: "Today's Sales", 
                value: stats?.todaySales || 0, 
                icon: ShoppingBag, 
                gradient: 'from-primary-500 to-primary-600',
                bgGradient: 'from-primary-50 to-primary-100',
                iconBg: 'bg-primary-100',
                iconColor: 'text-primary-600'
              },
              { 
                label: "Pickup Rate", 
                value: `${stats?.pickupRate || 0}%`, 
                icon: TrendingUp, 
                gradient: 'from-blue-500 to-blue-600',
                bgGradient: 'from-blue-50 to-blue-100',
                iconBg: 'bg-blue-100',
                iconColor: 'text-blue-600'
              },
              { 
                label: "Avg Rating", 
                value: stats?.avgRating || 0, 
                icon: DollarSign, 
                gradient: 'from-accent-500 to-accent-600',
                bgGradient: 'from-accent-50 to-accent-100',
                iconBg: 'bg-accent-100',
                iconColor: 'text-accent-600'
              },
              { 
                label: "Meals Saved", 
                value: stats?.totalMealsSaved || 0, 
                icon: Leaf, 
                gradient: 'from-green-500 to-green-600',
                bgGradient: 'from-green-50 to-green-100',
                iconBg: 'bg-green-100',
                iconColor: 'text-green-600'
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`p-6 bg-gradient-to-br ${stat.bgGradient} border-0 overflow-hidden relative`} hover>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/20 to-transparent rounded-full -mr-16 -mt-16" />
                  <div className="relative z-10 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">{stat.label}</p>
                      <p className="text-4xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`w-14 h-14 rounded-2xl ${stat.iconBg} ${stat.iconColor} flex items-center justify-center shadow-lg`}>
                      <stat.icon size={28} />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Chart */}
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="md:col-span-2"
            >
              <Card className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8 tracking-tight">Sales History (Last 7 Days)</h3>
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
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="md:col-span-1"
            >
              <Card className="p-8">
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
            </motion.div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Link to="/vendor/bags">
                <Card className="p-8 group h-full" hover>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Manage Bags</h3>
                    <motion.div
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ArrowRight className="text-gray-400 group-hover:text-primary-600 transition-colors" size={24} />
                    </motion.div>
                  </div>
                  <p className="text-gray-600 leading-relaxed">Update quantity or add new surprise bags for today.</p>
                </Card>
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Link to="/vendor/orders">
                <Card className="p-8 group h-full" hover>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Incoming Orders</h3>
                    <motion.div
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ArrowRight className="text-gray-400 group-hover:text-primary-600 transition-colors" size={24} />
                    </motion.div>
                  </div>
                  <p className="text-gray-600 leading-relaxed">Check customer pickups and verify confirmation codes.</p>
                </Card>
              </Link>
            </motion.div>
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
              <p className="text-red-700 font-medium">Platform Fees (10%)</p>
              <p className="text-3xl font-bold text-red-900 mt-2">$245.00</p>
            </Card>
            <Card className="p-6 bg-blue-50 border-blue-100">
              <p className="text-blue-700 font-medium">Net Payouts</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">$2,205.00</p>
            </Card>
           </div>

           <Card className="overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
               <h3 className="font-bold text-gray-900">Payout History</h3>
               <Button 
                 variant="outline" 
                 size="sm"
                 onClick={() => {
                   // Generate CSV data
                   const csvContent = [
                     ['Period', 'Gross', 'Fees', 'Net', 'Status'],
                     ...(stats?.payouts || []).map(p => [p.period, p.gross.toFixed(2), p.fees.toFixed(2), p.net.toFixed(2), p.status])
                   ].map(row => row.join(',')).join('\n');
                   
                   // Download CSV
                   const blob = new Blob([csvContent], { type: 'text/csv' });
                   const url = window.URL.createObjectURL(blob);
                   const a = document.createElement('a');
                   a.href = url;
                   a.download = `payout-history-${new Date().toISOString().split('T')[0]}.csv`;
                   a.click();
                   window.URL.revokeObjectURL(url);
                 }}
               >
                 Download CSV
               </Button>
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
    </motion.div>
  );
};

export default VendorDashboard;

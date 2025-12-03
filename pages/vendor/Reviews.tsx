import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card, Badge } from '../../components/UI';
import { Star } from 'lucide-react';

const VendorReviews: React.FC = () => {
  const { user } = useAuth();
  const [sort, setSort] = useState('recent');

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['vendorReviews', user?.id],
    queryFn: () => api.getVendorReviews(user!.id),
    enabled: !!user
  });

  const { data: stats } = useQuery({
    queryKey: ['vendorStats', user?.id],
    queryFn: () => api.getVendorStats(user!.id),
    enabled: !!user
  });

  const sortedReviews = reviews?.sort((a, b) => {
    if (sort === 'recent') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sort === 'highest') return (b.rating || 0) - (a.rating || 0);
    if (sort === 'lowest') return (a.rating || 0) - (b.rating || 0);
    return 0;
  });

  if (isLoading) return <div>Loading reviews...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Customer Reviews</h1>
        <select 
          value={sort} 
          onChange={(e) => setSort(e.target.value)}
          className="border-gray-300 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500 p-2 border"
        >
          <option value="recent">Most Recent</option>
          <option value="highest">Highest Rating</option>
          <option value="lowest">Lowest Rating</option>
        </select>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Summary Card */}
        <Card className="md:col-span-1 p-6 h-fit bg-white">
          <div className="text-center">
            <h2 className="text-5xl font-extrabold text-gray-900">{stats?.avgRating || '-'}</h2>
            <div className="flex justify-center my-2 text-yellow-400">
              {[1,2,3,4,5].map(i => <Star key={i} size={20} fill={i <= (stats?.avgRating || 0) ? "currentColor" : "none"} />)}
            </div>
            <p className="text-gray-500 text-sm">Based on {reviews?.length || 0} reviews</p>
          </div>
          <div className="mt-6 space-y-2">
             {/* Mock distribution bars */}
             {[5,4,3,2,1].map(star => (
               <div key={star} className="flex items-center gap-2 text-xs text-gray-600">
                 <span className="w-3">{star}</span>
                 <Star size={10} className="text-gray-400" />
                 <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                   <div className="bg-yellow-400 h-full" style={{ width: star === 5 ? '70%' : star === 4 ? '20%' : '5%' }}></div>
                 </div>
               </div>
             ))}
          </div>
        </Card>

        {/* Reviews List */}
        <div className="md:col-span-3 space-y-4">
          {sortedReviews?.length === 0 ? (
            <div className="text-gray-500 text-center py-10">No reviews yet.</div>
          ) : (
            sortedReviews?.map(review => (
              <Card key={review.id} className="p-6">
                 <div className="flex justify-between items-start mb-2">
                   <div className="flex items-center gap-2">
                     <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 text-xs">
                       C
                     </div>
                     <div>
                       <p className="text-sm font-bold text-gray-900">Consumer {review.consumerId.substring(0,4)}</p>
                       <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                     </div>
                   </div>
                   <div className="flex text-yellow-400">
                      {[1,2,3,4,5].map(i => <Star key={i} size={14} fill={i <= (review.rating || 0) ? "currentColor" : "none"} />)}
                   </div>
                 </div>
                 <div className="pl-10">
                   <Badge variant="neutral">{review.bagTitle}</Badge>
                   <p className="mt-2 text-gray-700">{review.review || "No written review."}</p>
                 </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorReviews;

import React, { useEffect, useState } from 'react';
import { supabase } from '../api/supabase.js'; 

const StarRating = ({ rating }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200 fill-slate-100'}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
};

export default function ValidReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({ avgRating: '0.0', total: 0, fiveStars: 0, fourStars: 0 });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);

      // 1. Fetch authenticated user to isolate their specific dashboard items
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      if (!user) {
        toast.error("Please log in to view feedback");
        setLoading(false);
        return;
      }

      // 2. Query the 'reviews' table matching the authenticated seller's ID
      const { data, error } = await supabase
        .from('reviews')
        .select('id, product_id, buyer_id, seller_id, rating_score, comment_text, created_at')
        .eq('seller_id', user.id) // Filter so sellers only view their own feedback records
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setReviews(data);
        calculateMetrics(data);
      }
    } catch (err) {
      console.error('Error loading data from reviews table:', err.message);
      toast.error('Failed to load student feedback reviews');
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (dataList) => {
    const total = dataList.length;
    if (total === 0) return;

    const sum = dataList.reduce((acc, item) => acc + (item.rating_score || 0), 0);
    const avg = (sum / total).toFixed(1);

    const fiveCount = dataList.filter(r => r.rating_score === 5).length;
    const fourCount = dataList.filter(r => r.rating_score === 4).length;

    setMetrics({
      avgRating: avg,
      total,
      fiveStars: Math.round((fiveCount / total) * 100),
      fourStars: Math.round((fourCount / total) * 100)
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-3">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-500 font-medium">Fetching feedback database rows...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header section */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Student Feedback</h2>
        <p className="text-sm text-slate-500 mt-1">Monitor your course ratings and active student text reviews.</p>
      </div>

      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Average Rating Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Average Rating</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{metrics.avgRating}</h3>
            <div className="mt-2">
              <StarRating rating={Math.round(parseFloat(metrics.avgRating))} />
            </div>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl text-amber-500">
            <svg className="w-6 h-6 fill-amber-500" viewBox="0 0 24 24">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
        </div>

        {/* Total Reviews Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Feedbacks</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{metrics.total}</h3>
            <p className="text-xs text-slate-400 mt-2">Verified course enrollments</p>
          </div>
          <div className="p-3 bg-slate-100 rounded-xl text-slate-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
          </div>
        </div>

        {/* Breakdown bar simulator */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-center space-y-2.5 shadow-sm">
          <div className="flex items-center text-xs text-slate-500 justify-between">
            <span className="font-medium">5 Stars</span>
            <div className="w-32 bg-slate-100 h-1.5 rounded-full mx-2 overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: `${metrics.fiveStars}%` }}></div>
            </div>
            <span className="font-bold text-slate-700">{metrics.fiveStars}%</span>
          </div>
          <div className="flex items-center text-xs text-slate-500 justify-between">
            <span className="font-medium">4 Stars</span>
            <div className="w-32 bg-slate-100 h-1.5 rounded-full mx-2 overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: `${metrics.fourStars}%` }}></div>
            </div>
            <span className="font-bold text-slate-700">{metrics.fourStars}%</span>
          </div>
        </div>
      </div>

      {/* Reviews feed */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold tracking-wider text-slate-400 uppercase">Recent Responses</h4>
        
        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-white border border-dashed border-slate-200 rounded-xl">
            <p className="text-sm text-slate-400 font-medium">You haven't received any course feedback reviews yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-slate-300 transition duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  
                  {/* User & Rating Meta */}
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-sm text-slate-700">
                      {review.buyer_id ? review.buyer_id.charAt(0).toUpperCase() : 'S'}
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold text-slate-900">Student Ref: {review.buyer_id}</h5>
                      <div className="flex items-center gap-2 mt-0.5">
                        <StarRating rating={review.rating_score} />
                        <span className="text-[11px] text-slate-400 font-medium">Review Item: {review.id}</span>
                      </div>
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="text-xs text-slate-400 font-medium sm:text-right">
                    {review.created_at ? new Date(review.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    }) : 'N/A'}
                  </div>
                </div>

                {/* Review Text Body */}
                <div className="mt-3 pl-0 sm:pl-12">
                  <p className="text-sm text-slate-600 leading-relaxed font-normal italic bg-slate-50/60 p-3 rounded-lg border-l-2 border-blue-600">
                    "{review.comment_text}"
                  </p>
                  
                  {/* Product/Course Tag Badge */}
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono font-medium border border-slate-200">
                      Course Reference ID: {review.product_id}
                    </span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
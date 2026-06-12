import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 max-w-sm w-full">
        <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="text-red-500" size={32} />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Page Unavailable</h1>
        <p className="text-slate-500 text-sm mt-2 mb-6">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <button 
          onClick={() => navigate('/')} 
          className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-slate-800 transition flex items-center justify-center gap-2"
        >
          <ArrowLeft size={18} /> Back to Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;
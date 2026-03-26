import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Clock, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import axios from 'axios';

const ScanHistory = () => {
  const { user } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const userId = user?.email || 'guest';
        const res = await axios.get(`http://localhost:5001/api/scan-history/${userId}`);
        setHistory(res.data);
      } catch (err) {
        console.error("Failed to fetch scan history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center bg-gray-50">
        <div className="flex gap-2 items-center">
          <div className="w-3 h-3 bg-agri-main rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-agri-main rounded-full animate-bounce delay-100"></div>
          <div className="w-3 h-3 bg-agri-main rounded-full animate-bounce delay-200"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8 flex items-center justify-between">
            <div>
               <h2 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                  <Clock className="text-agri-main" size={32} /> Scan History
               </h2>
               <p className="mt-2 text-gray-600">Track your past plant disease diagnosis records.</p>
            </div>
            <div className="hidden sm:block opacity-20">
               <ShieldCheck size={80} className="text-agri-main" />
            </div>
        </div>

        {history.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
             <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <Clock size={40} />
             </div>
             <h3 className="text-xl font-bold text-gray-700">No scan history found</h3>
             <p className="text-gray-500 mt-2">Diagnose a leaf in the Disease Prediction tab and your history will appear here.</p>
          </div>
        ) : (
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
            {history.map((scan, index) => {
              const isHealthy = scan.disease.toLowerCase() === 'healthy';
              return (
                <div key={scan._id || index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  {/* Timeline Badge */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-agri-light text-agri-main shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    {isHealthy ? <CheckCircle size={16} className="text-green-500" /> : <AlertTriangle size={16} className="text-amber-500" />}
                  </div>

                  {/* Content Card */}
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-transform duration-300 hover:-translate-y-1 hover:shadow-md">
                    <div className="flex justify-between items-start mb-2">
                       <h3 className="font-bold text-gray-900 text-lg">{scan.disease}</h3>
                       <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                          {new Date(scan.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                       </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                       <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${isHealthy ? 'bg-green-500' : 'bg-amber-500'}`} style={{ width: `${scan.confidence}%` }}></div>
                       </div>
                       <span className="text-xs font-bold text-gray-500">{scan.confidence.toFixed(1)}% Sure</span>
                    </div>

                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                       {scan.advice}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanHistory;

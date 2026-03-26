import React, { useState } from 'react';
import { MapPin, Truck, TrendingUp, IndianRupee, Loader2, Navigation, AlertCircle, ArrowRight, Star } from 'lucide-react';
import axios from 'axios';

const Logistics = () => {
  const [formData, setFormData] = useState({ crop: '', quantity: '', location: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.crop || !formData.quantity || !formData.location) {
        setError("All fields are required.");
        return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await axios.post('http://localhost:5001/api/logistics', {
        crop: formData.crop,
        quantity: parseInt(formData.quantity),
        location: formData.location
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to calculate arbitrage. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-[#F9FBFA] py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-[#1A2E24] rounded-3xl p-8 sm:p-10 relative overflow-hidden shadow-xl flex flex-col sm:flex-row justify-between items-center gap-6">
          {/* Subtle Background Texture */}
          <div className="absolute inset-0 z-0 opacity-20 mix-blend-overlay pointer-events-none">
            <img src="/images/hero.png" alt="Overlay" className="w-full h-full object-cover" />
          </div>
          
          <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none transform translate-x-10 z-0">
            <Truck size={200} />
          </div>
          <div className="relative z-10 max-w-xl text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 font-bold text-[10px] uppercase tracking-widest mb-3">
              <Star size={12} className="fill-current" /> Super AI Feature
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight mb-3">Smart Mandi Arbitrage</h1>
            <p className="text-green-100 font-medium leading-relaxed">Don't sell blindly. Enter your harvest details, and our Logistics AI will calculate transport costs to mega-markets to find you the highest net profit.</p>
          </div>
          <div className="relative z-10 hidden lg:flex bg-white/10 p-5 border border-white/20 rounded-2xl items-center gap-4 backdrop-blur-sm">
             <div className="bg-agri-main text-white p-3 rounded-xl"><IndianRupee size={24} /></div>
             <div>
               <p className="text-white font-black text-lg">Maximize Profit</p>
               <p className="text-xs text-green-100 mt-0.5">Real-time Route Math</p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Input Form */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl p-6 border border-[#E9F0EC] shadow-sm sticky top-24">
              <h2 className="font-black text-[#1A2E24] text-lg flex items-center gap-2 mb-6">
                <Navigation size={18} className="text-agri-main" /> Calculate Routes
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Crop Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Onion, Tomato"
                    className="w-full px-4 py-3 rounded-xl border-2 border-[#E9F0EC] focus:border-agri-main focus:ring-4 focus:ring-agri-main/10 outline-none transition-all font-medium text-gray-800 placeholder-gray-400 bg-[#F9FBFA]"
                    value={formData.crop}
                    onChange={(e) => setFormData({...formData, crop: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Quantity (Quintals)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 50"
                    className="w-full px-4 py-3 rounded-xl border-2 border-[#E9F0EC] focus:border-agri-main focus:ring-4 focus:ring-agri-main/10 outline-none transition-all font-medium text-gray-800 placeholder-gray-400 bg-[#F9FBFA]"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Current Location</label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Nashik, Maharashtra"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-[#E9F0EC] focus:border-agri-main focus:ring-4 focus:ring-agri-main/10 outline-none transition-all font-medium text-gray-800 placeholder-gray-400 bg-[#F9FBFA]"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1A2E24] hover:bg-agri-main text-white font-bold py-4 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <><Loader2 className="animate-spin" size={18} /> Calculating...</>
                  ) : (
                    <>Find Best Route <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                  )}
                </button>
              </form>

              {error && (
                <div className="mt-6 bg-red-50 text-red-600 border border-red-100 p-4 rounded-2xl flex items-start gap-3">
                  <AlertCircle size={20} className="shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Results Area */}
          <div className="lg:col-span-8">
            {!loading && !result && !error && (
              <div className="h-full min-h-[400px] border-2 border-dashed border-[#E9F0EC] rounded-3xl flex flex-col items-center justify-center p-12 text-center bg-white/50">
                <Truck size={64} className="text-[#E9F0EC] mb-4" />
                <h3 className="text-lg font-black text-gray-400 mb-2">No active route mapped</h3>
                <p className="text-sm text-gray-400 max-w-sm">Enter your harvest parameters to instantly compute inter-district arbitrage algorithms.</p>
              </div>
            )}

            {loading && (
              <div className="h-full min-h-[400px] bg-white rounded-3xl border border-[#E9F0EC] flex flex-col items-center justify-center p-12 text-center shadow-sm">
                <div className="relative w-20 h-20 mb-6">
                  <div className="absolute inset-0 bg-agri-main/20 rounded-full animate-ping"></div>
                  <div className="absolute inset-2 bg-agri-main/40 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-agri-main">
                    <Truck size={32} />
                  </div>
                </div>
                <h3 className="text-xl font-black text-[#1A2E24] mb-2 animate-pulse">Simulating Logistics...</h3>
                <p className="text-gray-500 font-medium">Crunching distances, freight costs, and live APMC rates.</p>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                
                {/* Local Baseline Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#E9F0EC]">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-orange-100 text-orange-600 p-3 rounded-2xl">
                       <MapPin size={24} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Local Baseline Selling</p>
                      <h3 className="text-xl font-black text-[#1A2E24]">{result.local_mandi}</h3>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#F9FBFA] p-5 rounded-2xl border border-[#E9F0EC]">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Local APMC Rate</p>
                      <p className="text-2xl font-black text-[#1A2E24]">₹{result.local_price_per_quintal.toLocaleString()}</p>
                    </div>
                    <div className="bg-[#F9FBFA] p-5 rounded-2xl border border-[#E9F0EC]">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Estimated Net Earnings</p>
                      <p className="text-2xl font-black text-orange-600">₹{result.local_net_profit.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 py-2">
                  <div className="h-px bg-[#E9F0EC] flex-1"></div>
                  <p className="shrink-0 text-xs font-bold text-gray-400 tracking-widest uppercase">Cross-District Arbitrage Options</p>
                  <div className="h-px bg-[#E9F0EC] flex-1"></div>
                </div>

                {/* Destinations */}
                <div className="grid grid-cols-1 gap-6">
                  {result.destinations.map((dest, index) => {
                    const isBest = dest.additional_profit_over_local === Math.max(...result.destinations.map(d => d.additional_profit_over_local));
                    
                    return (
                      <div key={index} className={`relative rounded-3xl p-6 sm:p-8 border-2 transition-all ${isBest ? 'bg-gradient-to-b from-agri-main/5 to-white border-agri-main shadow-lg shadow-agri-main/10' : 'bg-white border-[#E9F0EC] shadow-sm'}`}>
                        {isBest && (
                          <div className="absolute -top-4 right-6 bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-black text-xs uppercase tracking-widest px-4 py-2 rounded-full shadow-md flex items-center gap-1">
                            <Star size={14} className="fill-current" /> Highest Profit Match 
                          </div>
                        )}
                        
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-6 mb-6">
                          <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${isBest ? 'bg-agri-main text-white shadow-md' : 'bg-[#F9FBFA] text-gray-500 border border-[#E9F0EC]'}`}>
                               <TrendingUp size={28} />
                            </div>
                            <div>
                               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{dest.distance_km} KM Transport Range</p>
                               <h4 className="text-2xl font-black text-[#1A2E24]">{dest.mandi}</h4>
                            </div>
                          </div>
                          
                          <div className={`text-right ${isBest ? 'text-agri-main' : 'text-gray-500'}`}>
                             <p className="text-[10px] font-bold uppercase tracking-widest mb-1">Mandi Price Rate</p>
                             <p className="text-2xl font-black">₹{dest.price_per_quintal.toLocaleString()}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                          <div className="bg-[#F9FBFA] rounded-2xl p-4 border border-[#E9F0EC]">
                             <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1"><IndianRupee size={12} /> Gross Revenue</p>
                             <p className="text-lg font-black text-gray-700">₹{dest.gross_revenue.toLocaleString()}</p>
                          </div>
                          <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
                             <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1 flex items-center gap-1"><Truck size={12} /> Truck Freight</p>
                             <p className="text-lg font-black text-red-600">- ₹{dest.transport_cost.toLocaleString()}</p>
                          </div>
                          <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
                             <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1 flex items-center gap-1"><IndianRupee size={12} /> Final Net Profit</p>
                             <p className="text-lg font-black text-green-700">₹{dest.net_profit.toLocaleString()}</p>
                          </div>
                        </div>

                        <div className={`rounded-2xl p-5 border flex flex-col sm:flex-row items-center justify-between gap-4 ${isBest ? 'bg-agri-main text-white border-agri-main' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                          <div>
                            <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isBest ? 'text-green-200' : 'text-gray-500'}`}>Extra Profit Over Local</p>
                            <h4 className="text-3xl font-black">
                               {dest.additional_profit_over_local > 0 ? '+' : ''}₹{dest.additional_profit_over_local.toLocaleString()}
                            </h4>
                          </div>
                          <div className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm ${isBest ? 'bg-white text-agri-main' : 'bg-white border text-gray-600'}`}>
                            {dest.recommendation}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Logistics;

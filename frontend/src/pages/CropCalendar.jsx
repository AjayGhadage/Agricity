import React, { useState } from 'react';
import { Calendar, Search, Sprout, Info, MapPin, ChevronRight } from 'lucide-react';
import axios from 'axios';

const CropCalendar = () => {
  const [crop, setCrop] = useState('');
  const [region, setRegion] = useState('');
  const [calendar, setCalendar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!crop || !region) return;

    setLoading(true);
    setError(null);
    setCalendar(null);

    try {
      const res = await axios.post('http://localhost:5001/api/calendar', { crop, region });
      setCalendar(res.data.calendar);
    } catch (err) {
      console.error("Calendar generation error:", err);
      setError("Failed to generate crop calendar. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const phaseColors = {
    'Preparation': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Sowing': 'bg-green-100 text-green-800 border-green-200',
    'Growing': 'bg-blue-100 text-blue-800 border-blue-200',
    'Harvesting': 'bg-amber-100 text-amber-800 border-amber-200',
    'Storage': 'bg-purple-100 text-purple-800 border-purple-200',
    'Idle': 'bg-gray-100 text-gray-800 border-gray-200'
  };

  return (
    <div className="min-h-[85vh] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="max-w-xl">
               <h2 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                  <Calendar className="text-agri-main" size={32} /> Smart Crop Calendar
               </h2>
               <p className="mt-2 text-gray-600">Generate a localized 12-month farming timeline for any crop and region using AI.</p>
            </div>
            <div className="hidden md:block opacity-20">
               <Sprout size={80} className="text-agri-main" />
            </div>
        </div>

        {/* Input Form */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
           <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Sprout className="h-5 w-5 text-gray-400" />
                 </div>
                 <input 
                    type="text" 
                    placeholder="Enter Crop (e.g. Wheat)" 
                    value={crop}
                    onChange={(e) => setCrop(e.target.value)}
                    required
                    className="block w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-agri-main outline-none transition-all font-medium"
                 />
              </div>
              <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                 </div>
                 <input 
                    type="text" 
                    placeholder="Enter Region (e.g. Pune)" 
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    required
                    className="block w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-agri-main outline-none transition-all font-medium"
                 />
              </div>
              <button
                 type="submit"
                 disabled={loading}
                 className="bg-agri-main text-white py-4 px-8 rounded-2xl font-bold text-lg hover:bg-agri-dark transition-all disabled:opacity-70 flex justify-center items-center shadow-lg shadow-agri-main/20"
              >
                 {loading ? (
                    <div className="flex gap-2">
                       <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                       <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-100"></div>
                       <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-200"></div>
                    </div>
                 ) : (
                    <div className="flex items-center gap-2">
                       <Search size={20} /> Generate Calendar
                    </div>
                 )}
              </button>
           </form>
           {error && <p className="mt-4 text-red-500 text-center font-medium">{error}</p>}
        </div>

        {/* Calendar Grid */}
        {calendar ? (
           <div className="animate-fade-in space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 {calendar.map((item, idx) => (
                    <div key={idx} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center relative overflow-hidden group hover:shadow-md transition-all">
                       <div className={`absolute top-0 right-0 p-1.5 rounded-bl-xl text-[10px] font-bold uppercase tracking-wider border-l border-b ${item.color.split(' ')[0]} ${item.color.split(' ')[1]} border-opacity-20`}>
                          {item.phase}
                       </div>
                       <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-agri-main font-bold mb-4 text-lg">
                          {item.month}
                       </div>
                       <h4 className="font-bold text-gray-900 mb-2">{item.activity}</h4>
                       <div className="mt-auto pt-4 flex items-center text-xs font-semibold text-gray-400 group-hover:text-agri-main transition-colors">
                          Phase Details <ChevronRight size={14} />
                       </div>
                    </div>
                 ))}
              </div>

              {/* Legend & Info */}
              <div className="bg-blue-50 rounded-3xl p-6 border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-6">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-2xl text-blue-600 shadow-sm"><Info size={24} /></div>
                    <div>
                       <h5 className="font-bold text-blue-900 text-lg">AI-Optimized Schedule</h5>
                       <p className="text-blue-700 text-sm">This calendar is generated based on historical weather patterns for {region}.</p>
                    </div>
                 </div>
                 <div className="flex flex-wrap justify-center gap-3">
                    {Object.entries(phaseColors).map(([phase, colors]) => (
                       <span key={phase} className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${colors}`}>
                          {phase}
                       </span>
                    ))}
                 </div>
              </div>
           </div>
        ) : !loading && (
           <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm flex flex-col items-center">
              <div className="w-24 h-24 bg-gray-50 rounded-3xl flex items-center justify-center text-agri-main mb-6 opacity-40">
                 <Calendar size={48} />
              </div>
              <h3 className="text-2xl font-bold text-gray-400">Ready to plan your season?</h3>
              <p className="text-gray-400 max-w-sm mt-2">Enter a crop and your region to generate a scientific farming timeline tailored to your local environment.</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default CropCalendar;

import React, { useState } from 'react';
import { CloudSun, MapPin, Wind, Droplets, Thermometer, ShieldAlert } from 'lucide-react';
import axios from 'axios';

const WeatherAdvisory = () => {
  const [query, setQuery] = useState({ location: '', crop: '' });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAdvisory = async (e) => {
    e.preventDefault();
    if (!query.location) return;

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await axios.get(`http://localhost:5001/api/advisory?location=${query.location}&crop=${query.crop}`);
      
      if (res.data.error) {
         setError(res.data.error);
      } else {
         setData(res.data);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch weather advisory. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-gradient-to-br from-agri-light to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-block p-4 bg-orange-100 rounded-full mb-4">
            <CloudSun size={48} className="text-orange-500" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Hyperlocal Weather Advisory</h2>
          <p className="mt-4 text-lg text-gray-600">Get tailored agricultural advice based on current weather conditions.</p>
        </div>

        {/* Input Form */}
        <div className="glass-panel p-8 max-w-2xl mx-auto animate-float" style={{animationDuration: '5s'}}>
          <form onSubmit={fetchAdvisory} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  required
                  placeholder="e.g., Pune, IN"
                  value={query.location}
                  onChange={(e) => setQuery({ ...query, location: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-agri-main outline-none text-gray-800"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Crop (Optional)</label>
              <div className="relative">
                <ShieldAlert className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="e.g., Wheat"
                  value={query.crop}
                  onChange={(e) => setQuery({ ...query, crop: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-agri-main outline-none text-gray-800"
                />
              </div>
            </div>

            <button
               type="submit"
               disabled={loading}
               className="w-full bg-agri-main text-white py-4 rounded-xl font-bold hover:bg-agri-dark transition shadow-lg flex justify-center items-center h-14 mt-4"
            >
               {loading ? (
                 <div className="flex gap-2 items-center">
                   <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                   <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-100"></div>
                   <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-200"></div>
                 </div>
               ) : 'Get Advisory'}
            </button>
          </form>
        </div>

        {/* Results */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center font-medium max-w-2xl mx-auto border border-red-200">
            {error}
          </div>
        )}

        {data && data.weather && (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 transform transition-all hover:scale-[1.01]">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-400 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold">{data.location}</h3>
                <p className="text-blue-100 mt-1 capitalize">{data.weather.condition}</p>
              </div>
              <CloudSun size={64} className="opacity-90" />
            </div>
            
            <div className="p-6 grid grid-cols-2 gap-6">
               <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                  <div className="p-3 bg-orange-100 text-orange-500 rounded-xl">
                    <Thermometer size={24} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 font-medium">Temperature</div>
                    <div className="text-2xl font-bold text-gray-900">{data.weather.temp}°C</div>
                  </div>
               </div>

               <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                  <div className="p-3 bg-blue-100 text-blue-500 rounded-xl">
                    <Droplets size={24} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 font-medium">Humidity</div>
                    <div className="text-2xl font-bold text-gray-900">{data.weather.humidity}%</div>
                  </div>
               </div>
            </div>

            <div className="px-6 pb-6">
               <div className="bg-green-50 p-6 rounded-2xl border border-green-100 relative overflow-hidden">
                 <div className="absolute -right-4 -bottom-4 opacity-10">
                   <ShieldAlert size={100} className="text-green-600"/>
                 </div>
                 <h4 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                   <ShieldAlert size={20} /> Agricultural Advisory
                 </h4>
                 <p className="text-green-700 leading-relaxed relative z-10 font-medium">
                   {data.advisory}
                   {data.crop && ` Note: Monitor your ${data.crop} closely.`}
                 </p>
               </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default WeatherAdvisory;

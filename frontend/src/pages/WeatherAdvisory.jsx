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

  const formatTime = (timestamp) => {
    if (!timestamp) return '--:--';
    return new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getWeatherIcon = (condition) => {
    if (condition.includes('Rain')) return '🌧️';
    if (condition.includes('Cloud')) return '☁️';
    if (condition.includes('Clear')) return '☀️';
    return '⛅';
  };

  return (
    <div className="min-h-[85vh] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Agricultural Weather Dashboard</h2>
          <p className="mt-4 text-lg text-gray-600">Hyperlocal insights and tailored advisories for your crops.</p>
        </div>

        {/* Input Form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-w-3xl mx-auto">
          <form onSubmit={fetchAdvisory} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                required
                placeholder="Enter Location (e.g., Pune)"
                value={query.location}
                onChange={(e) => setQuery({ ...query, location: e.target.value })}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-agri-main outline-none text-gray-800 font-medium"
              />
            </div>
            
            <div className="flex-1 relative">
              <ShieldAlert className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Crop (e.g., Sugarcane)"
                value={query.crop}
                onChange={(e) => setQuery({ ...query, crop: e.target.value })}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-agri-main outline-none text-gray-800 font-medium"
              />
            </div>

            <button
               type="submit"
               disabled={loading}
               className="bg-agri-main text-white px-8 py-4 rounded-xl font-bold hover:bg-agri-dark transition shadow-md flex justify-center items-center shrink-0"
            >
               {loading ? (
                 <div className="flex gap-2 items-center">
                   <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                   <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-100"></div>
                   <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-200"></div>
                 </div>
               ) : 'Get Forecast'}
            </button>
          </form>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center font-medium max-w-3xl mx-auto border border-red-200">
            {error}
          </div>
        )}

        {/* Dashboard Results */}
        {data && data.weather && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Left Column: Main Weather & Advisory */}
            <div className="lg:col-span-1 space-y-6">
               {/* Main Weather Card */}
               <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between h-[300px]">
                 <div>
                   <h3 className="text-xl font-bold text-gray-800 capitalize mb-1">{data.location}</h3>
                   <span className="text-gray-500 font-medium">Current conditions</span>
                 </div>
                 <div className="flex items-center gap-4 my-6">
                   <span className="text-7xl">{getWeatherIcon(data.weather.condition)}</span>
                   <div>
                     <div className="text-6xl font-extrabold text-gray-900 tracking-tighter">
                       {Math.round(data.weather.temp)}°
                     </div>
                     <div className="text-lg text-gray-600 font-medium mt-1">
                        H:{Math.round(data.weather.tempMax)}° L:{Math.round(data.weather.tempMin)}°
                     </div>
                   </div>
                 </div>
                 <div className="text-xl font-semibold text-agri-main capitalize">
                   {data.weather.condition}
                 </div>
               </div>

               {/* Agricultural Advisory box */}
               <div className="bg-gradient-to-br from-green-50 to-agri-light p-8 rounded-3xl border border-green-100 relative overflow-hidden group">
                 <div className="absolute right-[-20px] bottom-[-20px] opacity-10 transform group-hover:scale-110 transition-transform duration-500">
                   <ShieldAlert size={120} className="text-green-600"/>
                 </div>
                 <h4 className="font-bold text-green-900 mb-4 flex items-center gap-2 text-lg">
                   <ShieldAlert size={24} className="text-agri-main" /> AI Crop Advisory
                 </h4>
                 <p className="text-green-800 leading-relaxed relative z-10 text-lg">
                   {data.advisory}
                 </p>
                 {data.crop && (
                   <p className="mt-4 pt-4 border-t border-green-200 border-opacity-50 text-green-700 font-medium relative z-10">
                     Target Crop: <span className="font-bold capitalize">{data.crop}</span>
                   </p>
                 )}
               </div>
            </div>

            {/* Right Columns: Metrics Grid */}
            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-6">
                {/* Wind Card */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
                  <div className="flex items-center gap-2 text-gray-500 font-semibold text-sm uppercase tracking-wider mb-4">
                    <Wind size={18} /> Wind
                  </div>
                  <div className="flex flex-col items-center flex-1 justify-center">
                    <div className="w-20 h-20 rounded-full border-4 border-gray-50 flex items-center justify-center relative mb-3">
                       <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-1 h-3 bg-blue-500 rounded-full"></div>
                       <Wind size={32} className="text-blue-500 opacity-80" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{data.weather.windSpeed} <span className="text-lg text-gray-500">km/h</span></div>
                  </div>
                </div>

                {/* Visibility Card */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
                  <div className="flex items-center gap-2 text-gray-500 font-semibold text-sm uppercase tracking-wider mb-4">
                    Visibility
                  </div>
                  <div className="flex flex-col items-start justify-end flex-1">
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {data.weather.visibility >= 1000 ? (data.weather.visibility / 1000).toFixed(1) : data.weather.visibility} 
                      <span className="text-lg text-gray-500 ml-1">{data.weather.visibility >= 1000 ? 'km' : 'm'}</span>
                    </div>
                    <div className="text-gray-500 font-medium">{data.weather.visibility >= 5000 ? 'Good condition' : 'Poor visibility'}</div>
                  </div>
                </div>

                {/* Humidity Card */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
                  <div className="flex items-center gap-2 text-gray-500 font-semibold text-sm uppercase tracking-wider mb-4">
                    <Droplets size={18} /> Humidity
                  </div>
                  <div className="flex flex-col items-start justify-end flex-1">
                    <div className="text-4xl font-bold text-gray-900 mb-4">{data.weather.humidity}%</div>
                    {/* Status bar */}
                    <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                       <div className="bg-blue-400 h-2 rounded-full" style={{ width: `${data.weather.humidity}%` }}></div>
                    </div>
                    <div className="text-sm text-gray-500 font-medium">Dew point analysis</div>
                  </div>
                </div>

                {/* Pressure Card */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
                  <div className="flex items-center gap-2 text-gray-500 font-semibold text-sm uppercase tracking-wider mb-4">
                    Pressure
                  </div>
                  <div className="flex flex-col items-start justify-end flex-1">
                    <div className="text-3xl font-bold text-gray-900 mb-1">{data.weather.pressure} <span className="text-lg text-gray-500">mb</span></div>
                    <div className="text-gray-500 font-medium">{data.weather.pressure > 1010 ? 'High pressure' : 'Low pressure'}</div>
                  </div>
                </div>
                
                {/* Sun Hours Card (Takes 2 cols on mobile, 1 on desktop if needed, but grid-cols-3 handles it) */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between sm:col-span-2">
                  <div className="flex items-center gap-2 text-gray-500 font-semibold text-sm uppercase tracking-wider mb-2">
                    <CloudSun size={18} /> Sun Cycle
                  </div>
                  <div className="flex-1 flex flex-col justify-center relative">
                     {/* Arc graphic representation */}
                     <div className="w-full h-24 border-b-2 border-gray-200 relative overflow-hidden mb-4">
                        <div className="absolute bottom-0 left-[10%] right-[10%] h-[200%] border-t-2 border-dashed border-orange-400 rounded-full"></div>
                        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-orange-100 p-2 rounded-full">
                           <CloudSun size={24} className="text-orange-500" />
                        </div>
                     </div>
                     <div className="flex justify-between w-full font-bold text-gray-800">
                        <div>
                          <span className="block text-xl">{formatTime(data.weather.sunrise)}</span>
                          <span className="text-xs text-gray-500 uppercase">Sunrise</span>
                        </div>
                        <div className="text-right">
                          <span className="block text-xl">{formatTime(data.weather.sunset)}</span>
                          <span className="text-xs text-gray-500 uppercase">Sunset</span>
                        </div>
                     </div>
                  </div>
                </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default WeatherAdvisory;

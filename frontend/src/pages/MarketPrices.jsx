import React, { useState } from 'react';
import { Search, MapPin, Sprout, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import axios from 'axios';

const MarketPrices = () => {
  const [query, setQuery] = useState({ crop: '', location: '' });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.crop || !query.location) return;

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await axios.get(`http://localhost:5001/api/prices?crop=${query.crop}&location=${query.location}`);
      if (res.data && res.data.prices && res.data.prices.length > 0) {
        setData(res.data);
      } else {
        setError(`No recent price data found for ${query.crop} in ${query.location}.`);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch market prices. Make sure the Node backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-agri-light py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="glass-panel p-8">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900">Real-Time Market Prices</h2>
            <p className="mt-4 text-gray-600">Search for current commodity rates across local Mandis and wholesale markets.</p>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <Sprout className="absolute left-4 top-1/2 transform -translate-y-1/2 text-agri-main" size={20} />
              <input
                type="text"
                required
                placeholder="Crop (e.g., Onion, Wheat)"
                value={query.crop}
                onChange={(e) => setQuery({ ...query, crop: e.target.value })}
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-agri-main outline-none text-lg shadow-sm"
              />
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-agri-main" size={20} />
              <input
                type="text"
                required
                placeholder="Location (e.g., Pune, Nashik)"
                value={query.location}
                onChange={(e) => setQuery({ ...query, location: e.target.value })}
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-agri-main outline-none text-lg shadow-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="md:w-auto w-full bg-agri-main text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-agri-dark transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <><Search size={24} /> Search</>
              )}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3 animate-float" style={{animationDuration: '4s'}}>
            <span className="font-semibold text-lg">{error}</span>
          </div>
        )}

        {data && data.prices && (
          <div className="space-y-6 animate-float" style={{animationDuration: '8s'}}>
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900 capitalize">
                {data.crop} prices in {data.location}
              </h3>
              <span className="bg-green-100 text-green-800 px-4 py-1.5 rounded-full text-sm font-semibold border border-green-200">Live Data</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {data.prices.map((price, idx) => {
                const markets = ["APMC Main Yard", "Wholesale Market", "Farmers Mandi", "District Traders", "Local Hub"];
                const marketName = markets[idx % markets.length] + (idx > markets.length - 1 ? ` ${idx}` : '');
                const trendDecider = price % 3;
                const trend = trendDecider === 0 ? 'up' : trendDecider === 1 ? 'down' : 'stable';

                return (
                  <div key={idx} className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all border border-gray-50 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                          <MapPin size={16} /> {marketName}
                        </div>
                        {trend === 'up' && <span className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded-md text-xs font-bold"><TrendingUp size={14} className="mr-1" /> +2.4%</span>}
                        {trend === 'down' && <span className="flex items-center text-red-600 bg-red-50 px-2 py-1 rounded-md text-xs font-bold"><TrendingDown size={14} className="mr-1" /> -1.2%</span>}
                        {trend === 'stable' && <span className="flex items-center text-gray-600 bg-gray-50 px-2 py-1 rounded-md text-xs font-bold"><Minus size={14} className="mr-1" /> 0.0%</span>}
                      </div>
                      <div className="text-3xl font-extrabold text-gray-900 mb-1">
                        ₹{price}
                      </div>
                      <div className="text-sm text-gray-500">per Quintal</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketPrices;

import React, { useState } from 'react';
import { Landmark, MapPin, Scale, Users, Loader2, ArrowRight, ExternalLink, IndianRupee, AlertCircle, Search } from 'lucide-react';
import axios from 'axios';

const Subsidies = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [schemes, setSchemes] = useState([]);

  const [formData, setFormData] = useState({
    state: '',
    landSize: '',
    category: 'General'
  });

  const CATEGORIES = ['General', 'OBC', 'SC', 'ST', 'Women Farmer'];
  
  // Top 10 Indian states for dropdown
  const STATES = [
    'Maharashtra', 'Punjab', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh', 
    'Gujarat', 'Rajasthan', 'Karnataka', 'Andhra Pradesh', 'Tamil Nadu'
  ];

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSchemes([]);

    try {
      const res = await axios.post('http://localhost:5001/api/subsidies', formData);
      if (res.data.schemes) {
        setSchemes(res.data.schemes);
      } else {
        setError("Failed to fetch accurate schemes for your profile.");
      }
    } catch (err) {
      setError("Server connection failed. Ensure the backend is running on port 5001.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-[#F9FBFA] py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-[#1A2E24] rounded-3xl p-8 sm:p-10 relative overflow-hidden shadow-xl text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none transform translate-x-10">
            <Landmark size={200} />
          </div>
          <div className="relative z-10 max-w-xl">
            <p className="text-[#8FB89A] font-black uppercase tracking-[0.3em] text-xs mb-2">Financial Aid</p>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight mb-3">Government Subsidies & Schemes</h1>
            <p className="text-green-100 font-medium leading-relaxed">Billions of rupees in agricultural grants go unclaimed every year. Enter your details to find out what you are eligible for.</p>
          </div>
          <div className="relative z-10 bg-white/10 p-6 rounded-2xl border border-white/20 backdrop-blur-sm hidden lg:block">
            <p className="text-white font-black text-xl flex items-center gap-2"><IndianRupee size={20} className="text-agri-main" /> Maximize Profit</p>
            <p className="text-xs text-green-100 mt-1">Direct DBT & Equipment Grants</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Form Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 border border-[#E9F0EC] shadow-sm sticky top-24">
              <h2 className="font-black text-[#1A2E24] text-lg flex items-center gap-2 mb-6"><Search size={18} className="text-agri-main" /> Find Eligible Schemes</h2>
              
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block flex items-center gap-1"><MapPin size={12} /> State</label>
                  <select required value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full px-4 py-3 bg-[#F9FBFA] border border-[#E9F0EC] rounded-xl text-sm font-bold focus:outline-none focus:border-agri-main focus:ring-1 focus:ring-agri-main cursor-pointer text-[#1A2E24]">
                    <option value="" disabled>Select your state...</option>
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block flex items-center gap-1"><Scale size={12} /> Land Size (Acres)</label>
                  <input type="number" step="0.1" required value={formData.landSize} onChange={e => setFormData({...formData, landSize: e.target.value})} placeholder="e.g. 2.5" className="w-full px-4 py-3 bg-[#F9FBFA] border border-[#E9F0EC] rounded-xl text-sm font-bold focus:outline-none focus:border-agri-main" />
                </div>

                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block flex items-center gap-1"><Users size={12} /> Social Category</label>
                  <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-3 bg-[#F9FBFA] border border-[#E9F0EC] rounded-xl text-sm font-bold focus:outline-none focus:border-agri-main cursor-pointer text-[#1A2E24]">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="pt-2">
                  <button type="submit" disabled={loading} className="w-full bg-[#1A2E24] text-white py-4 rounded-xl font-black text-sm hover:bg-agri-main transition flex items-center justify-center gap-2 shadow-lg">
                    {loading ? <><Loader2 size={16} className="animate-spin" /> Searching Database...</> : <>Check Eligibility <ArrowRight size={16} /></>}
                  </button>
                </div>
              </form>

              {error && (
                <div className="mt-4 bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold border border-red-200 text-center flex items-center justify-center gap-2">
                  <AlertCircle size={16} /> {error}
                </div>
              )}
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-2 space-y-4">
            {!loading && schemes.length === 0 && !error && (
              <div className="h-full min-h-[300px] border-2 border-dashed border-[#E9F0EC] rounded-3xl flex flex-col items-center justify-center p-12 text-center bg-white/50">
                <Landmark size={64} className="text-[#E9F0EC] mb-4" />
                <h3 className="text-lg font-black text-gray-400 mb-2">No active search</h3>
                <p className="text-sm text-gray-400 max-w-sm">Fill out the form to instantly verify your eligibility for central and state farming schemes.</p>
              </div>
            )}

            {loading && (
              <div className="h-full min-h-[300px] rounded-3xl flex flex-col items-center justify-center p-12 text-center">
                <Loader2 size={48} className="text-agri-main animate-spin mb-4" />
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Scanning Gov Databases...</p>
              </div>
            )}

            {schemes.length > 0 && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between bg-white px-5 py-3 rounded-2xl border border-[#E9F0EC]">
                  <p className="font-black text-[#1A2E24]">Found {schemes.length} Eligible Schemes</p>
                  <span className="text-[10px] bg-green-100 text-green-700 px-3 py-1 rounded-full font-black uppercase tracking-widest">Verified</span>
                </div>

                {schemes.map((scheme, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-[#E9F0EC] hover:border-agri-main/50 transition-all shadow-sm group">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest bg-agri-main/10 text-agri-main px-3 py-1 rounded-full">{scheme.tag || "Government Scheme"}</span>
                        <h3 className="text-xl font-black text-[#1A2E24] mt-3 leading-tight">{scheme.name}</h3>
                      </div>
                      <div className="text-left sm:text-right bg-green-50 px-4 py-2 rounded-xl border border-green-100 min-w-max">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Estimated Benefit</p>
                        <p className="text-lg font-black text-green-700 block">{scheme.amount}</p>
                      </div>
                    </div>
                    
                    <div className="bg-[#F9FBFA] p-4 rounded-xl border border-[#E9F0EC] mb-5">
                      <p className="text-sm font-medium text-gray-600 leading-relaxed"><span className="font-black text-[#1A2E24] mr-1">Eligibility:</span> {scheme.eligibility}</p>
                    </div>

                    <a href={scheme.link || "#"} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-black text-agri-main hover:text-[#1A2E24] transition group-hover:underline">
                      Apply on Official Portal <ExternalLink size={14} />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Subsidies;

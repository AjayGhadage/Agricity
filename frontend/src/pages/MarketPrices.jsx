import React, { useState, useEffect } from 'react';
import { Search, MapPin, Sprout, TrendingUp, TrendingDown, Minus, BrainCircuit, Navigation, Phone, ArrowLeftRight, Filter, Building2, Store, UserCheck, Volume2, Calendar, CloudSun, Zap } from 'lucide-react';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const MarketPrices = () => {
  const [query, setQuery] = useState({ crop: '', location: '', compareLocation: '' });
  const [data, setData] = useState(null);
  const [compareData, setCompareData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isComparing, setIsComparing] = useState(false);
  const [filter, setFilter] = useState('All');
  const [speaking, setSpeaking] = useState(false);

  // Stop speech if navigating away
  useEffect(() => {
    return () => window.speechSynthesis.cancel();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.crop || !query.location) return;

    setLoading(true);
    setError(null);
    setData(null);
    setCompareData(null);
    setFilter('All');
    window.speechSynthesis.cancel();
    setSpeaking(false);

    try {
      const res = await axios.get(`http://localhost:5001/api/prices?crop=${query.crop}&location=${query.location}`);
      if (res.data && res.data.final_estimate > 0) {
        setData(res.data);
        console.log(`[DEBUG] Marketplace Data Loaded: ${res.data.buyer_list?.length} partners received.`);

        
        if (isComparing && query.compareLocation) {
          try {
            const compRes = await axios.get(`http://localhost:5001/api/prices?crop=${query.crop}&location=${query.compareLocation}`);
            if (compRes.data && compRes.data.final_estimate > 0) {
              setCompareData(compRes.data);
            }
          } catch (compErr) {
            console.error("Comparison fetch failed", compErr);
          }
        }
      } else {
        setError(`No reliable price data found for ${query.crop} in ${query.location}.`);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch market prices. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = () => {
     if (speaking) {
        window.speechSynthesis.cancel();
        setSpeaking(false);
        return;
     }

     const text = `Market Report for ${data.crop} in ${data.location}. Price ₹${data.final_estimate}. Analysis: ${data.ai_insight}. Weather Alert: ${data.weather_impact}. Seasonal peak is usually in ${data.seasonality?.peak_months?.join(' and ')}.`;
     const utterance = new SpeechSynthesisUtterance(text);
     utterance.onend = () => setSpeaking(false);
     setSpeaking(true);
     window.speechSynthesis.speak(utterance);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl shadow-2xl border border-gray-100">
          <p className="font-bold text-gray-800 text-xs uppercase tracking-tighter">{label}</p>
          <p className="text-agri-main font-black text-lg">
            ₹{payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  const filteredBuyers = data?.buyer_list?.filter(buyer => {
    const type = (buyer.type || '').toLowerCase();
    const name = (buyer.name || '').toLowerCase();
    const isMandi = type.includes('mandi') || type.includes('market') || type.includes('apmc') || name.includes('apmc') || name.includes('mandi');
    
    if (filter === 'All') return true;
    if (filter === 'Mandis') return isMandi;
    if (filter === 'Direct') return !isMandi;
    return true;
  }) || [];

  return (
    <div className="min-h-screen bg-[#F9FBFA] py-4 sm:py-10 px-3 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-10">
        
        {/* Header & Search */}
        <div className="bg-white rounded-[1.8rem] sm:rounded-[3rem] p-5 sm:p-12 shadow-sm border border-[#E9F0EC] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-agri-main/[0.03] rounded-bl-full -mr-12 -mt-12"></div>
          
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-14 relative z-10">
            <h2 className="text-3xl sm:text-6xl font-black text-[#1A2E24] tracking-tight leading-none">Market Intelligence</h2>
            <p className="mt-4 text-xs sm:text-lg text-gray-500 font-medium max-w-lg mx-auto leading-relaxed">Advanced AI-driven tools to bypass middlemen and maximize your agricultural profits.</p>
          </div>

          <form onSubmit={handleSearch} className="space-y-6 relative z-10">
             <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 max-w-5xl mx-auto">
                <div className="flex-1 relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-agri-main"><Sprout size={20} /></div>
                  <input
                    type="text"
                    required
                    placeholder="Crop (e.g., Onion)"
                    value={query.crop}
                    onChange={(e) => setQuery({ ...query, crop: e.target.value })}
                    className="w-full pl-14 pr-4 py-4 sm:py-5 bg-[#FDFEFE] border border-[#E9F0EC] rounded-[1.2rem] sm:rounded-[1.5rem] focus:ring-4 focus:ring-agri-main/5 focus:border-agri-main outline-none text-[#1A2E24] font-black text-sm sm:text-base placeholder:font-medium placeholder:text-gray-300 transition-all"
                  />
                </div>
                <div className="flex-1 relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-agri-main"><MapPin size={20} /></div>
                  <input
                    type="text"
                    required
                    placeholder="Location (e.g., Satara)"
                    value={query.location}
                    onChange={(e) => setQuery({ ...query, location: e.target.value })}
                    className="w-full pl-14 pr-4 py-4 sm:py-5 bg-[#FDFEFE] border border-[#E9F0EC] rounded-[1.2rem] sm:rounded-[1.5rem] focus:ring-4 focus:ring-agri-main/5 focus:border-agri-main outline-none text-[#1A2E24] font-black text-sm sm:text-base placeholder:font-medium placeholder:text-gray-300 transition-all"
                  />
                </div>
                
                {isComparing && (
                   <div className="flex-1 relative animate-in zoom-in-95 duration-200 group">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-500"><ArrowLeftRight size={20} /></div>
                      <input
                        type="text"
                        required
                        placeholder="Compare City"
                        value={query.compareLocation}
                        onChange={(e) => setQuery({ ...query, compareLocation: e.target.value })}
                        className="w-full pl-14 pr-4 py-4 sm:py-5 bg-blue-50/30 border border-blue-100 rounded-[1.2rem] sm:rounded-[1.5rem] focus:ring-4 focus:ring-blue-400/5 focus:border-blue-400 outline-none text-gray-800 font-black text-sm sm:text-base placeholder:font-medium transition-all"
                      />
                   </div>
                )}

                 <button
                   type="submit"
                   disabled={loading}
                   className="bg-agri-main text-white px-10 py-4 sm:py-5 rounded-[1.2rem] sm:rounded-[1.5rem] font-black hover:bg-agri-dark transition-all shadow-xl shadow-agri-main/20 flex justify-center items-center shrink-0 w-full lg:w-auto active:scale-95"
                >
                   {loading ? (
                     <div className="flex flex-col items-center gap-2">
                       <div className="flex gap-2">
                          <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
                          <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-100"></span>
                          <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-200"></span>
                       </div>
                       <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Scanning 12 Hubs</span>
                     </div>
                   ) : (
                    <><Search size={22} className="mr-2" /> {isComparing ? 'Compare' : 'Analyze'}</>
                   )}
                </button>
             </div>
             
             <div className="flex justify-center">
                <button 
                  type="button"
                  onClick={() => setIsComparing(!isComparing)}
                  className={`text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 px-8 py-3 rounded-full transition-all border-2 ${isComparing ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-100 text-gray-400 hover:text-agri-main hover:border-agri-main'}`}
                >
                   <ArrowLeftRight size={14} /> {isComparing ? 'Standard Mode' : 'Market Comparison'}
                </button>
             </div>
          </form>
        </div>

        {error && (
          <div className="bg-white p-6 sm:p-10 rounded-[2rem] text-center border-t-4 border-t-red-500 shadow-2xl animate-in slide-in-from-top-4 duration-500 max-w-xl mx-auto">
             <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 font-black text-xl">!</div>
             <p className="text-gray-800 font-black text-sm sm:text-base leading-tight">{error}</p>
             <button onClick={() => setError(null)} className="mt-5 text-[10px] font-black text-red-500 uppercase tracking-widest px-8 py-2.5 bg-red-50 rounded-full">Try Again</button>
          </div>
        )}

        {/* Comparison Result Card */}
        {data && compareData && (
           <div className="bg-gradient-to-br from-agri-main via-agri-dark to-[#0F172A] p-1 sm:p-1.5 rounded-[2.5rem] sm:rounded-[3.5rem] shadow-2xl animate-in zoom-in-95 duration-500">
              <div className="bg-white rounded-[2.3rem] sm:rounded-[3.3rem] p-6 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-14 text-center">
                 <div className="flex-1 w-full order-1">
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-4 block truncate">{query.location} Market</span>
                    <h3 className="text-5xl sm:text-7xl font-black text-agri-main tracking-tighter flex items-center justify-center gap-1">
                       <span className="text-2xl sm:text-3xl font-bold opacity-30 mt-2">₹</span>{data.final_estimate}
                    </h3>
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-[9px] font-black uppercase tracking-widest">Trend: {data.predicted_trend}</div>
                 </div>
                 
                 <div className="flex flex-col items-center shrink-0 order-2 lg:order-2">
                    <div className="bg-[#F8FAFC] p-7 sm:p-9 rounded-full text-gray-200 border border-[#E2E8F0] shadow-inner mb-2 group-hover:rotate-180 transition-transform duration-700">
                       <ArrowLeftRight size={32} className="sm:w-10 sm:h-10 text-gray-300" />
                    </div>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Price Gap</span>
                 </div>

                 <div className="flex-1 w-full order-3 lg:order-3">
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-4 block truncate">{query.compareLocation} Market</span>
                    <h3 className="text-5xl sm:text-7xl font-black text-blue-600 tracking-tighter flex items-center justify-center gap-1">
                       <span className="text-2xl sm:text-3xl font-bold opacity-30 mt-2">₹</span>{compareData.final_estimate}
                    </h3>
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest">Trend: {compareData.predicted_trend}</div>
                 </div>

                 <div className="w-full lg:w-[280px] bg-[#F8FAFC] px-8 py-10 rounded-[2.5rem] border border-[#E2E8F0] self-stretch flex flex-col justify-center order-4 shadow-inner">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Profit Variation</p>
                    <p className={`text-4xl sm:text-6xl font-black tracking-tighter ${data.final_estimate >= compareData.final_estimate ? 'text-agri-main' : 'text-blue-600'}`}>
                       ₹{Math.abs(data.final_estimate - compareData.final_estimate)}
                    </p>
                    <div className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-[#E2E8F0] rounded-2xl text-[10px] font-black uppercase text-gray-500 shadow-sm mx-auto">
                       Best: <span className={`ml-1 ${data.final_estimate >= compareData.final_estimate ? 'text-agri-main' : 'text-blue-600'}`}>{data.final_estimate >= compareData.final_estimate ? data.location : compareData.location}</span>
                    </div>
                 </div>
              </div>
           </div>
        )}

        {data && (
          <div className="space-y-6 sm:space-y-10 animate-in fade-in duration-700">
            {/* Top Row: Prices & AI Insight */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-10">
               
               {/* Current Price Card */}
               <div className="bg-white p-8 sm:p-12 rounded-[2rem] sm:rounded-[3rem] shadow-sm border border-[#E9F0EC] flex flex-col justify-center text-center items-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-agri-main/[0.02] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-agri-main/5 rounded-bl-full translate-x-8 -translate-y-8"></div>
                  
                  <h3 className="text-3xl font-black text-[#1A2E24] capitalize tracking-tight mb-3">{data.crop}</h3>
                  <div className="flex items-center gap-1.5 px-4 py-1.5 bg-[#F9FBFA] border border-[#E9F0EC] rounded-full mb-8 shadow-sm">
                     <MapPin size={14} className="text-agri-main" />
                     <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">{data.location}</span>
                  </div>

                  <div className="flex items-center justify-center gap-6 relative px-4">
                     <div className="text-7xl sm:text-9xl font-black text-[#1A2E24] tracking-tighter shrink-0 border-b-8 border-agri-main/10 pb-2">
                       <span className="text-3xl sm:text-4xl font-black opacity-20 mr-1 align-top mt-5 inline-block">₹</span>{data.final_estimate}
                     </div>
                     <div className={`p-5 rounded-3xl shrink-0 shadow-2xl relative ${
                        data.predicted_trend === 'up' ? 'bg-green-500 text-white shadow-green-500/30' : 
                        (data.predicted_trend === 'down' ? 'bg-red-500 text-white shadow-red-500/30' : 'bg-blue-500 text-white shadow-blue-500/30')
                     }`}>
                        {data.predicted_trend === 'up' && <TrendingUp size={36} />}
                        {data.predicted_trend === 'down' && <TrendingDown size={36} />}
                        {data.predicted_trend === 'stable' && <Minus size={36} />}
                     </div>
                  </div>
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] mt-10">Real-time Avg Index</span>
               </div>

               {/* AI Insight Box */}
               <div className="lg:col-span-2 bg-white p-7 sm:p-14 rounded-[2rem] sm:rounded-[3rem] border border-[#E9F0EC] shadow-sm relative overflow-hidden group">
                  <div className="absolute -right-24 -bottom-24 opacity-[0.04] grayscale scale-125 transform rotate-12 group-hover:scale-150 transition-transform duration-1000">
                    <BrainCircuit size={400} className="text-agri-main"/>
                  </div>
                  
                  <div className="flex items-center justify-between mb-10 relative z-10">
                     <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-[1.8rem] flex items-center justify-center shadow-sm border border-indigo-100">
                           <BrainCircuit size={36} />
                        </div>
                        <div>
                           <h4 className="font-black text-[#1A2E24] text-2xl sm:text-3xl tracking-tight leading-none">Market Strategy</h4>
                           <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mt-2.5">AI Analysis Hub</p>
                        </div>
                     </div>
                     <button
                        onClick={handleSpeak}
                        className={`w-16 h-16 rounded-full transition-all flex items-center justify-center shadow-xl border ${speaking ? 'bg-red-500 border-red-400 text-white animate-pulse' : 'bg-white border-gray-100 text-gray-400 hover:text-agri-main hover:border-agri-main'}`}
                     >
                        {speaking ? <Minus size={22} /> : <Volume2 size={26} />}
                     </button>
                  </div>
                  
                  <div className="relative z-10 space-y-10">
                     <div className="relative">
                        <div className="absolute -left-7 top-0 bottom-0 w-2 bg-indigo-500 rounded-full group-hover:bg-agri-main transition-colors"></div>
                        <p className="text-gray-700 leading-tight text-xl sm:text-3xl font-black pl-5 italic tracking-tight">
                          "{data.ai_insight}"
                        </p>
                     </div>

                     {data.weather_impact && (
                        <div className="bg-[#FDFEFE] border border-[#E9F0EC] p-6 rounded-[1.5rem] flex items-start gap-4 shadow-sm animate-in fade-in slide-in-from-left-4 duration-500">
                           <div className="p-3 bg-amber-50 rounded-2xl text-amber-600 shadow-sm"><CloudSun size={24} /></div>
                           <div>
                              <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-1 block">Weather & Market Flow</span>
                              <p className="text-sm font-bold text-gray-600 leading-tight">{data.weather_impact}</p>
                           </div>
                        </div>
                     )}
                     
                     <div className="pt-10 border-t border-[#F8FBFA] flex flex-wrap justify-between items-center gap-8">
                        <div>
                           <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-3 block">Optimal Farmer Action</span>
                           <strong className={`text-xl sm:text-2xl font-black uppercase tracking-[0.15em] ${data.predicted_trend === 'up' ? 'text-green-600' : (data.predicted_trend === 'down' ? 'text-red-600' : 'text-blue-600')}`}>
                              {data.predicted_trend === 'up' ? '🚀 SELL NOW' : (data.predicted_trend === 'down' ? '🛡️ HOLD STOCK' : '⚖️ WAIT & WATCH')}
                           </strong>
                        </div>
                        
                        <div className="flex gap-4 w-full sm:w-auto">
                           <button 
                              onClick={() => {
                                 const text = `*AgriTech Market Report*\n🌾 Crop: ${data.crop}\n📍 Location: ${data.location}\n💰 Price: ₹${data.final_estimate}/Quintal\n📈 Trend: ${data.predicted_trend.toUpperCase()}\n\n_Generated by AgriTech AI_`;
                                 window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                              }}
                              className="bg-[#25D366] text-white px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-xl shadow-[#25D366]/20 flex-1 sm:flex-none"
                           >
                              Broadcast
                           </button>
                           <div className="hidden sm:flex px-6 items-center bg-[#F9FBFA] rounded-2xl text-[10px] font-black text-gray-300 uppercase tracking-widest border border-[#E9F0EC]">
                              Reliability: {data.source?.split(' ')[0] || 'AI'}
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Price Stability & Trend Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-10">
                <div className="lg:col-span-1 flex flex-col gap-6 sm:gap-10">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-[#E9F0EC] flex-1 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:scale-125 transition-transform duration-700 text-green-500"><TrendingUp size={100} /></div>
                        <div className="text-[9px] text-gray-400 font-black uppercase tracking-[0.3em] mb-3">52-Week Peak</div>
                        <div className="text-5xl sm:text-6xl font-black text-green-600 tracking-tighter">₹{data.max_price}</div>
                        <p className="text-xs font-bold text-gray-400 mt-2 italic">Premium "A-Grade" Lots</p>
                        <div className="w-full bg-[#F9FBFA] h-3.5 rounded-full mt-10 overflow-hidden shadow-inner border border-[#E9F0EC]"><div className="bg-green-400 h-full w-full shadow-lg shadow-green-500/20"></div></div>
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-[#E9F0EC] flex-1 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:scale-125 transition-transform duration-700 text-red-500"><TrendingDown size={100} /></div>
                        <div className="text-[9px] text-gray-400 font-black uppercase tracking-[0.3em] mb-3">Historical Floor</div>
                        <div className="text-5xl sm:text-6xl font-black text-red-500 tracking-tighter">₹{data.min_price}</div>
                        <p className="text-xs font-bold text-gray-400 mt-2 italic">Average Bulk Auction</p>
                        <div className="w-full bg-[#F9FBFA] h-3.5 rounded-full mt-10 overflow-hidden shadow-inner border border-[#E9F0EC]"><div className="bg-red-400 h-full w-[40%] shadow-lg shadow-red-500/20"></div></div>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white p-8 sm:p-12 rounded-[2.5rem] sm:rounded-[3rem] shadow-sm border border-[#E9F0EC] flex flex-col relative overflow-hidden">
                    <div className="flex justify-between items-center mb-10 pb-6 border-b border-[#F9FBFA]">
                       <h4 className="font-black text-[#1A2E24] uppercase text-[11px] tracking-[0.4em] flex items-center gap-3">
                          <Zap size={18} className="text-agri-main" /> Price Volatility Index
                       </h4>
                       <span className="text-[9px] font-black text-agri-main bg-agri-light/50 px-6 py-2.5 rounded-3xl uppercase tracking-widest border border-agri-main/10 shadow-sm">Updated Final Node</span>
                    </div>
                    <div className="flex-1 w-full min-h-[320px] sm:min-h-[380px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={data.trend_data || []} margin={{ top: 10, right: 30, bottom: 20, left: 10 }}>
                            <CartesianGrid strokeDasharray="10 10" vertical={false} stroke="#F8FAFC" />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 11, fontWeight: 900}} dy={20} />
                            <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 11, fontWeight: 900}} dx={-15} tickFormatter={(val) => `₹${val}`} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="stepAfter" dataKey="price" stroke="#16a34a" strokeWidth={6} dot={{r: 8, strokeWidth: 5, fill: '#fff', stroke: '#16a34a'}} activeDot={{r: 12, strokeWidth: 0, fill: '#16a34a'}} />
                          </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Seasonality Data Insight */}
            {data.seasonality && (
               <div className="bg-gray-900 px-7 py-10 sm:p-14 rounded-[2.5rem] sm:rounded-[3.5rem] text-white overflow-hidden relative shadow-2xl group">
                  <div className="absolute inset-0 bg-gradient-to-r from-agri-main/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 grid grid-cols-1 lg:grid-cols-4 gap-12 items-center">
                     <div className="lg:col-span-1 flex items-center gap-6">
                        <div className="w-20 h-20 bg-white/5 rounded-[2.2rem] border border-white/10 backdrop-blur-3xl shadow-2xl flex items-center justify-center">
                           <Calendar size={44} className="text-agri-main" />
                        </div>
                        <div>
                           <h4 className="text-2xl sm:text-3xl font-black tracking-tighter leading-none">Seasonality</h4>
                           <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mt-3">Smart Timing Hub</p>
                        </div>
                     </div>
                     
                     <div className="lg:col-span-1 flex flex-col gap-4">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-1">Peak Dividend Months</p>
                        <div className="flex flex-wrap gap-3">
                           {data.seasonality.peak_months?.map(m => (
                              <span key={m} className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-[1.2rem] text-[11px] font-black uppercase tracking-widest text-[#E9F0EC] group-hover:bg-agri-main/20 group-hover:border-agri-main/20 transition-all">{m}</span>
                           ))}
                        </div>
                     </div>

                     <div className="lg:col-span-2 bg-white/5 border border-white/10 p-8 sm:p-10 rounded-[2.2rem] backdrop-blur-3xl relative overflow-hidden group-hover:border-white/20 transition-all">
                        <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-agri-main"></div>
                        <p className="text-gray-300 text-lg sm:text-xl font-medium leading-relaxed italic relative z-10">
                           <span className="text-agri-main font-black not-italic block text-[10px] uppercase tracking-[0.5em] mb-4">Historical Advice Node</span>
                           "{data.seasonality.advice}"
                        </p>
                     </div>
                  </div>
               </div>
            )}

            {/* Bottom Row: Local Buyers Directory Expanded */}
            {data.buyer_list && data.buyer_list.length > 0 && (
              <div className="bg-white p-6 sm:p-16 rounded-[3rem] sm:rounded-[4rem] shadow-sm border border-[#E9F0EC]">
                  <div className="flex flex-col xl:flex-row justify-between items-center gap-10 mb-14 pb-10 border-b border-[#F9FBFA]">
                     <div className="text-center xl:text-left">
                        <h4 className="text-4xl sm:text-5xl font-black text-[#1A2E24] tracking-tighter leading-none">Selling Marketplace</h4>
                        <p className="text-sm sm:text-lg font-medium text-gray-400 mt-4 leading-relaxed max-w-xl">
                           Direct point-of-sale directory in <span className="text-agri-main font-black">{data.location}</span>. 
                           <span className="ml-2 inline-flex items-center px-3 py-1 bg-agri-main/10 text-agri-main rounded-full text-[10px] font-black uppercase tracking-widest">
                              Showing {filteredBuyers.length} Partners
                           </span>
                        </p>
                     </div>
                     
                     <div className="flex bg-[#F9FBFA] p-2 rounded-[2rem] gap-3 border border-[#E9F0EC] shadow-inner w-full xl:w-auto overflow-x-auto no-scrollbar">
                        {['All', 'Mandis', 'Direct'].map((t) => (
                           <button
                              key={t}
                              onClick={() => setFilter(t)}
                              className={`flex-1 xl:flex-none px-10 py-4 rounded-[1.8rem] text-[10px] font-black uppercase tracking-[0.25em] transition-all whitespace-nowrap shadow-sm ${filter === t ? 'bg-white text-agri-main shadow-xl ring-1 ring-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                           >
                              {t === 'Mandis' ? 'APMC Hubs' : (t === 'Direct' ? 'Direct Traders' : 'All Partners')}
                           </button>
                        ))}
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-14">
                    {filteredBuyers.length > 0 ? filteredBuyers.map((buyer, idx) => (
                      <div key={idx} className="bg-white p-9 rounded-[2.8rem] border border-[#F1F5F9] flex flex-col justify-between shadow-sm hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-4 group overflow-hidden relative">
                         <div className="absolute inset-0 bg-agri-main/[0.01] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                         
                         {/* Header: Price & Priority */}
                         <div className="absolute top-0 left-0 right-0 flex justify-between z-10">
                            <div className="px-7 py-3.5 bg-[#1A2E24] text-white text-[13px] font-black rounded-br-[2rem] shadow-xl border-r-4 border-b-4 border-agri-main flex flex-col items-center leading-none">
                               <span className="text-[8px] uppercase tracking-widest text-agri-main mb-1">Offer Price</span>
                               ₹{buyer.estimated_price || data.final_estimate}
                            </div>
                            <div className={`px-7 py-3.5 text-[9px] font-black uppercase tracking-[0.3em] rounded-bl-[2rem] shadow-sm flex items-center justify-center ${
                               buyer.priority === 'High' ? 'bg-green-500 text-white' : 
                               (buyer.priority === 'Medium' ? 'bg-blue-500 text-white' : 'bg-gray-400 text-white')
                            }`}>
                               {buyer.priority}
                            </div>
                         </div>

                         <div className="mt-12">
                            <div className="flex items-center gap-5 mb-8">
                               <div className={`w-20 h-20 rounded-[2.2rem] flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:rotate-6 bg-white border ${
                                  (buyer.type || '').toLowerCase().includes('mandi') || (buyer.name || '').toLowerCase().includes('apmc') ? 'text-orange-500 border-orange-50 shadow-orange-500/5' : 
                                  'text-agri-main border-agri-light shadow-agri-main/5'
                               }`}>
                                  {(buyer.type || '').toLowerCase().includes('mandi') || (buyer.name || '').toLowerCase().includes('apmc') ? <Building2 size={36} /> : <UserCheck size={36} />}
                               </div>
                               <div className="overflow-hidden">
                                  <span className="text-[10px] font-black px-4 py-1.5 rounded-2xl bg-[#F9FBFA] text-gray-400 uppercase tracking-widest border border-[#E9F0EC] mb-2 inline-block shadow-sm">
                                     {buyer.distance || 'Nearby Hub'}
                                  </span>
                                  <h5 className="font-black text-[#1A2E24] text-xl sm:text-2xl uppercase tracking-tighter mt-1 line-clamp-2 leading-tight min-h-[3rem] sm:min-h-[3.5rem]">{buyer.name}</h5>
                               </div>
                            </div>
                            
                            <div className="space-y-4">
                               <div className="flex items-center gap-3 px-4 py-3 bg-[#F9FBFA] rounded-2xl border border-[#E9F0EC]">
                                  <MapPin size={18} className="text-agri-main shrink-0" />
                                  <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest truncate">{buyer.address || data.location}</p>
                               </div>
                               <div className="flex items-center gap-3 px-4 py-3 bg-[#F9FBFA] rounded-2xl border border-[#E9F0EC]">
                                  <Store size={18} className="text-indigo-400 shrink-0" />
                                  <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest truncate">{buyer.type || 'Verified Entity'}</p>
                               </div>
                            </div>
                         </div>

                         <div className="space-y-4 mt-10 pt-10 border-t border-[#F1F5F9] relative z-10">
                            <a href={`tel:${buyer.contact}`} className="w-full flex items-center justify-center gap-4 bg-[#F8FAFC] border-2 border-transparent text-[#475569] py-5 rounded-[1.8rem] font-black uppercase text-[11px] tracking-[0.2em] hover:bg-white hover:border-green-200 transition-all hover:text-green-600 shadow-sm active:scale-95 group/btn">
                               <Phone size={20} className="group-hover/btn:scale-110 transition-transform" /> {buyer.contact || 'Direct Dial'}
                            </a>
                            <a 
                               href={`https://www.bing.com/maps?q=${encodeURIComponent((buyer.name + ' ' + (buyer.address || '') + ' ' + data.location).replace(/[^a-zA-Z0-9 ]/g, ''))}`} 
                               target="_blank" 
                               rel="noopener noreferrer" 
                               className="w-full flex items-center justify-center gap-4 bg-agri-main text-white py-5 rounded-[1.8rem] font-black uppercase text-[11px] tracking-[0.2em] hover:bg-agri-dark transition-all shadow-2xl shadow-agri-main/30 hover:scale-[1.02] active:scale-95 group/btn"
                            >
                               <Navigation size={20} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" /> Start Navigation
                            </a>
                            <a 
                               href={`https://www.google.com/search?q=${encodeURIComponent(buyer.name + ' ' + data.location + ' location')}`} 
                               target="_blank" 
                               rel="noopener noreferrer" 
                               className="text-[9px] font-black text-gray-300 uppercase tracking-widest hover:text-agri-main transition-colors text-center block"
                            >
                               Search on Google
                            </a>
                         </div>
                      </div>
                    )) : (
                       <div className="col-span-full py-40 text-center bg-[#F9FBFA] rounded-[4rem] border-4 border-dashed border-[#E9F0EC] relative overflow-hidden group">
                          <Filter size={80} className="mx-auto text-[#E2E8F0] mb-8 group-hover:rotate-12 transition-transform duration-700" />
                          <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-2xl">Empty Knowledge Node</p>
                          <p className="text-gray-400 text-sm mt-4 font-bold max-w-sm mx-auto leading-relaxed">No <span className="text-agri-main font-black">{filter}</span> detected for this logic hub. Try expanding your search node.</p>
                          <button onClick={() => setFilter('All')} className="mt-10 text-[11px] font-black text-agri-main underline uppercase tracking-[0.4em] hover:opacity-60 transition-opacity">Sync to All Nodes</button>
                       </div>
                    )}
                  </div>
              </div>
            )}

          </div>
        )}

      </div>
      
      {/* Footer Mobile Fix */}
      <div className="mt-16 text-center pb-8 opacity-20 pointer-events-none">
         <p className="text-[10px] font-black text-gray-500 uppercase tracking-[1em]">AgriTech AI Ecosystem</p>
      </div>
    </div>
  );
};

export default MarketPrices;

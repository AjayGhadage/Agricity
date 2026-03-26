import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { UserCircle, Calendar, Target, ShieldCheck, BadgeIndianRupee, TrendingUp, Sparkles, Leaf, MapPin, Truck, AlertTriangle } from 'lucide-react';
import ScanHistory from './ScanHistory';
import axios from 'axios';

const UserProfile = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('management');
  
  // Groq Timeline State
  const [crop, setCrop] = useState('');
  const [sowDate, setSowDate] = useState('');
  const [timeline, setTimeline] = useState(null);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  // Mock Financial Ledger Data
  const financialHistory = [
    { season: 'Rabi 2025', crop: 'Onion', area: '5 Acres', cost: '₹65,000', revenue: '₹4,10,000', profit: '+ ₹3,45,000', status: 'excel' },
    { season: 'Kharif 2024', crop: 'Soybean', area: '5 Acres', cost: '₹40,000', revenue: '₹48,000', profit: '+ ₹8,000', status: 'warn' },
    { season: 'Zaid 2024', crop: 'Watermelon', area: '2 Acres', cost: '₹25,000', revenue: '₹1,10,000', profit: '+ ₹85,000', status: 'good' },
  ];

  const handleGenerateTimeline = async (e) => {
    e.preventDefault();
    setLoadingTimeline(true);
    try {
      const res = await axios.post('http://localhost:5001/api/farm/timeline', {
        crop,
        sowDate,
        area: 5,
        location: 'Maharashtra'
      });
      setTimeline(res.data.timeline);
    } catch (err) {
      console.error(err);
      alert('Failed to generate AI timeline.');
    } finally {
      setLoadingTimeline(false);
    }
  };

  return (
    <div className="min-h-[90vh] bg-[#F9FBFA] pb-20">
      
      {/* Hero Header */}
      <div className="bg-[#1A2E24] pt-20 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20 mix-blend-overlay pointer-events-none">
           <img src="/images/hero.png" alt="Farm Overlay" className="w-full h-full object-cover" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-32 h-32 bg-white rounded-3xl p-1 shadow-2xl skew-y-3 transform -rotate-3 border-4 border-[#8FB89A]">
            <div className="w-full h-full bg-agri-light rounded-2xl flex items-center justify-center text-agri-main">
              <UserCircle size={64} />
            </div>
          </div>
          <div className="text-center md:text-left flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">{user?.name || 'Farmer'}</h1>
              <span className="px-4 py-1.5 bg-green-500/20 text-green-300 border border-green-500/30 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 w-max mx-auto md:mx-0">
                <ShieldCheck size={14} /> Certified Smart Farmer
              </span>
            </div>
            <p className="text-[#8FB89A] flex items-center justify-center md:justify-start gap-2 text-lg font-medium">
              <MapPin size={18} /> Nashik, Maharashtra • Joined 2024
            </p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center">
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Total Land</p>
              <p className="text-2xl font-black text-white">12 <span className="text-lg font-medium text-white/80">Acres</span></p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center">
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Net Yield Profit</p>
              <p className="text-2xl font-black text-green-400">₹4.3 <span className="text-lg font-medium text-white/80">Lakh</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Hub */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        
        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-[#E9F0EC] p-2 flex flex-wrap md:flex-nowrap gap-2 mb-8">
          {[
            { id: 'management', icon: Calendar, label: 'Active Pipeline' },
            { id: 'ledger', icon: BadgeIndianRupee, label: 'P&L Ledger' },
            { id: 'guidance', icon: Sparkles, label: 'AI Future Guidance' },
            { id: 'history', icon: Target, label: 'Disease History' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-[#1A2E24] text-white shadow-md' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-agri-main'
              }`}
            >
              <tab.icon size={18} /> <span className="hidden sm:block">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: ACTIVE MANAGEMENT (GROQ API) */}
        {activeTab === 'management' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#E9F0EC]">
                <h3 className="text-xl font-black text-[#1A2E24] mb-4 flex items-center gap-2">
                  <Leaf className="text-agri-main" /> Start New Crop Cycle
                </h3>
                <p className="text-sm text-gray-500 mb-6">Enter your newly planted crop and Groq's LLaMA 3 will generate a 6-phase management timeline optimized for your soil.</p>
                <form onSubmit={handleGenerateTimeline} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Crop Name</label>
                    <input type="text" required value={crop} onChange={e=>setCrop(e.target.value)} placeholder="e.g., Tomato" className="w-full bg-[#F9FBFA] border-2 border-[#E9F0EC] rounded-xl px-4 py-3 focus:outline-none focus:border-agri-main font-bold text-[#1A2E24]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Sowing Date</label>
                    <input type="date" required value={sowDate} onChange={e=>setSowDate(e.target.value)} className="w-full bg-[#F9FBFA] border-2 border-[#E9F0EC] rounded-xl px-4 py-3 focus:outline-none focus:border-agri-main font-bold text-gray-600" />
                  </div>
                  <button type="submit" disabled={loadingTimeline} className="w-full bg-agri-main text-white font-black py-4 rounded-xl shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2">
                    {loadingTimeline ? (
                      <span className="animate-pulse">Synthesizing Timeline...</span>
                    ) : (
                      <>Generate AI Timeline <Calendar size={18} /></>
                    )}
                  </button>
                </form>
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-sm border border-[#E9F0EC]">
                 {timeline ? (
                   <div className="space-y-8">
                     <h3 className="text-2xl font-black text-[#1A2E24] mb-6 flex items-center gap-3">
                        <Sparkles className="text-agri-main" /> Your Personalized {crop} Timeline
                     </h3>
                     <div className="relative border-l-4 border-agri-light ml-4 space-y-10 py-2">
                       {timeline.map((step, idx) => (
                         <div key={idx} className="relative pl-8 group">
                           <div className="absolute -left-[24px] bg-white border-4 border-agri-main w-10 h-10 rounded-full flex items-center justify-center shadow-md z-10 group-hover:scale-110 transition-transform">
                             <Leaf size={16} className="text-agri-main" />
                           </div>
                           <div className="bg-[#F9FBFA] p-6 rounded-2xl border border-[#E9F0EC] group-hover:shadow-md transition-shadow">
                             <div className="flex justify-between items-start mb-2">
                               <h4 className="text-xl font-bold text-[#1A2E24]">{step.phase}</h4>
                               <span className="bg-[#1A2E24] text-white text-xs font-bold px-3 py-1 rounded-lg">Day {step.day}</span>
                             </div>
                             <p className="text-gray-600 font-medium leading-relaxed">{step.action}</p>
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>
                 ) : (
                   <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-50">
                      <Calendar size={64} className="text-gray-300 mb-4" />
                      <h3 className="text-2xl font-bold text-gray-400">No Active Timeline</h3>
                      <p className="text-gray-400 mt-2 max-w-sm">Use the form on the left to generate an AI-powered growth schedule.</p>
                   </div>
                 )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: P&L LEDGER */}
        {activeTab === 'ledger' && (
          <div className="bg-white rounded-3xl shadow-sm border border-[#E9F0EC] overflow-hidden content-fade-in">
            <div className="p-8 border-b border-[#E9F0EC] bg-[#F9FBFA] flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="text-2xl font-black text-[#1A2E24] flex items-center gap-3">
                  <BadgeIndianRupee className="text-agri-main" /> Profit & Loss Ledger
                </h3>
                <p className="text-gray-500 mt-1 font-medium">Your historical farm finances and cultivation yields.</p>
              </div>
              <button className="bg-gray-100 text-[#1A2E24] font-bold px-6 py-3 rounded-xl hover:bg-gray-200 transition border border-gray-200">
                Export PDF Report
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest border-b border-[#E9F0EC]">Season / Crop</th>
                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest border-b border-[#E9F0EC]">Area</th>
                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest border-b border-[#E9F0EC]">Total Cost (Input)</th>
                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest border-b border-[#E9F0EC]">Est. Revenue</th>
                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest border-b border-[#E9F0EC] text-right">Net Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9F0EC]">
                  {financialHistory.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50/30 transition-colors group">
                      <td className="px-8 py-6">
                        <p className="font-black text-[#1A2E24] text-lg">{row.crop}</p>
                        <p className="text-sm font-bold text-gray-400">{row.season}</p>
                      </td>
                      <td className="px-8 py-6 font-bold text-gray-600">{row.area}</td>
                      <td className="px-8 py-6 font-bold text-red-500/80">{row.cost}</td>
                      <td className="px-8 py-6 font-bold text-[#1A2E24]">{row.revenue}</td>
                      <td className="px-8 py-6 text-right">
                        <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-black ${
                          row.status === 'excel' ? 'bg-green-100 text-green-700' : 
                          row.status === 'warn' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          <TrendingUp size={16} /> {row.profit}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: AI FUTURE GUIDANCE */}
        {activeTab === 'guidance' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 content-fade-in">
            {/* The Predictive Advice */}
            <div className="bg-gradient-to-br from-[#1A2E24] to-[#0A1A12] rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden text-white">
              <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-10 -translate-y-10">
                <Sparkles size={250} />
              </div>
              <span className="px-4 py-1.5 bg-agri-main/30 border border-agri-main w-max rounded-full text-xs font-bold uppercase tracking-widest text-green-300 flex items-center gap-2 mb-8">
                <Target size={14} /> AI Predictive Farming Engine
              </span>
              <h2 className="text-3xl font-black tracking-tight mb-4 leading-tight">
                "Rotate to <span className="text-agri-main">Pigeon Pea (Tur)</span> next season to restore Nitrogen."
              </h2>
              <p className="text-green-100/70 text-lg leading-relaxed mb-10">
                Our ML ecosystem analyzed your historically low <b>Soybean</b> yield from Kharif 2024 (caused by Yellow Mosaic Virus). Continuous cultivation has drained soil nitrogen. Rotating to Tur will capture current high APMC market values while physically restoring soil health.
              </p>
              <button className="bg-agri-main text-white font-black px-8 py-4 rounded-xl hover:bg-white hover:text-[#1A2E24] transition-colors shadow-lg shadow-agri-main/30">
                View Full Tur Strategy
              </button>
            </div>

            {/* AI Warning Context */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-8 border border-[#E9F0EC] shadow-sm">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-6">
                  <AlertTriangle size={24} />
                </div>
                <h3 className="text-xl font-bold text-[#1A2E24] mb-2">Soil Nitrogen Depletion Risk</h3>
                <p className="text-gray-500 leading-relaxed font-medium">Your 5-acre Nashik plot has sustained intense cash crop growth for 3 concurrent seasons. Without immediate leguminous crop rotation, fertilizer overhead costs will increase by ~30% next year.</p>
              </div>
              
              <div className="bg-white rounded-3xl p-8 border border-[#E9F0EC] shadow-sm">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <Truck size={24} />
                </div>
                <h3 className="text-xl font-bold text-[#1A2E24] mb-2">Market Demand Surge</h3>
                <p className="text-gray-500 leading-relaxed font-medium">Tur (Pigeon Pea) prices in the Lasalgaon and Pimpalgaon APMCs are currently tracking 25% above the 5-year average. Smart Logistics indicates high profitability.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SCAN HISTORY */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-[#E9F0EC] p-2 content-fade-in">
            {/* We re-use the exact ScanHistory component the user liked, but mount it cleanly inside the tab */}
            <div className="-m-8 relative">
                <ScanHistory />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default UserProfile;

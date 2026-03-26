import React, { useState } from 'react';
import { Calculator as CalcIcon, Pickaxe, Sprout, Loader2, ArrowRight, IndianRupee, PieChart, Info, AlertCircle } from 'lucide-react';
import axios from 'axios';

const Calculator = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const [formData, setFormData] = useState({
    crop: '',
    area: '',
    soilType: 'Medium'
  });

  const SOIL_TYPES = ['Light (Sandy)', 'Medium (Loam)', 'Heavy (Clay)'];

  const handleCalculate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await axios.post('http://localhost:5001/api/calculator', formData);
      if (res.data.calculator) {
        setResult(res.data.calculator);
      } else {
        setError("Failed to generate calculation data.");
      }
    } catch (err) {
      setError("Server connection failed. Ensure backend is running on port 5001.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-[#F9FBFA] py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-[#1A2E24] rounded-3xl p-8 sm:p-10 relative overflow-hidden shadow-xl flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none transform translate-x-10">
            <PieChart size={200} />
          </div>
          <div className="relative z-10 max-w-xl text-center sm:text-left">
            <p className="text-[#8FB89A] font-black uppercase tracking-[0.3em] text-xs mb-2">Financial Planning</p>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight mb-3">Fertilizer & ROI Calculator</h1>
            <p className="text-green-100 font-medium leading-relaxed">Calculate exact NPK requirements, estimate input costs, and project your end-of-season profit margin before you even sow.</p>
          </div>
          <div className="relative z-10 hidden lg:flex bg-white/10 p-5 border border-white/20 rounded-2xl items-center gap-4 backdrop-blur-sm">
             <div className="bg-agri-main text-white p-3 rounded-xl"><IndianRupee size={24} /></div>
             <div>
               <p className="text-white font-black text-lg">Profit Analytics</p>
               <p className="text-xs text-green-100 mt-0.5">AI-Powered Forecasting</p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Form Section */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-6 border border-[#E9F0EC] shadow-sm sticky top-24">
              <h2 className="font-black text-[#1A2E24] text-lg flex items-center gap-2 mb-6"><CalcIcon size={18} className="text-agri-main" /> Enter Farm Details</h2>
              
              <form onSubmit={handleCalculate} className="space-y-5">
                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block flex items-center gap-1"><Sprout size={12} /> Target Crop</label>
                  <input type="text" required value={formData.crop} onChange={e => setFormData({...formData, crop: e.target.value})} placeholder="e.g. Cotton, Soybean, Wheat" className="w-full px-4 py-3 bg-[#F9FBFA] border border-[#E9F0EC] rounded-xl text-sm font-bold focus:outline-none focus:border-agri-main" />
                </div>

                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block flex items-center gap-1"><Pickaxe size={12} /> Cultivation Area (Acres)</label>
                  <input type="number" step="0.1" required value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} placeholder="e.g. 5" className="w-full px-4 py-3 bg-[#F9FBFA] border border-[#E9F0EC] rounded-xl text-sm font-bold focus:outline-none focus:border-agri-main" />
                </div>

                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block flex items-center gap-1"><Info size={12} /> Soil Type</label>
                  <select required value={formData.soilType} onChange={e => setFormData({...formData, soilType: e.target.value})} className="w-full px-4 py-3 bg-[#F9FBFA] border border-[#E9F0EC] rounded-xl text-sm font-bold focus:outline-none focus:border-agri-main text-[#1A2E24]">
                    {SOIL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="pt-2">
                  <button type="submit" disabled={loading} className="w-full bg-agri-main text-white py-4 rounded-xl font-black text-sm hover:bg-[#1A2E24] transition flex items-center justify-center gap-2 shadow-lg">
                    {loading ? <><Loader2 size={16} className="animate-spin" /> Analyzing Costs & ROI...</> : <>Calculate Analytics <ArrowRight size={16} /></>}
                  </button>
                </div>
              </form>

              {error && (
                <div className="mt-5 bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold border border-red-200 text-center flex items-center justify-center gap-2">
                  <AlertCircle size={16} /> {error}
                </div>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-7">
            {!loading && !result && !error && (
              <div className="h-full min-h-[400px] border-2 border-dashed border-[#E9F0EC] rounded-3xl flex flex-col items-center justify-center p-12 text-center bg-white/50">
                <PieChart size={64} className="text-[#E9F0EC] mb-4" />
                <h3 className="text-lg font-black text-gray-400 mb-2">No active projection</h3>
                <p className="text-sm text-gray-400 max-w-sm">Enter your crop and land size to generate a detailed cost-of-cultivation and profit projection report.</p>
              </div>
            )}

            {loading && (
              <div className="h-full min-h-[400px] bg-white rounded-3xl border border-[#E9F0EC] shadow-sm flex flex-col items-center justify-center p-12 text-center">
                <Loader2 size={48} className="text-agri-main animate-spin mb-4" />
                <p className="text-sm font-black text-agri-main mb-1">Generating Financial Model...</p>
                <p className="text-xs text-gray-400 font-medium">Estimating NPK, Seeds, Labor, and Harvest yields.</p>
              </div>
            )}

            {result && (
              <div className="space-y-6 animate-fade-in">
                
                {/* ROI Hero Card */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E9F0EC] shadow-sm">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-[#E9F0EC]">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Projected Return on Investment</p>
                      <h2 className="text-4xl font-black text-[#1A2E24]">{result.roiPercentage}</h2>
                    </div>
                    <div className="text-left sm:text-right bg-green-50 px-5 py-3 rounded-2xl border border-green-100">
                      <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Estimated Net Profit</p>
                      <p className="text-2xl font-black text-green-700">{result.netProfit}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { l: 'Total Revenue', v: result.estimatedRevenue, c: 'text-[#1A2E24]' },
                      { l: 'Investments', v: result.totalInvestment, c: 'text-red-500' },
                      { l: 'Seeds Cost', v: result.estimatedSeedCost, c: 'text-gray-600' },
                      { l: 'Labor Cost', v: result.estimatedLaborCost, c: 'text-gray-600' }
                    ].map((m, i) => (
                      <div key={i} className="bg-[#F9FBFA] p-4 rounded-2xl border border-[#E9F0EC] text-center">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{m.l}</p>
                        <p className={`text-sm font-black ${m.c}`}>{m.v}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fertilizer Requirements */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E9F0EC] shadow-sm">
                  <h3 className="font-black text-[#1A2E24] text-lg flex items-center gap-2 mb-6">⚙️ Detailed Fertilizer Plan</h3>
                  <div className="space-y-3">
                    {result.fertilizers?.map((f, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-2xl border-2 border-[#F9FBFA] bg-white hover:border-[#E9F0EC] transition">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white ${
                            f.name.toLowerCase().includes('urea') ? 'bg-blue-500' :
                            f.name.toLowerCase().includes('dap') ? 'bg-amber-600' :
                            f.name.toLowerCase().includes('mop') ? 'bg-red-500' : 'bg-[#1A2E24]'
                          }`}>
                            {f.name.substring(0,2)}
                          </div>
                          <div>
                            <p className="font-black text-[#1A2E24] text-sm uppercase">{f.name}</p>
                            <p className="text-xs text-gray-500 font-medium">{f.quantity} Required</p>
                          </div>
                        </div>
                        <p className="font-black text-lg text-[#1A2E24]">{f.cost}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 pt-5 border-t border-[#E9F0EC] flex items-start gap-3 bg-agri-main/5 p-4 rounded-2xl">
                    <Info size={18} className="text-agri-main flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-black text-agri-main uppercase tracking-widest mb-1">Agronomist Top Tip</p>
                      <p className="text-sm font-medium text-gray-700 leading-relaxed">{result.advice}</p>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Calculator;

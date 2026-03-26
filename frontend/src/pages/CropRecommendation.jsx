import React, { useState } from 'react';
import { Leaf, Droplets, ThermometerSun, TestTube, CloudRain, CheckCircle, CalendarClock, Scale, Sprout, MapPin, Zap, SlidersHorizontal, Loader2, FlaskConical } from 'lucide-react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { handleDownloadPDF } from '../utils/generatePDF';

// ─── Soil type → NPK/pH mapping ────────────────────────────────────────────
const SOIL_PROFILES = {
  black: { label: 'Black Soil (Regur)', emoji: '⚫', nitrogen: 78, phosphorus: 48, potassium: 220, ph: 7.8, description: 'Rich in clay, ideal for cotton & sugarcane. Retains moisture well.' },
  red:   { label: 'Red / Laterite Soil', emoji: '🔴', nitrogen: 40, phosphorus: 25, potassium: 120, ph: 6.3, description: 'Low in nutrients, good for millets, groundnut & pulses.' },
  sandy: { label: 'Sandy / Desert Soil', emoji: '🟡', nitrogen: 28, phosphorus: 18, potassium: 80,  ph: 5.9, description: 'Drains fast, low fertility. Good for vegetables & root crops.' },
  clay:  { label: 'Clay / Alluvial Soil', emoji: '🟫', nitrogen: 90, phosphorus: 55, potassium: 180, ph: 7.2, description: 'Very fertile, holds water. Best for rice, wheat & vegetables.' },
  loamy: { label: 'Loamy / Mixed Soil', emoji: '🌱', nitrogen: 65, phosphorus: 42, potassium: 150, ph: 6.8, description: 'Balanced and fertile. Suitable for almost all crops.' },
};

const SEASONS = [
  { value: 'kharif',  label: 'Kharif (Jun–Oct)',  emoji: '🌧️' },
  { value: 'rabi',    label: 'Rabi (Nov–Mar)',     emoji: '❄️' },
  { value: 'zaid',    label: 'Zaid (Mar–Jun)',     emoji: '☀️' },
];

const CropRecommendation = () => {
  const [mode, setMode] = useState('smart'); // 'smart' | 'manual'

  // Smart mode state
  const [smartData, setSmartData] = useState({ location: '', soilType: 'loamy', season: 'kharif' });
  const [autoFilled, setAutoFilled] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [regionalCrops, setRegionalCrops] = useState([]);

  // Manual mode state
  const [formData, setFormData] = useState({ nitrogen: '', phosphorus: '', potassium: '', temperature: '', humidity: '', ph: '', rainfall: '' });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Smart Mode: Auto-fetch weather + derive soil values + regional crops ──
  const handleSmartFetch = async () => {
    if (!smartData.location) return;
    setFetching(true);
    setFetchError(null);
    setAutoFilled(null);
    setRegionalCrops([]);

    // Fetch weather + regional crops in parallel
    const soil = SOIL_PROFILES[smartData.soilType];
    const seasonDefaults = { kharif: { temperature: 28, humidity: 78, rainfall: 200 }, rabi: { temperature: 18, humidity: 55, rainfall: 50 }, zaid: { temperature: 33, humidity: 40, rainfall: 30 } };

    let weatherValues = seasonDefaults[smartData.season];
    let weatherOk = false;

    try {
      const [weatherRes, regionalRes] = await Promise.allSettled([
        axios.get(`http://localhost:5001/api/advisory?location=${encodeURIComponent(smartData.location)}`),
        axios.get(`http://localhost:5001/api/crop/regional?location=${encodeURIComponent(smartData.location)}`)
      ]);

      // Weather
      if (weatherRes.status === 'fulfilled') {
        const w = weatherRes.value.data.weather;
        weatherValues = { temperature: w.temp ?? 25, humidity: w.humidity ?? 70, rainfall: 120 };
        weatherOk = true;
      }

      // Regional crops
      if (regionalRes.status === 'fulfilled' && regionalRes.value.data?.crops) {
        setRegionalCrops(regionalRes.value.data.crops);
      }
    } catch { /* handled below */ }

    setAutoFilled({ nitrogen: soil.nitrogen, phosphorus: soil.phosphorus, potassium: soil.potassium, ph: soil.ph, ...weatherValues });
    if (!weatherOk) setFetchError('Weather data unavailable — using seasonal averages.');
    setFetching(false);
  };

  // ── Submit (works for both modes) ────────────────────────────────────────
  const [regionWarning, setRegionWarning] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setRegionWarning(null);

    const payload = mode === 'smart' && autoFilled
      ? { nitrogen: autoFilled.nitrogen, phosphorus: autoFilled.phosphorus, potassium: autoFilled.potassium, temperature: autoFilled.temperature, humidity: autoFilled.humidity, ph: autoFilled.ph, rainfall: autoFilled.rainfall }
      : { nitrogen: Number(formData.nitrogen), phosphorus: Number(formData.phosphorus), potassium: Number(formData.potassium), temperature: Number(formData.temperature), humidity: Number(formData.humidity), ph: Number(formData.ph), rainfall: Number(formData.rainfall) };

    try {
      const res = await axios.post('http://localhost:8001/predict-crop', payload);
      if (res.data.error) { setError(res.data.error); }
      else {
        const predicted = res.data.recommended_crop?.toLowerCase().trim();
        
        // Regional validation: check if predicted crop is actually grown here
        if (mode === 'smart' && regionalCrops.length > 0 && predicted) {
          const regionalNames = regionalCrops.map(c => c.name.toLowerCase().trim());
          const isRegionallyValid = regionalNames.some(rn => rn.includes(predicted) || predicted.includes(rn));
          
          if (!isRegionallyValid) {
            setRegionWarning({
              predicted: res.data.recommended_crop,
              location: smartData.location,
              message: `Wait! While the raw soil/weather numbers match ${res.data.recommended_crop}, it is NOT traditionally grown in ${smartData.location}. To avoid loss, we highly recommend choosing from the safe, regionally verified alternatives below.`
            });
          }
        }
        setResult(res.data);
      }
    } catch {
      setError('Failed to connect to the prediction service. Ensure ML service is running on port 8001.');
    } finally {
      setLoading(false);
    }
  };

  const chartData = result?.ai_profile ? [
    { name: 'Nitrogen',   'Your Soil': result.input_features.nitrogen,   'Ideal Min': result.ai_profile.ideal_n[0], 'Ideal Max': result.ai_profile.ideal_n[1] },
    { name: 'Phosphorus', 'Your Soil': result.input_features.phosphorus, 'Ideal Min': result.ai_profile.ideal_p[0], 'Ideal Max': result.ai_profile.ideal_p[1] },
    { name: 'Potassium',  'Your Soil': result.input_features.potassium,  'Ideal Min': result.ai_profile.ideal_k[0], 'Ideal Max': result.ai_profile.ideal_k[1] },
  ] : [];

  const displayValues = mode === 'smart' ? autoFilled : (Object.values(formData).every(v => v !== '') ? formData : null);
  const canSubmit = mode === 'smart' ? !!autoFilled : Object.values(formData).every(v => v !== '');

  return (
    <div className="min-h-screen bg-[#F2F7F4] py-8 px-3 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div className="bg-[#1A2E24] rounded-3xl p-6 sm:p-8 overflow-hidden relative">
          <div className="absolute right-0 top-0 bottom-0 w-40 opacity-5 flex items-center justify-center">
            <Sprout size={180} />
          </div>
          <div className="relative z-10">
            <p className="text-[#8FB89A] font-black uppercase tracking-[0.3em] text-xs mb-2">AI Powered</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none">Crop Recommendation</h2>
            <p className="mt-3 text-[#8FB89A] text-sm sm:text-base max-w-xl leading-relaxed">
              Get the perfect crop for your field — no soil lab required. Just enter your location and soil type.
            </p>
          </div>
        </div>

        {/* ── Mode Toggle ── */}
        <div className="flex bg-white rounded-2xl p-1.5 border border-[#E9F0EC] shadow-sm gap-2">
          <button onClick={() => setMode('smart')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm transition-all ${mode === 'smart' ? 'bg-[#1A2E24] text-white shadow-md' : 'text-gray-400 hover:text-[#1A2E24]'}`}>
            <Zap size={16} /> Smart Mode <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${mode === 'smart' ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'}`}>Recommended</span>
          </button>
          <button onClick={() => setMode('manual')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm transition-all ${mode === 'manual' ? 'bg-[#1A2E24] text-white shadow-md' : 'text-gray-400 hover:text-[#1A2E24]'}`}>
            <SlidersHorizontal size={16} /> Manual Mode
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left Panel ── */}
          <div className="lg:col-span-1">
            <form onSubmit={handleSubmit} className="space-y-4">

              {mode === 'smart' ? (
                <div className="bg-white rounded-3xl p-6 border border-[#E9F0EC] shadow-sm space-y-4">
                  <h3 className="font-black text-[#1A2E24] text-lg flex items-center gap-2"><Zap size={18} className="text-agri-main" /> Smart Auto-Fill</h3>
                  <p className="text-xs text-gray-400 font-medium leading-relaxed">Enter your location & select your soil type — we'll auto-fill all soil and weather values.</p>

                  {/* Location */}
                  <div>
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 block">Your Location / Village</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="e.g. Satara, Pune, Nashik..."
                        value={smartData.location}
                        onChange={e => setSmartData({ ...smartData, location: e.target.value })}
                        className="w-full pl-9 pr-4 py-3 bg-[#F9FBFA] border border-[#E9F0EC] rounded-xl text-sm font-bold text-[#1A2E24] focus:outline-none focus:ring-2 focus:ring-agri-main placeholder:text-gray-300"
                      />
                    </div>
                  </div>

                  {/* Soil Type */}
                  <div>
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Soil Color / Type</label>
                    <div className="grid grid-cols-1 gap-2">
                      {Object.entries(SOIL_PROFILES).map(([key, s]) => (
                        <button key={key} type="button" onClick={() => setSmartData({ ...smartData, soilType: key })}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${smartData.soilType === key ? 'border-agri-main bg-agri-main/5' : 'border-[#E9F0EC] bg-[#F9FBFA] hover:border-agri-main/40'}`}>
                          <span className="text-xl">{s.emoji}</span>
                          <div>
                            <p className="text-xs font-black text-[#1A2E24]">{s.label}</p>
                            <p className="text-[10px] text-gray-400 font-medium">pH ~{s.ph} · N:{s.nitrogen} P:{s.phosphorus} K:{s.potassium}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Season */}
                  <div>
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Current Season</label>
                    <div className="flex gap-2">
                      {SEASONS.map(s => (
                        <button key={s.value} type="button" onClick={() => setSmartData({ ...smartData, season: s.value })}
                          className={`flex-1 py-2.5 rounded-xl border-2 text-xs font-black text-center transition-all ${smartData.season === s.value ? 'border-agri-main bg-agri-main text-white' : 'border-[#E9F0EC] text-gray-500 hover:border-agri-main/40'}`}>
                          {s.emoji}<br />{s.label.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Fetch Button */}
                  <button type="button" onClick={handleSmartFetch} disabled={!smartData.location || fetching}
                    className="w-full bg-[#2D5A3D] text-white py-3 rounded-xl font-black text-sm hover:bg-[#1A2E24] transition disabled:opacity-50 flex items-center justify-center gap-2">
                    {fetching ? <><Loader2 size={16} className="animate-spin" /> Fetching Data...</> : <><MapPin size={16} /> Auto-Fill from Location</>}
                  </button>

                  {fetchError && <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 font-medium">{fetchError}</p>}

                  {/* Preview auto-filled values */}
                  {autoFilled && (
                    <div className="bg-[#F9FBFA] rounded-2xl p-4 border border-[#E9F0EC]">
                      <p className="text-[10px] font-black text-agri-main uppercase tracking-widest mb-3 flex items-center gap-1"><CheckCircle size={12} /> Auto-Filled Values</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {[['N', autoFilled.nitrogen], ['P', autoFilled.phosphorus], ['K', autoFilled.potassium], ['pH', autoFilled.ph], ['Temp', `${autoFilled.temperature}°C`], ['Humid', `${autoFilled.humidity}%`], ['Rain', `${autoFilled.rainfall}mm`]].map(([k, v]) => (
                          <div key={k} className="flex justify-between bg-white rounded-lg px-2 py-1.5 border border-[#E9F0EC]">
                            <span className="font-black text-gray-400">{k}</span>
                            <span className="font-black text-[#1A2E24]">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-6 border border-[#E9F0EC] shadow-sm space-y-4">
                  <h3 className="font-black text-[#1A2E24] text-lg flex items-center gap-2"><FlaskConical size={18} className="text-blue-500" /> Manual Entry</h3>
                  <p className="text-xs text-gray-400 font-medium">Enter your soil test report values directly.</p>
                  {[
                    { name: 'nitrogen', label: 'Nitrogen (N)', placeholder: 'e.g. 80' },
                    { name: 'phosphorus', label: 'Phosphorus (P)', placeholder: 'e.g. 45' },
                    { name: 'potassium', label: 'Potassium (K)', placeholder: 'e.g. 200' },
                    { name: 'temperature', label: 'Temperature (°C)', placeholder: 'e.g. 25', step: '0.1' },
                    { name: 'humidity', label: 'Humidity (%)', placeholder: 'e.g. 70', step: '0.1' },
                    { name: 'ph', label: 'pH Value', placeholder: 'e.g. 6.5', step: '0.1' },
                    { name: 'rainfall', label: 'Rainfall (mm)', placeholder: 'e.g. 200', step: '0.1' },
                  ].map(f => (
                    <div key={f.name}>
                      <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 block">{f.label}</label>
                      <input type="number" step={f.step} name={f.name} required value={formData[f.name]}
                        onChange={e => setFormData({ ...formData, [e.target.name]: e.target.value })}
                        placeholder={f.placeholder}
                        className="w-full px-4 py-3 bg-[#F9FBFA] border border-[#E9F0EC] rounded-xl text-sm font-bold text-[#1A2E24] focus:outline-none focus:ring-2 focus:ring-agri-main placeholder:text-gray-300" />
                    </div>
                  ))}
                </div>
              )}

              {/* Submit */}
              <button type="submit" disabled={loading || !canSubmit}
                className="w-full bg-agri-main text-white py-4 rounded-2xl font-black text-base hover:bg-[#1A2E24] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg">
                {loading ? <><Loader2 size={18} className="animate-spin" /> Analyzing...</> : <><Sprout size={18} /> Get Crop Recommendation</>}
              </button>

              {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-200">{error}</div>}
            </form>
          </div>

          {/* ── Right Panel: Results ── */}
          <div className="lg:col-span-2">
            {result ? (
              <div className="space-y-5 animate-fade-in" id="crop-report">
                <div className="flex justify-end">
                  <button onClick={() => handleDownloadPDF('crop-report', 'Crop-Recommendation.pdf')} className="bg-[#1A2E24] text-white px-5 py-2.5 rounded-xl text-xs font-black hover:bg-agri-main transition shadow">
                    ↓ Download PDF Report
                  </button>
                </div>

                {/* Hero crop card with Regional Override Logic */}
                {regionWarning ? (
                  <div className="bg-gradient-to-br from-red-600 to-red-900 p-8 rounded-3xl text-white relative overflow-hidden shadow-xl">
                    <div className="absolute right-4 bottom-4 opacity-10"><Leaf size={140} /></div>
                    <p className="text-red-200 font-black uppercase tracking-[0.3em] text-xs mb-2 flex items-center gap-2">⚠️ High Risk Match</p>
                    <h2 className="text-5xl sm:text-6xl font-black capitalize mb-4 tracking-tight line-through opacity-80">{result.recommended_crop}</h2>
                    <p className="bg-red-950/60 p-4 rounded-xl text-red-50 text-sm leading-relaxed max-w-2xl relative z-10 font-medium border border-red-500/30">
                      {regionWarning.message}
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <a href="#regional-crops" className="inline-flex items-center gap-2 bg-white text-red-900 px-5 py-3 rounded-xl text-xs font-black transition shadow-lg hover:bg-red-50">
                        ↓ View Safe Alternatives First
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-[#2D5A3D] to-[#1A2E24] p-8 rounded-3xl text-white relative overflow-hidden shadow-xl">
                    <div className="absolute right-4 bottom-4 opacity-10"><Leaf size={140} /></div>
                    <p className="text-[#8FB89A] font-black uppercase tracking-[0.3em] text-xs mb-2 flex items-center gap-2"><CheckCircle size={14} /> AI Verified Match</p>
                    <h2 className="text-5xl sm:text-6xl font-black capitalize mb-4 tracking-tight">{result.recommended_crop}</h2>
                    <p className="text-green-100 text-sm leading-relaxed max-w-lg relative z-10 font-medium">
                      {result.ai_profile?.description || 'A highly suitable crop for your specific soil type and local weather conditions.'}
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <a href={`/prices?crop=${result.recommended_crop}`} className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-black transition border border-white/20">
                        💰 Check Market Price →
                      </a>
                      <span className="inline-flex items-center gap-1 bg-agri-main/50 text-white px-4 py-2 rounded-xl text-xs font-black">
                        {mode === 'smart' ? `🌍 Safe for ${smartData.location}` : '🧪 Manual Analysis'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Stats row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl p-5 border border-[#E9F0EC] shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><CalendarClock size={22} /></div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Maturity Time</p>
                      <p className="text-base font-black text-[#1A2E24]">{result.ai_profile?.maturity_time || 'Varies'}</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-5 border border-[#E9F0EC] shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Scale size={22} /></div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Estimated Yield</p>
                      <p className="text-base font-black text-[#1A2E24]">{result.ai_profile?.estimated_yield || 'Varies'}</p>
                    </div>
                  </div>
                </div>

                {/* Chart */}
                {chartData.length > 0 && (
                  <div className="bg-white p-6 rounded-3xl border border-[#E9F0EC] shadow-sm">
                    <h4 className="font-black text-[#1A2E24] mb-5 flex items-center gap-2 text-base"><Droplets className="text-blue-500" /> Soil NPK Analysis</h4>
                    <div className="h-[260px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontWeight: 'bold', fontSize: 12 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                          <RechartsTooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                          <Legend wrapperStyle={{ paddingTop: '16px', fontSize: '12px', fontWeight: 'bold' }} />
                          <Bar dataKey="Your Soil" fill="#2D5A3D" radius={[4, 4, 0, 0]} maxBarSize={48} />
                          <Bar dataKey="Ideal Min" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={48} />
                          <Bar dataKey="Ideal Max" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={48} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Tips */}
                {result.ai_profile?.tips?.length > 0 && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-3xl border border-green-100">
                    <h4 className="font-black text-green-900 mb-4 flex items-center gap-2 text-base"><CheckCircle className="text-green-600" /> Essential Growing Tips</h4>
                    <ul className="space-y-3">
                      {result.ai_profile.tips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-green-100/50 shadow-sm">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-black text-sm">{idx + 1}</span>
                          <span className="text-green-800 text-sm font-medium leading-relaxed">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full min-h-[400px] border-2 border-dashed border-[#E9F0EC] rounded-3xl flex flex-col items-center justify-center p-12 text-center bg-white/50">
                <Sprout size={64} className="text-[#E9F0EC] mb-4" />
                <h3 className="text-lg font-black text-gray-500 mb-2">
                  {mode === 'smart' ? 'Select Location & Soil Type' : 'Enter Soil Parameters'}
                </h3>
                <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
                  {mode === 'smart'
                    ? 'Choose your location, soil color and season — we\'ll auto-fill the rest and recommend your best crop.'
                    : 'Fill in all 7 soil and weather values from your soil health card to get a precision recommendation.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Profit-Ranked Regional Crops ── */}
        {regionalCrops.length > 0 && (
          <div id="regional-crops" className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E9F0EC] shadow-sm mt-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[10px] font-black text-agri-main uppercase tracking-[0.3em]">Profitability Ranking</p>
                <h3 className="text-xl sm:text-2xl font-black text-[#1A2E24] tracking-tight">Best Crops for {smartData.location}</h3>
                <p className="text-xs text-gray-400 mt-1">Ranked by profit potential · Real regional data</p>
              </div>
              <span className="bg-agri-main/10 text-agri-main px-3 py-1 rounded-full text-[10px] font-black uppercase">{regionalCrops.length} Crops</span>
            </div>
            <div className="space-y-3">
              {regionalCrops.map((crop, idx) => (
                <div key={idx} className={`rounded-2xl border-2 p-4 sm:p-5 transition-all hover:shadow-md ${idx === 0 ? 'border-agri-main bg-agri-main/5' : 'border-[#E9F0EC] bg-[#F9FBFA]'}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Rank */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${idx === 0 ? 'bg-agri-main text-white' : idx === 1 ? 'bg-blue-500 text-white' : idx === 2 ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                      #{crop.rank || idx + 1}
                    </div>
                    {/* Crop name + meta */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-[#1A2E24] text-lg capitalize">{crop.name}</h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">📅 {crop.season}</span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">🌍 {crop.soil_type}</span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-600">💧 {crop.water_need || 'Medium'}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${crop.risk_level === 'Low' ? 'bg-green-50 text-green-600' : crop.risk_level === 'High' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'}`}>
                          ⚡ {crop.risk_level || 'Medium'} Risk
                        </span>
                      </div>
                    </div>
                    {/* Profit metrics */}
                    <div className="flex gap-3 sm:gap-5 flex-wrap sm:flex-nowrap">
                      <div className="text-center min-w-[70px]">
                        <p className="text-[9px] font-black text-gray-400 uppercase">Revenue</p>
                        <p className="text-sm font-black text-[#1A2E24]">{crop.revenue_per_acre || '—'}</p>
                      </div>
                      <div className="text-center min-w-[70px]">
                        <p className="text-[9px] font-black text-gray-400 uppercase">Cost</p>
                        <p className="text-sm font-black text-red-500">{crop.investment_per_acre || '—'}</p>
                      </div>
                      <div className="text-center min-w-[70px]">
                        <p className="text-[9px] font-black text-gray-400 uppercase">Profit</p>
                        <p className="text-sm font-black text-green-600">{crop.profit_per_acre || '—'}</p>
                      </div>
                      <div className="text-center min-w-[55px]">
                        <p className="text-[9px] font-black text-gray-400 uppercase">ROI</p>
                        <p className={`text-sm font-black ${(crop.roi_percent || 0) > 100 ? 'text-green-600' : 'text-amber-600'}`}>{crop.roi_percent || 0}%</p>
                      </div>
                    </div>
                    {/* Action */}
                    <a href={`/prices?crop=${crop.name}`} className="flex-shrink-0 bg-[#1A2E24] text-white text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl hover:bg-agri-main transition text-center">
                      Price →
                    </a>
                  </div>
                  {crop.tip && <p className="text-[10px] text-gray-400 mt-3 pl-14 italic leading-relaxed">💡 {crop.tip}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CropRecommendation;

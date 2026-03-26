import React, { useState, useEffect } from 'react';
import { Leaf, Calendar, MapPin, CheckCircle, Circle, ArrowRight, Sprout, Loader2, RotateCcw, AlertCircle } from 'lucide-react';
import axios from 'axios';

const MyFarm = () => {
  const [farmData, setFarmData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [crop, setCrop] = useState('');
  const [area, setArea] = useState('');
  const [location, setLocation] = useState('');
  const [sowDate, setSowDate] = useState(new Date().toISOString().split('T')[0]);

  // Load from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('agricity_myfarm');
    if (saved) {
      setFarmData(JSON.parse(saved));
    }
  }, []);

  const handleCreateTracker = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post('http://localhost:5001/api/farm/timeline', {
        crop, area, location, sowDate
      });

      if (res.data.timeline) {
        const newData = {
          crop, area, location, sowDate,
          created_at: new Date().toISOString(),
          timeline: res.data.timeline
        };
        setFarmData(newData);
        localStorage.setItem('agricity_myfarm', JSON.stringify(newData));
      } else {
        setError('Failed to generate timeline. Please try again.');
      }
    } catch (err) {
      setError('Connection failed. Ensure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (index) => {
    if (!farmData) return;
    const updated = { ...farmData };
    const currentStatus = updated.timeline[index].status;
    updated.timeline[index].status = currentStatus === 'completed' ? 'pending' : 'completed';
    setFarmData(updated);
    localStorage.setItem('agricity_myfarm', JSON.stringify(updated));
  };

  const calculateDate = (daysToAdd) => {
    if (!farmData?.sowDate) return '';
    const date = new Date(farmData.sowDate);
    date.setDate(date.getDate() + parseInt(daysToAdd));
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const calculateProgress = () => {
    if (!farmData?.timeline) return 0;
    const completed = farmData.timeline.filter(t => t.status === 'completed').length;
    return Math.round((completed / farmData.timeline.length) * 100);
  };

  const getDaysElapsed = () => {
    if (!farmData?.sowDate) return 0;
    const start = new Date(farmData.sowDate);
    const now = new Date();
    const diffTime = now - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <div className="min-h-[85vh] bg-[#F9FBFA] py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black text-[#1A2E24] tracking-tight">🚜 My Farm Tracker</h1>
          <p className="text-gray-500 font-medium mt-2">Manage your active crop lifecycle and get timely actionable alerts.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 font-bold border border-red-200">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* State: No Tracker Active -> Show Form */}
        {!farmData ? (
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#E9F0EC] shadow-sm max-w-2xl mx-auto mt-10">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-agri-main/10 text-agri-main rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sprout size={32} />
              </div>
              <h2 className="text-2xl font-black text-[#1A2E24]">Start a New Crop</h2>
              <p className="text-sm text-gray-500 font-medium mt-1">Enter your crop details to generate a customized AI action plan.</p>
            </div>

            <form onSubmit={handleCreateTracker} className="space-y-5">
              <div>
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Crop Name</label>
                <input type="text" required value={crop} onChange={e => setCrop(e.target.value)} placeholder="e.g. Sugarcane, Wheat, Cotton..." className="w-full px-4 py-3 bg-[#F9FBFA] border border-[#E9F0EC] rounded-xl text-sm font-bold focus:outline-none focus:border-agri-main focus:ring-1 focus:ring-agri-main" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Area (Acres)</label>
                  <input type="number" step="0.1" required value={area} onChange={e => setArea(e.target.value)} placeholder="e.g. 2.5" className="w-full px-4 py-3 bg-[#F9FBFA] border border-[#E9F0EC] rounded-xl text-sm font-bold focus:outline-none focus:border-agri-main" />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Location</label>
                  <input type="text" required value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Satara" className="w-full px-4 py-3 bg-[#F9FBFA] border border-[#E9F0EC] rounded-xl text-sm font-bold focus:outline-none focus:border-agri-main" />
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Sowing Date</label>
                <input type="date" required value={sowDate} onChange={e => setSowDate(e.target.value)} className="w-full px-4 py-3 bg-[#F9FBFA] border border-[#E9F0EC] rounded-xl text-sm font-bold text-[#1A2E24] focus:outline-none focus:border-agri-main" />
              </div>

              <button type="submit" disabled={loading} className="w-full bg-[#1A2E24] text-white py-4 rounded-xl font-black text-base mt-4 hover:bg-agri-main transition flex items-center justify-center gap-2">
                {loading ? <><Loader2 size={18} className="animate-spin" /> Generating Plan...</> : <><Calendar size={18} /> Generate Timeline</>}
              </button>
            </form>
          </div>
        ) : (
          /* State: Tracker Active -> Show Dashboard */
          <div className="space-y-6">
            
            {/* Dashboard Hero */}
            <div className="bg-gradient-to-br from-[#2D5A3D] to-[#1A2E24] p-8 sm:p-10 rounded-3xl text-white relative overflow-hidden shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div className="absolute right-0 top-0 bottom-0 w-64 opacity-5 pointer-events-none">
                <Leaf size={250} className="-mr-10 -mt-10" />
              </div>
              
              <div className="relative z-10 space-y-3">
                <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-widest text-[#8FB89A]">
                  <span className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full"><MapPin size={12} /> {farmData.location}</span>
                  <span className="bg-white/10 px-3 py-1 rounded-full">{farmData.area} Acres</span>
                </div>
                <h2 className="text-4xl sm:text-5xl font-black capitalize tracking-tight">{farmData.crop}</h2>
                <p className="text-green-100 font-medium">Sown on: {new Date(farmData.sowDate).toLocaleDateString()}</p>
              </div>

              <div className="relative z-10 bg-white/10 p-6 rounded-2xl border border-white/20 text-center min-w-[150px] backdrop-blur-sm">
                <p className="text-xs font-black uppercase tracking-widest text-[#8FB89A] mb-1">Day</p>
                <p className="text-5xl font-black">{getDaysElapsed()}</p>
              </div>
            </div>

            {/* Progress Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-[#E9F0EC] shadow-sm">
              <div className="flex-1 w-full flex items-center gap-4">
                <p className="font-black text-[#1A2E24] whitespace-nowrap">Progress: {calculateProgress()}%</p>
                <div className="w-full bg-[#E9F0EC] h-3 rounded-full overflow-hidden">
                  <div className="bg-agri-main h-full rounded-full transition-all duration-500" style={{ width: `${calculateProgress()}%` }}></div>
                </div>
              </div>
              <button onClick={() => { if(window.confirm('Reset tracker? All progress will be lost.')){ localStorage.removeItem('agricity_myfarm'); setFarmData(null); } }} className="flex-shrink-0 flex items-center gap-2 text-xs font-black text-gray-500 hover:text-red-500 transition px-4 py-2 bg-gray-50 rounded-lg shrink-0">
                <RotateCcw size={14} /> Start Fresh
              </button>
            </div>

            {/* Timeline UI */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E9F0EC] shadow-sm">
              <h3 className="font-black text-[#1A2E24] text-xl mb-8 flex items-center gap-2">
                <Calendar size={20} className="text-agri-main" /> Activity Timeline
              </h3>
              
              <div className="relative border-l-2 border-[#E9F0EC] ml-4 sm:ml-6 space-y-8 pb-4">
                {farmData.timeline.map((item, idx) => {
                  const isCompleted = item.status === 'completed';
                  return (
                    <div key={idx} className={`relative pl-8 transition-opacity duration-300 ${isCompleted ? 'opacity-60' : 'opacity-100'}`}>
                      {/* Timeline Dot Button */}
                      <button onClick={() => toggleTask(idx)} className={`absolute -left-[17px] top-1 p-1 rounded-full bg-white transition-colors cursor-pointer ${isCompleted ? 'text-agri-main' : 'text-gray-300 hover:text-agri-main'}`}>
                        {isCompleted ? <CheckCircle size={24} className="fill-agri-main text-white" /> : <Circle size={24} className="fill-white" />}
                      </button>

                      {/* Content Card */}
                      <div className={`p-5 rounded-2xl border-2 transition-all ${isCompleted ? 'border-transparent bg-[#F9FBFA]' : 'border-[#E9F0EC] bg-white hover:border-agri-main/40 hover:shadow-md'}`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                          <h4 className={`text-lg font-black ${isCompleted ? 'line-through text-gray-400' : 'text-[#1A2E24]'}`}>{item.phase}</h4>
                          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full self-start ${isCompleted ? 'bg-gray-200 text-gray-500' : 'bg-agri-main/10 text-agri-main'}`}>
                            {calculateDate(item.day)} • Day {item.day}
                          </span>
                        </div>
                        <p className={`text-sm font-medium ${isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>{item.action}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default MyFarm;

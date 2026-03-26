import React, { useState } from 'react';
import { UploadCloud, CheckCircle, AlertTriangle, ShieldAlert, Loader2, ArrowRight, Microscope, Leaf, Stethoscope, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { handleDownloadPDF } from '../utils/generatePDF';

const DiseasePrediction = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selected);
      // Reset past results
      setResult(null);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select an image first.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post('http://127.0.0.1:8001/predict-disease', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.error) {
        setError(res.data.error);
      } else {
        setResult(res.data);
        
        // Auto-save history
        try {
          const userObj = JSON.parse(localStorage.getItem('user'));
          const userId = userObj ? userObj.email : 'guest';
          await axios.post('http://localhost:5001/api/scan-history', {
            userId,
            disease: res.data.disease,
            confidence: res.data.confidence,
            advice: res.data.advice
          });
        } catch (historyErr) {
          console.error("Failed to save scan history", historyErr);
        }
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to the prediction service. Ensure ML service is running on port 8001.");
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
            <ShieldAlert size={200} />
          </div>
          <div className="relative z-10 max-w-xl text-center sm:text-left">
            <p className="text-[#8FB89A] font-black uppercase tracking-[0.3em] text-xs mb-2">Plant Pathology AI</p>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight mb-3">Disease Prediction</h1>
            <p className="text-green-100 font-medium leading-relaxed">Upload a clear picture of a diseased leaf. Our deep learning model instantly diagnoses the pathogen and provides actionable treatment advisory.</p>
          </div>
          <div className="relative z-10 hidden lg:flex bg-white/10 p-5 border border-white/20 rounded-2xl items-center gap-4 backdrop-blur-sm">
             <div className="bg-agri-main text-white p-3 rounded-xl"><Stethoscope size={24} /></div>
             <div>
               <p className="text-white font-black text-lg">Instant Diagnosis</p>
               <p className="text-xs text-green-100 mt-0.5">98% Model Accuracy</p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Upload Form Section */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-6 border border-[#E9F0EC] shadow-sm sticky top-24">
              <h2 className="font-black text-[#1A2E24] text-lg flex items-center gap-2 mb-6"><UploadCloud size={18} className="text-agri-main" /> Upload Image</h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <label htmlFor="file-upload" className={`w-full h-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${preview ? 'border-agri-main bg-agri-main/5' : 'border-[#E9F0EC] hover:border-agri-main/50 bg-[#F9FBFA]'}`}>
                  {preview ? (
                    <img src={preview} alt="Leaf preview" className="h-full w-full object-cover opacity-90 transition-opacity hover:opacity-100" />
                  ) : (
                    <div className="flex flex-col items-center text-gray-500 p-6 text-center">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#E9F0EC] mb-4 text-agri-main">
                        <UploadCloud size={32} />
                      </div>
                      <span className="text-sm font-black text-[#1A2E24]">Click to upload leaf image</span>
                      <span className="text-xs font-medium text-gray-400 mt-2">Supports PNG, JPG (Max 10MB)</span>
                    </div>
                  )}
                  <input 
                    id="file-upload" 
                    name="file" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileChange}
                  />
                </label>
                
                <button
                  type="submit"
                  disabled={!file || loading}
                  className="w-full bg-[#1A2E24] text-white py-4 rounded-xl font-black text-sm hover:bg-agri-main transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <><Loader2 size={16} className="animate-spin" /> Scanning Image...</>
                  ) : (
                    <>Diagnose Disease <ArrowRight size={16} /></>
                  )}
                </button>
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
                <Microscope size={64} className="text-[#E9F0EC] mb-4" />
                <h3 className="text-lg font-black text-gray-400 mb-2">No active scan</h3>
                <p className="text-sm text-gray-400 max-w-sm">Upload a close-up picture of an affected crop leaf to generate a comprehensive pathology report.</p>
              </div>
            )}

            {loading && (
              <div className="h-full min-h-[400px] bg-white rounded-3xl border border-[#E9F0EC] shadow-sm flex flex-col items-center justify-center p-12 text-center">
                <Loader2 size={48} className="text-agri-main animate-spin mb-4" />
                <p className="text-sm font-black text-agri-main mb-1">Analyzing Pathogens...</p>
                <p className="text-xs text-gray-400 font-medium">Cross-referencing ML visual markers.</p>
              </div>
            )}

            {result && (
              <div className="space-y-6 animate-fade-in" id="disease-report">
                
                <div className="flex justify-end">
                   <button onClick={() => handleDownloadPDF('disease-report', 'Disease-Diagnosis-Report.pdf')} className="bg-[#1A2E24] text-white px-5 py-2.5 rounded-xl text-xs font-black hover:bg-agri-main transition shadow">
                     ↓ Download PDF Report
                   </button>
                </div>

                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E9F0EC] shadow-sm">
                  
                  {/* Result Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#E9F0EC]">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${result.disease === 'Healthy' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {result.disease === 'Healthy' ? <CheckCircle size={32} /> : <AlertTriangle size={32} />}
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pathology Diagnosis</p>
                        <h2 className="text-2xl sm:text-3xl font-black text-[#1A2E24]">{result.disease}</h2>
                      </div>
                    </div>
                    
                    <div className="text-left sm:text-right bg-[#F9FBFA] px-5 py-3 rounded-2xl border border-[#E9F0EC]">
                      <p className="text-[10px] font-black text-agri-main uppercase tracking-widest mb-1">AI Confidence</p>
                      <p className="text-2xl font-black text-[#1A2E24]">{result.confidence}%</p>
                    </div>
                  </div>

                  {/* Confidence Bar */}
                  <div className="mb-8">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex justify-between">
                       <span>Detection Certainty</span>
                       <span>{result.confidence}%</span>
                     </p>
                     <div className="w-full bg-[#E9F0EC] rounded-full h-3 overflow-hidden">
                       <div className="bg-agri-main h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${result.confidence}%` }}></div>
                     </div>
                  </div>

                  {/* Advice Card */}
                  <div className="bg-agri-main/5 p-6 rounded-2xl border border-agri-main/20 relative">
                     <div className="absolute -top-3 -left-3 bg-agri-main text-white p-2.5 rounded-xl shadow-sm">
                       <Stethoscope size={18} />
                     </div>
                     <h4 className="font-black text-[#1A2E24] mb-3 ml-7">Treatment & Advisory</h4>
                     <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                       {result.advice}
                     </p>
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

export default DiseasePrediction;

import React, { useState } from 'react';
import { UploadCloud, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import axios from 'axios';

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
      const res = await axios.post('http://localhost:8000/predict-disease', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (res.data.error) {
        setError(res.data.error);
      } else {
        setResult(res.data);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to the prediction service. Ensure ML service is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-agri-light py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-5xl w-full">
        <div className="max-w-4xl mx-auto">
          <div className="relative h-64 rounded-3xl overflow-hidden mb-8 shadow-2xl">
            <img src="/images/disease_sample.png" alt="Plant Disease Analysis" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-agri-main/80 to-transparent flex items-end p-8">
              <h1 className="text-4xl font-extrabold text-white">Plant Disease Prediction</h1>
            </div>
          </div>
          <div className="text-center mb-10 block">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Plant Disease Diagnosis
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Upload a clear picture of the diseased leaf for instant AI diagnosis and treatment advisory.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
           {/* Upload Section */}
           <div className="p-8 border-r border-gray-100 flex flex-col justify-center">
             <form onSubmit={handleSubmit} className="flex flex-col items-center">
               <label htmlFor="file-upload" className={`w-full h-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${preview ? 'border-agri-main bg-green-50' : 'border-gray-300 hover:border-agri-main hover:bg-gray-50'}`}>
                 {preview ? (
                   <img src={preview} alt="Leaf preview" className="h-full w-full object-cover rounded-2xl opacity-80" />
                 ) : (
                   <div className="flex flex-col items-center text-gray-500">
                      <UploadCloud size={48} className="mb-4 text-agri-main" />
                      <span className="text-sm font-medium">Click to upload leaf image</span>
                      <span className="text-xs mt-1">PNG, JPG up to 10MB</span>
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
                  className="mt-8 w-full bg-agri-main text-white py-4 px-8 rounded-xl font-bold text-lg hover:bg-agri-dark transition-all disabled:opacity-50 flex justify-center items-center h-14"
                >
                  {loading ? (
                    <div className="flex gap-2 items-center">
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-200"></div>
                    </div>
                  ) : 'Diagnose Disease'}
                </button>
                {error && <p className="mt-4 text-red-500 text-sm font-medium text-center">{error}</p>}
             </form>
           </div>

           {/* Results Section */}
           <div className="bg-gray-50 p-8 flex flex-col justify-center relative">
              {result ? (
                <div className="animate-float" style={{animationDuration: '6s'}}>
                  <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-red-100 text-red-600 rounded-full">
                      {result.disease === 'Healthy' ? <CheckCircle size={32} className="text-green-500" /> : <AlertTriangle size={32} />}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Diagnosis</h3>
                      <p className="text-2xl font-bold text-gray-900">{result.disease}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between items-end mb-2">
                       <span className="text-sm font-medium text-gray-600">AI Confidence</span>
                       <span className="text-lg font-bold text-agri-main">{result.confidence}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-agri-main h-2.5 rounded-full" style={{ width: `${result.confidence}%` }}></div>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative">
                     <div className="absolute -top-3 -left-3 bg-blue-100 text-blue-600 p-2 rounded-full shadow-sm">
                       <Info size={16} />
                     </div>
                     <h4 className="font-semibold text-gray-900 mb-2">Treatment & Advice</h4>
                     <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                       {result.advice}
                     </p>
                  </div>
                </div>
              ) : (
                <div className="text-center opacity-40">
                  <ShieldAlert size={64} className="mx-auto mb-4" />
                  <p className="text-lg text-gray-500">Awaiting image scan...</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default DiseasePrediction;

import React, { useState } from 'react';
import { Leaf, Droplets, ThermometerSun, TestTube, CloudRain } from 'lucide-react';
import axios from 'axios';

const CropRecommendation = () => {
  const [formData, setFormData] = useState({
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    temperature: '',
    humidity: '',
    ph: '',
    rainfall: ''
  });
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    // Ensure they are numbers
    const payload = {
      nitrogen: Number(formData.nitrogen),
      phosphorus: Number(formData.phosphorus),
      potassium: Number(formData.potassium),
      temperature: Number(formData.temperature),
      humidity: Number(formData.humidity),
      ph: Number(formData.ph),
      rainfall: Number(formData.rainfall)
    };

    try {
      // Connect to ML service predicting crop
      const res = await axios.post('http://localhost:8000/predict-crop', payload);
      
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

  const inputFields = [
    { name: 'nitrogen', label: 'Nitrogen (N)', icon: Leaf, placeholder: 'Ratio of N in soil', type: 'number' },
    { name: 'phosphorus', label: 'Phosphorus (P)', icon: Leaf, placeholder: 'Ratio of P in soil', type: 'number' },
    { name: 'potassium', label: 'Potassium (K)', icon: Leaf, placeholder: 'Ratio of K in soil', type: 'number' },
    { name: 'temperature', label: 'Temperature (°C)', icon: ThermometerSun, placeholder: 'E.g., 25', type: 'number', step: '0.1' },
    { name: 'humidity', label: 'Humidity (%)', icon: Droplets, placeholder: 'E.g., 70', type: 'number', step: '0.1' },
    { name: 'ph', label: 'pH Value', icon: TestTube, placeholder: 'E.g., 6.5', type: 'number', step: '0.1' },
    { name: 'rainfall', label: 'Rainfall (mm)', icon: CloudRain, placeholder: 'E.g., 200', type: 'number', step: '0.1' },
  ];

  return (
    <div className="min-h-[85vh] bg-agri-light py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="relative h-64 rounded-3xl overflow-hidden mb-8 shadow-2xl">
          <img src="/images/soil_scan.png" alt="Soil Analysis" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-agri-main/80 to-transparent flex items-end p-8">
            <h1 className="text-4xl font-extrabold text-white">AI Crop Recommendation</h1>
          </div>
        </div>
        <div className="text-center mb-10">
          <p className="mt-4 text-lg text-gray-600">
            Enter your soil and weather parameters to find the best crop for your farm.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden md:flex">
          {/* Form Section */}
          <div className="md:w-3/5 p-8">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {inputFields.map((field) => {
                const Icon = field.icon;
                return (
                  <div key={field.name} className={`${field.name === 'rainfall' ? 'sm:col-span-2' : ''}`}>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2 gap-2">
                       <Icon size={16} className="text-agri-main" /> {field.label}
                    </label>
                    <input
                      type={field.type}
                      step={field.step}
                      name={field.name}
                      required
                      value={formData[field.name]}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-agri-main focus:border-transparent transition-all outline-none"
                    />
                  </div>
                );
              })}
              
              <div className="sm:col-span-2 mt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-agri-main text-white py-4 px-8 rounded-xl font-bold text-lg hover:bg-agri-dark transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center h-14"
                >
                  {loading ? (
                    <div className="flex gap-2 items-center">
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-200"></div>
                    </div>
                  ) : 'Predict Best Crop'}
                </button>
              </div>
            </form>
          </div>

          {/* Result Section */}
          <div className="md:w-2/5 bg-gradient-to-br from-agri-main to-agri-dark p-8 text-white flex flex-col justify-center relative overflow-hidden">
             
             {/* Decorative Background */}
             <div className="absolute top-0 right-0 p-12 opacity-10">
                <Leaf size={200} />
             </div>

             <div className="relative z-10 h-full flex flex-col justify-center items-center text-center">
               {error ? (
                  <div className="bg-red-500 bg-opacity-20 p-6 rounded-2xl border border-red-400">
                    <p className="font-medium">{error}</p>
                  </div>
               ) : result ? (
                 <div className="animate-float" style={{animationDuration: '4s'}}>
                   <h3 className="text-xl font-medium text-agri-light mb-2">Recommended Crop</h3>
                   <div className="text-5xl font-extrabold capitalize mb-6">{result.recommended_crop}</div>
                   
                   <div className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur-sm">
                     <p className="text-sm">Based on current conditions</p>
                     <p className="font-semibold text-agri-accent mt-1">Season: {result.season_used}</p>
                   </div>
                 </div>
               ) : (
                 <div className="opacity-80">
                   <Leaf size={64} className="mx-auto mb-4 animate-pulse" />
                   <p className="text-lg">Awaiting input data...</p>
                 </div>
               )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropRecommendation;

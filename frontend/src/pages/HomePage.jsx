import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ShieldAlert, BadgeIndianRupee, CloudSun, ArrowRight } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const HomePage = () => {
  const { user } = useContext(AuthContext);

  const features = [
    {
      title: 'AI Crop Recommendation',
      description: 'Get precise crop recommendations based on your soil profile and climate data.',
      icon: Leaf,
      path: '/crop',
      color: 'bg-green-100 text-green-600',
      delay: '0.1s'
    },
    {
      title: 'Disease Prediction',
      description: 'Upload a picture of a diseased leaf and our AI will diagnose it instantly.',
      icon: ShieldAlert,
      path: '/disease',
      color: 'bg-yellow-100 text-yellow-600',
      delay: '0.2s'
    },
    {
      title: 'Market Prices',
      description: 'Check real-time APMC market prices for your crops across various districts.',
      icon: BadgeIndianRupee,
      path: '/prices',
      color: 'bg-blue-100 text-blue-600',
      delay: '0.3s'
    },
    {
      title: 'Weather Advisory',
      description: 'Hyperlocal weather forecasts tailored for agricultural decision making.',
      icon: CloudSun,
      path: '/advisory',
      color: 'bg-orange-100 text-orange-600',
      delay: '0.4s'
    }
  ];

  return (
    <div className="min-h-[90vh]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-agri-main pt-24 pb-48">
        {/* Hero Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/hero.png" 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-30 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-agri-main/60 via-agri-main/40 to-agri-light"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
            Welcome back, {user ? user.name.split(' ')[0] : 'Farmer'}! 👋
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-agri-light opacity-90">
            Your crops are looking healthy today. Let's optimize your farming with cutting-edge AI.
          </p>
          
          <div className="mt-10 flex justify-center gap-4">
            <Link to="/crop" className="px-8 py-4 bg-white text-agri-main rounded-xl font-bold hover:bg-agri-light transition shadow-lg flex items-center gap-2">
              <Leaf size={20} /> Start Soil Scan
            </Link>
            <button className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-bold hover:bg-white hover:text-agri-main transition flex items-center gap-2">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Dashboard */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div 
                key={idx} 
                className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 transform hover:-translate-y-2"
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${feature.color} mb-6`}>
                  <Icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {feature.description}
                </p>
                <Link to={feature.path} className="inline-flex items-center text-agri-main font-semibold hover:text-agri-dark">
                  Explore <ArrowRight size={16} className="ml-2" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>
      
      {/* Quick Stats or extra dashboard info can go here */}
      <section className="bg-agri-light py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
           <h2 className="text-3xl font-bold text-gray-900 mb-8">Why Use AgriTech?</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <div className="glass-panel p-6">
                <div className="text-agri-main font-bold text-4xl mb-4">98%</div>
                <h4 className="font-semibold text-lg text-gray-900 mb-2">Disease Accuracy</h4>
                <p className="text-gray-600 font-sm">Our AI models are trained on thousands of leaves to identify issues quickly.</p>
              </div>
              <div className="glass-panel p-6">
                <div className="text-agri-main font-bold text-4xl mb-4">50+</div>
                <h4 className="font-semibold text-lg text-gray-900 mb-2">Supported Crops</h4>
                <p className="text-gray-600 font-sm">Extensive database and logic ensuring suitability across various yields.</p>
              </div>
              <div className="glass-panel p-6">
                <div className="text-agri-main font-bold text-4xl mb-4">24/7</div>
                <h4 className="font-semibold text-lg text-gray-900 mb-2">AI Assistant</h4>
                <p className="text-gray-600 font-sm">Multilingual support to help you out directly on the farm.</p>
              </div>
           </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

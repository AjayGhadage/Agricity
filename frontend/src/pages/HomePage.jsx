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
            Welcome back, {user?.name?.split(' ')[0] || 'Farmer'}! 👋
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

      {/* Trending Agri News */}
      <section className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <p className="text-agri-main font-black uppercase tracking-widest text-sm mb-2">Live Updates</p>
              <h2 className="text-3xl sm:text-4xl font-black text-[#1A2E24] tracking-tight">Trending Agri-News 📰</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#F9FBFA] rounded-3xl p-6 border border-[#E9F0EC] hover:shadow-lg transition-all duration-300">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 font-bold text-xs rounded-lg mb-4">Export Policy</span>
              <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">Onion Export Ban Lifted: Prices Expected to Surge by 30%</h3>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">The central government has officially reversed the export ban on onions, opening up markets in the Middle East routing out of Nashik APMC.</p>
              <p className="text-xs font-bold text-gray-400 uppercase">2 Hours Ago</p>
            </div>
            <div className="bg-[#F9FBFA] rounded-3xl p-6 border border-[#E9F0EC] hover:shadow-lg transition-all duration-300">
              <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 font-bold text-xs rounded-lg mb-4">Weather Alert</span>
              <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">Monsoon 2026: IMD Predicts Early Onset in Maharashtra</h3>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">Farmers are advised to prepare soil early as the southwestern monsoon is predicted to hit the Konkan coast 5 days ahead of schedule.</p>
              <p className="text-xs font-bold text-gray-400 uppercase">5 Hours Ago</p>
            </div>
            <div className="bg-[#F9FBFA] rounded-3xl p-6 border border-[#E9F0EC] hover:shadow-lg transition-all duration-300">
              <span className="inline-block px-3 py-1 bg-green-100 text-green-700 font-bold text-xs rounded-lg mb-4">Govt Subsidy</span>
              <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">PM-Kisan 16th Installment Releasing Next Week</h3>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">Eligible farmers checking the subsidy portal are confirmed to receive ₹2,000 deposited directly into linked Aadhar bank accounts.</p>
              <p className="text-xs font-bold text-gray-400 uppercase">1 Day Ago</p>
            </div>
          </div>
        </div>
      </section>

      {/* Farmer Success Stories */}
      <section className="py-20 bg-[#1A2E24] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-500 via-[#1A2E24] to-[#1A2E24]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <p className="text-[#8FB89A] font-black uppercase tracking-[0.2em] text-sm mb-3">Kisaan Prerana</p>
            <h2 className="text-4xl text-white font-black tracking-tight">Community Success Stories 🤝</h2>
            <p className="text-green-100/80 mt-4 max-w-2xl mx-auto">Connect with top-performing local farmers who used AgriTech to revolutionize their yields. Peer-to-peer learning builds stronger communities.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all">
              <div className="w-16 h-16 bg-agri-main rounded-2xl flex items-center justify-center text-white text-2xl font-black mb-6">RP</div>
              <h3 className="text-2xl font-black text-white mb-2">Ramesh Patil</h3>
              <p className="text-green-300 font-bold text-sm mb-4">Nashik, Maharashtra</p>
              <p className="text-green-100/90 text-sm leading-relaxed mb-6">"Using the Deep AI Pathology engine, I saved my 5-acre tomato plot from early blight by applying the recommended Organic Copper fungicide exactly on time. Saved ₹40,000 in potential losses."</p>
              <div className="bg-white/10 rounded-xl p-4 flex items-center justify-between border border-white/10">
                <div>
                  <p className="text-[#8FB89A] text-[10px] font-bold uppercase tracking-widest mb-1">Mentor Contact</p>
                  <p className="text-white font-bold tracking-wider">+91 98765 43210</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all">
              <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center text-white text-2xl font-black mb-6">SK</div>
              <h3 className="text-2xl font-black text-white mb-2">Suresh Kumar</h3>
              <p className="text-orange-300 font-bold text-sm mb-4">Pune, Maharashtra</p>
              <p className="text-green-100/90 text-sm leading-relaxed mb-6">"I checked the Smart Route Logistics AI before selling my 100 quintals of Onion. Instead of the local yard, it calculated a ₹45,000 net extra profit if I rented a truck to Vashi APMC. The AI math was flawless."</p>
              <div className="bg-white/10 rounded-xl p-4 flex items-center justify-between border border-white/10">
                <div>
                  <p className="text-[#8FB89A] text-[10px] font-bold uppercase tracking-widest mb-1">Mentor Contact</p>
                  <p className="text-white font-bold tracking-wider">+91 91234 56789</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all">
              <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-white text-2xl font-black mb-6">AD</div>
              <h3 className="text-2xl font-black text-white mb-2">Anita Devi</h3>
              <p className="text-blue-300 font-bold text-sm mb-4">Jalgaon, Maharashtra</p>
              <p className="text-green-100/90 text-sm leading-relaxed mb-6">"I didn't know I was eligible for the MahaDBT Drip Irrigation scheme. The Govt Subsidy Finder matched my land size and caste instantly. I secured an 80% subsidy safely and modernized my farm."</p>
              <div className="bg-white/10 rounded-xl p-4 flex items-center justify-between border border-white/10">
                <div>
                  <p className="text-[#8FB89A] text-[10px] font-bold uppercase tracking-widest mb-1">Mentor Contact</p>
                  <p className="text-white font-bold tracking-wider">+91 99887 76655</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;

import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Target, Leaf, Navigation, ShieldAlert, BadgeIndianRupee, CloudSun, UserCircle, Clock, Calendar, ChevronDown, Info, Sprout, Landmark, Calculator, Truck, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, logout, user } = useContext(AuthContext);
  const location = useLocation();
  const [showMore, setShowMore] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowMore(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setShowMore(false);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const primaryLinks = [
    { name: 'Crop Recs', path: '/crop', icon: Leaf },
    { name: 'Disease Scan', path: '/disease', icon: ShieldAlert },
    { name: 'My Farm P&L', path: '/profile', icon: Target },
    { name: 'Markets', path: '/prices', icon: BadgeIndianRupee },
  ];

  const secondaryLinks = [
    { name: 'My Farm Tracker', path: '/my-farm', icon: Leaf, desc: 'Track crop lifecycles & alerts' },
    { name: 'Govt Subsidies', path: '/subsidies', icon: Landmark, desc: 'Find eligible schemes & grants' },
    { name: 'Fertilizer Calculator', path: '/calculator', icon: Calculator, desc: 'Calculate NPK costs & ROI' },
    { name: 'Weather Advisory', path: '/advisory', icon: CloudSun, desc: 'Local forecasts & warnings' },
    { name: 'Scan History', path: '/history', icon: Clock, desc: 'Past disease predictions' },
    { name: 'Crop Calendar', path: '/calendar', icon: Calendar, desc: 'Monthly sowing timelines' },
    { name: 'Smart Logistics AI', path: '/logistics', icon: Truck, desc: 'Calculate Mandi profits & paths' },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-[#E9F0EC] sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center min-w-max pr-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="p-2 bg-[#1A2E24] rounded-xl text-white group-hover:bg-agri-main transition-colors shadow-sm">
                <Leaf size={22} className="stroke-[2.5]" />
              </div>
              <span className="font-black text-2xl text-[#1A2E24] tracking-tight hidden sm:block">Agri<span className="text-agri-main">Tech</span></span>
            </Link>
          </div>

          {/* Primary Nav Links */}
          <div className="hidden lg:flex items-center space-x-1 flex-1 justify-center">
            {primaryLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                    isActive 
                      ? 'bg-[#F9FBFA] text-agri-main border border-[#E9F0EC] shadow-sm' 
                      : 'text-gray-500 hover:bg-gray-50 hover:text-[#1A2E24]'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-agri-main' : 'text-gray-400'} />
                  {link.name}
                </Link>
              );
            })}

            {/* Additional Features Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setShowMore(!showMore)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all focus:outline-none ${
                  showMore || secondaryLinks.some(l => l.path === location.pathname)
                    ? 'bg-[#1A2E24] text-white shadow-md' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-[#1A2E24]'
                }`}
              >
                More Features
                <ChevronDown size={14} className={`transition-transform duration-200 ${showMore ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Dropdown Menu */}
              {showMore && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#E9F0EC] p-3 grid grid-cols-1 gap-1 animate-fade-in origin-top">
                  {secondaryLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.path;
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${
                          isActive ? 'bg-[#F9FBFA] border border-[#E9F0EC]' : 'hover:bg-gray-50 border border-transparent hover:border-[#E9F0EC]'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${isActive ? 'bg-agri-main text-white' : 'bg-gray-100 text-gray-500'}`}>
                          <Icon size={18} />
                        </div>
                        <div>
                          <p className={`text-sm font-black ${isActive ? 'text-agri-main' : 'text-[#1A2E24]'}`}>{link.name}</p>
                          <p className="text-[10px] text-gray-400 font-medium leading-tight mt-0.5">{link.desc}</p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
            
            {/* About Us */}
            <Link to="/about" className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm text-gray-500 hover:bg-gray-50 hover:text-[#1A2E24] transition-all">
              <Info size={16} className="text-gray-400" />
              About Us
            </Link>
          </div>

          {/* Right Side: Translate widget + Auth/Profile */}
          <div className="flex items-center justify-end min-w-max gap-4 ml-4">
            
            {/* Google Translate Native Element Container */}
            <div className="hidden sm:block">
               <div id="google_translate_element"></div>
            </div>

            {/* User Profile / Login (Desktop) */}
            <div className="hidden lg:flex items-center space-x-6 min-w-max pl-6">
              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <Link to="/profile" className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                    <div className="w-9 h-9 bg-[#F9FBFA] border border-[#E9F0EC] rounded-full flex items-center justify-center shadow-sm">
                      <UserCircle size={20} className="text-[#1A2E24]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[#1A2E24] leading-none">{user?.name?.split(' ')[0] || "Farmer"}</span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Premium Member</span>
                    </div>
                  </Link>
                  <button
                    onClick={logout}
                    className="px-4 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors shadow-sm"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/auth" className="text-sm font-bold text-gray-500 hover:text-[#1A2E24] transition-colors">Login</Link>
                  <Link to="/auth" className="px-5 py-2 text-sm font-bold bg-[#1A2E24] text-white rounded-xl shadow-md hover:shadow-xl hover:bg-agri-main transition-all">Sign Up</Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex lg:hidden items-center ml-auto">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl text-gray-500 hover:text-[#1A2E24] hover:bg-gray-100 transition-colors focus:outline-none"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E9F0EC] bg-white absolute w-full left-0 animate-fade-in shadow-xl pb-6">
          <div className="px-4 pt-4 pb-2 space-y-1 h-[70vh] overflow-y-auto">
            
            {/* Mobile Primary Links */}
            <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 mb-2">Main Features</p>
            {primaryLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl font-bold transition-all ${
                    isActive ? 'bg-[#F9FBFA] text-agri-main border border-[#E9F0EC]' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-agri-main' : 'text-gray-400'} />
                  {link.name}
                </Link>
              );
            })}

            {/* Mobile Secondary Links */}
            <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-6 mb-2">More Tools</p>
            {secondaryLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl font-bold transition-all ${
                    isActive ? 'bg-[#F9FBFA] text-agri-main border border-[#E9F0EC]' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-agri-main' : 'text-gray-400'} />
                  <div className="flex flex-col">
                    <span>{link.name}</span>
                    <span className="text-[10px] text-gray-400 font-normal">{link.desc}</span>
                  </div>
                </Link>
              );
            })}

            {/* Mobile Auth Section */}
            <div className="mt-8 pt-6 border-t border-[#E9F0EC] px-3">
              {isAuthenticated ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#F9FBFA] border border-[#E9F0EC] rounded-full flex items-center justify-center">
                      <UserCircle size={24} className="text-[#1A2E24]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-base font-bold text-[#1A2E24] leading-none">{user?.name || "Farmer"}</span>
                      <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Premium Member</span>
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    className="w-full text-center px-4 py-3 text-sm font-bold text-red-600 bg-red-50 rounded-xl"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link to="/auth" className="text-center px-4 py-3 text-sm font-bold text-gray-600 bg-gray-50 border border-gray-100 rounded-xl">Login</Link>
                  <Link to="/auth" className="text-center px-4 py-3 text-sm font-bold bg-[#1A2E24] text-white rounded-xl">Sign Up</Link>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

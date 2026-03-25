import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Leaf, Navigation, ShieldAlert, BadgeIndianRupee, CloudSun, UserCircle } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, logout, user } = useContext(AuthContext);
  const location = useLocation();

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: Navigation },
    { name: 'Crop Recommendation', path: '/crop', icon: Leaf },
    { name: 'Disease Prediction', path: '/disease', icon: ShieldAlert },
    { name: 'Market Prices', path: '/prices', icon: BadgeIndianRupee },
    { name: 'Weather Advisory', path: '/advisory', icon: CloudSun },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex flex-shrink-0 items-center gap-2">
              <div className="p-2 bg-agri-main rounded-lg text-white">
                <Leaf size={24} />
              </div>
              <span className="font-bold text-2xl text-agri-main tracking-tight">Agri<span className="text-agri-earth">Tech</span></span>
            </Link>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md font-medium transition-colors ${
                    isActive 
                      ? 'bg-agri-light text-agri-main' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-agri-main'
                  }`}
                >
                  <Icon size={18} />
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Profile / Auth */}
          <div className="flex items-center">
             {isAuthenticated ? (
               <div className="flex items-center space-x-4">
                 <div className="hidden sm:flex items-center space-x-2 text-sm">
                   {user?.picture ? (
                     <img src={user.picture} alt="Profile" className="h-8 w-8 rounded-full border border-agri-light" />
                   ) : (
                     <UserCircle size={32} className="text-gray-400" />
                   )}
                   <div className="flex flex-col">
                     <span className="text-gray-800 font-medium">{user?.name || "Farmer"}</span>
                     <span className="text-xs text-gray-500">Premium Member</span>
                   </div>
                 </div>
                 <button
                   onClick={logout}
                   className="ml-4 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                 >
                   Logout
                 </button>
               </div>
             ) : (
               <Link
                 to="/auth"
                 className="bg-agri-main text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-agri-dark transition-colors shadow-sm"
               >
                 Sign In
               </Link>
             )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

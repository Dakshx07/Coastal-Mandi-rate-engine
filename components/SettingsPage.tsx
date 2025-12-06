import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Bell, 
  Shield, 
  Database, 
  LogOut, 
  ChevronRight, 
  Crown
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [dataSaver, setDataSaver] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-nunito">
      {/* Header */}
      <div className="bg-white sticky top-0 z-30 border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center">
          <Link to="/" className="p-2 -ml-2 hover:bg-slate-50 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-slate-700" />
          </Link>
          <h1 className="ml-2 text-xl font-heading font-bold text-slate-900">Settings</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        
        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center space-x-5 animate-fade-in hover:shadow-md transition-shadow">
          <div className="relative">
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-20 h-20 rounded-2xl border-4 border-slate-50 shadow-inner"
            />
            <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1.5 rounded-lg border-2 border-white">
              <Crown className="w-3 h-3" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-heading font-bold text-slate-900">{user.name}</h2>
            <p className="text-slate-500 font-medium text-sm">{user.email}</p>
            <div className="mt-2 inline-flex px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wide">
              Pro Member
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider px-2">App Preferences</h3>
          
          <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
            <div className="p-4 flex items-center justify-between border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-800">Push Notifications</div>
                  <div className="text-xs text-slate-500 font-medium">Alerts for price drops</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={notifications} onChange={() => setNotifications(!notifications)} />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 shadow-inner"></div>
              </label>
            </div>

            <div className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-800">Data Saver</div>
                  <div className="text-xs text-slate-500 font-medium">Reduce image quality</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={dataSaver} onChange={() => setDataSaver(!dataSaver)} />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Management */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider px-2">Management</h3>
          
          <Link to="/admin" className="block bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all active:scale-[0.99] group">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-slate-900 text-white rounded-xl group-hover:scale-110 transition-transform shadow-md shadow-slate-900/20">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-800">Admin Panel</div>
                  <div className="text-xs text-slate-500 font-medium">Manage rates & users</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-600 transition-colors" />
            </div>
          </Link>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full mt-8 p-4 bg-red-50 text-red-600 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-red-100 transition-colors border border-red-100 active:scale-[0.98]"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
        
        <div className="text-center pt-8 pb-4">
          <p className="text-xs font-bold text-slate-300">Coastal Mandi App v1.2.0</p>
        </div>
      </div>
    </div>
  );
};
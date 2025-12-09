import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bell,
  Shield,
  Database,
  LogOut,
  ChevronRight,
  Crown,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-nunito transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 sticky top-0 z-30 border-b border-slate-100 dark:border-slate-700 transition-colors duration-300">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center">
          <Link to="/" className="p-2 -ml-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-slate-700 dark:text-slate-200" />
          </Link>
          <h1 className="ml-2 text-xl font-heading font-bold text-slate-900 dark:text-white">{t('settings.title')}</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">

        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center space-x-5 animate-fade-in hover:shadow-md transition-all">
          <div className="relative">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-20 h-20 rounded-2xl border-4 border-slate-50 dark:border-slate-700 shadow-inner"
            />
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-lg border-2 border-white dark:border-slate-800">
              <Shield className="w-3 h-3" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-white">{user.name}</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">{user.email}</p>
            <div className="mt-2 inline-flex px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wide">
              {t('settings.verified')}
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2">{t('settings.preferences')}</h3>

          <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm">

            {/* Theme Selector */}
            <div className="p-4 flex items-center justify-between border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
                  {theme === 'light' ? <Sun className="w-5 h-5" /> : theme === 'dark' ? <Moon className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
                </div>
                <div>
                  <div className="font-bold text-slate-800 dark:text-white">{t('settings.appearance')}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {theme === 'light' ? t('settings.light') : theme === 'dark' ? t('settings.dark') : t('settings.system')}
                  </div>
                </div>
              </div>
              <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl">
                <button
                  onClick={() => setTheme('light')}
                  className={`p-2 rounded-lg transition-all ${theme === 'light' ? 'bg-white dark:bg-slate-600 shadow-sm text-amber-500' : 'text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                  title="Light Mode"
                >
                  <Sun className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`p-2 rounded-lg transition-all ${theme === 'dark' ? 'bg-white dark:bg-slate-600 shadow-sm text-indigo-500 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                  title="Dark Mode"
                >
                  <Moon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={`p-2 rounded-lg transition-all ${theme === 'system' ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-700 dark:text-slate-200' : 'text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                  title="System Default"
                >
                  <Monitor className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* WhatsApp Alerts */}
            <div className="p-4 flex items-center justify-between border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-800 dark:text-white">{t('settings.whatsapp_alerts')}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('settings.daily_updates')}</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={notifications} onChange={() => setNotifications(!notifications)} />
                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500 shadow-inner"></div>
              </label>
            </div>

            {/* Language Selector */}
            <div className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-800 dark:text-white">{t('settings.app_language')}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('settings.lang_desc')}</div>
                </div>
              </div>
              <select
                className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 font-bold"
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="ml">Malayalam</option>
                <option value="kn">Kannada</option>
              </select>
            </div>
          </div>
        </div>

        {/* Management */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2">{t('settings.management')}</h3>

          <Link to="/admin" className="block bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all active:scale-[0.99] group">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-slate-900 dark:bg-slate-700 text-white rounded-xl group-hover:scale-110 transition-transform shadow-md shadow-slate-900/20">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-800 dark:text-white">{t('settings.admin_panel')}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('settings.admin_desc')}</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-400 transition-colors" />
            </div>
          </Link>
        </div>

        <button
          onClick={handleLogout}
          className="w-full mt-8 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors border border-red-100 dark:border-red-900/30 active:scale-[0.98]"
        >
          <LogOut className="w-5 h-5" />
          <span>{t('settings.sign_out')}</span>
        </button>

        <div className="text-center pt-8 pb-4">
          <p className="text-xs font-bold text-slate-300 dark:text-slate-600">Coastal Mandi App v1.2.0</p>
        </div>
      </div>
    </div>
  );
};
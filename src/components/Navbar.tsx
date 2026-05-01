import React from 'react';
import { LogIn, LogOut, Heart, LayoutDashboard, PlusCircle, User as UserIcon, Trophy } from 'lucide-react';
import { loginWithGoogle, logout } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';

interface NavbarProps {
  onNavigate: (view: 'home' | 'admin' | 'new-case' | 'leaderboard' | 'profile') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const { user, profile, isAdmin } = useAuth();

  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <button 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 transition-transform active:scale-95"
          >
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Heart size={24} fill="currentColor" />
            </div>
            <div className="text-right">
              <h1 className="text-lg font-black text-gray-900 leading-none">داعم ومستفيد</h1>
              <p className="text-[9px] text-teal-600 font-black uppercase tracking-[0.2em] mt-1">Syria Relief</p>
            </div>
          </button>

          {user && (
            <div className="hidden lg:flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-gray-400">
              <button 
                onClick={() => onNavigate('home')}
                className="hover:text-gray-900 transition-colors"
              >
                الرئيسية
              </button>
              <button 
                onClick={() => onNavigate('leaderboard')}
                className="flex items-center gap-2 hover:text-gray-900 transition-colors"
              >
                <Trophy size={14} />
                <span>لوحة الشرف</span>
              </button>
              <button 
                onClick={() => onNavigate('new-case')}
                className="flex items-center gap-2 hover:text-gray-900 transition-colors"
              >
                <PlusCircle size={14} />
                <span>نشر حالة</span>
              </button>
              {isAdmin && (
                <button 
                  onClick={() => onNavigate('admin')}
                  className="flex items-center gap-2 text-orange-500 hover:text-orange-600 transition-colors"
                >
                  <LayoutDashboard size={14} />
                  <span>الإدارة</span>
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-6">
          {user ? (
            <div className="flex items-center gap-4">
              <button 
                onClick={() => onNavigate('profile')}
                className="flex items-center gap-4 text-right hover:opacity-80 transition-opacity"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-[11px] font-black text-gray-900 uppercase">{profile?.name}</p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{isAdmin ? 'Administrator' : 'Verified Member'}</p>
                </div>
                <div className="h-10 w-[1px] bg-gray-100 hidden sm:block" />
                <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
                   <UserIcon size={20} />
                </div>
              </button>
              <button 
                onClick={logout}
                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors rounded-xl hover:bg-red-50 border border-transparent hover:border-red-100"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <button 
              onClick={loginWithGoogle}
              className="flex items-center gap-3 bg-gray-900 text-white px-6 py-3 rounded-xl text-xs font-black shadow-xl hover:bg-teal-600 transition-all active:scale-95"
            >
              <LogIn size={18} />
              <span>تسجيل الدخول</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

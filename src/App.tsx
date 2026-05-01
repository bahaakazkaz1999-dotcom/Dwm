import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { CaseCard } from './components/CaseCard';
import { CaseForm } from './components/CaseForm';
import { DonationModal } from './components/DonationModal';
import { AdminDashboard } from './components/AdminDashboard';
import { Leaderboard } from './components/Leaderboard';
import { UserProfileView } from './components/UserProfile';
import { Case } from './types';
import { api } from './lib/api';
import { isConfigValid } from './lib/firebase';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Search, Filter, AlertCircle } from 'lucide-react';

const MainView = () => {
  const { user, profile, isAdmin } = useAuth();
  const [view, setView] = useState<'home' | 'admin' | 'new-case' | 'leaderboard' | 'profile'>('home');
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const data = await api.getCases();
        setCases(data.filter(c => ['approved', 'completed'].includes(c.status)));
      } catch (error) {
        console.error("Error fetching cases:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, [view]); // Refresh when view changes (e.g. after donation)

  const filteredCases = cases.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans" dir="rtl">
      {!isConfigValid && (
        <div className="bg-orange-500 text-white py-2 px-4 text-center text-xs font-bold animate-pulse">
          تنبيه: جاري تجهيز قاعدة البيانات. يرجى الانتظار قليلاً أو التأكد من إعداد Firebase.
        </div>
      )}
      <Navbar onNavigate={setView} />
      
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="relative pt-24 pb-16 px-6 overflow-hidden">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-teal-50 rounded-[100%] blur-[120px] -z-10 opacity-50"
                />
                
                <div className="max-w-7xl mx-auto text-center">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                  >
                    <h2 className="text-6xl md:text-8xl font-black text-gray-900 mb-6 tracking-tighter leading-[0.9]">
                      كن يداً <span className="text-teal-600">للبناء</span><br/>وقلباً <span className="text-emerald-500">للعطاء</span>
                    </h2>
                    <p className="text-lg text-gray-400 font-medium max-w-2xl mx-auto mb-12 leading-relaxed">
                      منصة داعم ومستفيد: الجسر الموثوق بين المانحين في الوطن العربي والحالات الإنسانية الموثقة في سوريا. تبرع آمن، شفافية مطلقة.
                    </p>
                  </motion.div>

                  <div className="relative max-w-2xl mx-auto mb-12">
                    <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-600 transition-colors" size={24} />
                    <input 
                      type="text" 
                      placeholder="ابحث عن حالة، مدينة، أو نوع دعم..."
                      className="w-full h-20 pr-16 pl-8 bg-white border-none rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] outline-none text-gray-900 placeholder:text-gray-300 text-lg font-medium focus:ring-4 focus:ring-teal-500/10 transition-all"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex flex-wrap justify-center gap-3">
                    {['كل الحالات', 'احتياجات طبية', 'كفالة أيتام', 'دعم تعليمي', 'إغاثة عاجلة'].map((tag, i) => (
                      <button 
                        key={tag}
                        className={cn(
                          "px-8 py-3 rounded-2xl text-xs font-black transition-all active:scale-95",
                          i === 0 ? "bg-gray-900 text-white shadow-xl" : "bg-white text-gray-400 border border-gray-100 hover:border-teal-200 hover:text-teal-600 shadow-sm"
                        )}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="max-w-7xl mx-auto px-6 pb-24">
                <div className="flex items-center justify-between mb-12">
                   <h3 className="text-2xl font-black text-gray-900">أحدث الحالات النشطة</h3>
                   <div className="flex gap-2">
                      <div className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-50 transition-colors">
                        <Filter size={18} />
                      </div>
                   </div>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="bg-white rounded-[2rem] h-[500px] animate-pulse border border-gray-50 shadow-sm" />
                    ))}
                  </div>
                ) : filteredCases.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {filteredCases.map((c) => (
                      <CaseCard 
                        key={c.id} 
                        caseData={c} 
                        onDonate={setSelectedCase} 
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-32 bg-white rounded-[3rem] border border-gray-50 shadow-sm">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-50 rounded-full mb-8">
                      <AlertCircle className="text-gray-300" size={48} />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-3">لا يوجد نتائج لبحثك</h3>
                    <p className="text-gray-500 font-medium tracking-tight">جرب البحث بكلمات أخرى أو تصفح الحالات العامة.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {view === 'new-case' && (
            <motion.div 
              key="new-case"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-7xl mx-auto px-4 py-12"
            >
              <CaseForm onSuccess={() => setView('home')} />
            </motion.div>
          )}

          {view === 'admin' && isAdmin && (
            <motion.div 
              key="admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AdminDashboard />
            </motion.div>
          )}

          {view === 'leaderboard' && (
            <motion.div 
              key="leaderboard"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Leaderboard />
            </motion.div>
          )}

          {view === 'profile' && (
            <motion.div 
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <UserProfileView />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="bg-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start justify-between gap-12">
            <div className="max-w-sm">
              <div className="flex items-center gap-3 text-white font-black text-2xl mb-6">
                <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center text-white">
                  <Heart size={24} fill="currentColor" />
                </div>
                <span>داعم ومستفيد</span>
              </div>
              <p className="text-gray-400 font-medium leading-relaxed mb-8">
                أول منصة سورية متكاملة تهدف لإحلال الشفافية في العمل الإنساني وربط المحتاجين بالداعمين بشكل مباشر وموثق.
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 text-sm">
              <div className="space-y-4">
                <h4 className="text-white font-black uppercase tracking-widest text-[10px]">المنصة</h4>
                <ul className="text-gray-500 font-bold space-y-3">
                  <li><button onClick={() => setView('home')} className="hover:text-teal-400 transition-colors">عن المنصة</button></li>
                  <li><button onClick={() => setView('leaderboard')} className="hover:text-teal-400 transition-colors">لوحة الشرف</button></li>
                  <li><button onClick={() => setView('home')} className="hover:text-teal-400 transition-colors">الأسئلة الشائعة</button></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-white font-black uppercase tracking-widest text-[10px]">الدعم</h4>
                <ul className="text-gray-500 font-bold space-y-3">
                  <li><a href="#" className="hover:text-teal-400 transition-colors">كيف تتبرع؟</a></li>
                  <li><a href="#" className="hover:text-teal-400 transition-colors">دليل المستفيد</a></li>
                  <li><a href="#" className="hover:text-teal-400 transition-colors">اتصل بنا</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-20 pt-10 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.2em]">&copy; 2026 داعم ومستفيد - جميع الحقوق محفوظة</p>
            <div className="flex gap-8 text-[10px] text-gray-600 font-black uppercase tracking-[0.2em]">
               <a href="#" className="hover:text-white transition-colors">Privacy</a>
               <a href="#" className="hover:text-white transition-colors">Terms</a>
               <a href="#" className="hover:text-white transition-colors">Security</a>
            </div>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {selectedCase && (
          <DonationModal 
            caseData={selectedCase} 
            onClose={() => setSelectedCase(null)}
            onSuccess={() => {
              setSelectedCase(null);
              // Could show a "Thank you" toast here
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainView />
    </AuthProvider>
  );
}

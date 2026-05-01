import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { Donation } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { motion } from 'motion/react';
import { Heart, Clock, CheckCircle2, ChevronLeft } from 'lucide-react';

export const UserProfileView: React.FC = () => {
  const { user, profile } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchUserDonations = async () => {
      try {
        const allDonations = await api.getDonations();
        setDonations(allDonations.filter(d => d.donorId === user.uid));
      } catch (error) {
        console.error("Error fetching user donations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDonations();
  }, [user]);

  if (!user) return <div className="p-12 text-center text-gray-400">يرجى تسجيل الدخول لعرض الملف الشخصي.</div>;

  const formatDate = (dateInput: any) => {
    if (!dateInput) return 'N/A';
    // Handle both Firebase Timestamp and serializable date string
    const date = dateInput.seconds ? new Date(dateInput.seconds * 1000) : new Date(dateInput);
    return date.toLocaleDateString('ar-SY');
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="bg-gray-900 rounded-[2.5rem] p-8 md:p-12 text-white mb-10 relative overflow-hidden">
        <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.1, scale: 1 }}
            className="absolute -right-20 -bottom-20 bg-teal-400 w-80 h-80 rounded-full blur-3xl p-6"
        />
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center text-teal-400 border border-white/20">
              <Heart size={48} className="fill-current" />
            </div>
            <div className="text-center md:text-right">
              <h2 className="text-3xl font-black mb-2">{profile?.name}</h2>
              <p className="text-gray-400 font-medium">{user.email}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-6">
                <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl">
                   <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">إجمالي المبادرات</p>
                   <p className="text-2xl font-black tracking-tighter text-teal-400">{profile?.totalDonated?.count || 0}</p>
                </div>
                {profile?.totalDonated?.SYP! > 0 && (
                   <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl">
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">إجمالي الليرات</p>
                      <p className="text-2xl font-black tracking-tighter">{formatCurrency(profile?.totalDonated!.SYP, 'SYP')}</p>
                   </div>
                )}
                {profile?.totalDonated?.USD! > 0 && (
                   <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl">
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">إجمالي الدولارات</p>
                      <p className="text-2xl font-black tracking-tighter">{formatCurrency(profile?.totalDonated!.USD, 'USD')}</p>
                   </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between mb-8">
           <h3 className="text-2xl font-black text-gray-900">سجل المساهمات</h3>
           <div className="text-xs font-bold text-gray-400 px-4 py-2 bg-gray-100 rounded-xl">
             {donations.length} عملية تبرع
           </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-gray-400">جاري تحميل سجل المساهمات...</div>
        ) : donations.length > 0 ? (
          <div className="grid gap-4">
            {donations.map((donation) => (
              <motion.div 
                key={donation.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-100 p-6 rounded-[2rem] hover:shadow-[0_15px_40px_rgba(0,0,0,0.03)] transition-all group active:scale-[0.99]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                      donation.status === 'confirmed' ? "bg-emerald-50 text-emerald-600" : 
                      donation.status === 'pending' ? "bg-orange-50 text-orange-600" : "bg-red-50 text-red-600"
                    )}>
                      {donation.status === 'confirmed' ? <CheckCircle2 size={24} /> : 
                       donation.status === 'pending' ? <Clock size={24} /> : <Ban size={24} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-black text-gray-900 text-lg">
                          {formatCurrency(donation.amount, donation.currency)}
                        </span>
                        <span className={cn(
                          "text-[10px] font-black uppercase px-2 py-0.5 rounded-lg border",
                          donation.status === 'confirmed' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : 
                          donation.status === 'pending' ? "bg-orange-500/10 text-orange-600 border-orange-500/20" : "bg-red-500/10 text-red-600 border-red-500/20"
                        )}>
                          {donation.status === 'confirmed' ? 'تم الاستلام' : 
                           donation.status === 'pending' ? 'بانتظار التأكيد' : 'مرفوض'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 font-medium">
                        تاريخ العملية: {formatDate(donation.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-left">
                    <p className="text-[10px] text-gray-300 font-black uppercase tracking-widest mb-1 group-hover:text-teal-600 transition-colors">Ref ID: {donation.paymentProof.slice(0, 8)}</p>
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:text-teal-600 group-hover:bg-teal-50 transition-all">
                       <ChevronLeft size={16} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center bg-gray-50 rounded-[3rem] border border-gray-100 italic text-gray-400">
            لم تقم بأي تبرعات حتى الآن. تبرعك الأول سيظهر هنا!
          </div>
        )}
      </div>
    </div>
  );
};

const Ban = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
);

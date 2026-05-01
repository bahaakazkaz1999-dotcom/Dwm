import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { UserProfile } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { motion } from 'motion/react';
import { Trophy, Medal, Star, User as UserIcon } from 'lucide-react';

export const Leaderboard: React.FC = () => {
  const [donors, setDonors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await api.getLeaderboard();
        setDonors(data);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-flex p-4 bg-orange-100 text-orange-600 rounded-3xl mb-6"
        >
          <Trophy size={48} />
        </motion.div>
        <h2 className="text-3xl font-black text-gray-900 mb-2">لوحة الشرف</h2>
        <p className="text-gray-500">تحية تقدير لأكثر الداعمين عطاءً في مجتمعنا.</p>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">جاري تحميل لوحة الشرف...</div>
        ) : donors.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {donors.map((donor, index) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                key={donor.uid} 
                className={cn(
                  "flex items-center justify-between p-6 hover:bg-gray-50/50 transition-colors",
                  index === 0 && "bg-orange-50/30"
                )}
              >
                <div className="flex items-center gap-6">
                  <div className="flex items-center justify-center w-10 text-xl font-black text-gray-300">
                    {index === 0 ? <Medal className="text-orange-500" size={32} /> : 
                     index === 1 ? <Medal className="text-gray-400" size={28} /> : 
                     index === 2 ? <Medal className="text-amber-700" size={24} /> : 
                     `#${index + 1}`}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600">
                      <UserIcon size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{donor.name}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex gap-2">
                          {donor.totalDonated?.SYP! > 0 && (
                            <span className="text-[10px] bg-teal-100 text-teal-700 px-2 py-0.5 rounded font-black">
                              {formatCurrency(donor.totalDonated!.SYP, 'SYP')}
                            </span>
                          )}
                          {donor.totalDonated?.USD! > 0 && (
                            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-black">
                              {formatCurrency(donor.totalDonated!.USD, 'USD')}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400 font-bold border-r pr-3 border-gray-100">
                          {donor.totalDonated?.count || 0} مبادرات دعم
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                    <Star className={cn("inline-block mb-1", index < 3 ? "text-orange-400 fill-orange-400" : "text-gray-200")} size={16} />
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">داعم متميز</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-20 text-center text-gray-400 italic">لا يوجد متبرعين مسجلين بعد. كن أول من يساهم!</div>
        )}
      </div>
    </div>
  );
};

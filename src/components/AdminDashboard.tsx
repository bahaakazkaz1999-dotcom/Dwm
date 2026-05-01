import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Case, Donation } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Clock, Ban, CreditCard, Filter } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'cases' | 'donations'>('cases');

  const fetchData = async () => {
    try {
      const [casesData, donationsData] = await Promise.all([
        api.getCases(),
        api.getDonations()
      ]);
      setCases(casesData);
      setDonations(donationsData);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Polling as a substitute for onSnapshot
    return () => clearInterval(interval);
  }, []);

  const handleCaseAction = async (caseId: string, status: 'approved' | 'rejected') => {
    try {
      await api.updateCase(caseId, { status });
      fetchData();
    } catch (err) {
      console.error("Error updating case:", err);
    }
  };

  const confirmDonation = async (donation: Donation) => {
    try {
      await api.confirmDonation(donation.id);
      fetchData();
    } catch (err) {
      console.error("Error confirming donation:", err);
    }
  };

  const addEvidence = async (caseId: string, url: string, type: 'image' | 'video') => {
    try {
      await api.updateCase(caseId, { evidence: [{ url, type }] });
      fetchData();
    } catch (err) {
      console.error("Error adding evidence:", err);
    }
  };

  const rejectDonation = async (donationId: string) => {
    try {
      await api.rejectDonation(donationId);
      fetchData();
    } catch (err) {
      console.error("Error rejecting donation:", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
        <div>
          <h1 className="text-4xl font-black text-gray-900 mb-2">مركز الإدارة</h1>
          <p className="text-gray-400 font-medium">إدارة الحالات الميدانية والتحقق من التبرعات الواردة.</p>
        </div>
        <div className="flex bg-white shadow-[0_10px_30px_rgba(0,0,0,0.03)] p-1.5 rounded-2xl border border-gray-100">
          <button 
            onClick={() => setActiveTab('cases')}
            className={cn(
              "px-8 py-3 rounded-xl text-xs font-black transition-all uppercase tracking-widest", 
              activeTab === 'cases' ? "bg-gray-900 text-white shadow-xl" : "text-gray-400 hover:text-gray-600"
            )}
          >
            الحالات النشطة
          </button>
          <button 
            onClick={() => setActiveTab('donations')}
            className={cn(
              "px-8 py-3 rounded-xl text-xs font-black transition-all uppercase tracking-widest", 
              activeTab === 'donations' ? "bg-gray-900 text-white shadow-xl" : "text-gray-400 hover:text-gray-600"
            )}
          >
            تأكيد التبرعات
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'cases' ? (
          <motion.div 
            key="cases-grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {cases.filter(c => c.status === 'pending').map(c => (
              <div key={c.id} className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] flex flex-col group">
                <div className="flex items-center justify-between mb-6">
                  <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-100 flex items-center gap-2">
                    <Clock size={12} />
                    بانتظار المراجعة
                  </span>
                  <span className="text-[10px] text-gray-300 font-bold uppercase">Pending</span>
                </div>
                
                <h3 className="font-black text-xl mb-3 text-gray-900 leading-snug">{c.title}</h3>
                <p className="text-sm text-gray-400 font-medium mb-8 line-clamp-2 leading-relaxed">{c.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-8 p-4 bg-gray-50 rounded-2xl">
                  <div>
                    <span className="block text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">الهدف</span>
                    <span className="font-black text-gray-900">{formatCurrency(c.targetAmount, c.currency)}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">المستفيد</span>
                    <span className="font-black text-gray-900">{c.beneficiaryName}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-auto">
                  <button 
                    onClick={() => handleCaseAction(c.id, 'approved')}
                    className="py-4 bg-gray-900 text-white rounded-2xl text-xs font-black shadow-xl hover:bg-teal-600 transition-all border border-gray-900 hover:border-teal-600"
                  >
                    قبول الحالة
                  </button>
                  <button 
                    onClick={() => handleCaseAction(c.id, 'rejected')}
                    className="py-4 bg-white text-gray-400 border border-gray-100 rounded-2xl text-xs font-black hover:text-red-500 hover:border-red-100 transition-all"
                  >
                    رفض
                  </button>
                </div>
              </div>
            ))}
            
            {cases.filter(c => c.status === 'completed').map(c => (
              <div key={c.id} className="bg-white border border-gray-200 p-8 rounded-[2.5rem] shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100 flex items-center gap-2">
                    <CheckCircle size={12} />
                    توثيق العمل الميداني
                  </span>
                </div>
                <h3 className="font-black text-xl mb-4 text-gray-900 leading-snug">{c.title}</h3>
                
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-3">
                    {c.evidence?.map((ev, i) => (
                      <div key={i} className="relative group/img overflow-hidden rounded-2xl border border-gray-100">
                        <img src={ev.url} className="w-20 h-20 object-cover transition-transform duration-500 group-hover/img:scale-110" alt="Evidence" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity" />
                      </div>
                    ))}
                    {(!c.evidence || c.evidence.length === 0) && (
                      <div className="w-full py-10 rounded-2xl border-2 border-dashed border-gray-100 text-center flex flex-col items-center justify-center gap-2 text-gray-300">
                        <Filter size={24} />
                        <p className="text-[10px] font-bold uppercase tracking-widest">لا يوجد إثباتات بعد</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="أضف رابط صورة للتوثيق..."
                      className="w-full h-14 pr-4 pl-4 bg-gray-50 border-none rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addEvidence(c.id, (e.target as HTMLInputElement).value, 'image');
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}

            {cases.filter(c => c.status === 'pending').length === 0 && cases.filter(c => c.status === 'completed').length === 0 && (
              <div className="col-span-full py-32 text-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200">
                   <Clock size={40} />
                </div>
                <p className="text-gray-400 font-black uppercase tracking-widest text-sm">جميع الحالات تمت مراجعتها</p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="donations-list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {donations.filter(d => d.status === 'pending').map(d => (
              <div key={d.id} className="group bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-[0_20px_60px_rgba(0,0,0,0.03)] transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                <div className="flex items-center gap-8">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[1.5rem] flex items-center justify-center shadow-inner">
                    <CreditCard size={32} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                       <h4 className="font-black text-2xl text-gray-900 tracking-tighter">{formatCurrency(d.amount, d.currency)}</h4>
                       <span className="text-[10px] font-black text-teal-600 bg-teal-50 px-2 py-0.5 rounded-lg">New Payment</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                       <span className="text-gray-900">{d.donorName}</span>
                       <span className="w-1 h-1 bg-gray-200 rounded-full" />
                       <span className="font-mono bg-gray-50 px-2 py-1 rounded text-[10px]">Reference: {d.paymentProof}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                  <button 
                    onClick={() => confirmDonation(d)}
                    className="flex-1 md:flex-none px-10 py-4 bg-gray-900 text-white rounded-2xl text-xs font-black shadow-xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-3"
                  >
                    <CheckCircle size={18} />
                    <span>تأكيد الوصل</span>
                  </button>
                  <button 
                    onClick={() => rejectDonation(d.id)}
                    className="flex-1 md:flex-none px-6 py-4 bg-white text-gray-300 border border-gray-100 rounded-2xl text-xs font-black hover:text-red-500 hover:border-red-100 transition-all flex items-center justify-center gap-2"
                  >
                    <Ban size={18} />
                    <span>رفض</span>
                  </button>
                </div>
              </div>
            ))}
            {donations.filter(d => d.status === 'pending').length === 0 && (
              <div className="py-32 text-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200">
                   <CreditCard size={40} />
                </div>
                <p className="text-gray-400 font-black uppercase tracking-widest text-sm">لا توجد دفعات بانتظار التأكيد</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

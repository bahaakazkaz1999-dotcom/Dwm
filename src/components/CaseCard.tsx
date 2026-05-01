import React from 'react';
import { Case } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { motion } from 'motion/react';
import { CheckCircle2, Clock, XCircle, AlertCircle, Heart } from 'lucide-react';

interface CaseCardProps {
  caseData: Case;
  onDonate?: (caseData: Case) => void;
  isAdminView?: boolean;
  onStatusChange?: (id: string, status: 'approved' | 'rejected') => void;
}

export const CaseCard: React.FC<CaseCardProps> = ({ caseData, onDonate, isAdminView, onStatusChange }) => {
  const percentage = Math.min((caseData.collectedAmount / caseData.targetAmount) * 100, 100);
  const remaining = caseData.targetAmount - caseData.collectedAmount;

  const statusInfo = {
    pending: { label: 'قيد المراجعة', color: 'bg-orange-500/10 text-orange-600 border-orange-500/20', icon: Clock },
    approved: { label: 'نشط الآن', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: CheckCircle2 },
    rejected: { label: 'مرفوض', color: 'bg-red-500/10 text-red-600 border-red-500/20', icon: XCircle },
    completed: { label: 'تم تحقيق الهدف', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: Heart },
  };

  const { label, color, icon: Icon } = statusInfo[caseData.status];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group bg-white rounded-[2rem] border border-gray-100 overflow-hidden hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-500 flex flex-col h-full active:scale-[0.98]"
    >
      <div className="p-7 flex-1">
        <div className="flex items-center justify-between mb-5">
          <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1.5", color)}>
            <Icon size={12} strokeWidth={3} />
            {label}
          </span>
          <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">
            {new Date(caseData.createdAt).toLocaleDateString('ar-SY', { month: 'long', day: 'numeric' })}
          </span>
        </div>

        <h3 className="text-xl font-black text-gray-900 mb-3 leading-[1.2] group-hover:text-teal-600 transition-colors">
          {caseData.title}
        </h3>
        <p className="text-sm text-gray-400 font-medium mb-8 line-clamp-3 leading-relaxed">
          {caseData.description}
        </p>

        {caseData.status === 'completed' && caseData.evidence && caseData.evidence.length > 0 && (
          <div className="mb-8 space-y-3">
            <p className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] opacity-30">Field Documentation</p>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {caseData.evidence.map((ev, i) => (
                <div key={i} className="relative shrink-0 rounded-2xl overflow-hidden border border-gray-50 group/img">
                  <motion.img 
                    whileHover={{ scale: 1.1 }}
                    src={ev.url} 
                    className="w-24 h-24 object-cover transition-transform duration-700" 
                    alt="Field Evidence"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-6 pt-4 border-t border-gray-50">
          <div>
            <div className="flex items-end justify-between font-bold mb-3">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">المجمع حالياً</span>
                <span className="text-2xl text-gray-900 tracking-tighter">
                  {formatCurrency(caseData.collectedAmount, caseData.currency)}
                </span>
              </div>
              <div className="text-right flex flex-col items-end">
                <span className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">الهدف</span>
                <span className="text-sm text-gray-400">{formatCurrency(caseData.targetAmount, caseData.currency)}</span>
              </div>
            </div>
            
            <div className="h-2.5 bg-gray-50 rounded-full overflow-hidden relative">
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: `${percentage}%` }}
                transition={{ duration: 1.5, ease: "circOut" }}
                className={cn(
                  "h-full rounded-full transition-all relative overflow-hidden",
                  percentage === 100 ? "bg-blue-600" : "bg-gradient-to-r from-teal-500 to-emerald-400"
                )}
              >
                <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
              </motion.div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 text-[10px] font-black">
                   {caseData.beneficiaryName.charAt(0)}
                </div>
                <span className="text-[10px] font-bold text-gray-400">{caseData.beneficiaryName}</span>
             </div>
             {percentage < 100 && (
               <span className="text-[10px] font-black text-emerald-600">
                 {percentage.toFixed(0)}% تم تحقيقه
               </span>
             )}
          </div>
        </div>
      </div>

      <div className="p-6 pt-0">
        {isAdminView ? (
          caseData.status === 'pending' && (
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => onStatusChange?.(caseData.id, 'approved')}
                className="py-3 bg-gray-900 text-white rounded-2xl text-xs font-black shadow-xl hover:bg-teal-600 transition-all border border-gray-900 hover:border-teal-600"
              >
                قبول الحالة
              </button>
              <button 
                onClick={() => onStatusChange?.(caseData.id, 'rejected')}
                className="py-3 bg-white text-gray-400 rounded-2xl text-xs font-black border border-gray-100 hover:text-red-500 hover:border-red-100 transition-all"
              >
                رفض
              </button>
            </div>
          )
        ) : (
          <button 
            disabled={caseData.status !== 'approved' || remaining <= 0}
            onClick={() => onDonate?.(caseData)}
            className={cn(
              "w-full py-4 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-3 relative overflow-hidden",
              remaining <= 0 
                ? "bg-gray-50 text-gray-300 cursor-not-allowed" 
                : "bg-gray-900 text-white hover:bg-teal-700 shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_15px_30px_rgba(0,0,0,0.2)] active:scale-[0.97]"
            )}
          >
            {remaining <= 0 ? (
              <>
                <CheckCircle2 size={18} strokeWidth={3} />
                <span>اكتمل الدعم</span>
              </>
            ) : (
              <>
                <Heart size={18} strokeWidth={3} className="fill-current" />
                <span>ساهم الآن</span>
              </>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
};

import React, { useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { X, Landmark, Info, AlertCircle, Heart } from 'lucide-react';
import { Case } from '../types';
import { formatCurrency } from '../lib/utils';

interface DonationModalProps {
  caseData: Case;
  onClose: () => void;
  onSuccess: () => void;
}

export const DonationModal: React.FC<DonationModalProps> = ({ caseData, onClose, onSuccess }) => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [proof, setProof] = useState('');
  const [error, setError] = useState<string | null>(null);

  const remaining = caseData.targetAmount - (caseData.collectedAmount || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const numAmount = Number(amount);
    if (numAmount > remaining) {
      setError(`لا يمكن التبرع بمبلغ أكبر من المتبقي وهو ${formatCurrency(remaining, caseData.currency)}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.createDonation({
        id: crypto.randomUUID(),
        caseId: caseData.id,
        donorId: user.uid,
        donorName: profile?.name || 'متبرع',
        amount: numAmount,
        currency: caseData.currency,
        paymentProof: proof,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
      onSuccess();
    } catch (err) {
      console.error("Error creating donation:", err);
      setError('حدث خطأ أثناء إرسال الدعم. يرجى المحاولة لاحقاً.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 left-6 p-2 text-gray-400 hover:text-gray-900 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="p-8 sm:p-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl">
              <Heart className="fill-teal-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">دعم الحالة</h2>
              <p className="text-gray-500 text-sm">أنت تساهم في: {caseData.title}</p>
            </div>
          </div>

          <div className="bg-orange-50/50 p-5 rounded-2xl border border-orange-100 mb-8">
            <div className="flex items-start gap-3">
              <Landmark className="text-orange-600 shrink-0 mt-1" size={20} />
              <div className="space-y-2">
                <p className="text-sm font-bold text-gray-800">تفاصيل التحويل البنكي:</p>
                <div className="space-y-1">
                  <p className="text-xs text-gray-600">اسم البنك: بنك البركة - سوريا</p>
                  <p className="text-xs text-gray-600">اسم الحساب: مؤسسة الخير الإنسانية</p>
                  <p className="text-xs font-mono font-bold text-gray-900 select-all">IBAN: SY12 0001 0002 0003 0004 0005</p>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-orange-700 bg-orange-100/50 px-2 py-1 rounded-md">
                  <Info size={12} />
                  <span>يرجى إرسال المبلغ ثم إدخال التفاصيل أدناه</span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700">المبلغ المراد دفعه ({caseData.currency})</label>
              <div className="relative">
                <input 
                  required
                  type="number"
                  max={remaining}
                  min={1}
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-teal-500 transition-all outline-none font-bold"
                  placeholder="0.00"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                  الأقصى: {formatCurrency(remaining, caseData.currency)}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700">رقم الحوالة أو تفاصيل التأكيد</label>
              <textarea 
                required
                rows={3}
                value={proof}
                onChange={e => setProof(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-teal-500 transition-all outline-none resize-none text-sm"
                placeholder="مثال: حوالة من حساب السيد فلان بن فلان، رقم السند 123456"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-xs font-medium rounded-xl border border-red-100 flex items-center gap-2">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <button 
              disabled={loading}
              type="submit"
              className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-xl active:scale-95 disabled:opacity-50"
            >
              {loading ? 'جاري الإرسال...' : 'تأكيد إرسال الدعم'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

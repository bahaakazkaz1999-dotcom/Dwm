import React, { useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { AlertCircle } from 'lucide-react';
import { Currency } from '../types';

interface CaseFormProps {
  onSuccess: () => void;
}

export const CaseForm: React.FC<CaseFormProps> = ({ onSuccess }) => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAmount: '',
    currency: 'SYP' as Currency,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      await api.createCase({
        id: crypto.randomUUID(),
        ...formData,
        targetAmount: Number(formData.targetAmount),
        collectedAmount: 0,
        status: 'pending',
        authorId: user.uid,
        beneficiaryName: profile?.name || 'مستفيد',
        createdAt: new Date().toISOString(),
      } as any);
      onSuccess();
    } catch (err) {
      console.error("Error creating case:", err);
      setError('حدث خطأ أثناء إرسال الحالة. يرجى المحاولة لاحقاً.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-xl mx-auto bg-white p-8 rounded-3xl shadow-xl border border-gray-100"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-2">نشر حالة جديدة</h2>
      <p className="text-gray-500 mb-8 text-sm">أدخل تفاصيل الحالة ليتم مراجعتها من قبل المسؤولين.</p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-2 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-gray-700">عنوان الحالة</label>
          <input 
            required
            type="text"
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-teal-500 transition-all outline-none"
            placeholder="مثال: تأمين أدوية مزمنة"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-gray-700">وصف الحالة</label>
          <textarea 
            required
            rows={4}
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-teal-500 transition-all outline-none resize-none"
            placeholder="اشرح الحالة بالتفصيل، الأسباب والضرورة..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700">المبلغ المطلوب</label>
            <input 
              required
              type="number"
              min="1"
              value={formData.targetAmount}
              onChange={e => setFormData({...formData, targetAmount: e.target.value})}
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-teal-500 transition-all outline-none"
              placeholder="0"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700">العملة</label>
            <select 
              value={formData.currency}
              onChange={e => setFormData({...formData, currency: e.target.value as Currency})}
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-teal-500 transition-all outline-none appearance-none"
            >
              <option value="SYP">ليرة سورية (ل.س)</option>
              <option value="USD">دولار أمريكي ($)</option>
            </select>
          </div>
        </div>

        <button 
          disabled={loading}
          type="submit"
          className="w-full py-4 bg-teal-600 text-white rounded-2xl font-bold hover:bg-teal-700 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:scale-100"
        >
          {loading ? 'جاري الإرسال...' : 'إرسال الحالة للمراجعة'}
        </button>
      </form>
    </motion.div>
  );
};

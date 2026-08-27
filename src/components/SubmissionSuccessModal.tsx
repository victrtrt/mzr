import React from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';

interface SubmissionSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubmissionSuccessModal: React.FC<SubmissionSuccessModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden border border-purple-100 shadow-2xl relative text-center">
        {/* Top Banner */}
        <div className="bg-gradient-to-r from-purple-900 via-[#802882] to-purple-950 text-white p-7 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md text-emerald-300 border border-white/20 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </div>

          <h2 className="text-lg sm:text-xl font-bold">
            فورم شما با موفقیت ثبت شد
          </h2>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          <div className="p-4 rounded-2xl bg-purple-50/70 border border-[#802882]/20 text-center">
            <p className="text-sm font-bold text-gray-900 leading-relaxed">
              در صورت تایید اولیه جهت مصاحبه حضوری فراخوانده میشوید
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#802882] hover:bg-[#681c6a] text-white text-xs font-bold shadow-md shadow-[#802882]/20 flex items-center justify-center gap-1.5 transition-all"
          >
            <span>بستن</span>
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { FileText, Send } from 'lucide-react';
import { FormDataState, IpStatusResponse } from '../types';

interface StrategyNotesSectionProps {
  data: FormDataState;
  onChange: (fields: Partial<FormDataState>) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  ipStatus: IpStatusResponse | null;
}

export const StrategyNotesSection: React.FC<StrategyNotesSectionProps> = ({
  data,
  onChange,
  onSubmit,
  isSubmitting,
  ipStatus,
}) => {
  const canSubmit = ipStatus ? ipStatus.canSubmit : true;

  return (
    <section className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-5 sm:p-6 mb-6">
      <div className="space-y-4">
        {/* Candidate Notes */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#802882]" />
            <span>یادداشت‌ها و توضیحات اضافی:</span>
          </label>
          <textarea
            rows={3}
            placeholder="اگر نکته یا توضیحی دارید در اینجا بنویسید..."
            value={data.candidateNotes}
            onChange={(e) => onChange({ candidateNotes: e.target.value })}
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:border-[#802882] focus:ring-2 focus:ring-[#802882]/20 outline-none transition-all resize-y"
          />
        </div>

        {/* Primary Submit Button */}
        <div className="pt-2">
          <button
            type="button"
            disabled={isSubmitting || !canSubmit}
            onClick={onSubmit}
            className="w-full py-3 px-6 rounded-xl bg-[#802882] hover:bg-[#681d6a] text-white text-sm font-extrabold transition-all shadow-md shadow-[#802882]/20 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>در حال ارسال فورم...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>ثبت و ارسال فورم</span>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
};
